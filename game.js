// game.js — SPORE Extreme (Levels 0–6, dense/decoy graphs, BFS shortest-path acceptance + curved UX)

// --- DOM refs ---
const svg = document.getElementById("graph");
const levelTitle = document.getElementById("levelTitle");
const instruction = document.getElementById("instruction");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const showPathBtn = document.getElementById("showPathBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const restartBtn = document.getElementById("restartBtn");

let nodeElements = {};
let path = [];
let currentLevel = 0;
let showingSolution = false;

// ------------------ EXTREMELY HARD LEVELS 0..6 ------------------
// Dense connectivity, many decoy cross edges, irregular positions.
// Edges are undirected (BFS computes shortest by edge-count).
const levels = [
  // Level 0 — 'intro' but already brutal (dense)
  {
    name: "Level 0 — Brutal Intro",
    start: "A", end: "Z",
    nodes: {
      A:{x:80,y:340}, B:{x:160,y:220}, C:{x:160,y:460}, D:{x:260,y:140}, E:{x:260,y:260},
      F:{x:260,y:420}, G:{x:360,y:100}, H:{x:360,y:220}, I:{x:360,y:340}, J:{x:360,y:460},
      K:{x:480,y:140}, L:{x:480,y:260}, M:{x:480,y:420}, N:{x:600,y:220}, O:{x:600,y:460},
      P:{x:720,y:300}, Q:{x:840,y:180}, R:{x:840,y:420}, S:{x:960,y:300}, Z:{x:1080,y:300}
    },
    edges: [
      // backbone
      ['A','B'],['A','C'],['B','D'],['C','F'],['D','G'],['E','H'],['F','J'],
      ['G','K'],['H','L'],['I','L'],['J','M'],['K','N'],['L','N'],['M','O'],
      ['N','P'],['O','P'],['P','Q'],['P','R'],['Q','S'],['R','S'],['S','Z'],
      // decoys & cross ties
      ['B','E'],['C','E'],['D','H'],['F','I'],['G','L'],['J','N'],['K','M'],
      ['E','I'],['I','P'],['H','M'],['Q','Z']
    ],
    // Level 0 stays mostly straight for clarity
    curvedEdges: []
  },

  // Level 1 — grid with diagonals + traps
  {
    name: "Level 1 — Grid Ambush",
    nodes: (()=>{
      const nodes = {};
      const letters = "ABCDEFGHIJKLMNOP";
      let idx=0;
      for(let r=0;r<4;r++){
        for(let c=0;c<4;c++){
          nodes[letters[idx]] = { x: 100 + c*180 + (r%2?12:-12), y: 100 + r*120 + (c%2?8:-8) };
          idx++;
        }
      }
      // outer ring
      nodes['Q']={x:820,y:80}; nodes['R']={x:980,y:170}; nodes['S']={x:1040,y:320}; nodes['T']={x:980,y:470};
      nodes['U']={x:820,y:560}; nodes['V']={x:600,y:600}; nodes['W']={x:380,y:560}; nodes['X']={x:240,y:440};
      nodes['Y']={x:1100,y:350}; // end
      return nodes;
    })(),
    edges: (()=> {
      const edges = [];
      const letters = "ABCDEFGHIJKLMNOP";
      const get = (r,c)=> letters[r*4+c];
      for(let r=0;r<4;r++){
        for(let c=0;c<4;c++){
          const u = get(r,c);
          if(c<3) edges.push([u, get(r,c+1)]);
          if(r<3) edges.push([u, get(r+1,c)]);
          if(r<3 && c<3) edges.push([u, get(r+1,c+1)]);
          if(r<3 && c>0) edges.push([u, get(r+1,c-1)]);
        }
      }
      edges.push(['A','Q'],['B','R'],['C','S'],['D','T']);
      edges.push(['M','U'],['N','V'],['O','W'],['P','X']);
      edges.push(['E','K'],['F','L'],['G','I'],['H','J'],['I','Q'],['L','S'],['P','Y']);
      edges.push(['Q','R'],['R','S'],['S','T'],['T','U'],['U','V'],['V','W'],['W','X'],['X','Q']);
      return edges;
    })(),
    start: 'A',
    end: 'Y',
    // Curve some ring and diagonal connectors to reduce visual collisions
    curvedEdges: (() => {
      const c = [];
      const ring = [['Q','R'],['R','S'],['S','T'],['T','U'],['U','V'],['V','W'],['W','X'],['X','Q']];
      ring.forEach(p=>c.push({u:p[0],v:p[1],offset:28}));
      c.push({u:'I',v:'Q',offset:26},{u:'L',v:'S',offset:-26},{u:'P',v:'Y',offset:20});
      return c;
    })()
  },

  // Level 2 — tangled ladder with many crossbars
  {
    name: "Level 2 — Tangled Ladder",
    start: "START", end: "END",
    nodes: (()=>{
      const nodes = {};
      for(let i=0;i<8;i++){
        nodes['L'+i] = { x:120, y:80 + i*75 };
        nodes['R'+i] = { x:480, y:60 + i*75 + (i%2?12:-12) };
      }
      for(let m=0;m<4;m++){
        nodes['M'+m] = { x:300, y:160 + m*140 };
      }
      nodes['START'] = { x:40, y:80 };
      nodes['END'] = { x:600, y:560 };
      return nodes;
    })(),
    edges: (()=>{
      const e = [];
      for(let i=0;i<7;i++){
        e.push(['L'+i,'L'+(i+1)]);
        e.push(['R'+i,'R'+(i+1)]);
      }
      for(let i=0;i<8;i++){
        e.push(['L'+i,'R'+i]); // rung
        if(i<7){
          e.push(['L'+i,'R'+(i+1)]);
          e.push(['R'+i,'L'+(i+1)]);
        }
        if(i%2===0) e.push(['L'+i,'M'+(i/2)]);
        if(i%2===1) e.push(['R'+i,'M'+((i-1)/2)]);
      }
      e.push(['START','L0'],['R7','END'],['M0','M1'],['M1','M2'],['M2','M3'],['M3','END']);
      e.push(['L2','L5'],['R1','R6'],['L3','R4'],['L4','M2'],['M1','R5']);
      return e;
    })(),
    // Curve most rungs & cross-bars to separate them visually
    curvedEdges: (()=>{
      const curves = [];
      for(let i=0;i<8;i++){
        curves.push({u:'L'+i,v:'R'+i,offset:24*(i%2?1:-1)});           // rungs
        if(i<7){
          curves.push({u:'L'+i,v:'R'+(i+1),offset:22});
          curves.push({u:'R'+i,v:'L'+(i+1),offset:-22});
        }
      }
      // hub links
      curves.push({u:'M0',v:'M1',offset:18},{u:'M1',v:'M2',offset:-18},{u:'M2',v:'M3',offset:18});
      // extra tricky ones
      curves.push({u:'L3',v:'R4',offset:-26},{u:'M1',v:'R5',offset:26});
      return curves;
    })()
  },

  // Level 3 — chaotic hub-n-spoke with decoy rings
  {
    name: "Level 3 — Chaotic Hubs",
    start: "A0", end: "Z9",
    nodes: (()=>{
      const nodes = {};
      for(let h=0;h<4;h++) nodes['H'+h] = { x:360 + h*140, y:260 + (h%2?40:-40) };
      for(let i=0;i<8;i++){
        nodes['A'+i] = { x:80 + i*120, y:60 + (i%3)*40 + (i%2?20:-20) };
        nodes['B'+i] = { x:80 + i*120, y:520 - (i%3)*40 + (i%2?-20:20) };
      }
      nodes['Z9'] = { x:1100, y:320 };
      return nodes;
    })(),
    edges: (()=>{
      const e=[];
      for(let i=0;i<8;i++){
        e.push(['A'+i,'H'+(i%4)]);
        e.push(['A'+i,'H'+((i+1)%4)]);
        e.push(['B'+i,'H'+(i%4)]);
        e.push(['B'+i,'H'+((i+3)%4)]);
      }
      e.push(['H0','H1'],['H0','H2'],['H0','H3'],['H1','H2'],['H1','H3'],['H2','H3']);
      for(let i=0;i<7;i++){
        e.push(['A'+i,'A'+(i+1)], ['B'+i,'B'+(i+1)]);
      }
      e.push(['A1','B5'],['A2','B2'],['A3','A7'],['B0','H1'],['A5','H3'],['H2','Z9'],['B7','Z9']);
      return e;
    })(),
    // Curve hub–hub mesh and some hub–spoke ties to declutter
    curvedEdges: (()=>{
      const c=[];
      // hub mesh
      [['H0','H1',22],['H0','H2',-26],['H0','H3',24],['H1','H2',18],['H1','H3',-22],['H2','H3',20]]
        .forEach(([u,v,o])=>c.push({u,v,offset:o}));
      // spokes to hubs (alternate)
      for(let i=0;i<8;i++){
        c.push({u:'A'+i,v:'H'+(i%4),offset:(i%2?18:-18)});
        c.push({u:'B'+i,v:'H'+((i+3)%4),offset:(i%2?-18:18)});
      }
      // two goal lines
      c.push({u:'H2',v:'Z9',offset:-20},{u:'B7',v:'Z9',offset:20});
      return c;
    })()
  },

  // Level 4 — multi-layer mesh + bottlenecks
  {
    name: "Level 4 — Mesh & Bottlenecks",
    start: "S", end: "G",
    nodes: (()=>{
      const nodes = {};
      for(let i=0;i<6;i++) nodes['T'+i] = { x:80 + i*180, y:80 + ((i%2)?12:-12) };
      for(let i=0;i<6;i++) nodes['M'+i] = { x:80 + i*180, y:260 + ((i%2)?-10:10) };
      for(let i=0;i<6;i++) nodes['B'+i] = { x:80 + i*180, y:440 + ((i%2)?14:-14) };
      nodes['S'] = {x:20,y:60}; nodes['G'] = {x:1100,y:360};
      return nodes;
    })(),
    edges: (()=>{
      const e=[];
      for(let row of ['T','M','B']){
        for(let i=0;i<5;i++) e.push([row+i, row+(i+1)]);
      }
      for(let i=0;i<6;i++){
        e.push(['T'+i,'M'+i], ['M'+i,'B'+i], ['T'+i,'M'+((i+1)%6)], ['M'+i,'B'+((i+5)%6)]);
      }
      e.push(['T0','M2'],['T1','B3'],['M2','B4'],['T3','M5'],['M1','B0'],['B5','G'],['S','T0'],['T5','G']);
      e.push(['M0','M2'],['M1','M3'],['M2','M4'],['M3','M5']);
      return e;
    })(),
    // Curve horizontal lanes and a few diagonals for readability
    curvedEdges: (()=>{
      const c=[];
      // horizontal lanes
      for(let i=0;i<5;i++){
        c.push({u:'T'+i,v:'T'+(i+1),offset:18*(i%2?1:-1)});
        c.push({u:'M'+i,v:'M'+(i+1),offset:-14*(i%2?1:-1)});
        c.push({u:'B'+i,v:'B'+(i+1),offset:16*(i%2?-1:1)});
      }
      // diagonals & exits
      [['T0','M2',22],['T1','B3',-26],['M2','B4',22],['T3','M5',-20],['M1','B0',20],['B5','G',22],['T5','G',-22]]
        .forEach(([u,v,o])=>c.push({u,v,offset:o}));
      return c;
    })()
  },

  // Level 5 — deceptive labyrinth with equally short alternatives
  {
    name: "Level 5 — Labyrinth of Equals",
    start: "Start", end: "Goal",
    nodes: (()=>{
      const nodes = {};
      for(let i=0;i<12;i++){
        const a = Math.PI * 2 * i / 12;
        nodes['R'+i] = { x:600 + Math.round(Math.cos(a)*420), y:350 + Math.round(Math.sin(a)*220) };
      }
      for(let i=0;i<6;i++){
        const a = Math.PI * 2 * i / 6;
        nodes['C'+i] = { x:600 + Math.round(Math.cos(a)*160), y:350 + Math.round(Math.sin(a)*90) };
      }
      nodes['Start'] = {x:120,y:340}; nodes['Goal'] = {x:1080,y:360};
      return nodes;
    })(),
    edges: (()=>{
      const e=[];
      for(let i=0;i<12;i++){
        e.push(['R'+i, 'R'+((i+1)%12)]);
        e.push(['R'+i, 'C'+(i%6)]);
      }
      for(let i=0;i<6;i++){
        for(let j=i+1;j<6;j++) e.push(['C'+i,'C'+j]);
      }
      e.push(['Start','R0'],['Start','R3'],['Start','R5'],['Goal','R6'],['Goal','R9'],['Goal','R11']);
      e.push(['R1','R7'],['R2','R8'],['R4','R10'],['R3','R9']);
      return e;
    })(),
    // Curve ring segments around the ellipse + a few long chords
    curvedEdges: (()=>{
      const c=[];
      for(let i=0;i<12;i++){
        c.push({u:'R'+i, v:'R'+((i+1)%12), offset:28}); // ring arc feel
      }
      [['R1','R7',-18],['R2','R8',18],['R4','R10',-18],['R3','R9',18]].forEach(([u,v,o])=>c.push({u,v,offset:o}));
      // gentle curves from Start/Goal into ring
      [['Start','R0',16],['Start','R3',-16],['Start','R5',16],['Goal','R6',-16],['Goal','R9',16],['Goal','R11',-16]]
        .forEach(([u,v,o])=>c.push({u,v,offset:o}));
      return c;
    })()
  },

  // Level 6 — final brain-melter: near-complete graph with sparse bottlenecks
  {
    name: "Level 6 — Final Brain-Melter",
    start: "A", end: "Z",
    nodes: (()=>{
      const nodes = {};
      for(let i=0;i<18;i++){
        nodes['N'+i] = { x:80 + (i%6)*180 + (i%2?22:-22), y:80 + Math.floor(i/6)*220 + (i%3?12:-12) };
      }
      nodes['A'] = {x:20,y:220}; nodes['Z'] = {x:1160,y:360};
      return nodes;
    })(),
    edges: (()=>{
      const e=[];
      for(let i=0;i<18;i++){
        for(let j=i+1;j<18;j++){
          if(((i+j) % 7) !== 0) e.push(['N'+i,'N'+j]);
        }
      }
      e.push(['A','N0'],['A','N2'],['A','N5']);
      e.push(['Z','N16'],['Z','N17'],['Z','N10']);
      e.push(['N8','Z'],['N13','Z']);
      e.push(['A','N7'],['N7','N12'],['N12','Z']);
      return e;
    })(),
    // Curve the A-*, Z-* funnels and the long decoy so they visually stand out
    curvedEdges: [
      {u:'A',v:'N0',offset:24},{u:'A',v:'N2',offset:18},{u:'A',v:'N5',offset:-24},
      {u:'Z',v:'N16',offset:-20},{u:'Z',v:'N17',offset:22},{u:'Z',v:'N10',offset:-18},
      {u:'N8',v:'Z',offset:18},{u:'N13',v:'Z',offset:-18},
      {u:'A',v:'N7',offset:26},{u:'N7',v:'N12',offset:-22},{u:'N12',v:'Z',offset:26}
    ]
  }
];

// ------------------ Enhanced curve detection ------------------

// Check if two line segments overlap (not just cross)
function segmentsOverlap(p1, q1, p2, q2, tolerance = 8) {
  // Calculate distances from endpoints to the opposite line segment
  const distanceToLine = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (length === 0) return Math.hypot(px - x1, py - y1);
    
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    return Math.hypot(px - projX, py - projY);
  };

  // Check if segments are close enough to be considered overlapping
  const d1 = distanceToLine(p1.x, p1.y, p2.x, p2.y, q2.x, q2.y);
  const d2 = distanceToLine(q1.x, q1.y, p2.x, p2.y, q2.x, q2.y);
  const d3 = distanceToLine(p2.x, p2.y, p1.x, p1.y, q1.x, q1.y);
  const d4 = distanceToLine(q2.x, q2.y, p1.x, p1.y, q1.x, q1.y);

  return Math.min(d1, d2, d3, d4) < tolerance;
}

