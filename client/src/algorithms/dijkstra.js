// src/algorithms/dijkstra.js
// — Updated cost calculation to use `neighbor.weight` instead of fixed 1.

function dijkstra(grid, startNode, endNode) {
  // reset all nodes
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity
      node.visited = false
      node.previousNode = null
    }
  }

  const visitedNodesInOrder = []
  startNode.distance = 0

  // simple priority queue: array sorted by node.distance
  const pq = [startNode]

  while (pq.length) {
    pq.sort((a, b) => a.distance - b.distance)
    const current = pq.shift()
    if (current.visited) continue

    current.visited = true
    visitedNodesInOrder.push(current)

    if (current === endNode) break

    for (const neighbor of getNeighbors(current, grid)) {
      if (neighbor.visited || neighbor.isWall) continue

      // factor in the node’s weight
      const alt = current.distance + neighbor.weight
      if (alt < neighbor.distance) {
        neighbor.distance = alt
        neighbor.previousNode = current
        pq.push(neighbor)
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
  if (path[0] !== startNode) {
    return { visitedNodes: visitedNodesInOrder, path: [] }
  }

  return { visitedNodes: visitedNodesInOrder, path }
}

function getNeighbors(node, grid) {
  const { row, col } = node
  const neighbors = []
  if (row > 0)                  neighbors.push(grid[row - 1][col])
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1])
  if (row < grid.length - 1)    neighbors.push(grid[row + 1][col])
  if (col > 0)                  neighbors.push(grid[row][col - 1])
  return neighbors
}

export default dijkstra
