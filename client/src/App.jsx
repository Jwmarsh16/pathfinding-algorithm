import React from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import Grid from './components/Grid/Grid';
import Footer from './components/Footer';
import './styles/global.css';
import usePathfinder from './hooks/usePathfinder';

function App() {
  const {
    grid,
    setGrid,
    statistics,
    noPathFound,
    speed,
    play,
    pause,
    step,
    back,
    reset,
    changeSpeed
  } = usePathfinder();

  return (
    <div className="app">
      <Header />

      {noPathFound && (
        <div className="no-path-banner">
          🚫 No path found! Try removing walls or moving start/end.
        </div>
      )}

      <ControlPanel
        onPlay={play}
        onPause={pause}
        onStep={step}
        onBack={back}
        onReset={reset}
        onSpeedChange={changeSpeed}
        onAlgorithmChange={() => {}}
        speed={speed}
        statistics={statistics}
      />

      <div className="grid-wrapper">
        <Grid
          grid={grid}
          setGrid={setGrid}
          triggerAlgorithm={play}
        />
      </div>

      <Footer
        visitedNodes={statistics.visitedNodes}
        pathLength={statistics.pathLength}
      />
    </div>
  );
}

export default App;
