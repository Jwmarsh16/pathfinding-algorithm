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
    selectedAlgorithm
  } = useSelector(state => state.pathfinder)

  const [helpOpen, setHelpOpen] = useState(false)
  const [isStepHolding, setIsStepHolding] = useState(false)
  const [isBackHolding, setIsBackHolding] = useState(false)
  const stepHoldRef = useRef(null)
  const backHoldRef = useRef(null)

  // Repeat stepping while holding Step
  useEffect(() => {
    if (isStepHolding) {
      if (stepHoldRef.current) clearInterval(stepHoldRef.current)
      const delay = computeAnimationDelay(speed)
      stepHoldRef.current = setInterval(() => dispatch(processStep()), delay)
    } else {
      if (stepHoldRef.current) {
        clearInterval(stepHoldRef.current)
        stepHoldRef.current = null
      }
    }
    return () => {
      if (stepHoldRef.current) {
        clearInterval(stepHoldRef.current)
        stepHoldRef.current = null
      }
    }
  }, [isStepHolding, speed, dispatch])

  // Repeat stepping back while holding Back
  useEffect(() => {
    if (isBackHolding) {
      if (backHoldRef.current) clearInterval(backHoldRef.current)
      const delay = computeAnimationDelay(speed)
      backHoldRef.current = setInterval(() => dispatch(back()), delay)
    } else {
      if (backHoldRef.current) {
        clearInterval(backHoldRef.current)
        backHoldRef.current = null
      }
    }
    return () => {
      if (backHoldRef.current) {
        clearInterval(backHoldRef.current)
        backHoldRef.current = null
      }
    }
  }, [isBackHolding, speed, dispatch])

  const handleStep = () => {
    if (steps.length === 0) {
      dispatch(initializeSteps()).then(() => dispatch(processStep()))
    } else {
      dispatch(processStep())
    }
  }

  const handleStepHoldStart = () => setIsStepHolding(true)
  const handleStepHoldEnd   = () => setIsStepHolding(false)
  const handleBackHoldStart = () => setIsBackHolding(true)
  const handleBackHoldEnd   = () => setIsBackHolding(false)

  return (
    <div className="app">
      <Header />

      {noPathFound && (
        <div className="no-path-banner">
          🚫 No path found! Try removing walls or moving start/end.
        </div>
      )}

      <ControlPanel
        onPlay={() => dispatch(play())}
        onPause={() => dispatch(pause())}
        onStep={handleStep}
        onBack={() => dispatch(back())}
        onStepHoldStart={handleStepHoldStart}
        onStepHoldEnd={handleStepHoldEnd}
        onBackHoldStart={handleBackHoldStart}
        onBackHoldEnd={handleBackHoldEnd}
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
