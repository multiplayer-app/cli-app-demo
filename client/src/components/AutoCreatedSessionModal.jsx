import { useEffect, useState } from 'react'
import { recorderEventBus } from '@multiplayer-app/session-recorder-react'
import './AutoCreatedSessionModal.css'

const PREVIEW_IMAGE = '/agent-preview.png'

export default function AutoCreatedSessionModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    let openTimeoutId
    const handleNavigationModal = () => {
      openTimeoutId = window.setTimeout(() => setIsOpen(true), 2000)
    }
    recorderEventBus?.on('debug-session-ready', handleNavigationModal)
    return () => {
      recorderEventBus?.off('debug-session-ready', handleNavigationModal)
      if (openTimeoutId) window.clearTimeout(openTimeoutId)
    }
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
  }

  if (!isOpen) return null

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
            We caught the bug. <span className='auto-created-session-title-accent'>Now watch the Agent fix it.</span>
          </h2>
          <p id='auto-created-session-description' className='auto-created-session-description'>
            The full stack session - screens, traces, logs, requests, responses - has been recorded. Open the{' '}
            <strong>Multiplayer Debugging Agent CLI</strong> to see it analyze the issue, write a patch, and fix it in
            real time.
          </p>

          <div className='auto-created-session-actions'>
            <button
              type='button'
              className='auto-created-session-btn auto-created-session-btn-secondary'
              onClick={handleClose}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
