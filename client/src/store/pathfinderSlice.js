// src/store/pathfinderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import bfs from '../algorithms/bfs'
import dfs from '../algorithms/dfs'
import dijkstra from '../algorithms/dijkstra'
import astar from '../algorithms/astar'
import {
  createInitialGrid,
  clearGridVisualization,
  findNode
} from '../utils/gridHelpers'
import { computeAnimationDelay } from '../utils/animationHelpers'
import { DEFAULT_SPEED } from '../config'

// ─── Interval handle ──────────────────────────────────────────────────────
let intervalId = null

// ─── Thunks ────────────────────────────────────────────────────────────────

// Clone grid, run the selected algorithm, and build the steps sequence
export const initializeSteps = createAsyncThunk(
  'pathfinder/initializeSteps',
  async (_, { getState, dispatch }) => {
    const { grid: stateGrid, selectedAlgorithm: algo } = getState().pathfinder

    // 1) Clone & clear visualization
    const newGrid = stateGrid.map(row => row.map(n => ({ ...n })))
    clearGridVisualization(newGrid)

    // 2) Find start/end
    const start = findNode(newGrid, 'isStart')
    const end   = findNode(newGrid, 'isEnd')
    if (!start || !end) return

    // 3) Execute algorithm
    let { visitedNodes, path } = (() => {
      switch (algo) {
        case 'dfs':      return dfs(newGrid, start, end)
        case 'dijkstra': return dijkstra(newGrid, start, end)
        case 'astar':    return astar(newGrid, start, end)
        case 'bfs':
        default:         return bfs(newGrid, start, end)
      }
    })()

    // 4) Commit results
    dispatch(setGrid(newGrid))
    dispatch(setNoPathFound(path.length === 0))
    dispatch(setStatistics({
      visitedNodes: visitedNodes.length,
      pathLength:   path.length
    }))

    // 5) Build visit + path steps
    const steps = [
      ...visitedNodes.map(node => ({ node, isPath: false })),
      ...path       .map(node => ({ node, isPath: true  }))
    ]
    dispatch(setSteps(steps))
    dispatch(setStepIndex(0))
  }
)

// Start auto-play
export const play = createAsyncThunk(
  'pathfinder/play',
  async (_, { dispatch, getState }) => {
    const { isPlaying, steps, speed } = getState().pathfinder
    if (isPlaying) return
    if (steps.length === 0) await dispatch(initializeSteps())
    const delay = computeAnimationDelay(speed)
    intervalId = setInterval(() => dispatch(processStep()), delay)
    dispatch(setIsPlaying(true))
  }
)

// Pause auto-play
export const pause = createAsyncThunk(
  'pathfinder/pause',
  async (_, { dispatch }) => {
    if (intervalId) clearInterval(intervalId)
    dispatch(setIsPlaying(false))
  }
)

// Advance one step forward
export const processStep = createAsyncThunk(
  'pathfinder/processStep',
  (_, { dispatch, getState }) => {
    const { stepIndex, steps } = getState().pathfinder
    if (stepIndex >= steps.length) {
      if (intervalId) clearInterval(intervalId)
      dispatch(setIsPlaying(false))
      return
    }
    const { node, isPath } = steps[stepIndex]
    dispatch(markNode({ node, isPath }))
    dispatch(setStepIndex(stepIndex + 1))
  }
)

// Step one back
export const back = createAsyncThunk(
  'pathfinder/back',
  (_, { dispatch, getState }) => {
    const { stepIndex, steps } = getState().pathfinder
    if (stepIndex <= 0) return
    const prev = stepIndex - 1
    const { node, isPath } = steps[prev]
    dispatch(unmarkNode({ node, isPath }))
    dispatch(setStepIndex(prev))
  }
)

// Clear to fresh blank grid (preserve speed & algorithm)
export const resetGridThunk = createAsyncThunk(
  'pathfinder/resetGrid',
  (_, { dispatch }) => {
    if (intervalId) clearInterval(intervalId)
    dispatch(resetState())
  }
)

// Clear only visited/path markers & stats
export const resetPathThunk = createAsyncThunk(
  'pathfinder/resetPath',
  (_, { dispatch }) => {
    if (intervalId) clearInterval(intervalId)
    dispatch(resetPath())
  }
)

// Single-step without autoplay
export const stepOnce = createAsyncThunk(
  'pathfinder/stepOnce',
  async (_, { dispatch, getState }) => {
    const { steps } = getState().pathfinder
    if (steps.length === 0) await dispatch(initializeSteps())
    dispatch(processStep())
  }
)

// ─── Slice Definition ──────────────────────────────────────────────────────
const pathfinderSlice = createSlice({
  name: 'pathfinder',
  initialState: {
    grid:              createInitialGrid(),
    steps:             [],
    stepIndex:         0,
    isPlaying:         false,
    speed:             DEFAULT_SPEED,
    statistics:        { visitedNodes: 0, pathLength: null },
    noPathFound:       false,
    selectedAlgorithm: 'bfs'
  },
  reducers: {
    setGrid(state, { payload })          { state.grid = payload },
    toggleWall(state, { payload: {row,col} }) {
      state.grid[row][col].isWall = !state.grid[row][col].isWall
    },
    moveStart(state, { payload: {row,col} }) {
      state.grid.forEach(r => r.forEach(n => n.isStart = false))
      state.grid[row][col].isStart = true
    },
    moveEnd(state, { payload: {row,col} }) {
      state.grid.forEach(r => r.forEach(n => n.isEnd = false))
      state.grid[row][col].isEnd = true
    },
    loadPreset(state, { payload })       { state.grid = payload },
    setSteps(state, { payload })         { state.steps = payload },
    setStepIndex(state, { payload })     { state.stepIndex = payload },
    setIsPlaying(state, { payload })     { state.isPlaying = payload },
    setSpeed(state, { payload })         { state.speed = payload },
    setStatistics(state, { payload })    { state.statistics = payload },
    setNoPathFound(state, { payload })   { state.noPathFound = payload },
    setAlgorithm(state, { payload })     { state.selectedAlgorithm = payload },
    markNode(state, { payload: { node, isPath } }) {
      const { row, col } = node
      if (isPath) state.grid[row][col].isPath = true
      else        state.grid[row][col].isVisited = true
    },
    unmarkNode(state, { payload: { node, isPath } }) {
      const { row, col } = node
      if (isPath) state.grid[row][col].isPath = false
      else        state.grid[row][col].isVisited = false
    },
    // Reset entire grid (preserve speed & algo)
    resetState(state) {
      state.grid        = createInitialGrid()
      state.steps       = []
      state.stepIndex   = 0
      state.isPlaying   = false
      state.statistics  = { visitedNodes: 0, pathLength: null }
      state.noPathFound = false
    },
    // Reset only path/visited & stats
    resetPath(state) {
      state.grid.forEach(row =>
        row.forEach(node => {
          node.isVisited = false
          node.isPath    = false
        })
      )
      state.steps       = []
      state.stepIndex   = 0
      state.isPlaying   = false
      state.statistics  = { visitedNodes: 0, pathLength: null }
      state.noPathFound = false
    }
  }
})

// ─── Action Creators & Reducer ────────────────────────────────────────────
export const {
  setGrid,
  toggleWall,
  moveStart,
  moveEnd,
  loadPreset,
  setSteps,
  setStepIndex,
  setIsPlaying,
  setSpeed,
  setStatistics,
  setNoPathFound,
  setAlgorithm,
  markNode,
  unmarkNode,
  resetState,
  resetPath
} = pathfinderSlice.actions

export default pathfinderSlice.reducer
