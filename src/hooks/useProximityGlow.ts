import { useEffect, useRef } from 'react'
import { useMotionValue, useTransform } from 'framer-motion'

/* Single shared mouse position — one listener for the whole page */
const mouse = { x: 0, y: 0 }
let mouseInit = false
function initMouse() {
  if (mouseInit) return
  mouseInit = true
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY }, { passive: true })
}

export function useProximityGlow(range = 250) {
  const ref       = useRef<HTMLDivElement>(null)
  const intensity = useMotionValue(0)

  useEffect(() => {
    initMouse()
    const onMove = () => {
      if (!ref.current) return
      const r  = ref.current.getBoundingClientRect()
      const cx = r.left + r.width  / 2
      const cy = r.top  + r.height / 2
      const d  = Math.sqrt((mouse.x - cx) ** 2 + (mouse.y - cy) ** 2)
      intensity.set(Math.max(0, 1 - d / range))
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [range, intensity])

  const boxShadow = useTransform(
    intensity,
    [0, 0.4, 1],
    [
      '0 0 0px rgba(212,168,67,0)',
      '0 0 22px rgba(212,168,67,0.22), 0 0 45px rgba(212,168,67,0.1)',
      '0 0 42px rgba(212,168,67,0.5), 0 0 85px rgba(212,168,67,0.22)',
    ]
  )

  return { ref, boxShadow }
}
