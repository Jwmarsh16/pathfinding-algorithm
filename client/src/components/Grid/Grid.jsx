// src/components/Grid/Grid.jsx
/**
 * File: src/components/Grid/Grid.jsx
 *
 * Always renders the grid-controls element to preserve spacing.
 * Uses CSS visibility to show or hide the controls based on showControls.
 */

import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  toggleWall,
  moveStart,
  moveEnd,
  loadPreset,
  resetPathThunk
} from '../../store/pathfinderSlice'
import {
  createRecursiveDivisionMaze,
  createPrimsMaze,
  createEllersMaze,
  createRandomMaze
} from '../../utils/gridHelpers'
import Node from './Node'
import './Grid.css'

function Grid({ grid, showControls = true }) {
  const dispatch = useDispatch()
  const [isMousePressed, setIsMousePressed] = useState(false)
  const [isStartNodeDragged, setIsStartNodeDragged] = useState(false)
  const [isEndNodeDragged, setIsEndNodeDragged] = useState(false)

  const predefinedGrids = {
    empty: createEmptyGrid,
    smallMaze: createSmallMaze,
    recursiveDivision: createRecursiveDivisionMaze,
    prims: createPrimsMaze,
    ellers: createEllersMaze,
    random: createRandomMaze
  }

  const handleMouseDown = (row, col) => {
    const node = grid[row][col]
    if (node.isStart) setIsStartNodeDragged(true)
    else if (node.isEnd) setIsEndNodeDragged(true)
    else dispatch(toggleWall({ row, col }))
    setIsMousePressed(true)
  }

  const handleMouseEnter = (row, col) => {
    if (!isMousePressed) return
    if (isStartNodeDragged) dispatch(moveStart({ row, col }))
    else if (isEndNodeDragged) dispatch(moveEnd({ row, col }))
    else dispatch(toggleWall({ row, col }))
  }

  const handleMouseUp = () => {
    setIsMousePressed(false)
    setIsStartNodeDragged(false)
    setIsEndNodeDragged(false)
  }

  const loadPredefinedGrid = (type) => {
    const factory = predefinedGrids[type]
    if (!factory) return
    dispatch(resetPathThunk())
    dispatch(loadPreset(factory()))
  }

  return (
    <div>
      <div
        className="grid-controls"
        style={{ visibility: showControls ? 'visible' : 'hidden' }}
      >
        <select
          onChange={e => loadPredefinedGrid(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>
            Select Grid Configuration
          </option>
          <option value="empty">Empty Grid</option>
          <option value="smallMaze">Small Maze</option>
          <option value="recursiveDivision">Recursive Division Maze</option>
          <option value="prims">Prim’s Maze</option>
          <option value="ellers">Eller’s Maze</option>
          <option value="random">Random Maze</option>
        </select>
        <button
          type="button"
          onClick={() => loadPredefinedGrid('random')}
        >
          Generate Random Maze
        </button>
      </div>
      <div
        className="visualizer-canvas"
        onMouseLeave={handleMouseUp}
      >
        {grid.map((rowArr, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {rowArr.map((node, colIndex) => (
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
