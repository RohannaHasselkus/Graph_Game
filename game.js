// ─────────────────────────────────────────────
//  PATHFIND — Shortest Hop Puzzle
// ─────────────────────────────────────────────

// --- DOM refs ---
const svg         = document.getElementById("graph");
const levelBadge  = document.getElementById("levelBadge");
const instruction = document.getElementById("instruction");
const startLabel  = document.getElementById("startLabel");
const endLabel    = document.getElementById("endLabel");
const metaNodes   = document.getElementById("metaNodes");
const metaEdges   = document.getElementById("metaEdges");
const metaDiff    = document.getElementById("metaDifficulty");
const metaSol     = document.getElementById("metaSolution");
const pathDisplay = document.getElementById("pathDisplay");
const submitBtn   = document.getElementById("submitBtn");
const resetBtn    = document.getElementById("resetBtn");
const showPathBtn = document.getElementById("showPathBtn");
const nextLevelBtn= document.getElementById("nextLevelBtn");
const restartBtn  = document.getElementById("restartBtn");
const statSolved  = document.getElementById("statSolved");
const statFailed  = document.getElementById("statFailed");
const statHints   = document.getElementById("statHints");
const toast       = document.getElementById("toast");
const toastIcon   = document.getElementById("toastIcon");
const toastMsg    = document.getElementById("toastMsg");

let nodeElements = {};
let labelElements = {};
let playerPath   = [];
let currentLevel = 1;
let currentGraph = null;
let toastTimer   = null;
let levelAttempted = false;

const score = { solved: 0, failed: 0, hints: 0 };

// ─────────────────────────────────────────────
//  TOAST SYSTEM
// ─────────────────────────────────────────────

const ICONS = { success: '✓', error: '✕', warning: '⚠', info: '◈' };

function showToast(message, type = 'info', duration = 3200) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.className = `toast ${type}`;
  toastIcon.textContent = ICONS[type] || '◈';
  toastMsg.textContent = message;
  // Force reflow so re-triggering animates
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ─────────────────────────────────────────────
//  SEEDED RNG
// ─────────────────────────────────────────────

class SeededRNG {
  constructor(seed) {
    this.seed = ((seed % 2147483647) + 2147483647) % 2147483647 || 1;
  }
  next() {
    return this.seed = (this.seed * 16807) % 2147483647;
  }
  random() {
    return (this.next() - 1) / 2147483646;
  }
  choice(arr) {
    return arr[Math.floor(this.random() * arr.length)];
  }
  sample(arr, k) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, k);
  }
}

// ─────────────────────────────────────────────
//  LEVEL PARAMETER CALCULATOR
// ─────────────────────────────────────────────

function getLevelParams(level) {
  return {
    // Node count grows logarithmically — keeps layout manageable
    nodeCount: Math.floor(8 + 4 * Math.log2(level + 1)),

    // Avg degree stays LOW and grows very slowly — key to hardness
    // At degree 2.5 a 25-node graph has ~31 edges only
    avgDegree: 2.2 + Math.min(level * 0.07, 1.6), // caps at ~3.8

    // Minimum hops in the correct answer
    minSolutionHops: 3 + Math.floor(Math.log2(level + 1)),

    // Number of deliberate decoy paths (wrong-looking shortcuts)
    decoyCount: 1 + Math.floor(level / 3),

    // Number of layers for stratified structure
    layers: Math.max(4, 3 + Math.floor(Math.log2(level + 1))),

    // Nodes per layer
    nodesPerLayer: 2 + Math.min(Math.floor(level / 4), 4),

    // Seed — deterministic per level so the same level always looks the same
    seed: Math.imul(level, 2654435761) >>> 0
  };
}

// ─────────────────────────────────────────────
//  GRAPH GENERATOR
// ─────────────────────────────────────────────

class GraphGenerator {
  constructor(seed) {
    this.rng = new SeededRNG(seed);
  }

  generateNodeNames(count) {
    const names = [];
    for (let i = 0; i < Math.min(count, 26); i++) names.push(String.fromCharCode(65 + i));
    for (let i = 26; i < count; i++) names.push(`N${i - 25}`);
    return names;
  }

