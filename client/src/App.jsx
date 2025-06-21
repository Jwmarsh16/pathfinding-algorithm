// src/App.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import InfoPanel from './components/InfoPanel'
import HelpModal from './components/HelpModal'
import Grid from './components/Grid/Grid'
import Footer from './components/Footer'
import './styles/global.css'

import {
  resetGridThunk,
  resetPathThunk,
  changeSpeed,
  pause,
  play,
  initializeSteps,
  processStep,
  back
} from './store/pathfinderSlice'
import bfs from './algorithms/bfs'
import dfs from './algorithms/dfs'
import dijkstra from './algorithms/dijkstra'
import astar from './algorithms/astar'
import { computeAnimationDelay } from './utils/animationHelpers'

/**
 * Run the named algorithm on a clone of baseGrid.
 * Returns the new grid, the step list, and stats.
 */
function runAlgo(name, baseGrid) {
  const grid = baseGrid.map(row => row.map(cell => ({ ...cell })))
  const flat = grid.flat()
  const start = flat.find(n => n.isStart)
  const end   = flat.find(n => n.isEnd)
  let res
  switch (name) {
    case 'dfs':      res = dfs(grid, start, end);      break
    case 'dijkstra': res = dijkstra(grid, start, end); break
    case 'astar':    res = astar(grid, start, end);    break
    default:         res = bfs(grid, start, end)
  }
  const visitedCount = res.visitedNodes.length
  const pathCount    = res.path.length
  const steps = [
    ...res.visitedNodes.map(n => ({ node: n, isPath: false })),
    ...res.path.map(n =>       ({ node: n, isPath: true  }))
  ]
  return { grid, steps, visitedCount, pathCount }
}

