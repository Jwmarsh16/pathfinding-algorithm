// src/utils/gridHelpers.js
import {
  GRID_ROWS,
  GRID_COLS,
  START_NODE,
  END_NODE
} from '../config';

/**
 * Create a new grid of nodes.
 * @returns {Object[][]} grid
 */
function createInitialGrid() {
  const grid = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    const currentRow = [];
    for (let col = 0; col < GRID_COLS; col++) {
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
    isStart: row === START_NODE.row && col === START_NODE.col,
    isEnd:   row === END_NODE.row   && col === END_NODE.col,
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