  buildAdjacency(nodes, edges) {
    const adj = {};
    Object.keys(nodes).forEach(n => adj[n] = []);
    edges.forEach(([u, v]) => { adj[u].push(v); adj[v].push(u); });
    return adj;
  }

  bfsDistances(nodes, edges, start) {
    const adj = this.buildAdjacency(nodes, edges);
    const dist = {};
    Object.keys(nodes).forEach(n => dist[n] = Infinity);
    dist[start] = 0;
    const queue = [start];
    while (queue.length) {
      const cur = queue.shift();
      for (const nb of adj[cur]) {
        if (dist[nb] === Infinity) { dist[nb] = dist[cur] + 1; queue.push(nb); }
      }
    }
    return dist;
  }

  findShortestPath(nodes, edges, start, end) {
    const adj = this.buildAdjacency(nodes, edges);
    const parent = { [start]: null };
    const queue = [start];
    const visited = new Set([start]);
    while (queue.length) {
      const cur = queue.shift();
      if (cur === end) {
        const path = [];
        let node = end;
        while (node !== null) { path.unshift(node); node = parent[node]; }
        return path;
      }
      for (const nb of adj[cur] || []) {
        if (!visited.has(nb)) { visited.add(nb); parent[nb] = cur; queue.push(nb); }
      }
    }
    return null;
  }

  calculateDiameter(nodes, edges) {
    const nodeNames = Object.keys(nodes);
    let max = 0;
    for (const n of nodeNames) {
      const dists = Object.values(this.bfsDistances(nodes, edges, n));
      const finite = dists.filter(d => d !== Infinity);
      if (finite.length) max = Math.max(max, Math.max(...finite));
    }
    return max;
  }

  // Count paths of exactly length k from start to end (BFS layer counting)
  countPathsOfLength(nodes, edges, start, end, k) {
    const adj = this.buildAdjacency(nodes, edges);
    // BFS with layer tracking — count distinct paths
    let frontier = [{ node: start, visited: new Set([start]) }];
    for (let step = 0; step < k; step++) {
      const next = [];
      for (const { node, visited } of frontier) {
        for (const nb of adj[node] || []) {
          if (!visited.has(nb)) {
            const v2 = new Set(visited); v2.add(nb);
            next.push({ node: nb, visited: v2 });
          }
        }
      }
      frontier = next;
      if (!frontier.length) return 0;
    }
    return frontier.filter(f => f.node === end).length;
  }

