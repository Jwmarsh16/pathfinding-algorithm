// src/algorithms/bfs.js

/**
 * Breadth-First Search (BFS) for grid pathfinding.
 * @param {Object[][]} grid             2D array of node objects.
 * @param {Object} startNode            Starting node.
 * @param {Object} endNode              Target node.
 * @param {function(node: Object, isPath: boolean): void} visualize
 *                                      Callback to visualize nodes. 
 *                                      `isPath` true for final path nodes.
 * @returns {{ visitedNodes: Object[], path: Object[] }}
 */
function bfs(grid, startNode, endNode, visualize) {
  // 1. Reset all nodes
  for (const row of grid) {
    for (const node of row) {
      node.visited = false;
      node.previousNode = null;
    }
  }

  const visitedNodesInOrder = [];
  const queue = [];

  // 2. Seed queue with start
  startNode.visited = true;
  queue.push(startNode);

  // 3. BFS loop
  while (queue.length > 0) {
    const current = queue.shift();
    visitedNodesInOrder.push(current);

    // visualize visit
    if (visualize) visualize(current, false);

    // if reached end, stop exploring
    if (current === endNode) break;

    // explore neighbors
    for (const neighbor of getUnvisitedNeighbors(current, grid)) {
      neighbor.visited = true;
      neighbor.previousNode = current;
      queue.push(neighbor);
    }
  }

  // 4. Reconstruct path
  const path = [];
  let curr = endNode;
  while (curr !== null) {
    path.unshift(curr);
    curr = curr.previousNode;
  }

  // if no valid path, return empty path
  if (path.length === 0 || path[0] !== startNode) {
    return { visitedNodes: visitedNodesInOrder, path: [] };
  }

  // visualize path
  for (const node of path) {
    if (visualize) visualize(node, true);
  }

  return { visitedNodes: visitedNodesInOrder, path };
}

/**
 * Returns all unvisited, non-wall neighbors of `node`.
 * @param {Object} node
 * @param {Object[][]} grid
 * @returns {Object[]}
 */
function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { row, col } = node;

  if (row > 0)               neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0)               neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);

  return neighbors.filter(n => !n.visited && !n.isWall);
}

export default bfs;
