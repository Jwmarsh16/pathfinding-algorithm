// src/config.js
// ─── Global configuration constants ────────────────────────────────────────

// Grid dimensions
export const GRID_ROWS = 20
export const GRID_COLS = 50

// Default start/end locations
export const START_NODE = { row: 10, col: 5 }
export const END_NODE   = { row: 10, col: 45 }

// Animation speed (in milliseconds per step)
export const SPEED_MIN     = 1    // ← floor of 1 ms for maximum speed
export const SPEED_MAX     = 200
export const DEFAULT_SPEED = 50