  // ── STRATIFIED GRAPH GENERATION ──
  // Nodes arranged in layers. Edges only go forward (or lateral within a layer).
  // This guarantees a minimum path length equal to layers-1 hops.
  generateStratifiedGraph(params) {
    const { layers, nodesPerLayer, decoyCount, seed } = params;
    const totalNodes = layers * nodesPerLayer;
    const names = this.generateNodeNames(totalNodes);
    const nodes = {};
    const edges = [];
    const existingEdgeSet = new Set();

    const W = 1140, H = 540;
    const marginX = 80, marginY = 70;

    // Assign positions: layers along X, nodes per layer along Y
    const layerMap = [];
    let idx = 0;
    for (let l = 0; l < layers; l++) {
      layerMap[l] = [];
      for (let k = 0; k < nodesPerLayer; k++) {
        const name = names[idx++];
        const baseX = marginX + (l / (layers - 1)) * (W - 2 * marginX);
        const baseY = marginY + (nodesPerLayer > 1 ? (k / (nodesPerLayer - 1)) : 0.5) * (H - 2 * marginY);
        // Small jitter so it doesn't look too mechanical
        const jitterX = (this.rng.random() - 0.5) * 40;
        const jitterY = (this.rng.random() - 0.5) * 50;
        nodes[name] = {
          x: Math.max(marginX, Math.min(W - marginX + 40, baseX + jitterX)),
          y: Math.max(marginY, Math.min(H - marginY, baseY + jitterY))
        };
        layerMap[l].push(name);
      }
    }

    const addEdge = (u, v) => {
      const key = u < v ? `${u}|${v}` : `${v}|${u}`;
      if (u !== v && !existingEdgeSet.has(key)) {
        existingEdgeSet.add(key);
        edges.push([u, v]);
        return true;
      }
      return false;
    };

    // 1. Guarantee connectivity: each node in layer l connects to at least one node in layer l+1
    for (let l = 0; l < layers - 1; l++) {
      for (const u of layerMap[l]) {
        // Connect to 1 guaranteed neighbor in next layer
        const target = this.rng.choice(layerMap[l + 1]);
        addEdge(u, target);
      }
      // Also connect each next-layer node back to ensure no isolated nodes
      for (const v of layerMap[l + 1]) {
        const hasIncoming = edges.some(([u2, v2]) => (v2 === v || u2 === v) && layerMap[l].includes(u2 === v ? v2 : u2));
        if (!hasIncoming) {
          addEdge(this.rng.choice(layerMap[l]), v);
        }
      }
    }

    // 2. Add lateral edges within layers (same hop count, more choices = more confusion)
    const lateralCount = Math.floor(layers * nodesPerLayer * 0.3);
    for (let attempt = 0; attempt < lateralCount * 3; attempt++) {
      const l = Math.floor(this.rng.random() * layers);
      if (layerMap[l].length < 2) continue;
      const [u, v] = this.rng.sample(layerMap[l], 2);
      addEdge(u, v);
      if (edges.length >= lateralCount + layers * nodesPerLayer) break;
    }

    // 3. Add skip edges (skip one layer — look like shortcuts, same or longer actual hop count)
    for (let d = 0; d < decoyCount; d++) {
      const l1 = Math.floor(this.rng.random() * (layers - 2));
      const l2 = l1 + 2; // skip one layer
      const u = this.rng.choice(layerMap[l1]);
      const v = this.rng.choice(layerMap[l2]);
      addEdge(u, v);
    }

    // 4. Start = random node in first layer, End = random node in last layer
    const start = this.rng.choice(layerMap[0]);
    const end   = this.rng.choice(layerMap[layers - 1]);

    return { nodes, edges, start, end, layerMap };
  }

  generateLevel(level) {
    const params = getLevelParams(level);
    params.seed = Math.imul(level, 2654435761) >>> 0;

    let best = null;
    // Try up to 12 times to get a graph with good decoy ratio
    for (let attempt = 0; attempt < 12; attempt++) {
      // Use different seed per attempt but still deterministic
      this.rng = new SeededRNG(params.seed + attempt * 999983);
      const { nodes, edges, start, end } = this.generateStratifiedGraph(params);
      const shortestPath = this.findShortestPath(nodes, edges, start, end);
      if (!shortestPath) continue;

      const hops = shortestPath.length - 1;
      if (hops < params.minSolutionHops) continue;

      // Check decoy ratio: there should be at least 2 wrong paths for every 1 optimal path
      const optPaths  = this.countPathsOfLength(nodes, edges, start, end, hops);
      const wrongPaths = this.countPathsOfLength(nodes, edges, start, end, hops + 1);

      const decoyRatio = optPaths > 0 ? wrongPaths / optPaths : 0;
      const diameter   = this.calculateDiameter(nodes, edges);

      // Score this candidate — higher is better
      const candidateScore = hops * 3 + decoyRatio * 2 + diameter;
      if (!best || candidateScore > best.score) {
        best = { nodes, edges, start, end, shortestPath, hops, decoyRatio, diameter, score: candidateScore };
      }
    }

    // Fallback if nothing met criteria
    if (!best) {
      this.rng = new SeededRNG(params.seed);
      const { nodes, edges, start, end } = this.generateStratifiedGraph(params);
      const shortestPath = this.findShortestPath(nodes, edges, start, end) || [start, end];
      best = { nodes, edges, start, end, shortestPath, hops: shortestPath.length - 1, decoyRatio: 0, diameter: 0, score: 0 };
    }

    const difficultyScore = best.hops * 2.5 + best.decoyRatio * 1.5 + (Object.keys(best.nodes).length / 5);

    return {
      name: `Level ${level}`,
      nodes: best.nodes,
      edges: best.edges,
      start: best.start,
      end: best.end,
      shortestPath: best.shortestPath,
      hops: best.hops,
      decoyRatio: best.decoyRatio,
      difficulty: difficultyScore,
      nodeCount: Object.keys(best.nodes).length,
      edgeCount: best.edges.length
    };
  }
}

