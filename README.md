## 8-Puzzle Solver: BFS vs. A* Search
This project implements two fundamental search algorithms to solve the classic 8-Puzzle problem. It features a visualizer that renders the puzzle's transition from an initial scrambled state to the goal state in the browser.

## Core Features
BFS (Breadth-First Search): An uninformed search strategy that explores all possible moves layer by layer. It guarantees the shortest path (minimum moves) but explores a large number of nodes.

A (A-Star) Search:* An informed search strategy that uses the Manhattan Distance heuristic. It prioritizes paths that appear to be closer to the solution, significantly reducing the number of nodes checked.

Web Visualization: Uses a simple DOM-based render function to animate the solution steps in real-time.
