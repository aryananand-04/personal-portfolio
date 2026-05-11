import { useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import type React from 'react'

export function useCursorSpotlight(intensity = 7) {
  const rawX = useMotionValue(50)
  const rawY = useMotionValue(50)
  const spX  = useSpring(rawX, { stiffness: 50, damping: 20 })
  const spY  = useSpring(rawY, { stiffness: 50, damping: 20 })

  const background = useMotionTemplate`radial-gradient(ellipse 50% 40% at ${spX}% ${spY}%, color-mix(in srgb, #d4a843 ${intensity}%, transparent), transparent 65%)`

  const handlers = {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect()
      rawX.set(((e.clientX - r.left) / r.width)  * 100)
      rawY.set(((e.clientY - r.top)  / r.height) * 100)
    },
    onMouseLeave: () => { rawX.set(50); rawY.set(50) },
  }

  return { background, handlers }
}
