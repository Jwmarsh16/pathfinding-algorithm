/* File: src/App.jsx
 *
 * Position InfoPanel to the left of the grid in single mode by
 * swapping their order inside .main-container.
 */

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
  back,
  stepOnce,
  setAlgorithm
} from './store/pathfinderSlice'
import bfs from './algorithms/bfs'
import dfs from './algorithms/dfs'
import dijkstra from './algorithms/dijkstra'
import astar from './algorithms/astar'
import { computeAnimationDelay } from './utils/animationHelpers'

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
  const visit = res.visitedNodes.map(n => ({ node: n, isPath: false }))
  const path  = res.path.map(n => ({ node: n, isPath: true }))
  return { grid, steps: [...visit, ...path] }
}

function App() {
  const dispatch          = useDispatch()
  const reduxGrid         = useSelector(s => s.pathfinder.grid)
  const speed             = useSelector(s => s.pathfinder.speed)
  const statistics        = useSelector(s => s.pathfinder.statistics)
  const noPathFound       = useSelector(s => s.pathfinder.noPathFound)
  const isPlayingRd       = useSelector(s => s.pathfinder.isPlaying)
  const selectedAlgorithm = useSelector(s => s.pathfinder.selectedAlgorithm)

  const [helpOpen, setHelpOpen]           = useState(false)
  const [compareMode, setCompareMode]     = useState(false)
  const [algoA, setAlgoA]                 = useState('bfs')
  const [algoB, setAlgoB]                 = useState('dfs')
  const [gridA, setGridA]                 = useState(reduxGrid)
  const [gridB, setGridB]                 = useState(reduxGrid)
  const [stepsA, setStepsA]               = useState([])
  const [stepsB, setStepsB]               = useState([])
  const [stepIndex, setStepIndex]         = useState(0)
  const [isPlayingComp, setIsPlayingComp] = useState(false)

  const intervalRef  = useRef(null)
  const stepHoldRef  = useRef(null)
  const backHoldRef  = useRef(null)

  const handleSingleAlgoChange = algo => {
    dispatch(setAlgorithm(algo))
    dispatch(resetPathThunk())
  }
  const handleAlgoAChange = algo => {
    setAlgoA(algo)
    setGridA(reduxGrid.map(r => r.map(c => ({ ...c }))))
    setStepsA([])
  }
  const handleAlgoBChange = algo => {
    setAlgoB(algo)
    setGridB(reduxGrid.map(r => r.map(c => ({ ...c }))))
    setStepsB([])
  }

  useEffect(() => {
    if (compareMode) {
      setGridA(reduxGrid.map(r => r.map(c => ({ ...c }))))
      setGridB(reduxGrid.map(r => r.map(c => ({ ...c }))))
      setStepsA([]); setStepsB([])
      setStepIndex(0)
      setIsPlayingComp(false)
      clearInterval(intervalRef.current)
    }
  }, [compareMode, reduxGrid])

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
          const applyStep = (steps, setGrid) => {
            const s = steps[idx]
            if (s) {
              setGrid(prev => {
                const g = prev.map(r => r.map(c => ({ ...c })))
                const { row, col } = s.node
                if (s.isPath) g[row][col].isPath = true
                else           g[row][col].isVisited = true
                return g
              })
            }
          }
          applyStep(stepsA, setGridA)
          applyStep(stepsB, setGridB)
          return idx + 1
        })
      }, computeAnimationDelay(speed))
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [compareMode, isPlayingComp, stepsA, stepsB, speed])

  const handleTogglePlay = () => {
    if (compareMode) {
      if (stepsA.length === 0 && stepsB.length === 0) {
        const a = runAlgo(algoA, reduxGrid)
        const b = runAlgo(algoB, reduxGrid)
        setGridA(a.grid); setStepsA(a.steps)
        setGridB(b.grid); setStepsB(b.steps)
        setStepIndex(0)
      }
      setIsPlayingComp(p => !p)
    } else {
      isPlayingRd ? dispatch(pause()) : dispatch(play())
    }
  }

  const handleStep = () => {
    if (compareMode) {
      if (stepsA.length === 0 && stepsB.length === 0) {
        const a = runAlgo(algoA, reduxGrid)
        const b = runAlgo(algoB, reduxGrid)
        setGridA(a.grid); setStepsA(a.steps)
        setGridB(b.grid); setStepsB(b.steps)
        setStepIndex(0)
      }
      clearInterval(intervalRef.current)
      setIsPlayingComp(false)
      setStepIndex(idx => {
        ;[stepsA, stepsB].forEach((steps, i) => {
          const setGrid = i === 0 ? setGridA : setGridB
          const s = steps[idx]
          if (s) {
            setGrid(prev => {
              const g = prev.map(r => r.map(c => ({ ...c })))
              const { row, col } = s.node
              if (s.isPath) g[row][col].isPath = true
              else           g[row][col].isVisited = true
              return g
            })
          }
        })
        return idx + 1
      })
    } else {
      dispatch(stepOnce())
    }
  }

  const handleStepHoldStart = () => {
    clearInterval(stepHoldRef.current)
    const delay = computeAnimationDelay(speed)
    if (compareMode) {
      handleStep()
      stepHoldRef.current = setInterval(handleStep, delay)
    } else {
      dispatch(stepOnce())
      stepHoldRef.current = setInterval(() => dispatch(stepOnce()), delay)
    }
  }

  const handleStepHoldEnd = () => {
    clearInterval(stepHoldRef.current)
  }

  const handleBack = () => {
    if (compareMode) {
      clearInterval(intervalRef.current)
      setIsPlayingComp(false)
      setStepIndex(idx => {
        const prev = idx - 1
        if (prev < 0) return 0
        ;[stepsA, stepsB].forEach((steps, i) => {
          const setGrid = i === 0 ? setGridA : setGridB
          const s = steps[prev]
          if (s) {
            setGrid(prevG => {
              const g = prevG.map(r => r.map(c => ({ ...c })))
              const { row, col } = s.node
              if (s.isPath) g[row][col].isPath = false
              else           g[row][col].isVisited = false
              return g
            })
          }
        })
        return prev
      })
    } else {
      dispatch(back())
    }
  }

  const handleBackHoldStart = () => {
    clearInterval(backHoldRef.current)
    const delay = computeAnimationDelay(speed)
    if (compareMode) {
      handleBack()
      backHoldRef.current = setInterval(handleBack, delay)
    } else {
      dispatch(back())
      backHoldRef.current = setInterval(() => dispatch(back()), delay)
    }
  }

  const handleBackHoldEnd = () => {
    clearInterval(backHoldRef.current)
  }

  const visitedA = stepsA.filter(s => !s.isPath).length
  const pathA    = stepsA.filter(s => s.isPath).length
  const visitedB = stepsB.filter(s => !s.isPath).length
  const pathB    = stepsB.filter(s => s.isPath).length

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
        onStepHoldStart={handleStepHoldStart}
        onStepHoldEnd={handleStepHoldEnd}
        onBackHoldStart={handleBackHoldStart}
        onBackHoldEnd={handleBackHoldEnd}
        onResetGrid={() => {
          dispatch(resetGridThunk())
          if (compareMode) {
            setGridA(reduxGrid)
            setGridB(reduxGrid)
            setStepsA([]); setStepsB([])
            setStepIndex(0)
            setIsPlayingComp(false)
          }
        }}
        onResetPath={() => {
          dispatch(resetPathThunk())
          if (compareMode) {
            setGridA(reduxGrid)
            setGridB(reduxGrid)
            setStepsA([]); setStepsB([])
            setStepIndex(0)
            setIsPlayingComp(false)
          }
        }}
        onSpeedChange={e => dispatch(changeSpeed(Number(e.target.value)))}
        speed={speed}
        statistics={statistics}
        selectedAlgorithm={selectedAlgorithm}
        onAlgorithmChange={handleSingleAlgoChange}
        selectedAlgorithmA={algoA}
        selectedAlgorithmB={algoB}
        onAlgorithmChangeA={handleAlgoAChange}
        onAlgorithmChangeB={handleAlgoBChange}
      />

      <button
        type="button"
        className="help-button"
        onClick={() => setHelpOpen(true)}
        style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
      >
        Help
      </button>

      {compareMode ? (
        <>
          <div className="comparison-info-panels">
            <div className="info-panel-half">
              <InfoPanel selectedAlgorithm={algoA} />
            </div>
            <div className="info-panel-half">
              <InfoPanel selectedAlgorithm={algoB} />
            </div>
          </div>

          <div className="grid-wrapper compare">
            <div className="grid-half">
              <h3>Algorithm A: {algoA.toUpperCase()}</h3>
              <Grid grid={gridA} showControls={true} />
              <div className="stats-panel">
                <span className="visited">Visited: {visitedA}</span>
                <span className="path">Path: {pathA}</span>
              </div>
            </div>
            <div className="grid-half">
              <h3>Algorithm B: {algoB.toUpperCase()}</h3>
              <Grid grid={gridB} showControls={false} />
              <div className="stats-panel">
                <span className="visited">Visited: {visitedB}</span>
                <span className="path">Path: {pathB}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="main-container">
            <InfoPanel selectedAlgorithm={selectedAlgorithm} />
            <div className="grid-wrapper">
              <Grid grid={reduxGrid} showControls={true} />
            </div>
          </div>
          <Footer
            visitedNodes={statistics.visitedNodes}
            pathLength={statistics.pathLength}
          />
        </>
      )}

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}

export default App
