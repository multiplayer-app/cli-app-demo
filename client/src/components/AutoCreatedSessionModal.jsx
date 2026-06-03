import { useEffect, useState } from 'react'
import { recorderEventBus } from '@multiplayer-app/session-recorder-react'
import './AutoCreatedSessionModal.css'

const DEBUG_SESSION_READY_EVENT = 'debug-session:ready'
const AUTO_COPY = {
  eyebrow: 'Bug captured',
  callout: 'Agent is on it',
  title: (
    <>
      We caught the bug. <span className='auto-created-session-title-accent'>Now watch the Agent fix it.</span>
    </>
  ),
  description: (
    <>
      The full stack session — screens, traces, logs, requests, responses — has been recorded. Open the{' '}
      <strong>Debugging Agent CLI</strong> to see it analyze the issue, write a patch, and fix it in real time.
    </>
  ),
  previewImage: '/agent-preview.png',
  imageAlt: 'Debugging Agent analyzing a captured bug session and opening a pull request'
}

const MANUAL_COPY = {
  eyebrow: 'Recording complete',
  callout: 'Ready to review',
  title: (
    <>
      Your session was captured.{' '}
      <span className='auto-created-session-title-accent'>Add notes, then send to an agent.</span>
    </>
  ),
  description: (
    <>
      Your recording is saved in Multiplayer. Open it to review screens, traces, and logs, add notes on the spans that
      matter, then send the recording to your <strong>Debugging Agent</strong> from the recording page.
    </>
  ),
  steps: [
    'Open your recording in Multiplayer',
    'Add notes or star the traces and spans that matter',
    'Send the recording to your debugging agent'
  ],
  previewImage: '/dashboard-preview.png',
  imageAlt: 'Multiplayer dashboard showing a saved session recording ready to review'
}

export default function AutoCreatedSessionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isManual, setIsManual] = useState(false)
  const [recordingUrl, setRecordingUrl] = useState(null)

  useEffect(() => {
    const handleSessionReady = (payload) => {
      const manual = payload?.sessionType === 'MANUAL'
      setIsManual(manual)
      setRecordingUrl(manual && payload?.url ? payload.url : null)
      setIsOpen(true)
    }
    recorderEventBus?.on(DEBUG_SESSION_READY_EVENT, handleSessionReady)
    return () => {
      recorderEventBus?.off(DEBUG_SESSION_READY_EVENT, handleSessionReady)
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
    setIsManual(false)
    setRecordingUrl(null)
  }

  if (!isOpen) return null

  const copy = isManual ? MANUAL_COPY : AUTO_COPY

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
            <img src={copy.previewImage} alt={copy.imageAlt} className='auto-created-session-image' />
            <div
              className={`auto-created-session-callout${isManual ? ' auto-created-session-callout--manual' : ''}`}
              aria-hidden='true'
            >
              {!isManual && <span className='auto-created-session-callout-pulse' />}
              {copy.callout}
            </div>
          </div>
        </div>

        <div className='auto-created-session-body'>
          <span className={`auto-created-session-eyebrow${isManual ? ' auto-created-session-eyebrow--manual' : ''}`}>
            {!isManual && <span className='auto-created-session-eyebrow-dot' aria-hidden='true' />}
            {copy.eyebrow}
          </span>
          <h2 id='auto-created-session-heading' className='auto-created-session-title'>
            {copy.title}
          </h2>
          <p id='auto-created-session-description' className='auto-created-session-description'>
            {copy.description}
          </p>

          {isManual && copy.steps && (
            <ol className='auto-created-session-steps' aria-label='Next steps'>
              {copy.steps.map((step, index) => (
                <li key={step} className='auto-created-session-step'>
                  <span className='auto-created-session-step-num'>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          )}

          <div className='auto-created-session-actions'>
            <button
              type='button'
              className='auto-created-session-btn auto-created-session-btn-secondary'
              onClick={handleClose}
            >
              Continue
            </button>
            {isManual && recordingUrl && (
              <a
                href={recordingUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='auto-created-session-btn auto-created-session-btn-primary'
              >
                Open recording
                <span aria-hidden='true' className='auto-created-session-arrow'>
                  →
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
