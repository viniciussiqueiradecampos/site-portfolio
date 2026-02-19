import { StrictMode } from 'react'
console.log("Portfolio Version: 4.7 - CSP DISABLED TEST");
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
