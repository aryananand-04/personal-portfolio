import { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'

/* ── Module-level trigger ─────────────────────────────────────────────────── */
let _trigger: (() => void) | null = null
export const onKnightTrigger = (fn: () => void) => { _trigger = fn }
export const triggerKnight   = () => _trigger?.()

/* ── Idea #18: Three-layer parallax depth knights ────────────────────────── */
const LAYERS = [
  { opacity: 1,    top: '50%',              yOff: '-50%', size: 'min(88vh, 60vw)' },
  { opacity: 0.42, top: 'calc(50% - 6vh)',  yOff: '-50%', size: 'min(68vh, 46vw)' },
  { opacity: 0.18, top: 'calc(50% - 12vh)', yOff: '-50%', size: 'min(52vh, 36vw)' },
]

export default function KnightTransition() {
  const c0 = useAnimation()
  const c1 = useAnimation()
  const c2 = useAnimation()
  const controls = [c0, c1, c2]

  useEffect(() => {
    controls.forEach(c => c.set({ x: '-110vw' }))

    onKnightTrigger(() => {
      controls.forEach((c, i) => {
        const dur = 1.67 / (1 + i * 0.09)
        c.start({ x: '110vw', transition: { duration: dur, delay: i * 0.055, ease: [0.4, 0, 0.6, 1] } })
          .then(() => c.set({ x: '-110vw' }))
      })
    })
  }, [])

  return (
    <>
      {LAYERS.map(({ opacity, top, yOff, size }, i) => (
        <motion.div
          key={i}
          animate={controls[i]}
          className="fixed left-0 z-[9995] pointer-events-none select-none"
          style={{ top, translateY: yOff }}
          aria-hidden
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: size,
              lineHeight: 1,
              color: '#d4a843',
              opacity,
              display: 'block',
              textShadow: `
                0 0 40px  rgba(212,168,67,${opacity}),
                0 0 80px  rgba(212,168,67,${opacity * 0.6}),
                0 0 160px rgba(212,168,67,${opacity * 0.3})
              `,
            }}
          >
            ♞
          </span>
        </motion.div>
      ))}
    </>
  )
}