// Detect overlapping edges and generate smart curves
function detectOverlappingEdges(level) {
  const edges = level.edges;
  const nodes = level.nodes;
  const overlaps = new Map();
  
  // Check all pairs of edges for overlaps
  for (let i = 0; i < edges.length; i++) {
    for (let j = i + 1; j < edges.length; j++) {
      const [u1, v1] = edges[i];
      const [u2, v2] = edges[j];
      
      // Skip if edges share a node
      if (u1 === u2 || u1 === v2 || v1 === u2 || v1 === v2) continue;
      
      const p1 = nodes[u1], q1 = nodes[v1];
      const p2 = nodes[u2], q2 = nodes[v2];
      
      if (segmentsOverlap(p1, q1, p2, q2)) {
        const key1 = curveKey(u1, v1);
        const key2 = curveKey(u2, v2);
        
        if (!overlaps.has(key1)) overlaps.set(key1, []);
        if (!overlaps.has(key2)) overlaps.set(key2, []);
        
        overlaps.get(key1).push(key2);
        overlaps.get(key2).push(key1);
      }
    }
  }
  
  // Generate curve offsets for overlapping edges
  const curves = new Map();
  const processed = new Set();
  
  for (const [edgeKey, conflictingEdges] of overlaps) {
    if (processed.has(edgeKey)) continue;
    
    // Group all mutually overlapping edges
    const group = new Set([edgeKey]);
    const toProcess = [...conflictingEdges];
    
    while (toProcess.length > 0) {
      const current = toProcess.pop();
      if (group.has(current)) continue;
      
      group.add(current);
      if (overlaps.has(current)) {
        toProcess.push(...overlaps.get(current).filter(k => !group.has(k)));
      }
    }
    
    // Assign minimal curve offsets to group members
    const groupArray = Array.from(group);
    groupArray.forEach((key, index) => {
      processed.add(key);
      // Use very small offsets to minimize visual obstruction
      const baseOffset = 8 + (index * 3);
      const offset = index % 2 === 0 ? baseOffset : -baseOffset;
      curves.set(key, offset);
    });
  }
  
  return curves;
}

