import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { achievements } from '../data/portfolio'
import SectionLabel, { GoldLine } from './SectionLabel'
import { useCursorSpotlight } from '../hooks/useCursorSpotlight'
import { useProximityGlow } from '../hooks/useProximityGlow'

const SCROLL_STEP = 560

export default function Experience() {
  const { background, handlers } = useCursorSpotlight()
  const containerRef = useRef<HTMLDivElement>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  /* Track scroll position to enable/disable buttons */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      setCanLeft(el.scrollLeft > 1)
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  /* Wheel → horizontal scroll */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 5) return
      e.preventDefault()
      el.scrollLeft += e.deltaY * 0.8
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const scrollBy = (dir: 'left' | 'right') => {
    containerRef.current?.scrollBy({ left: dir === 'right' ? SCROLL_STEP : -SCROLL_STEP, behavior: 'smooth' })
  }

  const NavButtons = (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => scrollBy('left')}
        disabled={!canLeft}
        className="w-7 h-7 rounded-full liquid-glass border border-stroke flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 transition-all disabled:opacity-25 disabled:pointer-events-none"
        data-cursor="pointer" aria-label="Scroll left"
      >
        <ChevronLeft size={13} />
      </button>
      <button
        onClick={() => scrollBy('right')}
        disabled={!canRight}
        className="w-7 h-7 rounded-full liquid-glass border border-stroke flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 transition-all disabled:opacity-25 disabled:pointer-events-none"
        data-cursor="pointer" aria-label="Scroll right"
      >
        <ChevronRight size={13} />
      </button>
    </div>
  )

  return (
    <section id="experience" className="chess-bg relative py-24 md:py-36 bg-[#060919] overflow-hidden" {...handlers}>
      <GoldLine />
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background }} />

      <div className="relative z-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <SectionLabel num="02" label="Achievements" right={NavButtons} />
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative z-10 overflow-x-auto scrollbar-hide px-6 md:px-12 lg:px-20 pb-8"
      >
        <div className="flex gap-5">
          {achievements.map((item, i) => (
            <AchievementCard key={i} item={item} i={i} />
          ))}
          <div className="shrink-0 w-20" aria-hidden />
        </div>
      </div>
    </section>
  )
}

function AchievementCard({ item, i }: { item: typeof achievements[0]; i: number }) {
  const { ref, boxShadow } = useProximityGlow(220)

  return (
    <motion.div
      ref={ref}
      style={{ boxShadow }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="shrink-0 w-[88vw] sm:w-[480px] md:w-[520px] bg-[#080d1e] border border-stroke rounded-2xl p-7 group hover:border-accent/40 transition-colors duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <motion.span
          className="shrink-0 font-display italic font-black text-5xl text-accent/20 leading-none select-none"
          initial={{ fontVariationSettings: '"wght" 300', opacity: 0.1 }}
          whileInView={{ fontVariationSettings: '"wght" 900', opacity: 0.22 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          {String(i + 1).padStart(2, '0')}
        </motion.span>
        <span className="text-accent text-xs font-mono tracking-wider border border-accent/30 rounded-full px-3 py-1 self-start whitespace-nowrap">
          {item.period}
        </span>
      </div>

      <div className="overflow-hidden mb-5">
        <motion.h3
          initial={{ filter: 'blur(5px)', letterSpacing: '0.12em', opacity: 0 }}
          whileInView={{ filter: 'blur(0px)', letterSpacing: '-0.01em', opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: i * 0.06 + 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-black text-xl md:text-2xl text-[#f0f2ff] leading-tight group-hover:text-accent transition-colors duration-300"
        >
          {item.title}
        </motion.h3>
      </div>

      <ul className="space-y-3">
        {item.bullets.map((b, j) => (
          <motion.li
            key={j}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 + j * 0.07 + 0.15, duration: 0.5 }}
            className="flex gap-3 text-muted text-sm leading-relaxed"
          >
            <span className="text-accent shrink-0 mt-0.5">▹</span>
            {b}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
