import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Navin Frontend</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        React + TypeScript + Vite — browse the{' '}
        <a
          href="https://github.com/Navin-xmr/navin-frontend/issues"
          target="_blank"
          rel="noreferrer"
        >
          open issues
        </a>{' '}
        to start contributing.
      </p>
    </>
  )
}

export default App
