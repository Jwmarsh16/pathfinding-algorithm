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
  setSpeed
} from './store/pathfinderSlice'

function App() {
  const dispatch = useDispatch()
  const {
    grid,
    statistics,
    noPathFound,
    speed,
    steps  // grab steps array to know if we’ve initialized yet
  } = useSelector(state => state.pathfinder)

  const handleStep = () => {
    if (steps.length === 0) {
      // first step ever: build the steps then do one
      dispatch(initializeSteps()).then(() => {
        dispatch(processStep())
      })
    } else {
      // already have a steps array: just do one more
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
        onStep={handleStep}         /* <- use our new handler */
        onBack={() => dispatch(back())}
        onReset={() => dispatch(resetAll())}
        onSpeedChange={e => dispatch(setSpeed(Number(e.target.value)))}
        speed={speed}
        statistics={statistics}
      />

      <div className="grid-wrapper">
        <Grid
          grid={grid}
          setGrid={newGrid => dispatch({ type: 'pathfinder/setGrid', payload: newGrid })}
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
