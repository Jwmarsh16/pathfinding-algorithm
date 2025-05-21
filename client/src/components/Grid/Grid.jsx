// src/components/Grid/Grid.jsx
import React, { useState } from 'react'
import Node from './Node'
import './Grid.css'

// helper to deep‐clone grid + nodes
function cloneGrid(grid) {
  return grid.map(row => row.map(node => ({ ...node })))
}

function Grid({ grid, setGrid }) {
  const [isMousePressed, setIsMousePressed]         = useState(false)
  const [isStartNodeDragged, setIsStartNodeDragged] = useState(false)
  const [isEndNodeDragged, setIsEndNodeDragged]     = useState(false)

  // Predefined grid configurations
  const predefinedGrids = {
    empty: createEmptyGrid,
    smallMaze: createSmallMaze,
    diagonalWalls: createDiagonalWalls,
  }

  const handleMouseDown = (row, col) => {
    const newGrid = cloneGrid(grid)
    const node    = newGrid[row][col]

    if (node.isStart) {
      setIsStartNodeDragged(true)
    } else if (node.isEnd) {
      setIsEndNodeDragged(true)
    } else {
      node.isWall = !node.isWall
    }

    setGrid(newGrid)
    setIsMousePressed(true)
  }

  const handleMouseEnter = (row, col) => {
    if (!isMousePressed) return

    const newGrid = cloneGrid(grid)
    const node    = newGrid[row][col]

    if (isStartNodeDragged) {
      moveNode(newGrid, 'isStart', row, col)
    } else if (isEndNodeDragged) {
      moveNode(newGrid, 'isEnd', row, col)
    } else {
      node.isWall = true
    }

    setGrid(newGrid)
  }

  const handleMouseUp = () => {
    setIsMousePressed(false)
    setIsStartNodeDragged(false)
    setIsEndNodeDragged(false)
  }

  const moveNode = (grid, nodeType, row, col) => {
    for (const rowArr of grid) {
      for (const n of rowArr) {
        if (n[nodeType]) {
          n[nodeType] = false
        }
      }
    }
    grid[row][col][nodeType] = true
  }

  const loadPredefinedGrid = (type) => {
    if (predefinedGrids[type]) {
      setGrid(predefinedGrids[type]())
    }
  }

  return (
    <div>
      <div className="grid-controls">
        <select
          onChange={(e) => loadPredefinedGrid(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Select Grid Configuration
          </option>
          <option value="empty">Empty Grid</option>
          <option value="smallMaze">Small Maze</option>
          <option value="diagonalWalls">Diagonal Walls</option>
        </select>
      </div>

      <div
        className="visualizer-canvas"
        onMouseLeave={handleMouseUp}
      >
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((node, colIndex) => (
              <Node
                key={`${rowIndex}-${colIndex}`}
                node={node}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function createEmptyGrid() {
  const rows = 20, cols = 50
  const grid = []
  for (let r = 0; r < rows; r++) {
    const rowArr = []
    for (let c = 0; c < cols; c++) {
      rowArr.push(createNode(r, c))
    }
    grid.push(rowArr)
  }
  return grid
}

function createSmallMaze() {
  const grid = createEmptyGrid()
  grid.forEach((rowArr, r) => {
    if (r % 2 === 0) {
      rowArr.forEach((n, c) => {
        if (c % 2 === 0) n.isWall = true
      })
    }
  })
  return grid
}

function createDiagonalWalls() {
  const grid = createEmptyGrid()
  const max  = grid[0].length - 1
  grid.forEach((rowArr, r) =>
    rowArr.forEach((n, c) => {
      if (r === c || r + c === max) n.isWall = true
    })
  )
  return grid
}

function createNode(row, col) {
  return {
    row,
    col,
    isStart:   row === 10 && col === 5,
    isEnd:     row === 10 && col === 45,
    isWall:    false,
    isVisited: false,
    isPath:    false,
  }
}

export default Grid
