// src/components/ControlPanel.jsx
import React from 'react'
import './ControlPanel.css'

function ControlPanel({
  onPlay,
  onPause,
  onStep,
  onBack,
  onResetGrid,   // ← updated prop
  onResetPath,   // ← new prop
  onSpeedChange,
  onAlgorithmChange,
  selectedAlgorithm,
  speed,
  statistics
}) {
  return (
    <div className="control-panel">
      <button
        type="button"
        onClick={() => { console.log('▶️ Play clicked'); onPlay() }}
      >
        Play
      </button>

      <button
        type="button"
        onClick={() => { console.log('⏸️ Pause clicked'); onPause() }}
      >
        Pause
      </button>

      <button
        type="button"
        onClick={() => { console.log('⏭️ Step clicked'); onStep() }}
      >
        Step
      </button>

      <button
        type="button"
        onClick={() => { console.log('⏮️ Back clicked'); onBack() }}
      >
        Back
      </button>

      {/* Reset Grid: clears to fresh empty grid */}
      <button
        type="button"
        onClick={() => { console.log('🔄 Reset Grid clicked'); onResetGrid() }}
      >
        Reset Grid
      </button>

      {/* Reset Path: clears only visited & path markings */}
      <button
        type="button"
        onClick={() => { console.log('♻️ Reset Path clicked'); onResetPath() }}
      >
        Reset Path
      </button>

      <div className="control-panel__slider">
        <input
          type="range"
          min="10"
          max="200"
          value={speed}
          onChange={e => {
            console.log('🎚️ Speed:', e.target.value)
            onSpeedChange(e)
          }}
        />
        <span>{speed} ms</span>
      </div>

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

      <div className="control-panel__stats">
        <span>Visited: {statistics.visitedNodes}</span>
        <span>Path: {statistics.pathLength ?? '–'}</span>
      </div>
    </div>
  )
}

export default ControlPanel
