// src/App.jsx
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import Grid from './components/Grid/Grid';
import Footer from './components/Footer';
import './styles/global.css';
import bfs from './algorithms/bfs';

function App() {
  // -- state --
  const [grid, setGrid] = useState(createInitialGrid());
  const [statistics, setStatistics] = useState({ visitedNodes: 0, pathLength: null });
  const [noPathFound, setNoPathFound] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const intervalRef = useRef(null);

  // -- helpers --

  const clearGridVisualization = (g) => {
    g.forEach(row =>
      row.forEach(node => {
        node.isVisited = false;
        node.isPath = false;
        node.previousNode = null;
      }))
  };

  const findNode = (g, prop) => {
    for (const row of g) for (const node of row) if (node[prop]) return node;
    return null;
  };

  const initializeSteps = () => {
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    clearGridVisualization(newGrid);
    setGrid(newGrid);
    setNoPathFound(false);

    const startNode = findNode(newGrid, 'isStart');
    const endNode = findNode(newGrid, 'isEnd');
    if (!startNode || !endNode) return;

    const { visitedNodes, path } = bfs(newGrid, startNode, endNode);
    setStatistics({ visitedNodes: visitedNodes.length, pathLength: path.length });

    const visitSteps = visitedNodes.map(node => ({ node, isPath: false }));
    const pathSteps = path.map(node => ({ node, isPath: true }));
    setSteps([...visitSteps, ...pathSteps]);
    setStepIndex(0);

    if (path.length === 0) setNoPathFound(true);
  };

  const processStep = () => {
    setStepIndex(idx => {
      if (idx >= steps.length) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        return idx;
      }
      const { node, isPath } = steps[idx];
      setGrid(g => {
        const newG = g.map(row => row.map(n => ({ ...n })));
        if (isPath) newG[node.row][node.col].isPath = true;
        else newG[node.row][node.col].isVisited = true;
        return newG;
      });
      return idx + 1;
    });
  };

  // -- handlers --

  const startInterval = () => {
    const MIN_DELAY = 10, MAX_DELAY = 200;
    const delay = MAX_DELAY + MIN_DELAY - speed;
    intervalRef.current = setInterval(processStep, delay);
    setIsPlaying(true);
  };

  const handlePlay = () => {
    if (isPlaying) return;
    if (steps.length === 0) {
      initializeSteps();
      setTimeout(startInterval, 0);
    } else {
      startInterval();
    }
  };

  const handlePause = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
  };

  const handleStep = () => {
    if (steps.length === 0) {
      initializeSteps();
    } else {
      processStep();
    }
  };

  const handleBack = () => {
    if (stepIndex <= 0) return;
    const prev = stepIndex - 1;
    const { node, isPath } = steps[prev];
    const newGrid = grid.map(row => row.map(n => ({ ...n })));
    if (isPath) newGrid[node.row][node.col].isPath = false;
    else newGrid[node.row][node.col].isVisited = false;
    setGrid(newGrid);
    setStepIndex(prev);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setGrid(createInitialGrid());
    setStatistics({ visitedNodes: 0, pathLength: null });
    setNoPathFound(false);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
    if (isPlaying) {
      clearInterval(intervalRef.current);
      startInterval();
    }
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="app">
      <Header />

      {noPathFound && (
        <div className="no-path-banner">
          🚫 No path found! Try removing walls or moving start/end.
        </div>
      )}

      <ControlPanel
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onBack={handleBack}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
        onAlgorithmChange={() => {}}
        speed={speed}
        statistics={statistics}
      />

      <div className="grid-wrapper">
        <Grid grid={grid} setGrid={setGrid} triggerAlgorithm={handlePlay} />
      </div>

      <Footer
        visitedNodes={statistics.visitedNodes}
        pathLength={statistics.pathLength}
      />
    </div>
  );
}

// -- initial grid setup --

function createInitialGrid() {
  const rows = 20, cols = 50, grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isStart: r === 10 && c === 5,
        isEnd:   r === 10 && c === 45,
        isWall:  false,
        isVisited: false,
        isPath:    false,
        previousNode: null,
      });
    }
    grid.push(row);
  }
  return grid;
}

export default App;
