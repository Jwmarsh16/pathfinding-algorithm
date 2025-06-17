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
          <li>Click and drag the green start or red end nodes to move them.</li>
          <li>Use the Play/Pause/Step/Back controls to run or step through the algorithm.</li>
          <li>Adjust speed with the slider, and pick your algorithm from the dropdown.</li>
        </ul>

        <h3>Color Legend</h3>
        <ul>
          <li><span className="legend-box start" /> Start node (green)</li>
          <li><span className="legend-box end" /> End node (red)</li>
          <li><span className="legend-box wall" /> Wall (black)</li>
          <li><span className="legend-box visited" /> Visited nodes (lightblue)</li>
          <li><span className="legend-box path" /> Final path (yellow)</li>
        </ul>

        <h3>Learn More</h3>
        <ul>
          <li>
            <a href="https://en.wikipedia.org/wiki/Breadth-first_search" target="_blank" rel="noopener noreferrer">
              BFS on Wikipedia
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Depth-first_search" target="_blank" rel="noopener noreferrer">
              DFS on Wikipedia
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm" target="_blank" rel="noopener noreferrer">
              Dijkstra’s Algorithm on Wikipedia
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/A*_search_algorithm" target="_blank" rel="noopener noreferrer">
              A* Search on Wikipedia
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default HelpModal
