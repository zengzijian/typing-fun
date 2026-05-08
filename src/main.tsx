import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'remixicon/fonts/remixicon.css'
import './i18n'
import { ensureAnonymousAuth } from './lib/auth'
import App from './App.tsx'

ensureAnonymousAuth().catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
