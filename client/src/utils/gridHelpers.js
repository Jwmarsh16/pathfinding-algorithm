// src/utils/gridHelpers.js

/**
 * Create a new grid of nodes.
 * @param {number} rows - Number of rows (default 20)
 * @param {number} cols - Number of columns (default 50)
 * @returns {Object[][]} grid
 */
function createInitialGrid(rows = 20, cols = 50) {
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

/**
 * Create a single node object.
 * @param {number} row
 * @param {number} col
 * @returns {Object} node
 */
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

/**
 * Clear visualization flags on a grid.
 * @param {Object[][]} grid
 */
function clearGridVisualization(grid) {
  grid.forEach(row =>
    row.forEach(node => {
      node.isVisited = false;
      node.isPath = false;
      node.previousNode = null;
    })
  );
}

/**
 * Find the first node in the grid with a given boolean property.
 * @param {Object[][]} grid
 * @param {string} prop - e.g. 'isStart' or 'isEnd'
 * @returns {Object|null}
 */
function findNode(grid, prop) {
  for (const row of grid) {
    for (const node of row) {
      if (node[prop]) return node;
    }
  }
  return null;
}

export {
  createInitialGrid,
  createNode,
  clearGridVisualization,
  findNode,
};
