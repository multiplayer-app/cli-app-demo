import SessionRecorder from '@multiplayer-app/session-recorder-react'

// The SDK auto-creates a debug session on the first uncaptured error and emits
// `debug-session:auto-created` + `debug-session-ready`. Subsequent errors attach
// to that session silently, so AutoCreatedSessionModal would only open once per
// page load. For the demo we want every bug to re-open the modal — fire a
// custom DOM event the modal also listens for.
export function captureBug(error) {
  SessionRecorder.captureException(error)
  window.dispatchEvent(new CustomEvent('demo:bug-caught'))
}
