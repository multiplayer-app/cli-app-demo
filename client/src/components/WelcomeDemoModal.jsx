import { useEffect, useState } from 'react'
import './WelcomeDemoModal.css'

const PREVIEW_IMAGE = '/welcome-preview.png'

const STORAGE_KEY = 'mp-demo-welcome-dismissed'

export default function WelcomeDemoModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof sessionStorage === 'undefined') return
    if (sessionStorage.getItem(STORAGE_KEY)) return
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className='welcome-demo-backdrop' role='presentation' onClick={dismiss}>
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='welcome-demo-heading'
        aria-describedby='welcome-demo-description'
        className='welcome-demo-modal'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='welcome-demo-preview'>
          <div className='welcome-demo-browser-bar' aria-hidden='true'>
            <span className='welcome-demo-dot welcome-demo-dot--red' />
            <span className='welcome-demo-dot welcome-demo-dot--yellow' />
            <span className='welcome-demo-dot welcome-demo-dot--green' />
            <span className='welcome-demo-url'>localhost:5173/dashboard</span>
          </div>
          <div className='welcome-demo-image-wrap'>
            <img
              src={PREVIEW_IMAGE}
              alt='Analytics page showing Share and Compare buttons outlined in red'
              className='welcome-demo-image'
            />
            <div className='welcome-demo-callout' aria-hidden='true'>
              <span className='welcome-demo-callout-pulse' />
              Buttons outlined in red trigger bugs
            </div>
          </div>
        </div>

        <div className='welcome-demo-body'>
          <span className='welcome-demo-eyebrow'>Welcome to the Multiplayer Debugging Agent demo</span>
          <h2 id='welcome-demo-heading' className='welcome-demo-title'>
            Hunt the <span className='welcome-demo-title-accent'>red-outlined</span> buttons
          </h2>
          <p id='welcome-demo-description' className='welcome-demo-description'>
            Every red-outlined button triggers a real bug. The Multiplayer Debugging Agent
            captures the full stack session in real time - screens, traces, logs, requests, responses - 
            and it fixes bugs automatically.
          </p>

          <ol className='welcome-demo-steps' aria-label='How the demo works'>
            <li className='welcome-demo-step'>
              <span className='welcome-demo-step-num'>1</span>
              Click a red-outlined button
            </li>
            <li className='welcome-demo-step'>
              <span className='welcome-demo-step-num'>2</span>
              We capture the bug
            </li>
            <li className='welcome-demo-step'>
              <span className='welcome-demo-step-num'>3</span>
              We fix it in our Agent CLI
            </li>
          </ol>

          <div className='welcome-demo-actions'>
            <span className='welcome-demo-hint'>
              Press <kbd>Esc</kbd> or click outside to close
            </span>
            <button type='button' className='welcome-demo-cta' onClick={dismiss}>
              <span>Start exploring</span>
              <span aria-hidden='true' className='welcome-demo-cta-arrow'>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
