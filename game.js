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

    // --- Random Graph Generation with Progressive Difficulty ---
    
    class GraphGenerator {
      constructor() {
        this.rng = Math.random; // Can be replaced with seeded RNG
      }

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
        }
        
        return nodes;
      }

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
        }
        
        return names;
      }

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
        
        // Remove any direct edge between potential start/end to force longer paths
        const edgesWithoutDirect = (start, end) => {
          return edges.filter(([u, v]) => 
            !((u === start && v === end) || (u === end && v === start))
          );
        };
        
        // For higher levels, try to find start/end pairs with interesting paths
        let bestPair = null;
        let bestScore = -1;
        const minPathLength = Math.max(3, Math.min(3 + Math.floor(level / 2), 6)); // Progressive minimum
        const attempts = Math.min(100, n * n); // More attempts for better paths
        
        for (let i = 0; i < attempts; i++) {
          const start = nodeNames[Math.floor(this.rng() * n)];
          let end = nodeNames[Math.floor(this.rng() * n)];
          while (end === start) {
            end = nodeNames[Math.floor(this.rng() * n)];
          }
          
          // Check with direct edge removed
          const filteredEdges = edgesWithoutDirect(start, end);
          const shortestPath = this.findShortestPath(nodes, filteredEdges, start, end);
          
          if (shortestPath && shortestPath.length >= minPathLength) {
            // Score based on path length and visual separation
            const pathLength = shortestPath.length - 1;
            const visualDistance = this.distance(nodes[start], nodes[end]);
            const score = pathLength * 2 + visualDistance / 100; // Prioritize longer paths
            
            if (score > bestScore) {
              bestScore = score;
              bestPair = { start, end, shortestPath, filteredEdges };
            }
          }
        }
        
        // Fallback: try all pairs to find the longest path
        if (!bestPair) {
          for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
              const start = nodeNames[i];
              const end = nodeNames[j];
              const filteredEdges = edgesWithoutDirect(start, end);
              const shortestPath = this.findShortestPath(nodes, filteredEdges, start, end);
              
              if (shortestPath && (!bestPair || shortestPath.length > bestPair.shortestPath.length)) {
                bestPair = { start, end, shortestPath, filteredEdges };
                bestScore = shortestPath.length;
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
        const { start, end, shortestPath, filteredEdges } = this.chooseStartEnd(nodes, edges, level);
        
        const difficulty = this.calculateDifficulty(Object.keys(nodes), filteredEdges, shortestPath);
        
        return {
          name: `Level ${level}`,
          nodes,
          edges: filteredEdges, // Use edges WITHOUT direct start-end connection
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
