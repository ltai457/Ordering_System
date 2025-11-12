import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CacheBuster from 'react-cache-buster'
import { version } from '../package.json'
import './index.css'
import App from './App.jsx'

const isProduction = import.meta.env.PROD

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CacheBuster
      currentVersion={version}
      isEnabled={isProduction}
      isVerboseMode={false}
    >
      <App />
    </CacheBuster>
  </StrictMode>,
)