// ─────────────────────────────────────────────
//  EDGE OVERLAP / CURVE DETECTION
// ─────────────────────────────────────────────

function edgeKey(a, b) { return a < b ? `${a}|${b}` : `${b}|${a}`; }

function distance(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

function pointToSegDist(point, s, e) {
  const dx = e.x - s.x, dy = e.y - s.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return distance(point, s);
  const t = Math.max(0, Math.min(1, ((point.x - s.x) * dx + (point.y - s.y) * dy) / len2));
  return distance(point, { x: s.x + t * dx, y: s.y + t * dy });
}

function detectOverlappingEdges(nodes, edges) {
  const curves = new Map();
  const tol = 18;
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const [u1, v1] = edges[i], [u2, v2] = edges[j];
      if (u1===u2||u1===v2||v1===u2||v1===v2) continue;
      const p1=nodes[u1],q1=nodes[v1],p2=nodes[u2],q2=nodes[v2];
      const minDist = Math.min(
        pointToSegDist(p1,p2,q2), pointToSegDist(q1,p2,q2),
        pointToSegDist(p2,p1,q1), pointToSegDist(q2,p1,q1)
      );
      if (minDist < tol) {
        const k1 = edgeKey(u1,v1), k2 = edgeKey(u2,v2);
        if (!curves.has(k1)) curves.set(k1, 22);
        if (!curves.has(k2)) curves.set(k2, -22);
      }
    }
  }
  return curves;
}

// ─────────────────────────────────────────────
//  RENDERING
// ─────────────────────────────────────────────

function svgEl(tag) { return document.createElementNS("http://www.w3.org/2000/svg", tag); }

function drawStraightEdge(u, v, p1, p2) {
  const line = svgEl("line");
  line.setAttribute("x1", p1.x); line.setAttribute("y1", p1.y);
  line.setAttribute("x2", p2.x); line.setAttribute("y2", p2.y);
  line.setAttribute("class", "edge");
  line.dataset.u = u; line.dataset.v = v;
  svg.insertBefore(line, svg.querySelector('.node') || null);
}

function drawCurvedEdge(u, v, p1, p2, offset) {
  const midX = (p1.x + p2.x) / 2, midY = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.sqrt(dx*dx + dy*dy);
  if (len === 0) return drawStraightEdge(u, v, p1, p2);
  const cx = midX + (-dy / len) * offset;
  const cy = midY + (dx / len) * offset;
  const path = svgEl("path");
  path.setAttribute("d", `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`);
  path.setAttribute("class", "edge edge-curved");
  path.dataset.u = u; path.dataset.v = v;
  svg.insertBefore(path, svg.querySelector('.node') || null);
}

function drawLevel(graph) {
  currentGraph = graph;
  playerPath = [];
  levelAttempted = false;

  // Clear SVG (keep defs)
  const defs = svg.querySelector('defs');
  svg.innerHTML = defs ? defs.outerHTML : '';
  nodeElements = {};
  labelElements = {};

  // Update header
  levelBadge.textContent = `LVL ${currentLevel}`;
  startLabel.textContent = graph.start;
  endLabel.textContent   = graph.end;
  metaNodes.textContent  = `${graph.nodeCount} nodes`;
  metaEdges.textContent  = `${graph.edgeCount} edges`;
  metaDiff.textContent   = `difficulty ${graph.difficulty.toFixed(1)}`;
  metaSol.textContent    = `solution: ${graph.hops} hop${graph.hops !== 1 ? 's' : ''}`;
  pathDisplay.textContent = '—';

  // Hide action buttons
  showPathBtn.style.display  = 'none';
  nextLevelBtn.style.display = 'none';
  restartBtn.style.display   = 'none';

  // Draw edges first (behind nodes)
  const curves = detectOverlappingEdges(graph.nodes, graph.edges);
  graph.edges.forEach(([u, v]) => {
    const p1 = graph.nodes[u], p2 = graph.nodes[v];
    const key = edgeKey(u, v);
    curves.has(key) ? drawCurvedEdge(u, v, p1, p2, curves.get(key)) : drawStraightEdge(u, v, p1, p2);
  });

  // Draw nodes + labels
  Object.entries(graph.nodes).forEach(([name, pos]) => {
    const circle = svgEl("circle");
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);
    circle.setAttribute("r", 16);
    circle.setAttribute("class", "node");
    circle.dataset.name = name;
    svg.appendChild(circle);

    const text = svgEl("text");
    text.setAttribute("x", pos.x);
    text.setAttribute("y", pos.y + 4);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "node-label");
    text.textContent = name;
    svg.appendChild(text);

    circle.addEventListener("click", () => handleNodeClick(name));
    nodeElements[name] = circle;
    labelElements[name] = text;
  });

  // Style start / end
  applyNodeClass(graph.start, 'start');
  applyNodeClass(graph.end, 'end');
}

