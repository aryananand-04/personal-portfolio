import { motion } from 'framer-motion'
import { skills } from '../data/portfolio'
import SectionLabel, { GoldLine } from './SectionLabel'
import { useCursorSpotlight } from '../hooks/useCursorSpotlight'

const pool1 = skills.flatMap(g => g.items.map(item => ({ item, label: g.label })))
const pool2 = skills.flatMap(g => g.items.map(item => ({ item, label: g.label }))).reverse()
const track1 = [...pool1, ...pool1, ...pool1]
const track2 = [...pool2, ...pool2, ...pool2]
/* Third fast lane for depth */
const pool3  = [...pool1].sort(() => Math.random() - 0.5)
const track3 = [...pool3, ...pool3, ...pool3]

/* ── Idea #6: Blob-morphing skill tags on hover ──────────────────────────── */
function MarqueeTag({ item, label }: { item: string; label: string }) {
  return (
    <motion.span
      className="inline-flex items-center gap-2 liquid-glass text-[#f0f2ff] text-sm font-semibold px-5 py-2.5 rounded-full border border-white/5 shrink-0 mx-2 cursor-default"
      whileHover={{
        borderColor: 'rgba(212,168,67,0.55)',
        color: '#d4a843',
        borderRadius: ['9999px', '60% 40% 50% 60% / 50% 60% 40% 50%', '50% 60% 40% 60% / 60% 40% 60% 40%', '9999px'],
        transition: { borderRadius: { duration: 0.7, repeat: Infinity, repeatType: 'mirror' }, duration: 0.2 },
      }}
      transition={{ duration: 0.2 }}
      data-cursor="pointer"
    >
      <span className="text-accent/50 text-[10px] uppercase tracking-widest font-bold">{label}</span>
      {item}
    </motion.span>
  )
}

export default function Skills() {
  const { background, handlers } = useCursorSpotlight()

  return (
    <section id="skills" className="chess-bg relative py-24 md:py-36 overflow-hidden" {...handlers}>
      <GoldLine />
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <SectionLabel num="03" label="Skills" right={<p className="hidden md:block text-muted text-xs">Hover to pause · hover tags to morph</p>} />
      </div>

      {/* ── Idea #7: Parallax depth layers — perspective 3-lane marquee ──── */}
      <motion.div
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col gap-3"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          perspective: '900px',
        }}
      >
        <div style={{ transform: 'rotateX(5deg)', transformStyle: 'preserve-3d' }}>
          {/* Lane 1 — slow, far, dim */}
          <div className="marquee-track flex overflow-hidden" style={{ opacity: 0.38 }}>
            <div className="animate-marquee-slow flex items-center">
              {track1.map((s, i) => <MarqueeTag key={i} item={s.item} label={s.label} />)}
            </div>
          </div>

          {/* Lane 2 — medium speed */}
          <div className="marquee-track flex overflow-hidden mt-3" style={{ opacity: 0.72 }}>
            <div className="animate-marquee-right flex items-center">
              {track2.map((s, i) => <MarqueeTag key={i} item={s.item} label={s.label} />)}
            </div>
          </div>

          {/* Lane 3 — fast, near, full opacity */}
          <div className="marquee-track flex overflow-hidden mt-3">
            <div className="animate-marquee-fast flex items-center">
              {track3.map((s, i) => <MarqueeTag key={i} item={s.item} label={s.label} />)}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-px bg-stroke"
        >
          {skills.map((group, i) => (
            <div key={i} className="bg-[#050816] px-8 py-6">
              <p className="text-accent text-[10px] uppercase tracking-[0.35em] font-bold mb-3">{group.label}</p>
              <p className="text-muted text-sm">{group.items.join(' · ')}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
