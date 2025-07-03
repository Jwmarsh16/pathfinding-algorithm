// src/components/InfoPanel.jsx

import React from 'react'
import './InfoPanel.css'

const ALGO_INFO = {
  bfs: {
    title: 'Breadth-First Search',
    description: 'Unweighted shortest-path search using a FIFO queue.',
    time: 'O(V + E)',
    space: 'O(V)'
  },
  dfs: {
    title: 'Depth-First Search',
    description: 'Unweighted traversal using a LIFO stack (recursive backtracking).',
    time: 'O(V + E)',
    space: 'O(V)'
  },
  dijkstra: {
    title: 'Dijkstra’s Algorithm',
    description: 'Weighted shortest-path search (all weights = 1 here) using a priority queue.',
    time: 'O((V + E) log V)',
    space: 'O(V)'
  },
  astar: {
    title: 'A* Search',
    description: 'Shortest-path search with a heuristic (Manhattan) to guide exploration.',
    time: 'O((V + E) log V)',
    space: 'O(V)'
  }
}

function InfoPanel({ selectedAlgorithm }) {
  const info = ALGO_INFO[selectedAlgorithm] || ALGO_INFO.bfs

  return (
    <div className="info-panel">
      <h2 className="info-panel__title">{info.title}</h2>
      <p className="info-panel__desc">{info.description}</p>
      <div className="info-panel__complexities">
        <span><strong>Time:</strong> {info.time}</span>
        <span><strong>Space:</strong> {info.space}</span>
      </div>
    </div>
  )
}

export default InfoPanel
