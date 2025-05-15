// src/components/ControlPanel.jsx
import React from 'react';
import './ControlPanel.css';

function ControlPanel({
  onPlay,
  onPause,
  onStep,
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
      <button onClick={onReset}>Reset</button>

      <label className="control-panel__slider">
        Speed:&nbsp;
        <input
          type="range"
          min="10"
          max="200"
          value={speed}
          onChange={onSpeedChange}
        />
        &nbsp;{speed} ms
      </label>

      <label className="control-panel__dropdown">
        Algorithm:&nbsp;
        <select onChange={onAlgorithmChange} defaultValue="bfs">
          <option value="bfs">BFS</option>
          <option value="dfs">DFS</option>
          <option value="dijkstra">Dijkstra</option>
          <option value="astar">A*</option>
        </select>
      </label>

      <div className="control-panel__stats">
        <span>Visited: {statistics.visitedNodes}</span>
        <span>Path: {statistics.pathLength ?? '–'}</span>
      </div>
    </div>
  );
}

export default ControlPanel;
