// src/components/ControlPanel.jsx
import React from 'react'
import { SPEED_MIN, SPEED_MAX } from '../config'
import { computeAnimationDelay } from '../utils/animationHelpers'
import './ControlPanel.css'

function ControlPanel({
  // original props
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
  speed,
  statistics,

  // comparison mode props
  compareMode,
  onCompareToggle,
  selectedAlgorithm,
  onAlgorithmChange,
  selectedAlgorithmA,
  selectedAlgorithmB,
  onAlgorithmChangeA,
  onAlgorithmChangeB
}) {
  return (
    <div className="control-panel">
      {/* Comparison Mode Toggle */}
      <label className="control-panel__compare-toggle">
        <input
          type="checkbox"
          checked={compareMode}
          onChange={e => onCompareToggle(e.target.checked)}
        />
        Comparison Mode
      </label>

      {/* Algorithm selector(s) */}
      {compareMode ? (
        <>
          <label htmlFor="algoA-select">Algorithm A</label>
          <select
            id="algoA-select"
            value={selectedAlgorithmA}
            onChange={e => onAlgorithmChangeA(e.target.value)}
          >
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="dijkstra">Dijkstra</option>
            <option value="astar">A*</option>
          </select>

          <label htmlFor="algoB-select">Algorithm B</label>
          <select
            id="algoB-select"
            value={selectedAlgorithmB}
            onChange={e => onAlgorithmChangeB(e.target.value)}
          >
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="dijkstra">Dijkstra</option>
            <option value="astar">A*</option>
          </select>
        </>
      ) : (
        <>
          <label className="control-panel__dropdown" htmlFor="algo-select">
            Algorithm
          </label>
          <select
            id="algo-select"
            value={selectedAlgorithm}
            onChange={e => onAlgorithmChange(e.target.value)}
          >
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
            <option value="dijkstra">Dijkstra</option>
            <option value="astar">A*</option>
          </select>
        </>
      )}

      {/* Play/Pause / Step / Back */}
      <button
        type="button"
        onClick={onTogglePlay}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        type="button"
        onMouseDown={onStepHoldStart}
        onMouseUp={onStepHoldEnd}
        onMouseLeave={onStepHoldEnd}
        onClick={onStep}
      >
        Step
      </button>
      <button
        type="button"
        onMouseDown={onBackHoldStart}
        onMouseUp={onBackHoldEnd}
        onMouseLeave={onBackHoldEnd}
        onClick={onBack}
      >
        Back
      </button>

      {/* Resets */}
      <button type="button" onClick={onResetGrid}>Reset Grid</button>
      <button type="button" onClick={onResetPath}>Reset Path</button>

      {/* Speed Slider */}
      <div className="control-panel__slider">
        <input
          type="range"
          min={SPEED_MIN}
          max={SPEED_MAX}
          step="1"
          value={speed}
          onChange={onSpeedChange}
        />
        <span>{computeAnimationDelay(speed)} ms</span>
      </div>

      {/* Statistics */}
      <div className="control-panel__stats">
        <span>Visited: {statistics.visitedNodes}</span>
        <span>Path: {statistics.pathLength ?? '–'}</span>
      </div>
    </div>
  )
}

export default ControlPanel
