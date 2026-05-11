import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

interface Particle { id: number; x: number; y: number; vx: number; vy: number }

/* ── Idea #16: Ink-splatter particles on fast movement ───────────────────── */
export default function Cursor() {
  const [hovering, setHovering] = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const pidRef  = useRef(0)
  const lastPos = useRef({ x: 0, y: 0 })

  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)
  const ringX = useSpring(dotX, { stiffness: 150, damping: 15, mass: 0.1 })
  const ringY = useSpring(dotY, { stiffness: 150, damping: 15, mass: 0.1 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX)
      dotY.set(e.clientY)
      if (!visible) setVisible(true)

      /* Emit splatter only on fast movement */
      const dx  = e.clientX - lastPos.current.x
      const dy  = e.clientY - lastPos.current.y
      const vel = Math.sqrt(dx * dx + dy * dy)

      if (vel > 18) {
        const angle = Math.atan2(dy, dx)
        setParticles(prev => [
          ...prev.slice(-24),
          ...Array.from({ length: 4 }, () => {
            const spread = (Math.random() - 0.5) * 1.4
            const speed  = Math.random() * 2.5 + 0.8
            return {
              id: ++pidRef.current,
              x:  e.clientX,
              y:  e.clientY,
              vx: Math.cos(angle + spread) * speed,
              vy: Math.sin(angle + spread) * speed,
            }
          }),
        ])
      }
      lastPos.current = { x: e.clientX, y: e.clientY }
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [data-cursor="pointer"]') || t.tagName === 'A' || t.tagName === 'BUTTON')
        setHovering(true)
    }

    const onOut = (e: MouseEvent) => {
      const t = e.relatedTarget as HTMLElement | null
      if (!t?.closest('a, button, [data-cursor="pointer"]')) setHovering(false)
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout',  onOut)
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout',  onOut)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [dotX, dotY, visible])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null

  return (
    <>
      {/* Ink splatter particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="fixed rounded-full pointer-events-none z-[9996] bg-accent"
            style={{ translateX: '-50%', translateY: '-50%' }}
            initial={{ x: p.x, y: p.y, width: 5, height: 5, opacity: 0.85 }}
            animate={{ x: p.x + p.vx * 28, y: p.y + p.vy * 28 + 14, width: 2, height: 2, opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            onAnimationComplete={() => setParticles(prev => prev.filter(q => q.id !== p.id))}
          />
        ))}
      </AnimatePresence>

      {/* Lagging ring */}
      <motion.div
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:     hovering ? 44 : 32,
          height:    hovering ? 44 : 32,
          opacity:   visible  ? 1  : 0,
          boxShadow: hovering
            ? '0 0 20px rgba(212,168,67,1), 0 0 50px rgba(212,168,67,0.6), 0 0 90px rgba(212,168,67,0.25)'
            : '0 0 12px rgba(212,168,67,0.9), 0 0 28px rgba(212,168,67,0.45)',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-0 left-0 rounded-full border border-[#d4a843] pointer-events-none z-[9998]"
      />

      {/* Precise dot */}
      <motion.div
        style={{
          x: dotX, y: dotY,
          translateX: '-50%', translateY: '-50%',
          boxShadow: '0 0 10px rgba(212,168,67,1), 0 0 22px rgba(212,168,67,0.7)',
        }}
        animate={{ width: hovering ? 4 : 6, height: hovering ? 4 : 6, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 left-0 rounded-full bg-[#d4a843] pointer-events-none z-[9999]"
      />
    </>
  )
}