// ------------------ Rendering & interaction ------------------

// preserve existing <defs> (e.g., markers)
function keepDefs() {
  const d = svg.querySelector('defs');
  return d ? d.outerHTML : '';
}

// --- Curve utilities ---
function curveKey(a,b){ return a < b ? `${a}|${b}` : `${b}|${a}`; }

function buildCurveMap(level){
  const map = {};
  
  // First, add manually defined curves
  (level.curvedEdges || []).forEach(entry=>{
    if(Array.isArray(entry)){ // allow ['A','B'] form
      const k = curveKey(entry[0], entry[1]);
      map[k] = 24; // default offset
    } else if (entry && entry.u && entry.v){
      map[curveKey(entry.u, entry.v)] = typeof entry.offset === 'number' ? entry.offset : 24;
    }
  });
  
  // Then, add automatically detected overlapping edges
  const autoDetected = detectOverlappingEdges(level);
  for (const [key, offset] of autoDetected) {
    // Don't override manually defined curves
    if (!map.hasOwnProperty(key)) {
      map[key] = offset;
    }
  }
  
  return map;
}

function controlPoint(p1, p2, offset){
  // quadratic Bézier control point at the midpoint, offset perpendicular to the segment
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  // unit perpendicular (rotate by +90°)
  const px = -dy / len;
  const py =  dx / len;
  return { x: mx + px * offset, y: my + py * offset };
}

