import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../rent/rent.css'
import './nails.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
