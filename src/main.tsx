import { registerServiceWorker } from './registerServiceWorker'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Register SW (safe in browsers that support it)
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
