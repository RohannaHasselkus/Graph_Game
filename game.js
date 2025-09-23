<<<<<<< HEAD
    // --- DOM refs ---
    const svg = document.getElementById("graph");
    const levelTitle = document.getElementById("levelTitle");
    const instruction = document.getElementById("instruction");
    const difficultyInfo = document.getElementById("difficultyInfo");
    const submitBtn = document.getElementById("submitBtn");
    const resetBtn = document.getElementById("resetBtn");
    const showPathBtn = document.getElementById("showPathBtn");
    const nextLevelBtn = document.getElementById("nextLevelBtn");
    const restartBtn = document.getElementById("restartBtn");

    let nodeElements = {};
    let path = [];
    let currentLevel = 1;
    let showingSolution = false;
    let currentGraph = null;
=======
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
>>>>>>> d62cdc3865f943e5f2bd4eee0a7f83cc7c2316b8

    // --- Random Graph Generation with Progressive Difficulty ---
    
    class GraphGenerator {
      constructor() {
        this.rng = Math.random; // Can be replaced with seeded RNG
      }

<<<<<<< HEAD
      // Calculate mathematical difficulty score
      calculateDifficulty(nodes, edges, shortestPath) {
        const n = nodes.length;
        const m = edges.length;
        const density = (2 * m) / (n * (n - 1)); // Edge density
        const avgDegree = (2 * m) / n;
        const shortestLength = shortestPath ? shortestPath.length - 1 : 1;
        
        // Difficulty factors:
        // 1. Graph density (more edges = more confusing paths)
        // 2. Average degree (nodes with many connections)
        // 3. Ratio of total possible paths to shortest path
        // 4. Graph size
        
        const densityFactor = density * 2; // 0-2 range
        const degreeFactor = Math.min(avgDegree / 4, 2); // Cap at 2
        const pathComplexity = Math.log(n) / Math.log(shortestLength + 1);
        const sizeFactor = Math.log(n) / Math.log(10); // Logarithmic scaling
        
        return densityFactor + degreeFactor + pathComplexity + sizeFactor;
      }

      // Generate nodes in a roughly grid-like pattern with some randomness
      generateNodes(count, level) {
        const nodes = {};
        const margin = 80;
        const width = 1200 - 2 * margin;
        const height = 700 - 2 * margin;
        
        // Calculate rough grid dimensions
        const cols = Math.ceil(Math.sqrt(count * width / height));
        const rows = Math.ceil(count / cols);
        
        const nodeNames = this.generateNodeNames(count);
        let nodeIndex = 0;
        
        for (let row = 0; row < rows && nodeIndex < count; row++) {
          for (let col = 0; col < cols && nodeIndex < count; col++) {
            // Base grid position
            const baseX = margin + (col + 0.5) * (width / cols);
            const baseY = margin + (row + 0.5) * (height / rows);
            
            // Add randomness that increases with level - more chaos from start
            const randomFactor = Math.min(20 + level * 15, 60); // Start with more randomness
            const offsetX = (this.rng() - 0.5) * randomFactor;
            const offsetY = (this.rng() - 0.5) * randomFactor;
            
            nodes[nodeNames[nodeIndex]] = {
              x: Math.max(margin, Math.min(1200 - margin, baseX + offsetX)),
              y: Math.max(margin, Math.min(700 - margin, baseY + offsetY))
            };
            nodeIndex++;
          }
=======
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
>>>>>>> d62cdc3865f943e5f2bd4eee0a7f83cc7c2316b8
        }
        
        return nodes;
      }
<<<<<<< HEAD

      // Generate reasonable node names
      generateNodeNames(count) {
        const names = [];
        
        // Use single letters first
        for (let i = 0; i < Math.min(count, 26); i++) {
          names.push(String.fromCharCode(65 + i)); // A, B, C, ...
        }
        
        // Then use numbered names
        for (let i = 26; i < count; i++) {
          names.push(`N${i - 25}`);
=======
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
>>>>>>> d62cdc3865f943e5f2bd4eee0a7f83cc7c2316b8
        }
        
        return names;
      }
<<<<<<< HEAD

      // Generate edges with progressive complexity
      generateEdges(nodes, level) {
        const nodeNames = Object.keys(nodes);
        const n = nodeNames.length;
        const edges = [];
        
        // Calculate target metrics based on level - much denser from start
        const baseDensity = 0.35; // 35% base connectivity (was 15%)
        const levelDensity = Math.min(baseDensity + (level - 1) * 0.12, 0.85); // Cap at 85%, faster growth
        const targetEdges = Math.floor(levelDensity * n * (n - 1) / 2);
        
        // First, ensure connectivity with a spanning tree
        const connected = new Set([nodeNames[0]]);
        const unconnected = new Set(nodeNames.slice(1));
        
        while (unconnected.size > 0) {
          const fromNode = this.randomFromSet(connected);
          const toNode = this.randomFromSet(unconnected);
          
          edges.push([fromNode, toNode]);
          connected.add(toNode);
          unconnected.delete(toNode);
        }
        
        // Add additional edges for complexity
        const existingEdges = new Set();
        edges.forEach(([a, b]) => {
          existingEdges.add(a < b ? `${a}-${b}` : `${b}-${a}`);
=======
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
>>>>>>> d62cdc3865f943e5f2bd4eee0a7f83cc7c2316b8
        });
        
        while (edges.length < targetEdges) {
          const a = nodeNames[Math.floor(this.rng() * n)];
          const b = nodeNames[Math.floor(this.rng() * n)];
          
          if (a !== b) {
            const key = a < b ? `${a}-${b}` : `${b}-${a}`;
            if (!existingEdges.has(key)) {
              // More chaotic edge distribution - less bias towards short edges
              const dist = this.distance(nodes[a], nodes[b]);
              const maxDist = Math.sqrt(1200*1200 + 700*700);
              const probability = 1 - (dist / maxDist) * 0.4; // Less distance bias = more long edges
              
              if (this.rng() < probability) {
                edges.push([a, b]);
                existingEdges.add(key);
              }
            }
          }
        }
        
        return edges;
      }

      randomFromSet(set) {
        const items = Array.from(set);
        return items[Math.floor(this.rng() * items.length)];
      }

      distance(a, b) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
      }

      // Choose start and end nodes that create interesting shortest paths
      chooseStartEnd(nodes, edges, level) {
        const nodeNames = Object.keys(nodes);
        const n = nodeNames.length;
        
        // For higher levels, try to find start/end pairs with interesting paths
        let bestPair = null;
        let bestScore = -1;
        const attempts = Math.min(50, n * n); // More attempts for better paths
        
        for (let i = 0; i < attempts; i++) {
          const start = nodeNames[Math.floor(this.rng() * n)];
          let end = nodeNames[Math.floor(this.rng() * n)];
          while (end === start) {
            end = nodeNames[Math.floor(this.rng() * n)];
          }
          
          const shortestPath = this.findShortestPath(nodes, edges, start, end);
          if (shortestPath && shortestPath.length >= 4) { // Require longer minimum paths
            // Score based on path length and visual separation
            const pathLength = shortestPath.length - 1;
            const visualDistance = this.distance(nodes[start], nodes[end]);
            const score = pathLength * 1.5 + visualDistance / 150; // Prioritize longer paths more
            
            if (score > bestScore) {
              bestScore = score;
              bestPair = { start, end, shortestPath };
            }
          }
        }
        
        // Fallback to any valid pair if no good pair found
        if (!bestPair) {
          for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
              const start = nodeNames[i];
              const end = nodeNames[j];
              const shortestPath = this.findShortestPath(nodes, edges, start, end);
              if (shortestPath) {
                return { start, end, shortestPath };
              }
            }
          }
        }
        
        return bestPair;
      }

      // Generate complete level
      generateLevel(level) {
        // Much harder progressive difficulty scaling
        const baseNodes = 12; // Start with 12 nodes instead of 6
        const nodeCount = Math.min(baseNodes + Math.floor((level - 1) * 2.5), 25); // Faster growth, higher cap
        
        const nodes = this.generateNodes(nodeCount, level);
        const edges = this.generateEdges(nodes, level);
        const { start, end, shortestPath } = this.chooseStartEnd(nodes, edges, level);
        
        const difficulty = this.calculateDifficulty(Object.keys(nodes), edges, shortestPath);
        
        return {
          name: `Level ${level}`,
          nodes,
          edges,
          start,
          end,
          difficulty,
          shortestPath
        };
      }

      // BFS shortest path finder
      findShortestPath(nodes, edges, start, end) {
        const adj = {};
        Object.keys(nodes).forEach(n => adj[n] = []);
        edges.forEach(([u, v]) => {
          adj[u].push(v);
          adj[v].push(u);
        });

        const queue = [start];
        const visited = new Set([start]);
        const parent = { [start]: null };

        while (queue.length > 0) {
          const current = queue.shift();
          
          if (current === end) {
            // Reconstruct path
            const path = [];
            let node = end;
            while (node !== null) {
              path.unshift(node);
              node = parent[node];
            }
            return path;
          }

          for (const neighbor of adj[current] || []) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor);
              parent[neighbor] = current;
              queue.push(neighbor);
            }
          }
        }

        return null; // No path found
      }
    }

