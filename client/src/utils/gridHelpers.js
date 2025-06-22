// src/utils/gridHelpers.js
// — Added `weight` property (default 1) to each node to enable weighted pathfinding.

import {
  GRID_ROWS,
  GRID_COLS,
  START_NODE,
  END_NODE
} from '../config'

/**
 * Create a 2D grid of node objects, initializing start/end positions.
 * Now each node includes a `weight` (default 1) for weighted algorithms.
 * @returns {Object[][]} The initialized grid.
 */
function createInitialGrid() {
  const grid = []
  for (let row = 0; row < GRID_ROWS; row++) {
    const currentRow = []
    for (let col = 0; col < GRID_COLS; col++) {
      currentRow.push(createNode(row, col))
    }
    grid.push(currentRow)
  }
  return grid
}

/**
 * Create a single node object.
 * @param {number} row - The row index of the node.
 * @param {number} col - The col index of the node.
 * @returns {{
 *   row: number,
 *   col: number,
 *   isStart: boolean,
 *   isEnd: boolean,
 *   isWall: boolean,
 *   isVisited: boolean,
 *   isPath: boolean,
 *   previousNode: Object|null,
 *   weight: number
 * }}
 */
function createNode(row, col) {
  return {
    row,
    col,
    isStart:      row === START_NODE.row && col === START_NODE.col,
    isEnd:        row === END_NODE.row   && col === END_NODE.col,
    isWall:       false,
    isVisited:    false,
    isPath:       false,
    previousNode: null,
    weight:       1    // <-- default cost for weighted algorithms
  }
}

/**
 * Remove any visitation/path flags and clear previousNode pointers.
 * Leaves `weight` intact so custom weights persist across runs.
 * @param {Object[][]} grid - The grid to clear.
 */
function clearGridVisualization(grid) {
  grid.forEach(row =>
    row.forEach(node => {
      node.isVisited = false
      node.isPath = false
      node.previousNode = null
      // node.weight remains unchanged
    })
  )
}

/**
 * Find the first node in the grid with a given boolean property.
 * @param {Object[][]} grid - The grid to search.
 * @param {string} prop - The property to match (e.g. "isStart").
 * @returns {Object|null} The matching node or null if not found.
 */
function findNode(grid, prop) {
  for (const row of grid) {
    for (const node of row) {
      if (node[prop]) return node
    }
  }
  return null
}

/**
 * Shuffle an array in place using Fisher–Yates.
 * @param {Array} array - The array to shuffle.
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

/**
 * Reset start/end flags on the grid so start and end nodes are clear.
 * @param {Object[][]} grid - The grid to update.
 */
function placeStartEnd(grid) {
  grid.forEach(row =>
    row.forEach(node => {
      node.isStart = false
      node.isEnd = false
    })
  )
  const s = grid[START_NODE.row][START_NODE.col]
  s.isWall = false; s.isStart = true
  const e = grid[END_NODE.row][END_NODE.col]
  e.isWall = false; e.isEnd = true
}

/**
 * Carve an opening adjacent to both start and end to prevent isolation.
 * @param {Object[][]} grid - The grid to modify.
 */
function carveEntryExit(grid) {
  const dirs = [
    [0, 1], [1, 0], [0, -1], [-1, 0]
  ]
  const carve = (r, c) => {
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
        grid[nr][nc].isWall = false
        return
      }
    }
  }
  carve(START_NODE.row, START_NODE.col)
  carve(END_NODE.row,   END_NODE.col)
}

/**
 * Generate a maze via recursive division.
 * Guarantees an open perimeter and entry/exit near start/end.
 * @returns {Object[][]} The maze grid.
 */
function createRecursiveDivisionMaze() {
  const grid = createInitialGrid()
  grid.forEach(r => r.forEach(n => (n.isWall = false)))

  // Build perimeter walls
  for (let r = 0; r < GRID_ROWS; r++) {
    grid[r][0].isWall = true
    grid[r][GRID_COLS - 1].isWall = true
  }
  for (let c = 0; c < GRID_COLS; c++) {
    grid[0][c].isWall = true
    grid[GRID_ROWS - 1][c].isWall = true
  }

  function divide(r0, c0, r1, c1) {
    const width = c1 - c0, height = r1 - r0
    if (width < 2 || height < 2) return

    if (width > height) {
      // vertical division
      const cols = []
      for (let c = c0 + 1; c < c1; c += 2) cols.push(c)
      const wallCol = cols[Math.floor(Math.random() * cols.length)]
      const rows = []
      for (let r = r0; r <= r1; r += 2) rows.push(r)
      const holeRow = rows[Math.floor(Math.random() * rows.length)]
      for (let r = r0; r <= r1; r++) {
        if (r !== holeRow) grid[r][wallCol].isWall = true
      }
      divide(r0, c0, r1, wallCol - 1)
      divide(r0, wallCol + 1, r1, c1)
    } else {
      // horizontal division
      const rows = []
      for (let r = r0 + 1; r < r1; r += 2) rows.push(r)
      const wallRow = rows[Math.floor(Math.random() * rows.length)]
      const cols = []
      for (let c = c0; c <= c1; c += 2) cols.push(c)
      const holeCol = cols[Math.floor(Math.random() * cols.length)]
      for (let c = c0; c <= c1; c++) {
        if (c !== holeCol) grid[wallRow][c].isWall = true
      }
      divide(r0, c0, wallRow - 1, c1)
      divide(wallRow + 1, c0, r1, c1)
    }
  }

  divide(1, 1, GRID_ROWS - 2, GRID_COLS - 2)
  placeStartEnd(grid)
  carveEntryExit(grid)
  return grid
}

