import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ApiDataProvider } from './context/ApiDataContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApiDataProvider>
      <App />
    </ApiDataProvider>
  </StrictMode>,
)
