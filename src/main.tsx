import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { GamingProvider } from '@/store/gaming'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GamingProvider>
        <App />
      </GamingProvider>
    </BrowserRouter>
  </React.StrictMode>,
)