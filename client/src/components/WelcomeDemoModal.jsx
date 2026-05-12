import { useEffect, useState } from 'react'
import './AutoCreatedSessionModal.css'

const STORAGE_KEY = 'mp-demo-welcome-dismissed'

export default function WelcomeDemoModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY)) return
    setOpen(true)
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className='auto-created-session-backdrop' role='presentation' onClick={dismiss}>
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='welcome-demo-heading'
        className='auto-created-session-modal'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id='welcome-demo-heading' className='auto-created-session-title'>
          Welcome to the demo!
        </h2>
        <p className='auto-created-session-description'>
          To see the Multiplayer Debugging Agent in action, simply click any button with a <b>red outline</b> to trigger
          a bug and capture the session.
        </p>
        <div className='auto-created-session-actions' style={{ justifyContent: 'flex-end' }}>
          <button type='button' className='auto-created-session-btn auto-created-session-btn-primary' onClick={dismiss}>
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
