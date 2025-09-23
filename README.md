# Graph Game

This is an interactive puzzle game that turns Graph Theory into a playable experience. Players must discover shortest paths in progressively harder networks, while the computer checks solutions using classical graph algorithms.  
[Play the Game](https://rohannahasselkus.github.io/Graph_Game/)  

---

## Gameplay

1. **Choose a Level** – Six levels of increasing difficulty.  
2. **Select Nodes** – Build a pathway from the start node to the end node.  
   - Must begin at the designated start.  
   - Each move must follow an edge.  
   - No revisiting nodes.  
3. **Submit** – The game checks your path.  
   - Correct: Your path matches the graph’s shortest path.  
   - Incorrect: The computer shows how your attempt compares.  
4. **Progress** – Advance to the next level or replay to improve.  

---

## The Mathematics

- A **graph** is a pair \( G = (V, E) \) where  
  - \( V \) is a set of **vertices (nodes)**  
  - \( E \subseteq V \times V \) is a set of **edges (connections)**  
- A **walk** is a sequence of vertices \( (v_0, v_1, \dots, v_k) \) where each \( (v_i, v_{i+1}) \in E \).  
- A **path** is a walk with no repeated vertices.  

In this game:  
- You construct a path from a start \( s \) to an end \( t \).  
- The computer checks whether your path has the minimum possible length.  

The computer uses Breadth-First Search (BFS) to determine the shortest path length.  

**Theorem.** BFS finds the shortest path between two vertices \( s, t \) in an unweighted graph.  

**Proof.**  
- BFS explores vertices in increasing order of distance from \( s \).  
- Let \( d(v) \) be the length of the shortest path from \( s \) to \( v \).  
- BFS first discovers \( v \) at level \( d(v) \).  
- Suppose BFS discovered a shorter path of length \( < d(v) \). This contradicts the definition of \( d(v) \) as the shortest distance.  
- Thus, BFS always finds a path of minimum length. ∎

- **Player’s task**: find a shortest path manually (human problem-solving).  
- **Computer’s task**: BFS runs in  
  \[
  O(|V| + |E|)
  \]  
  which is linear in the size of the graph.  

When the player selects a pathway, the computer compares the number of steps taken manually by the player to what was found using breadth-first search, and if those numbers are equal, the player is correct. Otherwise, the player has a false solution. 
