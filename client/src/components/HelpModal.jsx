import React from 'react'
import './HelpModal.css'

function HelpModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div
        className="help-modal-content"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="help-modal-close"
          onClick={onClose}
          aria-label="Close help"
        >
          ×
        </button>

        <h2>How to Interact</h2>
        <ul>
          <li>Click or drag on cells to toggle walls.</li>
          <li>
            Click and drag the{' '}
            <span
              style={{ color: 'var(--accent-color)', fontWeight: 600 }}
            >
              start node
            </span>{' '}
            or{' '}
            <span
              style={{ color: 'var(--primary-color)', fontWeight: 600 }}
            >
              end node
            </span>{' '}
            to move them.
          </li>
          <li>
            Use the Play/Pause/Step/Back controls to run or step through
            the algorithm.
          </li>
          <li>
            Adjust speed with the slider, and pick your algorithm from
            the dropdown.
          </li>
        </ul>

        <h3>Color Legend</h3>
        <ul>
          <li>
            <span className="legend-box start" /> Start node
          </li>
          <li>
            <span className="legend-box end" /> End node
          </li>
          <li>
            <span className="legend-box wall" /> Wall
          </li>
          <li>
            <span className="legend-box visited" /> Visited nodes
          </li>
          <li>
            <span className="legend-box path" /> Final path
          </li>
        </ul>

        <h3>Learn More</h3>

        <h4>Pathfinding Algorithms</h4>
        <ul>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Breadth-first_search"
              target="_blank"
              rel="noopener noreferrer"
            >
              Breadth-First Search (BFS)
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Depth-first_search"
              target="_blank"
              rel="noopener noreferrer"
            >
              Depth-First Search (DFS)
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dijkstra’s Algorithm
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/A*_search_algorithm"
              target="_blank"
              rel="noopener noreferrer"
            >
              A* Search
            </a>
          </li>
        </ul>

        <h4>Maze Generation Algorithms</h4>
        <ul>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Maze_generation_algorithm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Maze Generation Overview
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_division_method"
              target="_blank"
              rel="noopener noreferrer"
            >
              Recursive Division Method
            </a>
          </li>
          <li>
            <a
              href="https://en.wikipedia.org/wiki/Prim%27s_algorithm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Prim’s Algorithm
            </a>
          </li>
          <li>
            <a
              href="https://weblog.jamisbuck.org/2010/12/29/maze-generation-eller-s-algorithm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Eller’s Algorithm (Jamis Buck)
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default HelpModal
