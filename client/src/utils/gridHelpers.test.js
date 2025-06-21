// src/utils/gridHelpers.test.js

import {
  GRID_ROWS,
  GRID_COLS
} from '../config'
import {
  createRecursiveDivisionMaze,
  createPrimsMaze,
  createEllersMaze,
  createRandomMaze,
  findNode
} from './gridHelpers'
import bfs from '../algorithms/bfs'

describe('Maze Generators', () => {
  const generators = [
    ['Recursive Division', createRecursiveDivisionMaze],
    ['Prim’s', createPrimsMaze],
    ['Eller’s', createEllersMaze],
    ['Random', createRandomMaze]
  ]

  generators.forEach(([name, gen]) => {
    describe(name, () => {
      let grid, start, end, result

      beforeAll(() => {
        grid = gen()
        start = findNode(grid, 'isStart')
        end = findNode(grid, 'isEnd')
        // clone grid for BFS so original isn’t mutated
        const gridClone = grid.map(row => row.map(cell => ({ ...cell })))
        result = bfs(gridClone, start, end)
      })

      test('has correct dimensions', () => {
        expect(grid.length).toBe(GRID_ROWS)
        expect(grid[0].length).toBe(GRID_COLS)
      })

      test('start and end present', () => {
        expect(start).toBeDefined()
        expect(end).toBeDefined()
      })

      test('is solvable (path length > 0)', () => {
        expect(result.path.length).toBeGreaterThan(0)
      })
    })
  })
})
