// src/hooks/usePathfinder.js
import { useState, useRef, useEffect } from 'react';
import bfs from '../algorithms/bfs';
import {
  createInitialGrid,
  clearGridVisualization,
  findNode
} from '../utils/gridHelpers';

function usePathfinder() {
  // grid + visualization flags
  const [grid, setGrid]               = useState(createInitialGrid());
  const [statistics, setStatistics]   = useState({ visitedNodes: 0, pathLength: null });
  const [noPathFound, setNoPathFound] = useState(false);

  // speed & playback
  const [speed, setSpeed]       = useState(50);        // raw slider value (10–200)
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // step-by-step
  const [steps, setSteps]         = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  // Build the full sequence of visit + path steps
  function initializeSteps() {
    const newGrid = grid.map(r => r.map(n => ({ ...n })));
    clearGridVisualization(newGrid);
    setGrid(newGrid);
    setNoPathFound(false);

    const start = findNode(newGrid, 'isStart');
    const end   = findNode(newGrid, 'isEnd');
    if (!start || !end) return;

    const { visitedNodes, path } = bfs(newGrid, start, end);
    setStatistics({ visitedNodes: visitedNodes.length, pathLength: path.length });

    const visitSteps = visitedNodes.map(node => ({ node, isPath: false }));
    const pathSteps  = path       .map(node => ({ node, isPath: true  }));
    setSteps([...visitSteps, ...pathSteps]);
    setStepIndex(0);

    if (path.length === 0) setNoPathFound(true);
  }

  // process one step
  function processStep() {
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
        else       newG[node.row][node.col].isVisited = true;
        return newG;
      });
      return idx + 1;
    });
  }

  // start/resume interval
  function startInterval() {
    const MIN_DELAY = 10, MAX_DELAY = 200;
    const delay = MAX_DELAY + MIN_DELAY - speed;
    intervalRef.current = setInterval(processStep, delay);
    setIsPlaying(true);
  }

  // Handlers exposed to App
  function play() {
    if (isPlaying) return;
    if (steps.length === 0) {
      initializeSteps();
      // schedule interval after state has updated
      setTimeout(startInterval, 0);
    } else {
      startInterval();
    }
  }

  function pause() {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
  }

  function step() {
    if (steps.length === 0) {
      initializeSteps();
    } else {
      processStep();
    }
  }

  function back() {
    if (stepIndex <= 0) return;
    const prev = stepIndex - 1;
    const { node, isPath } = steps[prev];
    setGrid(g => {
      const newG = g.map(r => r.map(n => ({ ...n })));
      if (isPath) newG[node.row][node.col].isPath = false;
      else        newG[node.row][node.col].isVisited = false;
      return newG;
    });
    setStepIndex(prev);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setGrid(createInitialGrid());
    setStatistics({ visitedNodes: 0, pathLength: null });
    setNoPathFound(false);
    setSteps([]);
    setStepIndex(0);
    setIsPlaying(false);
  }

  function changeSpeed(e) {
    const val = Number(e.target.value);
    setSpeed(val);
    if (isPlaying) {
      clearInterval(intervalRef.current);
      startInterval();
    }
  }

  // cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  return {
    grid,
    setGrid,
    statistics,
    noPathFound,
    speed,
    isPlaying,
    play,
    pause,
    step,
    back,
    reset,
    changeSpeed
  };
}

export default usePathfinder;
