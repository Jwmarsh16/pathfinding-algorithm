// src/App.jsx
import React, { useState } from 'react';
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
  const [speed, setSpeed] = useState(50); // ms per node visualization

  // -- helpers --

  // Reset flags on every node
  const clearGridVisualization = (g) => {
    g.forEach(row =>
      row.forEach(node => {
        node.isVisited = false;
        node.isPath = false;
        node.previousNode = null;
      })
    );
  };

  // Find the node with the given boolean prop (e.g. 'isStart' or 'isEnd')
  const findNode = (g, prop) => {
    for (const row of g) {
      for (const node of row) {
        if (node[prop]) return node;
      }
    }
    return null;
  };

  // -- handlers --

  const handlePlay = () => {
    // 1. Clone & clear previous visualization
    const newGrid = grid.map(row => row.map(node => ({ ...node })));
    clearGridVisualization(newGrid);
    setGrid(newGrid);
    setNoPathFound(false);

    // 2. Locate start/end
    const startNode = findNode(newGrid, 'isStart');
    const endNode   = findNode(newGrid, 'isEnd');
    if (!startNode || !endNode) {
      console.error('Start or end node missing!');
      return;
    }

    // 3. Run BFS (no visualize callback; we’ll animate manually)
    const { visitedNodes, path } = bfs(newGrid, startNode, endNode);

    // 4. Update raw stats
    setStatistics({
      visitedNodes: visitedNodes.length,
      pathLength: path.length,
    });

    // 5. Animate visited nodes
    visitedNodes.forEach((node, idx) => {
      setTimeout(() => {
        newGrid[node.row][node.col].isVisited = true;
        setGrid(g => [...newGrid]);
      }, idx * speed);
    });

    // 6. After all visited, animate path or show “no path” banner
    setTimeout(() => {
      if (path.length === 0) {
        setNoPathFound(true);
        return;
      }
      path.forEach((node, idx) => {
        setTimeout(() => {
          newGrid[node.row][node.col].isPath = true;
          setGrid(g => [...newGrid]);
        }, idx * speed);
      });
    }, visitedNodes.length * speed);
  };

  const handleReset = () => {
    setGrid(createInitialGrid());
    setStatistics({ visitedNodes: 0, pathLength: null });
    setNoPathFound(false);
  };

  const handleSpeedChange = (e) => {
    setSpeed(Number(e.target.value));
  };

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
        onPause={() => {}}
        onReset={handleReset}
        onStep={() => {}}
        onSpeedChange={handleSpeedChange}
        onAlgorithmChange={() => {}}
        statistics={statistics}
      />

      <Grid
        grid={grid}
        setGrid={setGrid}
        triggerAlgorithm={handlePlay}
      />

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