function applyNodeClass(name, cls) {
  nodeElements[name]?.classList.add(cls);
  labelElements[name]?.classList.add(cls);
}

function removeNodeClass(name, cls) {
  nodeElements[name]?.classList.remove(cls);
  labelElements[name]?.classList.remove(cls);
}

function highlightEdgeBetween(u, v, cls = 'highlighted') {
  svg.querySelectorAll('.edge').forEach(edge => {
    if ((edge.dataset.u === u && edge.dataset.v === v) ||
        (edge.dataset.u === v && edge.dataset.v === u)) {
      edge.classList.add(cls);
    }
  });
}

function clearEdgeClass(cls) {
  svg.querySelectorAll('.edge').forEach(e => e.classList.remove(cls));
}

function updatePathOverlay() {
  if (playerPath.length === 0) {
    pathDisplay.textContent = '—';
  } else {
    const hops = playerPath.length - 1;
    pathDisplay.textContent = playerPath.join(' → ') + (hops > 0 ? `  (${hops} hop${hops !== 1 ? 's' : ''})` : '');
  }
}

// ─────────────────────────────────────────────
//  GAME LOGIC
// ─────────────────────────────────────────────

function isConnected(a, b) {
  return currentGraph.edges.some(([u, v]) => (u===a&&v===b)||(u===b&&v===a));
}

function handleNodeClick(name) {
  if (!currentGraph) return;

  // Must start at the start node
  if (playerPath.length === 0 && name !== currentGraph.start) {
    showToast(`Start at node ${currentGraph.start}`, 'warning', 2000);
    flashInvalid(name);
    return;
  }

  const last = playerPath[playerPath.length - 1];

  // Click last node to undo
  if (last === name) {
    playerPath.pop();
    removeNodeClass(name, 'selected');
    // Remove player-path highlight on edge coming in to this node
    if (playerPath.length > 0) clearAndRehighlightPlayerPath();
    updatePathOverlay();
    return;
  }

  // Can't revisit
  if (playerPath.includes(name)) {
    showToast('Already visited — click the last node to undo', 'warning', 2000);
    return;
  }

  // Must be adjacent
  if (playerPath.length > 0 && !isConnected(last, name)) {
    showToast(`No edge from ${last} to ${name}`, 'error', 2000);
    flashInvalid(name);
    return;
  }

  playerPath.push(name);
  applyNodeClass(name, 'selected');

  // Highlight the edge we just traversed
  if (playerPath.length > 1) {
    highlightEdgeBetween(playerPath[playerPath.length - 2], name, 'player-path');
  }

  updatePathOverlay();
}

function flashInvalid(name) {
  const el = nodeElements[name];
  if (!el) return;
  el.classList.add('invalid-flash');
  setTimeout(() => el.classList.remove('invalid-flash'), 350);
}

function clearAndRehighlightPlayerPath() {
  clearEdgeClass('player-path');
  for (let i = 0; i < playerPath.length - 1; i++) {
    highlightEdgeBetween(playerPath[i], playerPath[i + 1], 'player-path');
  }
}

