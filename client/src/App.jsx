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
  const [speed, setSpeed] = useState(50);         // raw slider value (10–200)
  const [steps, setSteps] = useState([]);         // BFS visits + path
  const [stepIndex, setStepIndex] = useState(0);  // next step to process
  const [isPlaying, setIsPlaying] = useState(false);

  // refs for interval control
  const intervalRef = useRef(null);

  // -- helpers --

  // Clears all visit/path flags & previousNode references
  const clearGridVisualization = (g) => {
    g.forEach(row =>
      row.forEach(node => {
        node.isVisited = false;
        node.isPath    = false;
        node.previousNode = null;
      })
    );
  };

  // Finds the node in `g` with boolean prop `prop`
  const findNode = (g, prop) => {
    for (const row of g) {
      for (const node of row) {
        if (node[prop]) return node;
      }
    }
    return null;
  };

  // Build the steps array from BFS
  const initializeSteps = () => {
    // Clone & clear previous visualization
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    clearGridVisualization(newGrid);
    setGrid(newGrid);
    setNoPathFound(false);

    // Locate start/end
    const startNode = findNode(newGrid, 'isStart');
    const endNode   = findNode(newGrid, 'isEnd');
    if (!startNode || !endNode) {
      console.error('Start or end node missing!');
      return;
    }

    // Run BFS
    const { visitedNodes, path } = bfs(newGrid, startNode, endNode);
    setStatistics({
      visitedNodes: visitedNodes.length,
      pathLength: path.length,
    });

    // Combine visits then path
    const visitSteps = visitedNodes.map(node => ({ node, isPath: false }));
    const pathSteps  = path       .map(node => ({ node, isPath: true  }));
    const allSteps   = [...visitSteps, ...pathSteps];

    setSteps(allSteps);
    setStepIndex(0);

    if (path.length === 0) {
      setNoPathFound(true);
    }
  };

  // Process a single step from `steps`
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
        if (isPath) {
          newG[node.row][node.col].isPath = true;
        } else {
          newG[node.row][node.col].isVisited = true;
        }
        return newG;
      });
      return idx + 1;
    });
  };

  // -- handlers --

  // Autoplay: initialize steps if needed, then start interval
  const handlePlay = () => {
    if (isPlaying) return;            // already playing
    if (steps.length === 0) {
      initializeSteps();
      // slight delay to ensure `steps` state is set before starting
      setTimeout(startInterval, 0);
    } else {
      startInterval();
    }
  };

  // Pause autoplay
  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    }
  };

  // Manual step-by-step
  const handleStep = () => {
    if (steps.length === 0) {
      initializeSteps();
      return;
    }
    processStep();
  };

  // Start the interval based on current `speed`
  const startInterval = () => {
    const MIN_DELAY = 10, MAX_DELAY = 200;
    const delay = MAX_DELAY + MIN_DELAY - speed;
    intervalRef.current = setInterval(processStep, delay);
    setIsPlaying(true);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setGrid(createInitialGrid());
    setStatistics({ visitedNodes: 0, pathLength: null });
    setNoPathFound(false);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
    // if playing, restart interval with new speed
    if (isPlaying) {
      clearInterval(intervalRef.current);
      startInterval();
    }
  };

  // Clear on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // -- render --
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
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
        onAlgorithmChange={() => {}}
        speed={speed}
        statistics={statistics}
      />

      <div className="grid-wrapper">
        <Grid
          grid={grid}
          setGrid={setGrid}
          triggerAlgorithm={handlePlay}
        />
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
  const rows = 20;
  const cols = 50;
  const grid = [];
  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
}

function createNode(row, col) {
  return {
    row,
    col,
    isStart: row === 10 && col === 5,
    isEnd:   row === 10 && col === 45,
    isWall:  false,
    isVisited: false,
    isPath:    false,
    previousNode: null,
  };
}

export default App;
