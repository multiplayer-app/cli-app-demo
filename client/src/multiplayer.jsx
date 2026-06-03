import SessionRecorder, { SessionRecorderProvider } from '@multiplayer-app/session-recorder-react'

/**
 * Initialize the Multiplayer Session Recorder before mounting the app.
 * This should run as early as possible to capture all network requests and errors.
 */
export function initializeSessionRecorder() {
  try {
    SessionRecorder.init({
      // Core configuration
      version: '1.0.0',
      showWidget: true,
      showContinuousRecording: false,
      application: 'multiplayer-cli-demo-app',
      apiKey: import.meta.env.VITE_MULTIPLAYER_SDK_API_KEY,
      environment: import.meta.env.VITE_ENVIRONMENT || 'development',
      apiBaseUrl: import.meta.env.VITE_SESSION_DEBUGGER_API_BASE_URL,
      exporterEndpoint: import.meta.env.VITE_SESSION_DEBUGGER_EXPORTER_ENDPOINT,
      propagateTraceHeaderCorsUrls: [/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i],
      widgetButtonPlacement: 'bottom-left',
      widgetTextOverrides: {
        buttonTooltipIdle: 'Report a bug'
      }
    })
  } catch (error) {
    console.warn('[SessionRecorder] Initialization failed:', error)
  }
}

export { SessionRecorderProvider }
