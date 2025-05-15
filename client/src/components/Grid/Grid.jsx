import React, { useState } from 'react';
import Node from './Node';
import bfs from '../../algorithms/bfs'; // Adjust the relative path if needed
import './Grid.css'; // Grid-specific styles

function Grid({ grid, setGrid }) {
    const [isMousePressed, setIsMousePressed] = useState(false);
    const [isStartNodeDragged, setIsStartNodeDragged] = useState(false);
    const [isEndNodeDragged, setIsEndNodeDragged] = useState(false);

    // Predefined grid configurations
    const predefinedGrids = {
        empty: createEmptyGrid,
        smallMaze: createSmallMaze,
        diagonalWalls: createDiagonalWalls,
    };

    const handleMouseDown = (row, col) => {
        const newGrid = grid.slice();
        const node = newGrid[row][col];

        if (node.isStart) {
            setIsStartNodeDragged(true);
        } else if (node.isEnd) {
            setIsEndNodeDragged(true);
        } else {
            node.isWall = !node.isWall;
            setGrid(newGrid);
        }

        setIsMousePressed(true);
    };

    const handleMouseEnter = (row, col) => {
        if (!isMousePressed) return;

        const newGrid = grid.slice();
        const node = newGrid[row][col];

        if (isStartNodeDragged) {
            moveNode(newGrid, "isStart", row, col);
        } else if (isEndNodeDragged) {
            moveNode(newGrid, "isEnd", row, col);
        } else {
            node.isWall = true;
        }

        setGrid(newGrid);
    };

    const handleMouseUp = () => {
        setIsMousePressed(false);
        setIsStartNodeDragged(false);
        setIsEndNodeDragged(false);
    };

    const moveNode = (grid, nodeType, row, col) => {
        for (const rowArray of grid) {
            for (const node of rowArray) {
                if (node[nodeType]) {
                    node[nodeType] = false;
                }
            }
        }
        grid[row][col][nodeType] = true;
    };

    const loadPredefinedGrid = (type) => {
        if (predefinedGrids[type]) {
            setGrid(predefinedGrids[type]());
        }
    };

    const visualizeNode = (node) => {
        if (!node) return; // Prevent errors for invalid nodes
        const newGrid = grid.slice();
        newGrid[node.row][node.col].isVisited = true;
        setGrid(newGrid);
    };
    

    const visualizePathNode = (node) => {
        if (!node) return; // Prevent errors for invalid nodes
        const newGrid = grid.slice();
        newGrid[node.row][node.col].isPath = true;
        setGrid(newGrid);
    };
    

    const triggerBFS = () => {
        const startNode = findNode(grid, "isStart");
        const endNode = findNode(grid, "isEnd");
    
        console.log("Start Node:", startNode); // Log start node
        console.log("End Node:", endNode); // Log end node
    
        if (!startNode || !endNode) {
            console.error("Start or end node is invalid!");
            return;
        }
    
        // Run BFS to get visited nodes and path
        const { visitedNodes, path } = bfs(grid, startNode, endNode);
    
        // Debugging: Ensure visitedNodes and path are correct
        console.log("Visited Nodes:", visitedNodes);
        console.log("Shortest Path:", path);
    
        // Visualize visited nodes
        visitedNodes.forEach((node, index) => {
            setTimeout(() => {
                visualizeNode(node); // Highlight visited nodes
            }, index * 50); // Adjust speed with the delay
        });
    
        // Visualize the shortest path after visiting all nodes
        setTimeout(() => {
            path.forEach((node, index) => {
                setTimeout(() => {
                    visualizePathNode(node); // Highlight path nodes
                }, index * 50);
            });
        }, visitedNodes.length * 50);
        
    };
    

    const findNode = (grid, type) => {
        for (const row of grid) {
            for (const node of row) {
                if (node[type]) return node;
            }
        }
        return null; // Return null if no node is found
    };

    return (
        <div>
            <div className="grid-controls">
                <select onChange={(e) => loadPredefinedGrid(e.target.value)} defaultValue="">
                    <option value="" disabled>Select Grid Configuration</option>
                    <option value="empty">Empty Grid</option>
                    <option value="smallMaze">Small Maze</option>
                    <option value="diagonalWalls">Diagonal Walls</option>
                </select>
            </div>
            <div
                className="visualizer-canvas"
                onMouseLeave={handleMouseUp} // Ensure dragging stops if mouse leaves canvas
            >
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid-row">
                        {row.map((node, colIndex) => (
                            <Node
                                key={`${rowIndex}-${colIndex}`}
                                node={node}
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                onMouseUp={handleMouseUp}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function createEmptyGrid() {
    const rows = 20;
    const cols = 50;
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

function createSmallMaze() {
    const grid = createEmptyGrid();
    for (let i = 0; i < grid.length; i++) {
        if (i % 2 === 0) {
            for (let j = 0; j < grid[i].length; j++) {
                if (j % 2 === 0) {
                    grid[i][j].isWall = true;
                }
            }
        }
    }
    return grid;
}

function createDiagonalWalls() {
    const grid = createEmptyGrid();
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (i === j || i + j === grid[0].length - 1) {
                grid[i][j].isWall = true;
            }
        }
    }
    return grid;
}

function createNode(row, col) {
    return {
        row,
        col,
        isStart: row === 10 && col === 5,
        isEnd: row === 10 && col === 45,
        isWall: false,
        isVisited: false,
        isPath: false,
    };
}

export default Grid;
