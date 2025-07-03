/* File: src/components/Grid/Grid.jsx
 *
 * Change the Generate button so it reruns the currently selected maze
 * preset (falling back to random) instead of always using the random maze.
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
  const [selectedPreset, setSelectedPreset] = useState('')

  const predefinedGrids = {
    empty: createEmptyGrid,
    smallMaze: createSmallMaze,
    recursiveDivision: createRecursiveDivisionMaze,
    prims: createPrimsMaze,
    ellers: createEllersMaze,
    random: createRandomMaze
  }

  const loadPredefinedGrid = (type) => {
    const factory = predefinedGrids[type]
    if (!factory) return
    dispatch(resetPathThunk())
    dispatch(loadPreset(factory()))
  }

  const handlePresetChange = (type) => {
    setSelectedPreset(type)
    loadPredefinedGrid(type)
  }

  return (
    <div>
      <div
        className="grid-controls"
        style={{ visibility: showControls ? 'visible' : 'hidden' }}
      >
        <select
          value={selectedPreset}
          onChange={e => handlePresetChange(e.target.value)}
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
          onClick={() =>
            loadPredefinedGrid(selectedPreset || 'random')
          }
        >
          Generate Maze
        </button>
      </div>
      <div
        className="visualizer-canvas"
        onMouseLeave={() => setIsMousePressed(false)}
      >
        {grid.map((rowArr, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {rowArr.map((node, colIndex) => (
              <Node
                key={`${rowIndex}-${colIndex}`}
                node={node}
                onMouseDown={() => {
                  if (node.isStart) setIsStartNodeDragged(true)
                  else if (node.isEnd) setIsEndNodeDragged(true)
                  else dispatch(toggleWall({ row: rowIndex, col: colIndex }))
                  setIsMousePressed(true)
                }}
                onMouseEnter={() => {
                  if (!isMousePressed) return
                  if (isStartNodeDragged) dispatch(moveStart({ row: rowIndex, col: colIndex }))
                  else if (isEndNodeDragged) dispatch(moveEnd({ row: rowIndex, col: colIndex }))
                  else dispatch(toggleWall({ row: rowIndex, col: colIndex }))
                }}
                onMouseUp={() => {
                  setIsMousePressed(false)
                  setIsStartNodeDragged(false)
                  setIsEndNodeDragged(false)
                }}
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
