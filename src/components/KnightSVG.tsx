import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'

export default function KnightSVG() {
  const pathRef  = useRef<SVGPathElement>(null)
  const eyeRef   = useRef<SVGPathElement>(null)

  useEffect(() => {
    const path = pathRef.current
    const eye  = eyeRef.current
    if (!path || !eye) return

    const pLen = path.getTotalLength()
    const eLen = eye.getTotalLength()

    /* Start invisible */
    gsap.set(path, { strokeDasharray: pLen, strokeDashoffset: pLen })
    gsap.set(eye,  { strokeDasharray: eLen, strokeDashoffset: eLen })

    const tl = gsap.timeline({ delay: 2.6 })
    tl.to(path, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' })
      .to(eye,  { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, '-=0.4')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.4, duration: 0.6 }}
      className="absolute right-10 top-20 pointer-events-none select-none hidden xl:block"
      aria-hidden
    >
      <svg
        viewBox="0 0 100 115"
        width="200"
        height="230"
        fill="none"
        style={{ filter: 'drop-shadow(0 0 12px rgba(212,168,67,0.55))' }}
      >
        {/* Knight body */}
        <path
          ref={pathRef}
          d="M 28,100 L 72,100 L 67,86 C 62,75 57,69 53,61 L 62,46 C 67,35 63,19 54,13 C 45,7 34,9 27,18 C 20,27 22,40 29,47 L 21,59 C 16,68 15,79 19,88 Z"
          stroke="#d4a843"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Eye */}
        <path
          ref={eyeRef}
          d="M 41,30 C 43,27 47,27 48,30 C 49,33 47,36 44,35 C 41,34 40,32 41,30 Z"
          stroke="#d4a843"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  )
}
