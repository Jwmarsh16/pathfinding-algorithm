// src/App.jsx
import React, { useState } from 'react'
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
  changeSpeed,        // ← new thunk
  setAlgorithm
} from './store/pathfinderSlice'

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

  const handleStep = () => {
    if (steps.length === 0) {
      dispatch(initializeSteps()).then(() => dispatch(processStep()))
    } else {
      dispatch(processStep())
    }
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
        onPlay={() => dispatch(play())}
        onPause={() => dispatch(pause())}
        onStep={handleStep}
        onBack={() => dispatch(back())}
        onResetGrid={() => dispatch(resetGridThunk())}
        onResetPath={() => dispatch(resetPathThunk())}
        // ─── UPDATED: use changeSpeed thunk for live speed changes
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
