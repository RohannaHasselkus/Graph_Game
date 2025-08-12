// game.js — SPORE Extreme (Levels 0–6, dense/decoy graphs, BFS shortest-path acceptance)

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
    ]
  },

  // Level 1 — grid with diagonals + traps
  {
    name: "Level 1 — Grid Ambush",
    start: "A", end: "Y",
    nodes: (()=>{
      // 4x4 irregular grid A..P, plus Q..Y extra ring
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
      // connect grid neighbors and diagonals
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
      // connect to outer ring with many cross links (decoys)
      edges.push(['A','Q'],['B','R'],['C','S'],['D','T']);
      edges.push(['M','U'],['N','V'],['O','W'],['P','X']);
      // cross shortcuts and traps
      edges.push(['E','K'],['F','L'],['G','I'],['H','J'],['I','Q'],['L','S'],['P','Y']);
      // some ring connections
      edges.push(['Q','R'],['R','S'],['S','T'],['T','U'],['U','V'],['V','W'],['W','X'],['X','Q']);
      return edges;
    })(),
    start: 'A',
    end: 'Y'
  },

  // Level 2 — tangled ladder with many crossbars
  {
    name: "Level 2 — Tangled Ladder",
    start: "START", end: "END",
    nodes: (()=>{
      const nodes = {};
      // vertical ladder S0..S7 on left, T0..T7 on right, middle hubs M0..M3
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
      // ladder steps
      for(let i=0;i<7;i++){
        e.push(['L'+i,'L'+(i+1)]);
        e.push(['R'+i,'R'+(i+1)]);
      }
      // horizontal rungs & many cross links
      for(let i=0;i<8;i++){
        e.push(['L'+i,'R'+i]); // rung
        if(i<7){
          e.push(['L'+i,'R'+(i+1)]);
          e.push(['R'+i,'L'+(i+1)]);
        }
        if(i%2===0) e.push(['L'+i,'M'+(i/2)]);
        if(i%2===1) e.push(['R'+i,'M'+((i-1)/2)]);
      }
      // start & end attachments
      e.push(['START','L0'],['R7','END'],['M0','M1'],['M1','M2'],['M2','M3'],['M3','END']);
      // extra traps & loops
      e.push(['L2','L5'],['R1','R6'],['L3','R4'],['L4','M2'],['M1','R5']);
      return e;
    })()
  },

  // Level 3 — chaotic hub-n-spoke with decoy rings
  {
    name: "Level 3 — Chaotic Hubs",
    start: "A0", end: "Z9",
    nodes: (()=>{
      const nodes = {};
      // central hubs H0..H3
      for(let h=0;h<4;h++) nodes['H'+h] = { x:360 + h*140, y:260 + (h%2?40:-40) };
      // spokes A0..A7 and B0..B7 around hubs
      for(let i=0;i<8;i++){
        nodes['A'+i] = { x:80 + i*120, y:60 + (i%3)*40 + (i%2?20:-20) };
        nodes['B'+i] = { x:80 + i*120, y:520 - (i%3)*40 + (i%2?-20:20) };
      }
      // goal
      nodes['Z9'] = { x:1100, y:320 };
      return nodes;
    })(),
    edges: (()=>{
      const e=[];
      // connect spokes to multiple hubs (dense)
      for(let i=0;i<8;i++){
        e.push(['A'+i,'H'+(i%4)]);
        e.push(['A'+i,'H'+((i+1)%4)]);
        e.push(['B'+i,'H'+(i%4)]);
        e.push(['B'+i,'H'+((i+3)%4)]);
      }
      // connect hubs in a near-complete mesh
      e.push(['H0','H1'],['H0','H2'],['H0','H3'],['H1','H2'],['H1','H3'],['H2','H3']);
      // connect some spokes between each other to make loops
      for(let i=0;i<7;i++){
        e.push(['A'+i,'A'+(i+1)], ['B'+i,'B'+(i+1)]);
      }
      // several random cross edges forming decoys
      e.push(['A1','B5'],['A2','B2'],['A3','A7'],['B0','H1'],['A5','H3'],['H2','Z9'],['B7','Z9']);
      return e;
    })()
  },

  // Level 4 — multi-layer mesh + bottlenecks
  {
    name: "Level 4 — Mesh & Bottlenecks",
    start: "S", end: "G",
    nodes: (()=>{
      const nodes = {};
      // top layer T0..T5
      for(let i=0;i<6;i++) nodes['T'+i] = { x:80 + i*180, y:80 + ((i%2)?12:-12) };
      // mid layer M0..M5
      for(let i=0;i<6;i++) nodes['M'+i] = { x:80 + i*180, y:260 + ((i%2)?-10:10) };
      // bottom layer B0..B5
      for(let i=0;i<6;i++) nodes['B'+i] = { x:80 + i*180, y:440 + ((i%2)?14:-14) };
      nodes['S'] = {x:20,y:60}; nodes['G'] = {x:1100,y:360};
      return nodes;
    })(),
    edges: (()=>{
      const e=[];
      // full horizontal connects with diagonals (dense mesh)
      for(let row of ['T','M','B']){
        for(let i=0;i<5;i++) e.push([row+i, row+(i+1)]);
      }
      // vertical and cross links
      for(let i=0;i<6;i++){
        e.push(['T'+i,'M'+i], ['M'+i,'B'+i], ['T'+i,'M'+((i+1)%6)], ['M'+i,'B'+((i+5)%6)]);
      }
      // cross-level diagonals and loops
      e.push(['T0','M2'],['T1','B3'],['M2','B4'],['T3','M5'],['M1','B0'],['B5','G'],['S','T0'],['T5','G']);
      // extra inner mesh
      e.push(['M0','M2'],['M1','M3'],['M2','M4'],['M3','M5']);
      return e;
    })()
  },

  // Level 5 — deceptive labyrinth with equally short alternatives
  {
    name: "Level 5 — Labyrinth of Equals",
    start: "Start", end: "Goal",
    nodes: (()=>{
      const nodes = {};
      // ring of 12 nodes R0..R11
      for(let i=0;i<12;i++){
        const a = Math.PI * 2 * i / 12;
        nodes['R'+i] = { x:600 + Math.round(Math.cos(a)*420), y:350 + Math.round(Math.sin(a)*220) };
      }
      // inner core C0..C5
      for(let i=0;i<6;i++){
        const a = Math.PI * 2 * i / 6;
        nodes['C'+i] = { x:600 + Math.round(Math.cos(a)*160), y:350 + Math.round(Math.sin(a)*90) };
      }
      nodes['Start'] = {x:120,y:340}; nodes['Goal'] = {x:1080,y:360};
      return nodes;
    })(),
    edges: (()=>{
      const e=[];
      // ring connections
      for(let i=0;i<12;i++){
        e.push(['R'+i, 'R'+((i+1)%12)]);
        // spokes to core nodes (2-to-1)
        e.push(['R'+i, 'C'+(i%6)]);
      }
      // core full mesh
      for(let i=0;i<6;i++){
        for(let j=i+1;j<6;j++) e.push(['C'+i,'C'+j]);
      }
      // connect start and goal into ring at multiple points (decoy symmetry)
      e.push(['Start','R0'],['Start','R3'],['Start','R5'],['Goal','R6'],['Goal','R9'],['Goal','R11']);
      // add some cross-links across ring to create many equal-length routes
      e.push(['R1','R7'],['R2','R8'],['R4','R10'],['R3','R9']);
      return e;
    })()
  },

  // Level 6 — final brain-melter: near-complete graph with sparse bottlenecks
  {
    name: "Level 6 — Final Brain-Melter",
    start: "A", end: "Z",
    nodes: (()=>{
      const nodes = {};
      // create 18 nodes N0..N17 positioned irregularly
      for(let i=0;i<18;i++){
        nodes['N'+i] = { x:80 + (i%6)*180 + (i%2?22:-22), y:80 + Math.floor(i/6)*220 + (i%3?12:-12) };
      }
      // add start A at left, end Z at far right
      nodes['A'] = {x:20,y:220}; nodes['Z'] = {x:1160,y:360};
      return nodes;
    })(),
    edges: (()=>{
      const e=[];
      // near-complete connections among N0..N17 (but omit a few to make hard)
      for(let i=0;i<18;i++){
        for(let j=i+1;j<18;j++){
          // omit some edges to create pockets: skip if (i+j)%7==0 to add subtle sparse cuts
          if(((i+j) % 7) !== 0) e.push(['N'+i,'N'+j]);
        }
      }
      // connect A to a selection of nodes (not all) — bottleneck choices
      e.push(['A','N0'],['A','N2'],['A','N5']);
      // connect Z to a handful of nodes to force convergence
      e.push(['Z','N16'],['Z','N17'],['Z','N10']);
      // connect several N's to Z via intermediate bridges
      e.push(['N8','Z'],['N13','Z']);
      // add some long-shot decoys linking A -> Z via many nodes to look tempting
      e.push(['A','N7'],['N7','N12'],['N12','Z']);
      return e;
    })()
  }
];