function drawStraightEdge(u, v, p1, p2){
  const line = document.createElementNS("http://www.w3.org/2000/svg","line");
  line.setAttribute("x1", p1.x);
  line.setAttribute("y1", p1.y);
  line.setAttribute("x2", p2.x);
  line.setAttribute("y2", p2.y);
  line.setAttribute("class","edge");
  line.dataset.u = u;
  line.dataset.v = v;
  svg.appendChild(line);
}

function drawCurvedEdge(u, v, p1, p2, offset){
  const c = controlPoint(p1, p2, offset);
  const pathEl = document.createElementNS("http://www.w3.org/2000/svg","path");
  const d = `M ${p1.x} ${p1.y} Q ${c.x} ${c.y} ${p2.x} ${p2.y}`;
  pathEl.setAttribute("d", d);
  pathEl.setAttribute("class","edge edge-curved");
  pathEl.setAttribute("fill", "none");
  pathEl.setAttribute("stroke-width", "1.5");
  pathEl.setAttribute("stroke-opacity", "0.6");
  pathEl.setAttribute("stroke-dasharray", "2,2");
  pathEl.dataset.u = u;
  pathEl.dataset.v = v;
  svg.appendChild(pathEl);
}

function drawLevel(level) {
  // preserve defs (marker) and clear rest
  const defs = keepDefs();
  svg.innerHTML = defs;

  nodeElements = {};
  path = [];
  showingSolution = false;
  showPathBtn.style.display = "none";
  nextLevelBtn.style.display = "none";
  restartBtn.style.display = "none";

  levelTitle.textContent = level.name;
  instruction.innerHTML = `Select the shortest path from <b>${level.start}</b> → <b>${level.end}</b>`;

  // prepare curve map (with auto-detection)
  const curveMap = buildCurveMap(level);

  // draw edges (straight or curved)
  level.edges.forEach(([u,v])=>{
    if(!level.nodes[u] || !level.nodes[v]) return;
    const p1 = level.nodes[u], p2 = level.nodes[v];
    const k = curveKey(u,v);
    if (k in curveMap) {
      drawCurvedEdge(u, v, p1, p2, curveMap[k]);
    } else {
      drawStraightEdge(u, v, p1, p2);
    }
  });

  // draw nodes (circle + text)
  Object.entries(level.nodes).forEach(([name, pos])=>{
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx", pos.x);
    circle.setAttribute("cy", pos.y);
    circle.setAttribute("r", 18);
    circle.setAttribute("class", "node");
    circle.dataset.name = name;
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg","text");
    text.setAttribute("x", pos.x);
    text.setAttribute("y", pos.y + 5);
    text.setAttribute("text-anchor", "middle");
    text.textContent = name;
    svg.appendChild(text);

    circle.addEventListener("click", ()=>handleNodeClick(name));
    nodeElements[name] = circle;
  });

  // style start/end
  if(nodeElements[level.start]) nodeElements[level.start].classList.add('start');
  if(nodeElements[level.end]) nodeElements[level.end].classList.add('end');

  // control bindings
  submitBtn.onclick = submitPath;
  resetBtn.onclick = reset;
  showPathBtn.onclick = ()=>{
    if(!showingSolution){
      const sol = findOneShortestPath(level, level.start, level.end);
      if(sol) animateSolution(sol);
      showingSolution=true;
    }
  };
  nextLevelBtn.onclick = goToNextLevel;
  restartBtn.onclick = ()=>{ currentLevel = 0; drawLevel(levels[0]); };

  // show restart if player at end-of-campaign
  restartBtn.style.display = "none";
}

