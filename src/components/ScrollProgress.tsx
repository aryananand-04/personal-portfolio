import { motion, useScroll, useSpring } from 'framer-motion'

/* ── Idea #19: SVG pathLength progress bar with glowing tip ─────────────── */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const pathLength = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const dotScale   = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  return (
    <>
      {/* SVG path that draws itself as you scroll */}
      <div
        className="fixed top-0 left-0 right-0 z-[9998] pointer-events-none"
        style={{ height: 3 }}
        aria-hidden
      >
        <svg width="100%" height="3" preserveAspectRatio="none" viewBox="0 0 1000 3">
          <defs>
            <linearGradient id="pg" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor="#d4a843" />
              <stop offset="50%"  stopColor="#f5d78a" />
              <stop offset="100%" stopColor="#d4a843" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 0,1.5 L 1000,1.5"
            stroke="url(#pg)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            style={{ pathLength }}
          />
        </svg>

        {/* Glowing dot that rides the tip of the bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-full"
          style={{ scaleX: dotScale, transformOrigin: 'left' }}
        >
          <div
            className="absolute right-0 w-2.5 h-2.5 rounded-full"
            style={{
              top: '50%',
              marginTop: '-5px',
              marginRight: '-5px',
              background: '#f5d78a',
              boxShadow: '0 0 6px #d4a843, 0 0 14px rgba(212,168,67,0.8), 0 0 28px rgba(212,168,67,0.4)',
            }}
          />
        </motion.div>
      </div>

      {/* Dim track */}
      <div
        className="fixed top-0 left-0 right-0 h-[1px] z-[9997] pointer-events-none"
        style={{ background: 'rgba(30,35,64,0.5)' }}
        aria-hidden
      />
    </>
  )
}
