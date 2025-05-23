// src/App.jsx
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
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
  resetAll,
  setSpeed,
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
        onReset={() => dispatch(resetAll())}
        onSpeedChange={e => dispatch(setSpeed(Number(e.target.value)))}
        selectedAlgorithm={selectedAlgorithm}
        onAlgorithmChange={algo => dispatch(setAlgorithm(algo))}
        speed={speed}
        statistics={statistics}
      />

      <div className="grid-wrapper">
        <Grid
          grid={grid}
        />
      </div>

      <Footer
        visitedNodes={statistics.visitedNodes}
        pathLength={statistics.pathLength}
      />
    </div>
  )
}

export default App
