import React, { useState } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import Grid from './components/Grid/Grid';
import Footer from './components/Footer';
import './styles/global.css'; // Import global styles
import bfs from './algorithms/bfs'; // Import the BFS algorithm

function App() {
  // Grid state
  const [grid, setGrid] = useState(createInitialGrid());
  const [statistics, setStatistics] = useState({ pathLength: null, visitedNodes: 0 });

  // Visualize a single node during BFS traversal
  const visualizeNode = (node) => {
    const newGrid = grid.slice();
    newGrid[node.row][node.col].isVisited = true;
    setGrid(newGrid);
  };

  // Trigger BFS algorithm and visualize traversal
  const handlePlay = () => {
    const startNode = findNode(grid, 'isStart');
    const endNode = findNode(grid, 'isEnd');

    if (!startNode || !endNode) {
      console.error('Start or end node not found!');
      return;
    }

    const { visitedNodes, path } = bfs(grid, startNode, endNode);

    // Visualize visited nodes
    visitedNodes.forEach((node, index) => {
      setTimeout(() => {
        visualizeNode(node);
      }, index * 50); // Adjust speed with delay
    });

    // Visualize the shortest path after traversal
    setTimeout(() => {
      visualizePath(path);
    }, visitedNodes.length * 50);
  };

  // Visualize the shortest path
  const visualizePath = (path) => {
    const newGrid = grid.slice();
    path.forEach((node, index) => {
      setTimeout(() => {
        newGrid[node.row][node.col].isPath = true;
        setGrid(newGrid);
      }, index * 50);
    });

    // Update statistics after path visualization
    setStatistics((prev) => ({
      ...prev,
      pathLength: path.length,
    }));
  };

  // Reset the grid and statistics
  const handleReset = () => {
    setGrid(createInitialGrid());
    setStatistics({ pathLength: null, visitedNodes: 0 });
  };

  // Find a specific node type (e.g., start or end node)
  const findNode = (grid, type) => {
    for (const row of grid) {
      for (const node of row) {
        if (node[type]) return node;
      }
    }
    return null;
  };

  return (
    <div className="app">
      <Header />
      <ControlPanel
        onPlay={handlePlay}
        onPause={() => console.log('Pause (Not implemented)')}
        onReset={handleReset}
        onStep={() => console.log('Step (Not implemented)')}
        onSpeedChange={(event) => console.log(`Speed: ${event.target.value}`)}
        onAlgorithmChange={(event) => console.log(`Algorithm: ${event.target.value}`)}
      />
      <Grid grid={grid} setGrid={setGrid} triggerAlgorithm={handlePlay} />
      <Footer
        pathLength={statistics.pathLength}
        visitedNodes={statistics.visitedNodes}
      />
    </div>
  );
}

// Helper function to initialize the grid
function createInitialGrid() {
  const rows = 20; // Number of rows
  const cols = 50; // Number of columns
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
    isStart: row === 10 && col === 5, // Example start node
    isEnd: row === 10 && col === 45, // Example end node
    isWall: false,
    isVisited: false,
    isPath: false,
  };
}

export default App;