// ------------------ Graph helpers (undirected) ------------------

function buildAdj(level){
  const adj = {};
  Object.keys(level.nodes).forEach(n => adj[n]=[]);
  level.edges.forEach(([u,v])=>{
    if(!(u in adj)) adj[u]=[];
    if(!(v in adj)) adj[v]=[];
    adj[u].push(v);
    adj[v].push(u);
  });
  return adj;
}

// BFS from start: returns {dist,parent,adj}
function bfs(level, start){
  const adj = buildAdj(level);
  const dist = {};
  const parent = {};
  const q = [];
  q.push(start);
  dist[start]=0;
  parent[start]=null;
  while(q.length){
    const u = q.shift();
    (adj[u]||[]).forEach(v=>{
      if(dist[v] === undefined){
        dist[v] = dist[u] + 1;
        parent[v] = u;
        q.push(v);
      }
    });
  }
  return {dist, parent, adj};
}

function shortestDistance(level, start, end){
  const {dist} = bfs(level, start);
  return dist && (end in dist) ? dist[end] : Infinity;
}

function reconstruct(parent, start, end){
  if(!(end in parent)) return null;
  const out = [];
  let cur = end;
  while(cur !== null && cur !== undefined){
    out.push(cur);
    cur = parent[cur];
  }
  out.reverse();
  if(out[0] !== start) return null;
  return out;
}

