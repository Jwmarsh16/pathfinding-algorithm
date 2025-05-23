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

export const initializeSteps = createAsyncThunk(
  'pathfinder/initializeSteps',
  async (_, { getState, dispatch }) => {
    const state = getState().pathfinder
    const stateGrid = state.grid
    const algo = state.selectedAlgorithm

    // 1) Clone & clear visualization on the clone
    const newGrid = stateGrid.map(row => row.map(n => ({ ...n })))
    clearGridVisualization(newGrid)

    // 2) Find start/end on the clone
    const start = findNode(newGrid, 'isStart')
    const end   = findNode(newGrid, 'isEnd')
    if (!start || !end) return

    // 3) Run the selected algorithm on that clone
    let result
    switch (algo) {
      case 'dfs':
        result = dfs(newGrid, start, end)
        break
      case 'dijkstra':
        result = dijkstra(newGrid, start, end)
        break
      case 'astar':
        result = astar(newGrid, start, end)
        break
      case 'bfs':
      default:
        result = bfs(newGrid, start, end)
    }
    const { visitedNodes, path } = result

    // 4) Commit grid & flags to Redux (now frozen)
    dispatch(setGrid(newGrid))
    dispatch(setNoPathFound(path.length === 0))
    dispatch(setStatistics({
      visitedNodes: visitedNodes.length,
      pathLength:   path.length
    }))

    // 5) Build the step sequence
    const visitSteps = visitedNodes.map(node => ({ node, isPath: false }))
    const pathSteps  = path       .map(node => ({ node, isPath: true  }))
    dispatch(setSteps([...visitSteps, ...pathSteps]))
    dispatch(setStepIndex(0))
  }
)

export const play = createAsyncThunk(
  'pathfinder/play',
  async (_, { dispatch, getState }) => {
    const { isPlaying, steps } = getState().pathfinder
    if (isPlaying) return

    if (steps.length === 0) {
      await dispatch(initializeSteps())
    }

    const speed = getState().pathfinder.speed
    const delay = computeAnimationDelay(speed)
    intervalId = setInterval(() => dispatch(processStep()), delay)
    dispatch(setIsPlaying(true))
  }
)

export const pause = createAsyncThunk(
  'pathfinder/pause',
  async (_, { dispatch }) => {
    if (intervalId) clearInterval(intervalId)
    dispatch(setIsPlaying(false))
  }
)

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

export const resetAll = createAsyncThunk(
  'pathfinder/resetAll',
  (_, { dispatch }) => {
    if (intervalId) clearInterval(intervalId)
    dispatch(resetState())
  }
)

export const stepOnce = createAsyncThunk(
  'pathfinder/stepOnce',
  async (_, { dispatch, getState }) => {
    const { steps } = getState().pathfinder
    if (steps.length === 0) {
      await dispatch(initializeSteps())
    }
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
    setGrid(state, action) {
      state.grid = action.payload
    },
    toggleWall(state, action) {
      const { row, col } = action.payload
      const node = state.grid[row][col]
      node.isWall = !node.isWall
    },
    moveStart(state, action) {
      const { row, col } = action.payload
      state.grid.forEach(r => r.forEach(n => { n.isStart = false }))
      state.grid[row][col].isStart = true
    },
    moveEnd(state, action) {
      const { row, col } = action.payload
      state.grid.forEach(r => r.forEach(n => { n.isEnd = false }))
      state.grid[row][col].isEnd = true
    },
    loadPreset(state, action) {
      state.grid = action.payload
    },
    setSteps(state, action) {
      state.steps = action.payload
    },
    setStepIndex(state, action) {
      state.stepIndex = action.payload
    },
    setIsPlaying(state, action) {
      state.isPlaying = action.payload
    },
    setSpeed(state, action) {
      state.speed = action.payload
    },
    setStatistics(state, action) {
      state.statistics = action.payload
    },
    setNoPathFound(state, action) {
      state.noPathFound = action.payload
    },
    setAlgorithm(state, action) {
      state.selectedAlgorithm = action.payload
    },
    markNode(state, action) {
      const { node, isPath } = action.payload
      const { row, col } = node
      if (isPath) state.grid[row][col].isPath = true
      else        state.grid[row][col].isVisited = true
    },
    unmarkNode(state, action) {
      const { node, isPath } = action.payload
      const { row, col } = node
      if (isPath) state.grid[row][col].isPath = false
      else        state.grid[row][col].isVisited = false
    },
    resetState(state) {
      state.grid              = createInitialGrid()
      state.steps             = []
      state.stepIndex         = 0
      state.isPlaying         = false
      state.speed             = DEFAULT_SPEED
      state.statistics        = { visitedNodes: 0, pathLength: null }
      state.noPathFound       = false
      state.selectedAlgorithm = 'bfs'
    }
  }
})

// ─── Exports ────────────────────────────────────────────────────────────────

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
  resetState
} = pathfinderSlice.actions

export default pathfinderSlice.reducer