/**
 * Generate a maze via Prim’s algorithm.
 * @returns {Object[][]} The maze grid.
 */
function createPrimsMaze() {
  const grid = createInitialGrid()
  grid.forEach(r => r.forEach(n => (n.isWall = true)))

  const startRow = 2 * Math.floor(Math.random() * ((GRID_ROWS - 1) / 2)) + 1
  const startCol = 2 * Math.floor(Math.random() * ((GRID_COLS - 1) / 2)) + 1
  grid[startRow][startCol].isWall = false

  const walls = []
  const dirs = [[-2,0],[2,0],[0,-2],[0,2]]
  dirs.forEach(([dr, dc]) => {
    const nr = startRow + dr, nc = startCol + dc
    if (nr > 0 && nr < GRID_ROWS && nc > 0 && nc < GRID_COLS) {
      walls.push({
        row: startRow + dr/2,
        col: startCol + dc/2,
        betweenRow: nr,
        betweenCol: nc
      })
    }
  })

  while (walls.length) {
    const idx = Math.floor(Math.random() * walls.length)
    const { row, col, betweenRow, betweenCol } = walls.splice(idx, 1)[0]
    if (grid[betweenRow][betweenCol].isWall) {
      grid[row][col].isWall = false
      grid[betweenRow][betweenCol].isWall = false
      dirs.forEach(([dr, dc]) => {
        const nr = betweenRow + dr, nc = betweenCol + dc
        if (
          nr > 0 && nr < GRID_ROWS &&
          nc > 0 && nc < GRID_COLS &&
          grid[nr][nc].isWall
        ) {
          walls.push({
            row: betweenRow + dr/2,
            col: betweenCol + dc/2,
            betweenRow: nr,
            betweenCol: nc
          })
        }
      })
    }
  }

  placeStartEnd(grid)
  return grid
}

/**
 * Generate a perfect maze via Eller's algorithm.
 * @returns {Object[][]} The maze grid.
 */
function createEllersMaze() {
  const cellRows = Math.floor(GRID_ROWS / 2)
  const cellCols = Math.floor(GRID_COLS / 2)
  const grid = createInitialGrid()
  grid.forEach(r => r.forEach(n => (n.isWall = true)))

  let sets = Array.from({ length: cellCols }, (_, i) => i)
  let nextSetId = cellCols

  for (let row = 0; row < cellRows; row++) {
    for (let col = 0; col < cellCols; col++) {
      grid[row * 2 + 1][col * 2 + 1].isWall = false
    }

    for (let col = 0; col < cellCols - 1; col++) {
      if (sets[col] !== sets[col + 1] && Math.random() < 0.5) {
        grid[row * 2 + 1][col * 2 + 2].isWall = false
        const oldSet = sets[col + 1]
        const newSet = sets[col]
        sets = sets.map(s => (s === oldSet ? newSet : s))
      }
    }

    if (row === cellRows - 1) {
      for (let col = 0; col < cellCols - 1; col++) {
        if (sets[col] !== sets[col + 1]) {
          grid[row * 2 + 1][col * 2 + 2].isWall = false
          const oldSet = sets[col + 1]
          const newSet = sets[col]
          sets = sets.map(s => (s === oldSet ? newSet : s))
        }
      }
      break
    }

    const hasDown = {}
    const newSets = Array(cellCols).fill(null)
    sets.forEach((setId, col) => {
      if (Math.random() < 0.5 || !hasDown[setId]) {
        grid[row * 2 + 2][col * 2 + 1].isWall = false
        newSets[col] = setId
        hasDown[setId] = true
      }
    })
    const groups = {}
    sets.forEach((s, c) => (groups[s] = [...(groups[s] || []), c]))
    for (const s in groups) {
      if (!hasDown[s]) {
        const cols = groups[s]
        const c = cols[Math.floor(Math.random() * cols.length)]
        grid[row * 2 + 2][c * 2 + 1].isWall = false
        newSets[c] = +s
      }
    }
    for (let col = 0; col < cellCols; col++) {
      if (newSets[col] === null) newSets[col] = nextSetId++
    }
    sets = newSets
  }

  placeStartEnd(grid)
  return grid
}

/**
 * Randomly pick one of the maze generator functions.
 * @returns {Object[][]} The maze grid.
 */
function createRandomMaze() {
  const fns = [
    createRecursiveDivisionMaze,
    createPrimsMaze,
    createEllersMaze
  ]
  const fn = fns[Math.floor(Math.random() * fns.length)]
  return fn()
}

export {
  createInitialGrid,
  createNode,
  clearGridVisualization,
  findNode,
  shuffle,
  placeStartEnd,
  carveEntryExit,
  createRecursiveDivisionMaze,
  createPrimsMaze,
  createEllersMaze,
  createRandomMaze
}
