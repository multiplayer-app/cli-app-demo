import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SessionRecorder, ErrorBoundary } from '@multiplayer-app/session-recorder-react'
import './index.css'
import App from './App.jsx'

// Initialize Multiplayer Session Recorder before mounting the React tree.
// All options that reference env vars are read via import.meta.env (Vite convention).
SessionRecorder.init({
  application: 'multiplayer-cli-demo-app',
  version: '0.0.0',
  environment: import.meta.env.VITE_MULTIPLAYER_ENVIRONMENT ?? 'development',
  apiKey: import.meta.env.VITE_MULTIPLAYER_API_KEY,
  showWidget: true,
  showContinuousRecording: true,

  // TODO: add your API backend origin(s) so trace-context headers are
  // forwarded on cross-origin requests, e.g.:
  //   propagateTraceHeaderCorsUrls: [/https:\/\/api\.example\.com/]
  propagateTraceHeaderCorsUrls: ['https://jsonplaceholder.typicode.com'],

  captureBody: true,
  captureHeaders: true
})

// TODO: call SessionRecorder.setSessionAttributes() once your auth flow
// resolves the current user, for example after a successful login:
//   SessionRecorder.setSessionAttributes({ userId: 'user-123', userName: 'User Name' })

createRoot(document.getElementById('root'), {
  // Capture errors thrown outside React's rendering cycle (e.g. event handlers)
  onUncaughtError: (error) => {
    SessionRecorder.captureException(error)
  },
  // Capture errors caught by React error boundaries (including <ErrorBoundary> below)
  onCaughtError: (error) => {
    SessionRecorder.captureException(error)
  },
  // Capture errors React automatically recovered from (e.g. hydration mismatches)
  onRecoverableError: (error) => {
    SessionRecorder.captureException(error)
  }
}).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
