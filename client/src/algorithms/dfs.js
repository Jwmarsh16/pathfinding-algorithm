// src/algorithms/dfs.js

/**
 * Depth-First Search (DFS) for grid pathfinding.
 * @param {Object[][]} grid     2D array of node objects.
 * @param {Object} startNode    Starting node.
 * @param {Object} endNode      Target node.
 * @returns {{ visitedNodes: Object[], path: Object[] }}
 */
function dfs(grid, startNode, endNode) {
  // reset all nodes
  for (const row of grid) {
    for (const node of row) {
      node.visited = false
      node.previousNode = null
    }
  }

  const visitedNodesInOrder = []
  const stack = [startNode]
  startNode.visited = true

  while (stack.length) {
    const current = stack.pop()
    visitedNodesInOrder.push(current)

    if (current === endNode) break

    // push neighbors in reverse order so traversal order is consistent
    const neighbors = getUnvisitedNeighbors(current, grid)
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neigh = neighbors[i]
      neigh.visited = true
      neigh.previousNode = current
      stack.push(neigh)
    }
  }

  // build path back to start
  const path = []
  let curr = endNode
  while (curr) {
    path.unshift(curr)
    curr = curr.previousNode
  }
  // if it didn’t actually reach the start, return empty path
  if (path[0] !== startNode) {
    return { visitedNodes: visitedNodesInOrder, path: [] }
  }

  return { visitedNodes: visitedNodesInOrder, path }
}

/**
 * Grab all unvisited, non-wall neighbors of a node.
 * @param {Object} node
 * @param {Object[][]} grid
 * @returns {Object[]}
 */
function getUnvisitedNeighbors(node, grid) {
  const { row, col } = node
  const neighbors = []
  if (row > 0)                     neighbors.push(grid[row - 1][col])
  if (col < grid[0].length - 1)    neighbors.push(grid[row][col + 1])
  if (row < grid.length - 1)       neighbors.push(grid[row + 1][col])
  if (col > 0)                     neighbors.push(grid[row][col - 1])
  return neighbors.filter(n => !n.visited && !n.isWall)
}

export default dfs
