// src/hooks/usePathfinder.js

import { useState, useRef, useEffect } from 'react';
import bfs from '../algorithms/bfs';
import {
  createInitialGrid,
  clearGridVisualization,
  findNode
} from '../utils/gridHelpers';
import {
  computeAnimationDelay,
  startAnimationInterval,
  restartAnimationInterval
} from '../utils/animationHelpers';
import { DEFAULT_SPEED } from '../config';

export default function usePathfinder() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [grid, setGrid]               = useState(createInitialGrid());
  const [statistics, setStatistics]   = useState({ visitedNodes: 0, pathLength: null });
  const [noPathFound, setNoPathFound] = useState(false);

  const [speed, setSpeed]       = useState(DEFAULT_SPEED);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef             = useRef(null);

  const [steps, setSteps]         = useState([]);
  const [stepIndex, setStepIndex] = useState(0);

  // ─── Helpers ────────────────────────────────────────────────────────────

  // 1) Build the step sequence from BFS
  function initializeSteps() {
    // clone current grid and clear any previous marks
    const newGrid = grid.map(r => r.map(n => ({ ...n })));
    clearGridVisualization(newGrid);
    setGrid(newGrid);
    setNoPathFound(false);

    // locate start & end
    const start = findNode(newGrid, 'isStart');
    const end   = findNode(newGrid, 'isEnd');
    if (!start || !end) return;

    // run BFS
    const { visitedNodes, path } = bfs(newGrid, start, end);
    setStatistics({ visitedNodes: visitedNodes.length, pathLength: path.length });

    // assemble steps
    const visitSteps = visitedNodes.map(node => ({ node, isPath: false }));
    const pathSteps  = path       .map(node => ({ node, isPath: true  }));
    setSteps([...visitSteps, ...pathSteps]);
    setStepIndex(0);

    if (path.length === 0) setNoPathFound(true);
  }

  // 2) Process exactly one step
  function processStep() {
    setStepIndex(idx => {
      if (idx >= steps.length) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        return idx;
      }
      const { node, isPath } = steps[idx];
      setGrid(g => {
        // clone & mark this node
        const newG = g.map(r => r.map(n => ({ ...n })));
        if (isPath) newG[node.row][node.col].isPath = true;
        else        newG[node.row][node.col].isVisited = true;
        return newG;
      });
      return idx + 1;
    });
  }

  // 3) Kick off an interval for autoplay
  function startInterval() {
    const id = startAnimationInterval(processStep, speed);
    intervalRef.current = id;
    setIsPlaying(true);
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  function play() {
    if (isPlaying) return;
    if (steps.length === 0) {
      initializeSteps();
      // let React flush state, then start
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

  function changeSpeed(event) {
    const val = Number(event.target.value);
    setSpeed(val);
    if (isPlaying) {
      restartAnimationInterval(intervalRef, processStep, val);
    }
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // ─── API ─────────────────────────────────────────────────────────────────

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
    changeSpeed,
  };
}
