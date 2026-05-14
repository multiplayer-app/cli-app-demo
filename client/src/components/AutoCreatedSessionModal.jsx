import { useEffect, useRef, useState } from 'react'
import { recorderEventBus } from '@multiplayer-app/session-recorder-react'
import './AutoCreatedSessionModal.css'

const STORAGE_KEY = 'mp-navigation-url'

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

  return (
    <div className='auto-created-session-backdrop' role='presentation' aria-hidden={false}>
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='auto-created-session-heading'
        className='auto-created-session-modal'
      >
        <h2 id='auto-created-session-heading' className='auto-created-session-title'>
          We found a bug!
        </h2>
        <p className='auto-created-session-description'>
          Make sure you&apos;ve connected the Multiplayer Debugging Agent to fix it.
        </p>
        <div className='auto-created-session-actions'>
          <button
            type='button'
            className='auto-created-session-btn auto-created-session-btn-primary'
            onClick={handleClose}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
