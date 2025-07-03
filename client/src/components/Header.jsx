/* File: src/components/Header.jsx
 *
 * Add light/dark theme toggle. Persist choice in localStorage
 * and apply 'theme-light' class on <body> for light mode.
 */

import React, { useState, useEffect } from 'react'

function Header() {
  const [theme, setTheme] = useState('dark')

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    setTheme(saved)
  }, [])

  // Apply theme class and persist
  useEffect(() => {
    document.body.classList.toggle('theme-light', theme === 'light')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <header className="header">
      <h1>Pathfinder Algorithm Visualizer</h1>
      <nav>
        <a href="#about">About</a>
        <a href="#credits"></a>
      </nav>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle light/dark theme"
      >
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>
    </header>
  )
}

export default Header