function App() {
  const dispatch    = useDispatch()
  const reduxGrid   = useSelector(s => s.pathfinder.grid)
  const speed       = useSelector(s => s.pathfinder.speed)
  const statistics  = useSelector(s => s.pathfinder.statistics)
  const noPathFound = useSelector(s => s.pathfinder.noPathFound)
  const isPlayingRd = useSelector(s => s.pathfinder.isPlaying)

  // Help modal
  const [helpOpen, setHelpOpen] = useState(false)

  // Comparison‐mode state
  const [compareMode, setCompareMode]     = useState(false)
  const [algoA, setAlgoA]                 = useState('bfs')
  const [algoB, setAlgoB]                 = useState('dfs')
  const [gridA, setGridA]                 = useState(reduxGrid)
  const [gridB, setGridB]                 = useState(reduxGrid)
  const [stepsA, setStepsA]               = useState([])
  const [stepsB, setStepsB]               = useState([])
  const [statsA, setStatsA]               = useState({ visitedNodes: 0, pathLength: null })
  const [statsB, setStatsB]               = useState({ visitedNodes: 0, pathLength: null })
  const [stepIndex, setStepIndex]         = useState(0)
  const [isPlayingComp, setIsPlayingComp] = useState(false)
  const intervalRef = useRef(null)

  // Reset clones on grid change or mode toggle
  useEffect(() => {
    if (compareMode) {
      setGridA(reduxGrid.map(r => r.map(c => ({ ...c }))))
      setGridB(reduxGrid.map(r => r.map(c => ({ ...c }))))
      setStepsA([])
      setStepsB([])
      setStatsA({ visitedNodes: 0, pathLength: null })
      setStatsB({ visitedNodes: 0, pathLength: null })
      setStepIndex(0)
      setIsPlayingComp(false)
      clearInterval(intervalRef.current)
    }
  }, [compareMode, reduxGrid])

  // Play‐loop for comparison
  useEffect(() => {
    if (compareMode && isPlayingComp) {
      clearInterval(intervalRef.current)
      intervalRef.current = setInterval(() => {
        setStepIndex(idx => {
          if (idx >= stepsA.length && idx >= stepsB.length) {
            clearInterval(intervalRef.current)
            setIsPlayingComp(false)
            return idx
          }
          // Apply step to A
          const sA = stepsA[idx]
          if (sA) {
            setGridA(prev => {
              const g = prev.map(r => r.map(c => ({ ...c })))
              const { row, col } = sA.node
              if (sA.isPath) g[row][col].isPath = true
              else           g[row][col].isVisited = true
              return g
            })
          }
          // Apply step to B
          const sB = stepsB[idx]
          if (sB) {
            setGridB(prev => {
              const g = prev.map(r => r.map(c => ({ ...c })))
              const { row, col } = sB.node
              if (sB.isPath) g[row][col].isPath = true
              else           g[row][col].isVisited = true
              return g
            })
          }
          return idx + 1
        })
      }, computeAnimationDelay(speed))
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [compareMode, isPlayingComp, stepsA, stepsB, speed])

  // Play/Pause toggle
  const handleTogglePlay = () => {
    if (compareMode) {
      // initialize runs
      if (stepsA.length === 0 && stepsB.length === 0) {
        const { grid: gA, steps: sA, visitedCount: vA, pathCount: pA } = runAlgo(algoA, reduxGrid)
        const { grid: gB, steps: sB, visitedCount: vB, pathCount: pB } = runAlgo(algoB, reduxGrid)
        setGridA(gA); setStepsA(sA); setStatsA({ visitedNodes: vA, pathLength: pA })
        setGridB(gB); setStepsB(sB); setStatsB({ visitedNodes: vB, pathLength: pB })
        setStepIndex(0)
      }
      setIsPlayingComp(p => !p)
    } else {
      isPlayingRd ? dispatch(pause()) : dispatch(play())
    }
  }

  // Single‐step forward
  const handleStep = () => {
    if (compareMode) {
      if (stepsA.length === 0 && stepsB.length === 0) {
        const { grid: gA, steps: sA, visitedCount: vA, pathCount: pA } = runAlgo(algoA, reduxGrid)
        const { grid: gB, steps: sB, visitedCount: vB, pathCount: pB } = runAlgo(algoB, reduxGrid)
        setGridA(gA); setStepsA(sA); setStatsA({ visitedNodes: vA, pathLength: pA })
        setGridB(gB); setStepsB(sB); setStatsB({ visitedNodes: vB, pathLength: pB })
        setStepIndex(0)
      }
      clearInterval(intervalRef.current)
      setIsPlayingComp(false)
      setStepIndex(idx => {
        const sA = stepsA[idx]
        if (sA) {
          setGridA(prev => {
            const g = prev.map(r => r.map(c => ({ ...c })))
            const { row, col } = sA.node
            if (sA.isPath) g[row][col].isPath = true
            else           g[row][col].isVisited = true
            return g
          })
        }
        const sB = stepsB[idx]
        if (sB) {
          setGridB(prev => {
            const g = prev.map(r => r.map(c => ({ ...c })))
            const { row, col } = sB.node
            if (sB.isPath) g[row][col].isPath = true
            else           g[row][col].isVisited = true
            return g
          })
        }
        return idx + 1
      })
    } else {
      dispatch(initializeSteps()).then(() => dispatch(processStep()))
    }
  }

  // Single‐step backward
  const handleBack = () => {
    if (compareMode) {
      clearInterval(intervalRef.current)
      setIsPlayingComp(false)
      setStepIndex(idx => {
        const prev = idx - 1
        if (prev < 0) return 0
        const sA = stepsA[prev]
        if (sA) {
          setGridA(prev => {
            const g = prev.map(r => r.map(c => ({ ...c })))
            const { row, col } = sA.node
            if (sA.isPath) g[row][col].isPath = false
            else           g[row][col].isVisited = false
            return g
          })
        }
        const sB = stepsB[prev]
        if (sB) {
          setGridB(prev => {
            const g = prev.map(r => r.map(c => ({ ...c })))
            const { row, col } = sB.node
            if (sB.isPath) g[row][col].isPath = false
            else           g[row][col].isVisited = false
            return g
          })
        }
        return prev
      })
    } else {
      dispatch(back())
    }
  }

  return (
    <div className="app">
      <Header />

      {!compareMode && noPathFound && (
        <div className="no-path-banner">
          🚫 No path found! Try removing walls or moving start/end.
        </div>
      )}

      <ControlPanel
        compareMode={compareMode}
        onCompareToggle={setCompareMode}
        isPlaying={compareMode ? isPlayingComp : isPlayingRd}
        onTogglePlay={handleTogglePlay}
        onStep={handleStep}
        onBack={handleBack}
        onStepHoldStart={() => {}}
        onStepHoldEnd={() => {}}
        onBackHoldStart={() => {}}
        onBackHoldEnd={() => {}}
        onResetGrid={() => {
          dispatch(resetGridThunk())
          if (compareMode) {
            setGridA(reduxGrid)
            setGridB(reduxGrid)
            setStepsA([])
            setStepsB([])
            setStatsA({ visitedNodes: 0, pathLength: null })
            setStatsB({ visitedNodes: 0, pathLength: null })
            setStepIndex(0)
            setIsPlayingComp(false)
          }
        }}
        onResetPath={() => {
          dispatch(resetPathThunk())
          if (compareMode) {
            setGridA(reduxGrid)
            setGridB(reduxGrid)
            setStepsA([])
            setStepsB([])
            setStatsA({ visitedNodes: 0, pathLength: null })
            setStatsB({ visitedNodes: 0, pathLength: null })
            setStepIndex(0)
            setIsPlayingComp(false)
          }
        }}
        onSpeedChange={e => dispatch(changeSpeed(Number(e.target.value)))}
        speed={speed}
        statistics={statistics}
        selectedAlgorithmA={algoA}
        selectedAlgorithmB={algoB}
        onAlgorithmChangeA={setAlgoA}
        onAlgorithmChangeB={setAlgoB}
      />

      <button
        type="button"
        className="help-button"
        onClick={() => setHelpOpen(true)}
        style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
      >
        Help
      </button>

      {/* InfoPanels */}
      {compareMode ? (
        <div className="info-comparison">
          <div className="info-half">
            <InfoPanel selectedAlgorithm={algoA} />
          </div>
          <div className="info-half">
            <InfoPanel selectedAlgorithm={algoB} />
          </div>
        </div>
      ) : (
        <InfoPanel selectedAlgorithm={algoA} />
      )}

      {/* Comparison description */}
      {compareMode && (
        <p className="comparison-description">
          Compare how different algorithms traverse and find paths side-by-side.
        </p>
      )}

      {/* Grids */}
      <div className={`grid-wrapper${compareMode ? ' compare' : ''}`}>
        {compareMode ? (
          <>
            <div className="grid-half">
              <h3>Algorithm A: {algoA.toUpperCase()}</h3>
              <Grid grid={gridA} />
            </div>
            <div className="grid-half">
              <h3>Algorithm B: {algoB.toUpperCase()}</h3>
              <Grid grid={gridB} />
            </div>
          </>
        ) : (
          <Grid grid={reduxGrid} />
        )}
      </div>

      {/* Per‐grid stats */}
      {compareMode && (
        <div className="stats-comparison">
          <div className="stats-half">
            <strong>Algorithm A</strong>
            <p>Visited: {statsA.visitedNodes}</p>
            <p>Path: {statsA.pathLength ?? '–'}</p>
          </div>
          <div className="stats-half">
            <strong>Algorithm B</strong>
            <p>Visited: {statsB.visitedNodes}</p>
            <p>Path: {statsB.pathLength ?? '–'}</p>
          </div>
        </div>
      )}

      {/* Single‐mode footer */}
      {!compareMode && (
        <Footer
          visitedNodes={statistics.visitedNodes}
          pathLength={statistics.pathLength}
        />
      )}

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

export default App