<<<<<<< HEAD
    // --- Edge Overlap Detection and Curve Generation ---
    
    function detectOverlappingEdges(nodes, edges) {
      const curves = new Map();
      const tolerance = 15; // Pixels
      
      // Check all pairs of edges for visual overlap
      for (let i = 0; i < edges.length; i++) {
        for (let j = i + 1; j < edges.length; j++) {
          const [u1, v1] = edges[i];
          const [u2, v2] = edges[j];
          
          // Skip if edges share a node
          if (u1 === u2 || u1 === v2 || v1 === u2 || v1 === v2) continue;
          
          const p1 = nodes[u1], q1 = nodes[v1];
          const p2 = nodes[u2], q2 = nodes[v2];
          
          if (lineSegmentsNearlyOverlap(p1, q1, p2, q2, tolerance)) {
            const key1 = edgeKey(u1, v1);
            const key2 = edgeKey(u2, v2);
            
            // Assign curve offsets - alternate positive and negative
            if (!curves.has(key1)) {
              curves.set(key1, 20 + (curves.size % 2) * 10);
            }
            if (!curves.has(key2)) {
              curves.set(key2, -(20 + (curves.size % 2) * 10));
            }
          }
        }
      }
      
      return curves;
    }
=======
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
>>>>>>> d62cdc3865f943e5f2bd4eee0a7f83cc7c2316b8

    function lineSegmentsNearlyOverlap(p1, q1, p2, q2, tolerance) {
      // Calculate minimum distance between line segments
      const minDist = Math.min(
        pointToLineSegmentDistance(p1, p2, q2),
        pointToLineSegmentDistance(q1, p2, q2),
        pointToLineSegmentDistance(p2, p1, q1),
        pointToLineSegmentDistance(q2, p1, q1)
      );
      
      return minDist < tolerance;
    }

    function pointToLineSegmentDistance(point, lineStart, lineEnd) {
      const dx = lineEnd.x - lineStart.x;
      const dy = lineEnd.y - lineStart.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length === 0) return distance(point, lineStart);
      
      const t = Math.max(0, Math.min(1, 
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length)
      ));
      
      const projection = {
        x: lineStart.x + t * dx,
        y: lineStart.y + t * dy
      };
      
      return distance(point, projection);
    }

    function distance(a, b) {
      return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    function edgeKey(a, b) {
      return a < b ? `${a}|${b}` : `${b}|${a}`;
    }

    // --- Rendering Functions ---
    
    function drawLevel(graph) {
      currentGraph = graph;
      
      // Clear SVG (preserve defs)
      const defs = svg.querySelector('defs');
      svg.innerHTML = defs ? defs.outerHTML : '';
      
      nodeElements = {};
      path = [];
      showingSolution = false;
      
      // Update UI
      levelTitle.textContent = graph.name;
      instruction.innerHTML = `Select the shortest path from <strong>${graph.start}</strong> → <strong>${graph.end}</strong>`;
      difficultyInfo.textContent = `Nodes: ${Object.keys(graph.nodes).length} | Edges: ${graph.edges.length} | Difficulty: ${graph.difficulty.toFixed(1)}`;
      
      // Hide action buttons
      showPathBtn.style.display = "none";
      nextLevelBtn.style.display = "none";
      restartBtn.style.display = "none";
      
      // Detect overlapping edges and generate curves
      const curves = detectOverlappingEdges(graph.nodes, graph.edges);
      
      // Draw edges
      graph.edges.forEach(([u, v]) => {
        const p1 = graph.nodes[u];
        const p2 = graph.nodes[v];
        const key = edgeKey(u, v);
        
        if (curves.has(key)) {
          drawCurvedEdge(u, v, p1, p2, curves.get(key));
        } else {
          drawStraightEdge(u, v, p1, p2);
        }
      });
      
      // Draw nodes
      Object.entries(graph.nodes).forEach(([name, pos]) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pos.x);
        circle.setAttribute("cy", pos.y);
        circle.setAttribute("r", 18);
        circle.setAttribute("class", "node");
        circle.dataset.name = name;
        svg.appendChild(circle);
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", pos.x);
        text.setAttribute("y", pos.y + 4);
        text.setAttribute("text-anchor", "middle");
        text.textContent = name;
        svg.appendChild(text);
        
        circle.addEventListener("click", () => handleNodeClick(name));
        nodeElements[name] = circle;
      });
      
      // Style start/end nodes
      if (nodeElements[graph.start]) nodeElements[graph.start].classList.add('start');
      if (nodeElements[graph.end]) nodeElements[graph.end].classList.add('end');
    }

    function drawStraightEdge(u, v, p1, p2) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);
      line.setAttribute("class", "edge");
      line.dataset.u = u;
      line.dataset.v = v;
      svg.appendChild(line);
    }

    function drawCurvedEdge(u, v, p1, p2, offset) {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      // Calculate perpendicular offset
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length === 0) return drawStraightEdge(u, v, p1, p2);
      
      const perpX = -dy / length;
      const perpY = dx / length;
      
      const controlX = midX + perpX * offset;
      const controlY = midY + perpY * offset;
      
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const d = `M ${p1.x} ${p1.y} Q ${controlX} ${controlY} ${p2.x} ${p2.y}`;
      path.setAttribute("d", d);
      path.setAttribute("class", "edge edge-curved");
      path.dataset.u = u;
      path.dataset.v = v;
      svg.appendChild(path);
    }

    // --- Game Logic ---
    
    function isConnected(a, b, edges) {
      return edges.some(([u, v]) => (u === a && v === b) || (u === b && v === a));
    }

    function handleNodeClick(name) {
      if (!currentGraph) return;
      
      // Must start with start node
      if (path.length === 0 && name !== currentGraph.start) return;
      
      const lastNode = path[path.length - 1];
      
      // Clicking last node removes it (undo)
      if (lastNode === name) {
        path.pop();
        nodeElements[name].classList.remove('selected');
        return;
      }
      
      // Can't revisit nodes
      if (path.includes(name)) return;
      
      // Must be connected to previous node
      if (path.length === 0 || isConnected(lastNode, name, currentGraph.edges)) {
        path.push(name);
        nodeElements[name].classList.add('selected');
      }
    }

    function submitPath() {
      if (!currentGraph) return;
      
      if (path.length === 0) {
        alert("No path selected.");
        return;
      }
      
      if (path[0] !== currentGraph.start || path[path.length - 1] !== currentGraph.end) {
        alert(`Path must start at ${currentGraph.start} and end at ${currentGraph.end}.`);
        return;
      }
      
      // Verify all connections
      for (let i = 0; i < path.length - 1; i++) {
        if (!isConnected(path[i], path[i + 1], currentGraph.edges)) {
          alert("Invalid path - not all steps are connected.");
          return;
        }
      }
      
      const playerPathLength = path.length - 1;
      const shortestPathLength = currentGraph.shortestPath.length - 1;
      
      if (playerPathLength === shortestPathLength) {
        alert(`✅ Correct! You found a shortest path (${shortestPathLength} steps).`);
        nextLevelBtn.style.display = "inline-block";
        showPathBtn.style.display = "none";
      } else {
        alert(`❌ Not optimal. Your path: ${playerPathLength} steps, shortest: ${shortestPathLength} steps.`);
        showPathBtn.style.display = "inline-block";
        nextLevelBtn.style.display = "inline-block";
      }
    }

    function showSolution() {
      if (!currentGraph || !currentGraph.shortestPath) return;
      
      reset();
      animatePath(currentGraph.shortestPath);
      showingSolution = true;
    }

    function animatePath(pathToAnimate) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < pathToAnimate.length) {
          const node = pathToAnimate[i];
          if (nodeElements[node]) {
            nodeElements[node].classList.add('selected');
          }
          
          // Highlight edge
          if (i > 0) {
            const prevNode = pathToAnimate[i - 1];
            const currentNode = pathToAnimate[i];
            highlightEdge(prevNode, currentNode);
          }
          
          i++;
        } else {
          clearInterval(interval);
        }
      }, 400);
    }

    function highlightEdge(u, v) {
      const edges = svg.querySelectorAll('.edge');
      for (const edge of edges) {
        const edgeU = edge.dataset.u;
        const edgeV = edge.dataset.v;
        if ((edgeU === u && edgeV === v) || (edgeU === v && edgeV === u)) {
          edge.classList.add('highlighted');
          break;
        }
      }
    }

    function reset() {
      path = [];
      Object.values(nodeElements).forEach(node => {
        node.classList.remove('selected');
      });
      
      svg.querySelectorAll('.edge').forEach(edge => {
        edge.classList.remove('highlighted');
      });
      
      // Restore start/end styling
      if (currentGraph) {
        if (nodeElements[currentGraph.start]) nodeElements[currentGraph.start].classList.add('start');
        if (nodeElements[currentGraph.end]) nodeElements[currentGraph.end].classList.add('end');
      }
      
      showPathBtn.style.display = "none";
      nextLevelBtn.style.display = "none";
      showingSolution = false;
    }

    function nextLevel() {
      currentLevel++;
      const generator = new GraphGenerator();
      const newGraph = generator.generateLevel(currentLevel);
      drawLevel(newGraph);
    }

    function restart() {
      currentLevel = 1;
      const generator = new GraphGenerator();
      const newGraph = generator.generateLevel(currentLevel);
      drawLevel(newGraph);
    }

    // --- Event Listeners ---
    
    submitBtn.addEventListener('click', submitPath);
    resetBtn.addEventListener('click', reset);
    showPathBtn.addEventListener('click', showSolution);
    nextLevelBtn.addEventListener('click', nextLevel);
    restartBtn.addEventListener('click', restart);

    // --- Initialize ---
    
    function initialize() {
      const generator = new GraphGenerator();
      const initialGraph = generator.generateLevel(currentLevel);
      drawLevel(initialGraph);
    }

    initialize();