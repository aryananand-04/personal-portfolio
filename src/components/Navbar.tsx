import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { personal } from '../data/portfolio'
import { getLenis } from '../lib/lenis'
import { triggerKnight } from './KnightTransition'

const links = [
  { label: 'About',        href: '#about' },
  { label: 'Achievements', href: '#experience' },
  { label: 'Skills',       href: '#skills' },
  { label: 'Projects',     href: '#projects' },
  { label: 'Challenge',    href: '#challenge' },
  { label: 'Contact',      href: '#contact' },
]

/* ── Magnetic nav link ─────────────────────────────────────────────────────── */
function MagneticLink({ label, onClick }: { label: string; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x   = useMotionValue(0); const y = useMotionValue(0)
  const sx  = useSpring(x, { stiffness: 350, damping: 22 })
  const sy  = useSpring(y, { stiffness: 350, damping: 22 })

  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={e => {
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width  / 2)) * 0.25)
        y.set((e.clientY - (r.top  + r.height / 2)) * 0.25)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      onClick={onClick}
      className="text-muted hover:text-[#f0f2ff] transition-colors text-xs uppercase tracking-widest font-semibold"
      data-cursor="pointer"
    >
      {label}
    </motion.button>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    triggerKnight()
    const ease = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2
    getLenis()?.scrollTo(href, { duration: 1.67, easing: ease, offset: -80 })
  }

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
    >
      <nav
        className={`liquid-glass rounded-full px-5 py-2.5 flex items-center gap-6 transition-all duration-500 ${
          scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : ''
        }`}
      >
        <button
          onClick={() => getLenis()?.scrollTo(0, { duration: 1.2 })}
          className="font-display italic font-black text-[#f0f2ff] text-sm hover:text-accent transition-colors"
          data-cursor="pointer"
        >
          {personal.name}
        </button>

        <div className="hidden md:block w-px h-4 bg-stroke" />

        <ul className="hidden md:flex items-center gap-5">
          {links.map(({ label, href }) => (
            <li key={href}>
              <MagneticLink label={label} onClick={() => go(href)} />
            </li>
          ))}
        </ul>

        {personal.email && (
          <a
            href={`mailto:${personal.email}`}
            className="hidden md:inline-flex items-center liquid-glass rounded-full px-4 py-1.5 text-xs font-bold text-[#f0f2ff] hover:bg-white hover:text-[#050816] transition-all duration-300"
            data-cursor="pointer"
          >
            Hire me
          </a>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-muted hover:text-[#f0f2ff] transition-colors"
          aria-label="menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 left-4 right-4 liquid-glass rounded-2xl p-4"
          >
            <ul className="flex flex-col gap-1">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <button
                    onClick={() => go(href)}
                    className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-[#f0f2ff] hover:bg-white/5 rounded-xl transition-all"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
