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

// thunks & actions
import {
  initializeSteps,
  processStep,
  play,
  pause,
  back,
  resetGridThunk,
  resetPathThunk,
  changeSpeed,
  setAlgorithm
} from './store/pathfinderSlice'

import { computeAnimationDelay } from './utils/animationHelpers'

function App() {
  const dispatch = useDispatch()
  const {
    grid,
    statistics,
    noPathFound,
    speed,
    steps,
    selectedAlgorithm,
    isPlaying
  } = useSelector(state => state.pathfinder)

  const [helpOpen, setHelpOpen] = useState(false)
  const [isStepHolding, setIsStepHolding] = useState(false)
  const [isBackHolding, setIsBackHolding] = useState(false)
  const stepHoldRef = useRef(null)
  const backHoldRef = useRef(null)

  // Repeat stepping forward while holding “Step”
  useEffect(() => {
    if (isStepHolding) {
      clearInterval(stepHoldRef.current)
      stepHoldRef.current = setInterval(
        () => dispatch(processStep()),
        computeAnimationDelay(speed)
      )
    } else {
      clearInterval(stepHoldRef.current)
    }
    return () => clearInterval(stepHoldRef.current)
  }, [isStepHolding, speed, dispatch])

  // Repeat stepping back while holding “Back”
  useEffect(() => {
    if (isBackHolding) {
      clearInterval(backHoldRef.current)
      backHoldRef.current = setInterval(
        () => dispatch(back()),
        computeAnimationDelay(speed)
      )
    } else {
      clearInterval(backHoldRef.current)
    }
    return () => clearInterval(backHoldRef.current)
  }, [isBackHolding, speed, dispatch])

  const handleStep = () => {
    if (steps.length === 0) {
      dispatch(initializeSteps()).then(() => dispatch(processStep()))
    } else {
      dispatch(processStep())
    }
  }

  // Toggle play/pause
  const handleTogglePlay = () => {
    if (isPlaying) dispatch(pause())
    else          dispatch(play())
  }

  return (
    <div className="app">
      <Header />

      {noPathFound && (
        <div className="no-path-banner">
          🚫 No path found! Try removing walls or moving start/end.
        </div>
      )}

      <ControlPanel
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onStep={handleStep}
        onBack={() => dispatch(back())}
        onStepHoldStart={() => setIsStepHolding(true)}
        onStepHoldEnd={() => setIsStepHolding(false)}
        onBackHoldStart={() => setIsBackHolding(true)}
        onBackHoldEnd={() => setIsBackHolding(false)}
        onResetGrid={() => dispatch(resetGridThunk())}
        onResetPath={() => dispatch(resetPathThunk())}
        onSpeedChange={e => dispatch(changeSpeed(Number(e.target.value)))}
        selectedAlgorithm={selectedAlgorithm}
        onAlgorithmChange={algo => dispatch(setAlgorithm(algo))}
        speed={speed}
        statistics={statistics}
      />

      <button
        type="button"
        className="help-button"
        onClick={() => setHelpOpen(true)}
        style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
      >
        Help
      </button>

      <InfoPanel selectedAlgorithm={selectedAlgorithm} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div className="grid-wrapper">
        <Grid grid={grid} />
      </div>

      <Footer
        visitedNodes={statistics.visitedNodes}
        pathLength={statistics.pathLength}
      />
    </div>
  )
}

export default App