// ------------------ Rendering & interaction ------------------

function keepDefs() {
  const d = svg.querySelector('defs');
  return d ? d.outerHTML : '';
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

  // draw edges
  level.edges.forEach(([u,v])=>{
    // sanity check nodes exist
    if(!level.nodes[u] || !level.nodes[v]) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", level.nodes[u].x);
    line.setAttribute("y1", level.nodes[u].y);
    line.setAttribute("x2", level.nodes[v].x);
    line.setAttribute("y2", level.nodes[v].y);
    line.setAttribute("class","edge");
    svg.appendChild(line);
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
  showPathBtn.onclick = ()=>{ if(!showingSolution){ const sol = findOneShortestPath(level, level.start, level.end); if(sol) animateSolution(sol); showingSolution=true; } };
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

// Reconstruct one BFS parent-based path (shortest by edge count)
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

  // compute true shortest distance
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
        // find corresponding line (match coordinates)
        const lines = Array.from(svg.querySelectorAll('line'));
        const found = lines.find(l=>{
          const x1 = Number(l.getAttribute('x1')), y1 = Number(l.getAttribute('y1'));
          const x2 = Number(l.getAttribute('x2')), y2 = Number(l.getAttribute('y2'));
          const pFrom = level.nodes[from], pTo = level.nodes[to];
          return (pFrom && pTo) && (
            (x1===pFrom.x && y1===pFrom.y && x2===pTo.x && y2===pTo.y) ||
            (x1===pTo.x && y1===pTo.y && x2===pFrom.x && y2===pFrom.y)
          );
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
  svg.querySelectorAll('.edge').forEach(l=>l.classList.remove('highlighted'));
  // re-mark start/end for current level
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
