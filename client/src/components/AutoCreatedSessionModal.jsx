import { useEffect, useRef, useState } from 'react'
import { recorderEventBus } from '@multiplayer-app/session-recorder-react'
import './AutoCreatedSessionModal.css'

const STORAGE_KEY = 'mp-navigation-url'
const PREVIEW_IMAGE = '/agent-preview.png'

function getNavigationStoredUrl() {
  const storedUrl = localStorage.getItem(STORAGE_KEY)
  if (!storedUrl || storedUrl === 'undefined') return null
  return storedUrl
}

/**
 * When the SDK auto-creates a debug session it emits
 * `debug-session:auto-created` (URL) then `debug-session-ready`; we show a modal to open the recording.
 */
export default function AutoCreatedSessionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const navigationUrlRef = useRef(getNavigationStoredUrl())

  useEffect(() => {
    const handleSetUrl = (url) => {
      if (!url) return
      navigationUrlRef.current = url
      localStorage.setItem(STORAGE_KEY, url)
    }
    recorderEventBus?.on('debug-session:auto-created', handleSetUrl)
    return () => {
      recorderEventBus?.off('debug-session:auto-created', handleSetUrl)
    }
  }, [])

  useEffect(() => {
    const handleNavigationModal = () => {
      if (navigationUrlRef.current) {
        setIsOpen(true)
      }
    }
    recorderEventBus?.on('debug-session-ready', handleNavigationModal)
    return () => {
      recorderEventBus?.off('debug-session-ready', handleNavigationModal)
    }
  }, [])

  // The SDK only fires `debug-session-ready` for the first auto-created session;
  // every subsequent captureException is attached silently. For the demo we want
  // the modal to re-open on every bug, so listen for our own `demo:bug-caught`
  // event (dispatched by `utils/captureBug.js`).
  useEffect(() => {
    const handleBugCaught = () => setIsOpen(true)
    window.addEventListener('demo:bug-caught', handleBugCaught)
    return () => window.removeEventListener('demo:bug-caught', handleBugCaught)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    navigationUrlRef.current = null
    localStorage.removeItem(STORAGE_KEY)
  }

  const handleNavigate = () => {
    const url = navigationUrlRef.current
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
      handleClose()
    }
  }

  if (!isOpen) return null

  const hasUrl = Boolean(navigationUrlRef.current)

  return (
    <div className='auto-created-session-backdrop' role='presentation' onClick={handleClose}>
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='auto-created-session-heading'
        aria-describedby='auto-created-session-description'
        className='auto-created-session-modal'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='auto-created-session-preview'>
          <div className='auto-created-session-image-wrap'>
            <img
              src={PREVIEW_IMAGE}
              alt='Multiplayer Debugging Agent analyzing a captured bug session and opening a pull request'
              className='auto-created-session-image'
            />
            <div className='auto-created-session-callout' aria-hidden='true'>
              <span className='auto-created-session-callout-pulse' />
              Agent is on it
            </div>
          </div>
        </div>

        <div className='auto-created-session-body'>
          <span className='auto-created-session-eyebrow'>
            <span className='auto-created-session-eyebrow-dot' aria-hidden='true' />
            Bug captured
          </span>
          <h2 id='auto-created-session-heading' className='auto-created-session-title'>
            We caught the bug.{' '}
            <span className='auto-created-session-title-accent'>Now watch the Agent fix it.</span>
          </h2>
          <p id='auto-created-session-description' className='auto-created-session-description'>
            The full stack session - screens, traces, logs, requests, responses - has been recorded. Open the{' '}
            <strong>Multiplayer Debugging Agent</strong> to see it analyze the issue, write a
            patch, and fix it in real time. With real apps, it also opens a PR!
          </p>

          <div className='auto-created-session-actions'>
            <button
              type='button'
              className='auto-created-session-btn auto-created-session-btn-secondary'
              onClick={handleClose}
            >
              Continue
            </button>
            {hasUrl && (
              <button
                type='button'
                className='auto-created-session-btn auto-created-session-btn-primary'
                onClick={handleNavigate}
              >
                <span>Open in Multiplayer</span>
                <span aria-hidden='true' className='auto-created-session-arrow'>→</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
