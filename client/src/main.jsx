import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/demoIssueTrigger.css'
import App from './App.jsx'
import { 
  initializeSessionRecorder,
  SessionRecorderProvider,
} from './multiplayer.jsx'
import SessionRecorder from '@multiplayer-app/session-recorder-react'

// Initialize the session recorder before mounting
initializeSessionRecorder()

const container = document.getElementById('root')

const root = createRoot(container, {
  // React 19: thrown and not caught by an Error Boundary
  onUncaughtError(error, errorInfo) {
    SessionRecorder.captureException(error, { componentStack: errorInfo?.componentStack })
  },
  // React 19: caught by an Error Boundary
  onCaughtError(error, errorInfo) {
    SessionRecorder.captureException(error, { componentStack: errorInfo?.componentStack })
  },
  // React 18/19: recoverable runtime errors
  onRecoverableError(error) {
    SessionRecorder.captureException(error)
  }
})

root.render(
  <StrictMode>
    <SessionRecorderProvider>
      <App />
    </SessionRecorderProvider>
  </StrictMode>
)
