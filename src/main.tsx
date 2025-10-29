import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './app'
import './index.css'
import { ThemeProvider } from './theme/ThemeProvider'
import { ToastProvider } from './ui/Toast'

const qc = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
