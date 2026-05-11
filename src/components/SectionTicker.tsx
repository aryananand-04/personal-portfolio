import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = [
  { id: 'hero',       num: '00' },
  { id: 'about',      num: '01' },
  { id: 'experience', num: '02' },
  { id: 'skills',     num: '03' },
  { id: 'projects',   num: '04' },
  { id: 'challenge',  num: '06' },
  { id: 'contact',    num: '07' },
]

export default function SectionTicker() {
  const [active, setActive] = useState('00')

  useEffect(() => {
    const observers = SECTIONS.map(({ id, num }) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(num) },
        { threshold: 0.35 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  return (
    <div className="fixed right-7 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-3">
      {SECTIONS.map(({ num }) => (
        <div
          key={num}
          className="transition-all duration-500 rounded-full bg-accent"
          style={{
            width:   active === num ? 3   : 2,
            height:  active === num ? 22  : 4,
            opacity: active === num ? 1   : 0.25,
          }}
        />
      ))}

      {/* Animated number label */}
      <div className="mt-3 w-7 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={  { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-accent font-mono text-[9px] font-bold tracking-widest"
          >
            {active}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
