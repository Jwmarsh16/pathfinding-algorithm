// src/components/ControlPanel.jsx
import React from 'react'
import { SPEED_MIN, SPEED_MAX } from '../config'
import { computeAnimationDelay } from '../utils/animationHelpers'
import './ControlPanel.css'

function ControlPanel({
  isPlaying,
  onTogglePlay,
  onStep,
  onBack,
  onStepHoldStart,
  onStepHoldEnd,
  onBackHoldStart,
  onBackHoldEnd,
  onResetGrid,
  onResetPath,
  onSpeedChange,
  onAlgorithmChange,
  selectedAlgorithm,
  speed,
  statistics
}) {
  return (
    <div className="control-panel">
      {/* Toggle Play/Pause */}
      <button
        type="button"
        onClick={() => {
          console.log(isPlaying ? '⏸️ Pause clicked' : '▶️ Play clicked')
          onTogglePlay()
        }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Step */}
      <button
        type="button"
        onMouseDown={() => { console.log('⏭️ Step hold start'); onStepHoldStart() }}
        onMouseUp={() => { console.log('⏭️ Step hold end'); onStepHoldEnd() }}
        onMouseLeave={onStepHoldEnd}
        onClick={() => { console.log('⏭️ Step clicked'); onStep() }}
      >
        Step
      </button>

      {/* Back */}
      <button
        type="button"
        onMouseDown={() => { console.log('⏮️ Back hold start'); onBackHoldStart() }}
        onMouseUp={() => { console.log('⏮️ Back hold end'); onBackHoldEnd() }}
        onMouseLeave={onBackHoldEnd}
        onClick={() => { console.log('⏮️ Back clicked'); onBack() }}
      >
        Back
      </button>

      {/* Reset Grid */}
      <button
        type="button"
        onClick={() => { console.log('🔄 Reset Grid clicked'); onResetGrid() }}
      >
        Reset Grid
      </button>

      {/* Reset Path */}
      <button
        type="button"
        onClick={() => { console.log('♻️ Reset Path clicked'); onResetPath() }}
      >
        Reset Path
      </button>

      {/* Speed Slider */}
      <div className="control-panel__slider">
        <input
          type="range"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step="1"
          value={speed}
          onChange={e => {
            console.log('🎚️ Speed param:', e.target.value)
            onSpeedChange(e)
          }}
        />
        <span>{computeAnimationDelay(speed)} ms</span>
      </div>

      {/* Algorithm Dropdown */}
      <label className="control-panel__dropdown" htmlFor="algo-select">
        Algorithm
      </label>
      <select
        id="algo-select"
        value={selectedAlgorithm}
        onChange={e => {
          console.log('🔀 Algo:', e.target.value)
          onAlgorithmChange(e.target.value)
        }}
      >
        <option value="bfs">BFS</option>
        <option value="dfs">DFS</option>
        <option value="dijkstra">Dijkstra</option>
        <option value="astar">A*</option>
      </select>

      {/* Statistics */}
      <div className="control-panel__stats">
        <span>Visited: {statistics.visitedNodes}</span>
        <span>Path: {statistics.pathLength ?? '–'}</span>
      </div>
    </div>
  )
}

export default ControlPanel
