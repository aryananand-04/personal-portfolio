import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { motion, AnimatePresence, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'
import { personal } from '../data/portfolio'

const roles = personal.taglines

/* ── Idea #3: Animated isometric grid canvas background ──────────────────── */
function IsometricCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number, t = 0

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)
      t += 0.004

      const tW = 88, tH = 44
      const cols = Math.ceil(w / tW) + 6
      const rows = Math.ceil(h / (tH / 2)) + 6

      for (let r = -3; r < rows; r++) {
        for (let c = -3; c < cols; c++) {
          const ox = c * tW + (r % 2 === 0 ? 0 : tW / 2) + ((t * 18) % tW)
          const oy = r * (tH / 2) + ((t * 9) % (tH / 2))

          ctx.beginPath()
          ctx.moveTo(ox,         oy - tH / 2)
          ctx.lineTo(ox + tW / 2, oy)
          ctx.lineTo(ox,         oy + tH / 2)
          ctx.lineTo(ox - tW / 2, oy)
          ctx.closePath()

          const pulse = 0.025 + Math.sin(c * 0.5 + r * 0.7 + t * 1.2) * 0.018
          ctx.strokeStyle = `rgba(212,168,67,${Math.max(0.006, pulse)})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55 }}
      aria-hidden
    />
  )
}

/* ── Magnetic button with shimmer ────────────────────────────────────────── */
function MagneticButton({ children, className, onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [hov, setHov] = useState(false)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 300, damping: 20 })
  const sy = useSpring(y, { stiffness: 300, damping: 20 })

  return (
    <motion.button
      ref={ref} style={{ x: sx, y: sy }}
      onMouseEnter={() => setHov(true)}
      onMouseMove={e => {
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width  / 2)) * 0.3)
        y.set((e.clientY - (r.top  + r.height / 2)) * 0.3)
      }}
      onMouseLeave={() => { setHov(false); x.set(0); y.set(0) }}
      onClick={onClick}
      className={`relative overflow-hidden ${className}`}
      data-cursor="pointer"
    >
      <AnimatePresence>
        {hov && (
          <motion.span key="shimmer" className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%' }} animate={{ x: '200%' }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)' }}
          />
        )}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

function PortraitMask() {
  const [revealed, setRevealed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0); const rotY = useMotionValue(0)
  const srx  = useSpring(rotX, { stiffness: 150, damping: 20 })
  const sry  = useSpring(rotY, { stiffness: 150, damping: 20 })

  return (
    <>
      <motion.div
        ref={containerRef}
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', transformPerspective: 900, height: '78vh' }}
        className="relative w-full max-w-[360px] xl:max-w-[400px] rounded-2xl overflow-hidden cursor-pointer"
        animate={{
          boxShadow: revealed
            ? '0 0 0 2px rgba(212,168,67,0.9), 0 0 18px rgba(212,168,67,1), 0 0 35px rgba(212,168,67,0.6)'
            : '0 0 0 1px rgba(212,168,67,0.3), 0 0 8px rgba(212,168,67,0.15)',
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setRevealed(true)}
        onMouseLeave={() => { setRevealed(false); rotX.set(0); rotY.set(0) }}
        onMouseMove={e => {
          const r = containerRef.current!.getBoundingClientRect()
          rotX.set(((e.clientY - r.top)  / r.height - 0.5) * 7)
          rotY.set(-((e.clientX - r.left) / r.width  - 0.5) * 7)
        }}
        data-cursor="pointer"
      >
        <img src="/unmasked.png" alt={personal.name} className="absolute inset-0 w-full h-full object-cover object-top" />
        <motion.img
          src="/masked.png" alt="masked"
          className="absolute inset-0 w-full h-full object-cover object-top"
          animate={{ opacity: revealed ? 0 : 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(5,8,22,0.88), transparent)' }} />
        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-accent/30" />
        <motion.div
          animate={{ opacity: revealed ? 0 : [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-5 left-0 right-0 text-center pointer-events-none"
        >
          <p className="text-accent text-[9px] uppercase tracking-[0.55em] font-bold">Hover to reveal</p>
        </motion.div>
        <motion.div
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 10 }}
          transition={{ duration: 0.4, delay: revealed ? 0.2 : 0 }}
          className="absolute bottom-0 left-0 right-0 px-5 py-4 pointer-events-none"
        >
          <p className="text-[#f0f2ff] text-sm font-bold">{personal.name}</p>
          <p className="text-accent text-[9px] uppercase tracking-widest">{personal.role}</p>
        </motion.div>
      </motion.div>
    </>
  )
}

/* ── Hero ────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const [roleIdx, setRoleIdx] = useState(0)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const id = setInterval(() => setRoleIdx(i => (i + 1) % roles.length), 2500)
    return () => clearInterval(id)
  }, [])

  /* Cursor spotlight */
  const rawX = useMotionValue(30); const rawY = useMotionValue(50)
  const spX  = useSpring(rawX, { stiffness: 50, damping: 20 })
  const spY  = useSpring(rawY, { stiffness: 50, damping: 20 })
  const spotlight = useMotionTemplate`radial-gradient(ellipse 55% 45% at ${spX}% ${spY}%, color-mix(in srgb, #d4a843 8%, transparent), transparent 65%)`

  /* GSAP per-letter entrance */
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.1 })
    tl.fromTo('.hero-letter',
      { opacity: 0, y: 80, rotateX: 45 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out' }
    ).fromTo('.blur-in',
      { opacity: 0, y: 20, filter: 'blur(12px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.12, ease: 'power3.out' },
      '-=0.5'
    )
    return () => { tl.kill() }
  }, [])

  const nameLetters = personal.name.split('').map((ch, i) => (
    <span key={i} className="hero-letter inline-block" style={{ opacity: 0, whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>
      {ch}
    </span>
  ))

  return (
    <section
      ref={heroRef}
      id="hero"
      className="chess-bg relative min-h-screen flex flex-col justify-center overflow-hidden px-6 md:px-12 lg:px-20 pt-24 pb-16"
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        rawX.set(((e.clientX - r.left) / r.width)  * 100)
        rawY.set(((e.clientY - r.top)  / r.height) * 100)
      }}
      onMouseLeave={() => { rawX.set(30); rawY.set(50) }}
    >
      {/* Isometric animated grid background */}
      <IsometricCanvas />

      <motion.div className="absolute inset-0 pointer-events-none" style={{ background: spotlight }} />

      {/* Draggable chess pieces */}
      {[
        { piece: '♞', top: '8%',  left: '6%',  size: '4rem',   delay: 1.4 },
        { piece: '♟', top: '22%', left: '2%',  size: '2.8rem', delay: 1.7 },
        { piece: '♛', top: '55%', left: '5%',  size: '3.4rem', delay: 2.0 },
      ].map(({ piece, top, left, size, delay }, i) => (
        <motion.div
          key={i}
          drag
          dragConstraints={heroRef}
          dragElastic={0.08}
          dragMomentum={false}
          whileDrag={{ scale: 1.25, cursor: 'grabbing' }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute select-none hidden lg:block"
          style={{ top, left, fontSize: size, color: '#d4a843', textShadow: '0 0 18px rgba(212,168,67,0.55)', cursor: 'grab', zIndex: 30, lineHeight: 1 }}
          data-cursor="pointer"
        >
          {piece}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-center">

        {/* Left — text */}
        <div>
          <p className="blur-in text-xs text-muted uppercase tracking-[0.4em] mb-6 flex items-center gap-3" style={{ opacity: 0 }}>
            <span className="inline-block w-8 h-px bg-stroke" />
            Based in Bengaluru
          </p>

          <h1
            className="font-display italic font-bold leading-[0.85] tracking-[-0.04em] text-[#f0f2ff] mb-8"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 15rem)', textShadow: '0 4px 24px rgba(0,0,0,0.6)', perspective: '800px' }}
          >
            {nameLetters}
            <sup className="hero-letter inline-block text-[0.35em] ml-2 font-normal not-italic text-muted align-top mt-4" style={{ opacity: 0 }}>*</sup>
          </h1>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
            <div className="blur-in overflow-hidden" style={{ opacity: 0 }}>
              <p className="text-muted text-xs uppercase tracking-[0.3em] mb-2">Currently</p>
              <div className="h-8 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={roleIdx}
                    initial={{ y: 32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -32, opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display italic font-semibold text-[#f0f2ff] text-lg md:text-xl"
                  >
                    {roles[roleIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
            <div className="blur-in max-w-xs text-right" style={{ opacity: 0 }}>
              <p className="text-muted text-sm leading-relaxed">
                Obsessed with markets, chess, and systems<br />
                where every decision has a consequence.
              </p>
            </div>
          </div>

          <div className="blur-in mt-10 flex flex-wrap gap-4" style={{ opacity: 0 }}>
            <MagneticButton
              onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#f0f2ff] text-[#050816] rounded-full px-8 py-3.5 font-bold text-sm"
            >
              View work
            </MagneticButton>
            <MagneticButton
              onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="liquid-glass rounded-full px-8 py-3.5 font-bold text-sm text-[#f0f2ff]"
            >
              Get in touch
            </MagneticButton>
          </div>
        </div>

        {/* Right — masked portrait with liquid distortion */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex justify-center items-center"
        >
          <PortraitMask />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="blur-in absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20" style={{ opacity: 0 }}>
        <span className="text-muted text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
        <div className="w-px h-10 bg-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[40%] bg-white/60 animate-scroll-down" />
        </div>
      </div>
    </section>
  )
}
