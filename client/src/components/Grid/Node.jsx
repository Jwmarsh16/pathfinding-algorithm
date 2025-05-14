import React from 'react';
import './Grid.css'; // Ensure the styles include node-wall, etc.

function Node({ node, onMouseDown, onMouseEnter, onMouseUp }) {
    const { isStart, isEnd, isWall, isVisited, isPath } = node;

    const getNodeClass = () => {
        if (isStart) return 'node-start';
        if (isEnd) return 'node-end';
        if (isWall) return 'node-wall';
        if (isPath) return 'node-path';
        if (isVisited) return 'node-visited';
        return 'node';
    };

    return (
        <div
            className={getNodeClass()}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseUp={onMouseUp}
        />
    );
}

export default Node;