function findOneShortestPath(level, start, end){
  const {parent} = bfs(level, start);
  return reconstruct(parent, start, end);
}

// ------------------ Interaction logic ------------------

function isConnected(a,b,edges){
  return edges.some(e => (e[0]===a && e[1]===b) || (e[0]===b && e[1]===a));
}

function handleNodeClick(name){
  const level = levels[currentLevel];
  if(!level) return;
  if(path.length === 0 && name !== level.start) return; // must start at start
  const last = path[path.length-1];

  // clicking last node acts as undo
  if(last === name){
    path.pop();
    nodeElements[name].classList.remove('selected');
    return;
  }

  // prevent revisiting
  if(path.includes(name)) return;

  // must be connected to previous
  if(path.length===0 || isConnected(last, name, level.edges)){
    path.push(name);
    nodeElements[name].classList.add('selected');
  }
}

function submitPath(){
  const level = levels[currentLevel];
  if(!level) return;
  if(path.length === 0){ alert("No path selected."); return; }
  if(path[0] !== level.start || path[path.length-1] !== level.end){
    alert("Path must start at start and end at goal.");
    return;
  }
  // verify connectivity of chosen route
  for(let i=0;i<path.length-1;i++){
    if(!isConnected(path[i], path[i+1], level.edges)){
      alert("Invalid step in path (not an edge).");
      return;
    }
  }

  const best = shortestDistance(level, level.start, level.end);
  if(best === Infinity){
    alert("No path exists (level disconnected).");
    return;
  }
  const chosen = path.length - 1;
  if(chosen === best){
    alert(`✅ Correct — your path is one of the shortest (${best} steps).`);
    showPathBtn.style.display = "none";
    nextLevelBtn.style.display = "inline-block";
    restartBtn.style.display = "none";
  } else {
    alert(`❌ Not shortest. Your path uses ${chosen} steps; shortest is ${best}. You can view a shortest path or skip to next level.`);
    showPathBtn.style.display = "inline-block";
    nextLevelBtn.style.display = "inline-block";
  }
}

