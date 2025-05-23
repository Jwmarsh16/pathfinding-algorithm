// src/algorithms/astar.js

/**
 * A* Search for grid pathfinding with Manhattan heuristic.
 * @param {Object[][]} grid       2D array of node objects.
 * @param {Object} startNode      Starting node.
 * @param {Object} endNode        Target node.
 * @returns {{ visitedNodes: Object[], path: Object[] }}
 */
function astar(grid, startNode, endNode) {
  // reset all nodes
  for (const row of grid) {
    for (const node of row) {
      node.g = Infinity        // cost from start
      node.h = 0               // heuristic
      node.f = Infinity        // g + h
      node.visited = false
      node.previousNode = null
    }
  }

  const visitedNodesInOrder = []
  startNode.g = 0
  startNode.h = manhattan(startNode, endNode)
  startNode.f = startNode.h

  // simple priority queue by f-value
  const openSet = [startNode]

  while (openSet.length) {
    // sort so lowest f is first
    openSet.sort((a, b) => a.f - b.f)
    const current = openSet.shift()
    if (current.visited) continue

    current.visited = true
    visitedNodesInOrder.push(current)

    if (current === endNode) break

    for (const neighbor of getNeighbors(current, grid)) {
      if (neighbor.isWall || neighbor.visited) continue

      const tentativeG = current.g + 1
      if (tentativeG < neighbor.g) {
        neighbor.previousNode = current
        neighbor.g = tentativeG
        neighbor.h = manhattan(neighbor, endNode)
        neighbor.f = neighbor.g + neighbor.h
        openSet.push(neighbor)
      }
    }
  }

  // reconstruct path
  const path = []
  let curr = endNode
  while (curr) {
    path.unshift(curr)
    curr = curr.previousNode
  }
  // if it doesn’t actually reach the start, no valid path
  if (path[0] !== startNode) {
    return { visitedNodes: visitedNodesInOrder, path: [] }
  }

  return { visitedNodes: visitedNodesInOrder, path }
}

/**
 * Manhattan distance heuristic.
 */
function manhattan(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

/**
 * Get all neighbors (up, right, down, left).
 */
function getNeighbors(node, grid) {
  const { row, col } = node
  const neighbors = []
  if (row > 0)                  neighbors.push(grid[row - 1][col])
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1])
  if (row < grid.length - 1)    neighbors.push(grid[row + 1][col])
  if (col > 0)                  neighbors.push(grid[row][col - 1])
  return neighbors
}

export default astar
