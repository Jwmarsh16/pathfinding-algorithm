/* File: src/components/Footer.jsx */

function Footer({ pathLength, visitedNodes, executionTime }) {
    return (
      <footer className="footer">
        <p>Path Length: {pathLength || 'N/A'}</p>
        <p>Visited Nodes: {visitedNodes || 0}</p>
        {executionTime && <p>Execution Time: {executionTime} ms</p>}
        <p>Created by Jonathan W. Marshall</p>
      </footer>
    );
  }
  export default Footer;
  