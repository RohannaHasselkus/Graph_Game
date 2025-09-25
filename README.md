# Graph Pathfinding Game

This is an interactive puzzle that turns **Graph Theory** into a playable experience. Players must discover shortest paths in progressively harder networks, while the computer verifies solutions using classical graph algorithms.  
[Play the Game](https://rohannahasselkus.github.io/Graph_Game/)

---

## Gameplay

1. **Choose a Level** – Levels increase in difficulty with more nodes, edges, and visual complexity.  
2. **Select Nodes** – Build a path from the start node to the end node.  
   - Must begin at the designated start node.  
   - Each move must follow a valid edge.  
   - No revisiting nodes.  
3. **Submit** – The game checks your path.  
   - ✅ Correct: Path matches the shortest path of the graph.  
   - ❌ Incorrect: Game compares your path to the optimal path.  
4. **Progress** – Advance to the next level or replay to improve.

---

## The Mathematics

### Graph Basics
- A **graph** is a pair \\( G = (V, E) \\) where  
  - \\( V \\) is the set of **vertices (nodes)**  
  - \\( E \\subseteq V \times V \\) is the set of **edges (connections)**
- A **walk** is a sequence \\( (v_0, v_1, ..., v_k) \\) where each \\( (v_i, v_{i+1}) \in E \\)  
- A **path** is a walk with no repeated vertices  

**Player’s task:** construct a path from start \\( s \\) to end \\( t \\)  
**Computer’s task:** verify the shortest path using BFS

---

### Breadth-First Search (BFS)

**Theorem.** BFS finds the shortest path between two vertices \\( s, t \\) in an unweighted graph.

**Proof.**  
1. BFS explores vertices in order of increasing distance from \\( s \\).  
2. Let \\( d(v) \\) denote the shortest path length from \\( s \\) to \\( v \\).  
3. BFS discovers \\( v \\) at level \\( d(v) \\).  
4. Assume BFS found a path shorter than \\( d(v) \\). Contradiction arises because \\( d(v) \\) is minimal.  
5. Therefore, BFS finds a minimum-length path. ∎

- **Time Complexity:** \\( O(|V| + |E|) \\)  
- **Space Complexity:** \\( O(|V|) \\)

---

### Difficulty Score

The game calculates a difficulty metric combining graph structure and path complexity:

- **Density:**  
\\[
\text{Density} = \frac{2m}{n(n-1)}
\\]  
- **Average Degree:**  
\\[
\text{AvgDegree} = \frac{2m}{n}
\\]  
- **Path Complexity:**  
\\[
\text{PathComplexity} = \frac{\log n}{\log(\ell + 1)}
\\]  
where \\( \ell \\) is the shortest path length  
- **Size Factor:**  
\\[
\text{SizeFactor} = \frac{\log n}{\log 10}
\\]

**Combined Difficulty:**  
\\[
D = 2 \cdot \text{Density} + \min(\text{AvgDegree}/4, 2) + \text{PathComplexity} + \text{SizeFactor}
\\]

---

### Node Placement

- Nodes are arranged on a grid with random offsets that grow with level.  
- Ensures readability and increasing visual complexity.  
- Positions are clamped within canvas margins.

### Edge Generation

1. **Spanning Tree:** ensures connectivity (n-1 edges)  
2. **Extra Edges:** added probabilistically using distance-biased probability:  
\\[
P(\text{add edge}) = 1 - 0.4 \cdot \frac{d}{d_{max}}
\\]  
3. Edge density increases with level, capped for playability.

### Edge Curvature

- Detect overlapping edges using segment distance.  
- Apply perpendicular offsets for clarity.  
- Render as quadratic Bézier curves.

---

## Difficulty Progression

- **Starting nodes:** 12  
- **Node growth per level:** \\( n = \min(12 + \lfloor 2.5 \cdot (\text{level}-1) \rfloor, 25) \\)  
- **Base density:** 35%  
- **Density growth per level:** +12%, capped at 85%  
- **Random node offset:** increases with level  
- **Curve threshold:** 15 px
