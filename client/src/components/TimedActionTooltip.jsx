import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './TimedActionTooltip.css'

const HIDE_AFTER_MS = 5000
const SHOW_AFTER_MS = 500

/** Shown on demo-issue-trigger controls across pages */
export const DEMO_ERROR_TOOLTIP = 'Click the outlined button to trigger a demo error.'

/**
 * Shows a tooltip-style popover when mounted; hides after HIDE_AFTER_MS.
 * Rendered via portal so parent overflow/stacking does not clip it.
 */
export default function TimedActionTooltip({ children, content = DEMO_ERROR_TOOLTIP }) {
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState('above')
  const [popoverStyle, setPopoverStyle] = useState(() => ({
    position: 'fixed',
    left: 0,
    top: 0,
    visibility: 'hidden',
    zIndex: 10050
  }))

  const anchorRef = useRef(null)
  const tooltipRef = useRef(null)
  const tooltipId = useId()

  useEffect(() => {
    let t2 = null
    const t1 = window.setTimeout(() => {
      setOpen(true)
      t2 = window.setTimeout(() => setOpen(false), HIDE_AFTER_MS)
    }, SHOW_AFTER_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current
    const tip = tooltipRef.current
    if (!anchor || !tip || !open) return

    const ar = anchor.getBoundingClientRect()
    const tr = tip.getBoundingClientRect()
    const gap = 12
    const margin = 12

    let placeBelow = false
    let top = ar.top - tr.height - gap
    if (top < margin) {
      placeBelow = true
      top = ar.bottom + gap
    }

    let left = ar.left + ar.width / 2 - tr.width / 2
    left = Math.max(margin, Math.min(left, window.innerWidth - tr.width - margin))

    if (placeBelow && top + tr.height > window.innerHeight - margin) {
      placeBelow = false
      top = Math.max(margin, ar.top - tr.height - gap)
    }

    setPlacement(placeBelow ? 'below' : 'above')
    setPopoverStyle({
      position: 'fixed',
      left,
      top,
      visibility: 'visible',
      zIndex: 10050
    })
  }, [open])

  useLayoutEffect(() => {
    if (!open) return
    updatePosition()

    const tip = tooltipRef.current
    const anchor = anchorRef.current
    const ro = new ResizeObserver(() => updatePosition())
    if (tip) ro.observe(tip)
    if (anchor) ro.observe(anchor)

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, content, updatePosition])

  const tooltipNode =
    open && typeof document !== 'undefined' ? (
      <span
        ref={tooltipRef}
        id={tooltipId}
        role='tooltip'
        style={popoverStyle}
        className={`timed-action-tooltip-popover timed-action-tooltip-popover--portal timed-action-tooltip-popover--${placement}`}
      >
        {content}
      </span>
    ) : null

  return (
    <>
      <span ref={anchorRef} className='timed-action-tooltip-root'>
        <span className='timed-action-tooltip-anchor' aria-describedby={open ? tooltipId : undefined}>
          {children}
        </span>
      </span>
      {tooltipNode ? createPortal(tooltipNode, document.body) : null}
    </>
  )
}
