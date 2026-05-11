import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { personal } from '../data/portfolio'
import SectionLabel, { GoldLine } from './SectionLabel'
import { useCursorSpotlight } from '../hooks/useCursorSpotlight'
import { useProximityGlow } from '../hooks/useProximityGlow'
import ChessCard from './ChessCard'

/* ── Idea #5: Odometer-style digit drum for stat counters ────────────────── */
function Digit({ value, delay }: { value: number; delay: number }) {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })

  return (
    <div ref={ref} style={{ overflow: 'hidden', height: '1em', display: 'inline-block', lineHeight: '1em' }}>
      <motion.div
        animate={inView ? { y: `-${value * 10}%` } : { y: '0%' }}
        transition={{ type: 'spring', stiffness: 55, damping: 14, delay }}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <div key={n} style={{ height: '1em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {n}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function OdometerCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const str    = String(target)
  const digits = str.split('').map(Number)

  return (
    <span className="inline-flex items-end tabular-nums">
      {digits.map((d, i) => (
        <Digit key={i} value={d} delay={0.15 + (digits.length - 1 - i) * 0.07} />
      ))}
      {suffix && <span style={{ lineHeight: '1em' }}>{suffix}</span>}
    </span>
  )
}

/* Proximity-glow stat cell */
function GlowStat({ value, suffix, label, border }: {
  value: number; suffix: string; label: string; border: boolean
}) {
  const { ref, boxShadow } = useProximityGlow(180)
  return (
    <motion.div
      ref={ref}
      style={{ boxShadow }}
      className={`py-8 px-6 flex flex-col gap-2 rounded-lg transition-colors ${border ? 'border-r border-stroke' : ''}`}
    >
      <p className="font-display italic font-bold text-4xl md:text-5xl text-[#f0f2ff] leading-none">
        <OdometerCounter target={value} suffix={suffix} />
      </p>
      <p className="text-muted text-xs uppercase tracking-widest">{label}</p>
    </motion.div>
  )
}

const stats = [
  { value: 2200, suffix: '',    label: 'Chess.com Blitz' },
  { value: 2,    suffix: '+',   label: 'Intl. Competitions' },
  { value: 3,    suffix: ' yr', label: 'Uni Captain & Founder' },
  { value: 2,    suffix: '×',   label: 'National Champion' },
]

/* ── Idea #4: Syntax-highlighted typewriter terminal bio ─────────────────── */
type Segment = { text: string; color: string }

const HIGHLIGHTS: Array<{ regex: RegExp; color: string }> = [
  { regex: /\b(markets|quant|finance|AI products|intelligent agents|knowledge work)\b/gi, color: '#86efac' },
  { regex: /\b(chess|Chess Club|internationally)\b/gi,                                    color: '#d4a843' },
  { regex: /\b(decisions|reasoning|information|stakes)\b/gi,                              color: '#7dd3fc' },
  { regex: /\b(curiosity|absorbed|instinct)\b/gi,                                         color: '#f0abfc' },
  { regex: /\b(sport|build|builds|show up)\b/gi,                                          color: '#fb923c' },
]

function parseSegments(text: string): Segment[] {
  type Range = { start: number; end: number; color: string }
  const ranges: Range[] = []

  HIGHLIGHTS.forEach(({ regex, color }) => {
    let m: RegExpExecArray | null
    const re = new RegExp(regex.source, regex.flags)
    while ((m = re.exec(text)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, color })
    }
  })

  ranges.sort((a, b) => a.start - b.start)

  const segs: Segment[] = []
  let pos = 0
  for (const r of ranges) {
    if (r.start < pos) continue
    if (r.start > pos) segs.push({ text: text.slice(pos, r.start), color: '#90a0c0' })
    segs.push({ text: text.slice(r.start, r.end), color: r.color })
    pos = r.end
  }
  if (pos < text.length) segs.push({ text: text.slice(pos), color: '#90a0c0' })
  return segs
}

function TerminalBio({ text }: { text: string }) {
  const [charCount, setCharCount] = useState(0)
  const [done, setDone]           = useState(false)
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })
  const segments = useMemo(() => parseSegments(text), [text])

  useEffect(() => {
    if (!inView) return
    let i = 0
    const id = setInterval(() => {
      setCharCount(++i)
      if (i >= text.length) { clearInterval(id); setDone(true) }
    }, 16)
    return () => clearInterval(id)
  }, [inView, text])

  /* Render segments up to charCount */
  let rendered = 0
  const visible = segments.map((seg, si) => {
    if (rendered >= charCount) return null
    const avail = charCount - rendered
    const slice = seg.text.slice(0, avail)
    rendered += seg.text.length
    return slice ? (
      <span key={si} style={{ color: seg.color }}>{slice}</span>
    ) : null
  })

  return (
    <div ref={ref} className="rounded-xl overflow-hidden border border-[#0d3d0d]/60 font-mono text-sm" style={{ background: '#020c02' }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#0d3d0d]/40" style={{ background: '#031403' }}>
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-green-700/70 text-xs tracking-wider">aryan@portfolio — bio.txt</span>
      </div>
      <div className="p-5 leading-relaxed text-sm" style={{ whiteSpace: 'pre-wrap' }}>
        <span className="text-green-600">aryan@portfolio</span>
        <span className="text-white/30">:</span>
        <span className="text-blue-400">~</span>
        <span className="text-white/30">$ </span>
        <span className="text-white/50">cat bio.txt</span>
        <br /><br />
        {visible}
        {!done && <span className="animate-pulse text-green-400">▋</span>}
        {done && (
          <>
            <br /><br />
            <span className="text-green-600">aryan@portfolio</span>
            <span className="text-white/30">:</span>
            <span className="text-blue-400">~</span>
            <span className="text-white/30">$ </span>
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-green-400">▋</motion.span>
          </>
        )}
      </div>
    </div>
  )
}

export default function About() {
  const { background, handlers } = useCursorSpotlight()

  return (
    <section id="about" className="chess-bg relative py-24 md:py-36 px-6 md:px-12 lg:px-20" {...handlers}>
      <GoldLine />
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionLabel num="01" label="About" />

        {/* Stat counters — odometer digits */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 mb-20"
        >
          {stats.map((s, i) => (
            <GlowStat key={i} value={s.value} suffix={s.suffix} label={s.label} border={i < stats.length - 1} />
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <div className="lg:col-span-7 flex flex-col gap-8">
            <motion.div
              initial={{ skewX: -10, filter: 'blur(6px)', opacity: 0 }}
              whileInView={{ skewX: 0, filter: 'blur(0px)', opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <TerminalBio text={personal.bio} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-4 flex-wrap"
            >
              {personal.linkedin && (
                <a href={personal.linkedin} target="_blank" rel="noreferrer" data-cursor="pointer"
                  className="liquid-glass rounded-full px-6 py-2.5 text-sm font-bold text-[#f0f2ff] hover:bg-white hover:text-[#050816] transition-all duration-300">
                  LinkedIn ↗
                </a>
              )}
              {personal.github && (
                <a href={personal.github} target="_blank" rel="noreferrer" data-cursor="pointer"
                  className="liquid-glass rounded-full px-6 py-2.5 text-sm font-bold text-[#f0f2ff] hover:bg-white hover:text-[#050816] transition-all duration-300">
                  GitHub ↗
                </a>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <ChessCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