function goToNextLevel(){
  currentLevel++;
  if(currentLevel < levels.length){
    drawLevel(levels[currentLevel]);
  } else {
    alert("🎉 You've completed all levels (extreme set). Restarting at Level 0.");
    currentLevel = 0;
    drawLevel(levels[0]);
    restartBtn.style.display = "inline-block";
  }
}

function animateSolution(solution){
  // clear current visuals
  reset();
  const level = levels[currentLevel];
  if(!solution || solution.length === 0) return;
  let i = 0;
  const iv = setInterval(()=>{
    if(i < solution.length){
      const n = solution[i];
      if(nodeElements[n]) nodeElements[n].classList.add('selected');
      if(i>0){
        const from = solution[i-1], to = solution[i];
        // match either straight line or curved path via data attributes
        const edges = Array.from(svg.querySelectorAll('.edge'));
        const found = edges.find(el=>{
          const u = el.dataset.u, v = el.dataset.v;
          return (u===from && v===to) || (u===to && v===from);
        });
        if(found) found.classList.add('highlighted');
      }
      i++;
    } else {
      clearInterval(iv);
    }
  }, 300);
}

function reset(){
  path = [];
  Object.values(nodeElements).forEach(n=>n.classList.remove('selected','start','end'));
  svg.querySelectorAll('.edge').forEach(el=>el.classList.remove('highlighted'));
  const lvl = levels[currentLevel];
  if(lvl && nodeElements[lvl.start]) nodeElements[lvl.start].classList.add('start');
  if(lvl && nodeElements[lvl.end]) nodeElements[lvl.end].classList.add('end');
  showPathBtn.style.display = "none";
  nextLevelBtn.style.display = "none";
  showingSolution = false;
}

// initialize
drawLevel(levels[0]);

// expose some methods for console debugging if desired
window._spore = {
  levels, drawLevel, reset, submitPath, goToNextLevel, findOneShortestPath: (l,s,e)=>findOneShortestPath(l,s,e)
};