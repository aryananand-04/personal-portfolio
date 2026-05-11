import { useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Mail, Linkedin, Github, ArrowUpRight, MapPin } from 'lucide-react'
import { personal } from '../data/portfolio'
import SectionLabel, { GoldLine } from './SectionLabel'
import { useCursorSpotlight } from '../hooks/useCursorSpotlight'

const headingWords = [
  { text: "Let's",     accent: false },
  { text: 'build',     accent: false },
  { text: 'something', accent: true  },
  { text: 'together.', accent: false },
]

/* ── Idea #14: Radial pulse rings on email button hover ──────────────────── */
function PulseRings() {
  return (
    <>
      {[0, 0.35, 0.7].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-2xl border border-accent/40 pointer-events-none"
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 1.3, delay, ease: 'easeOut', repeat: Infinity }}
        />
      ))}
    </>
  )
}

export default function Contact() {
  const { background, handlers } = useCursorSpotlight()
  const [emailHover, setEmailHover] = useState(false)
  const headingRef  = useRef<HTMLHeadingElement>(null)
  const headingInView = useInView(headingRef, { once: true, amount: 0 })

  const socials = [
    { icon: Mail,     label: 'Email',    value: personal.email,    href: `mailto:${personal.email}` },
    { icon: Linkedin, label: 'LinkedIn', value: personal.linkedin, href: personal.linkedin },
    { icon: Github,   label: 'GitHub',   value: personal.github,   href: personal.github },
  ].filter(s => s.value)

  return (
    <section id="contact" className="chess-bg relative py-24 md:py-36 px-6 md:px-12 lg:px-20" {...handlers}>
      <GoldLine />
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background }} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <SectionLabel num="07" label="Contact" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left */}
          <div>
            {/* ── Idea #13: Solari departures-board 3D word flip ─────────────── */}
            <h3
              ref={headingRef}
              className="font-display italic font-black text-[#f0f2ff] leading-[0.9] tracking-[-0.04em] mb-8"
              style={{ fontSize: 'clamp(3rem, 7vw, 7rem)', perspective: '600px' }}
            >
              {headingWords.map(({ text, accent }, i) => (
                <span key={i} className="overflow-hidden inline-block mr-[0.18em] last:mr-0">
                  <motion.span
                    className={`inline-block ${accent ? 'text-accent' : ''}`}
                    initial={false}
                    animate={headingInView
                      ? { rotateX: 0, opacity: 1 }
                      : { rotateX: 90, opacity: 0 }
                    }
                    transition={{ duration: 0.52, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: 'top center' }}
                  >
                    {text}
                  </motion.span>
                </span>
              ))}
            </h3>

            <motion.p
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
              className="text-muted text-base leading-relaxed max-w-md mb-10"
            >
              You made it this far — might as well say hi.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.55 }}
              className="flex flex-wrap gap-3"
            >
              <div className="liquid-glass flex items-center gap-2 px-4 py-2 rounded-full text-xs text-muted">
                <MapPin size={12} className="text-accent" />
                Bengaluru, India
              </div>
            </motion.div>
          </div>

          {/* Right — links */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="flex flex-col gap-3"
          >
            {personal.email && (
              <motion.a
                href={`mailto:${personal.email}`}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(212,168,67,0.15)' }}
                onMouseEnter={() => setEmailHover(true)}
                onMouseLeave={() => setEmailHover(false)}
                className="group relative flex items-center justify-between bg-[#f0f2ff] text-black rounded-2xl px-7 py-5 font-bold text-base hover:bg-white transition-colors overflow-hidden"
              >
                {/* Pulse rings — only visible on hover */}
                <AnimatePresence>
                  {emailHover && <PulseRings />}
                </AnimatePresence>

                <div className="relative z-10">
                  <p className="font-black">Say Hello</p>
                  <p className="text-xs text-black/50 font-normal mt-0.5">{personal.email}</p>
                </div>
                <ArrowUpRight size={20} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0" />
              </motion.a>
            )}

            {socials.filter(s => s.label !== 'Email').map(({ icon: Icon, label, value, href }) => (
              <motion.a
                key={label} href={href} target="_blank" rel="noreferrer"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 24px rgba(212,168,67,0.1)' }}
                className="group liquid-glass rounded-2xl px-7 py-5 flex items-center justify-between hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-surface border border-stroke flex items-center justify-center group-hover:border-accent/40 transition-colors">
                    <Icon size={16} className="text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-semibold text-[#f0f2ff]">
                      {value.replace(/^https?:\/\/(www\.)?/, '')}
                    </p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </motion.a>
            ))}

            <motion.p
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3 } } }}
              className="text-muted text-xs text-center pt-2"
            >
              Usually responds within 24 hours
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
