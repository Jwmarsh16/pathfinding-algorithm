// src/components/ControlPanel.jsx
import React from 'react';
import './ControlPanel.css';

function ControlPanel({
  onPlay,
  onPause,
  onStep,
  onBack,
  onReset,
  onSpeedChange,
  onAlgorithmChange,
  speed,
  statistics
}) {
  return (
    <div className="control-panel">
      <button onClick={onPlay}>Play</button>
      <button onClick={onPause}>Pause</button>
      <button onClick={onStep}>Step</button>
      <button onClick={onBack}>Back</button>
      <button onClick={onReset}>Reset</button>

      <div className="control-panel__slider">
        <input
          type="range"
          min="10"
          max="200"
          value={speed}
          onChange={onSpeedChange}
        />
        <span>{speed} ms</span>
      </div>

      <label className="control-panel__dropdown" htmlFor="algo-select">
        Algorithm
      </label>
      <select
        id="algo-select"
        onChange={onAlgorithmChange}
        defaultValue="bfs"
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
  );
}

export default ControlPanel;