function submitPath() {
  if (!currentGraph) return;

  if (playerPath.length === 0) {
    showToast('Select a path first', 'warning');
    return;
  }

  if (playerPath[0] !== currentGraph.start || playerPath[playerPath.length - 1] !== currentGraph.end) {
    showToast(`Path must go from ${currentGraph.start} → ${currentGraph.end}`, 'warning');
    return;
  }

  for (let i = 0; i < playerPath.length - 1; i++) {
    if (!isConnected(playerPath[i], playerPath[i + 1])) {
      showToast('Invalid path — disconnected step detected', 'error');
      return;
    }
  }

  const playerHops   = playerPath.length - 1;
  const optimalHops  = currentGraph.hops;

  if (playerHops === optimalHops) {
    score.solved++;
    updateStats();
    showToast(`✓ Optimal! ${optimalHops} hop${optimalHops !== 1 ? 's' : ''} — perfect path`, 'success', 4000);
    nextLevelBtn.style.display  = 'inline-flex';
    restartBtn.style.display    = 'inline-flex';
    showPathBtn.style.display   = 'none';
  } else {
    if (!levelAttempted) { score.failed++; updateStats(); }
    showToast(`✕ Not optimal — your path: ${playerHops} hops, best: ${optimalHops} hops`, 'error', 4000);
    showPathBtn.style.display   = 'inline-flex';
    nextLevelBtn.style.display  = 'inline-flex';
    restartBtn.style.display    = 'inline-flex';
  }
  levelAttempted = true;
}

function showSolution() {
  if (!currentGraph?.shortestPath) return;
  score.hints++;
  updateStats();
  reset(false);
  animatePath(currentGraph.shortestPath, 'highlighted');
  nextLevelBtn.style.display = 'inline-flex';
  restartBtn.style.display   = 'inline-flex';
  showToast(`Solution: ${currentGraph.shortestPath.join(' → ')}`, 'info', 5000);
}

function animatePath(pathArr, cls) {
  let i = 0;
  const tick = setInterval(() => {
    if (i >= pathArr.length) { clearInterval(tick); return; }
    const name = pathArr[i];
    applyNodeClass(name, cls === 'player-path' ? 'selected' : 'selected');
    if (i > 0) highlightEdgeBetween(pathArr[i - 1], name, cls);
    i++;
  }, 380);
}

function reset(clearButtons = true) {
  playerPath = [];
  levelAttempted = false;
  updatePathOverlay();

  // Remove all dynamic node classes
  Object.keys(nodeElements).forEach(name => {
    removeNodeClass(name, 'selected');
    removeNodeClass(name, 'invalid-flash');
  });

  // Re-apply start/end
  if (currentGraph) {
    applyNodeClass(currentGraph.start, 'start');
    applyNodeClass(currentGraph.end, 'end');
  }

  clearEdgeClass('highlighted');
  clearEdgeClass('player-path');

  if (clearButtons) {
    showPathBtn.style.display  = 'none';
    nextLevelBtn.style.display = 'none';
    restartBtn.style.display   = 'none';
  }
}

function nextLevel() {
  currentLevel++;
  const gen = new GraphGenerator(getLevelParams(currentLevel).seed);
  drawLevel(gen.generateLevel(currentLevel));
}

function restartGame() {
  currentLevel = 1;
  score.solved = 0; score.failed = 0; score.hints = 0;
  updateStats();
  const gen = new GraphGenerator(getLevelParams(1).seed);
  drawLevel(gen.generateLevel(1));
}

function updateStats() {
  statSolved.textContent = score.solved;
  statFailed.textContent = score.failed;
  statHints.textContent  = score.hints;
}

// ─────────────────────────────────────────────
//  EVENT LISTENERS
// ─────────────────────────────────────────────

submitBtn.addEventListener('click', submitPath);
resetBtn.addEventListener('click', () => reset(true));
showPathBtn.addEventListener('click', showSolution);
nextLevelBtn.addEventListener('click', nextLevel);
restartBtn.addEventListener('click', restartGame);

// ─────────────────────────────────────────────
//  INITIALIZE
// ─────────────────────────────────────────────

(function init() {
  const params = getLevelParams(1);
  const gen = new GraphGenerator(params.seed);
  drawLevel(gen.generateLevel(1));
})();
