function ControlPanel({ onPlay, onPause, onReset, onStep, onSpeedChange, onAlgorithmChange }) {
    return (
      <div className="control-panel">
        <button onClick={onPlay}>Play</button>
        <button onClick={onPause}>Pause</button>
        <button onClick={onReset}>Reset</button>
        <button onClick={onStep}>Step</button>
        <select onChange={onAlgorithmChange}>
          <option value="bfs">Breadth-First Search</option>
          <option value="dfs">Depth-First Search</option>
          <option value="dijkstra">Dijkstra's Algorithm</option>
          <option value="a-star">A*</option>
        </select>
        <label>
          Speed:
          <input type="range" min="1" max="5" onChange={onSpeedChange} />
        </label>
      </div>
    );
  }
  export default ControlPanel;
  