/* File: src/components/Footer.jsx
 *
 * Update structure to group stats and credit separately for flex layout.
 * Import Footer.css for enhanced styling.
 */

import React from 'react'
import './Footer.css'

function Footer({ pathLength, visitedNodes, executionTime }) {
  return (
    <footer className="footer">
      <div className="footer__stats">
        <div className="footer__stat">
          <strong>Path Length:</strong> {pathLength || 'N/A'}
        </div>
        <div className="footer__stat">
          <strong>Visited Nodes:</strong> {visitedNodes || 0}
        </div>
        {executionTime && (
          <div className="footer__stat">
            <strong>Execution Time:</strong> {executionTime} ms
          </div>
        )}
      </div>
      <div className="footer__credit">
        Created by Jonathan W. Marshall
      </div>
    </footer>
  )
}

export default Footer
