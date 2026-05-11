import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setLenis }        from './lib/lenis'
import WebGLGrain          from './components/WebGLGrain'
import Cursor              from './components/Cursor'
import ScrollProgress      from './components/ScrollProgress'
import AmbientParticles    from './components/AmbientParticles'
import SectionTicker       from './components/SectionTicker'
import KnightTransition    from './components/KnightTransition'
import KonamiEgg           from './components/KonamiEgg'
import LoadingScreen       from './components/LoadingScreen'
import Navbar              from './components/Navbar'
import Hero                from './components/Hero'
import About               from './components/About'
import Experience          from './components/Experience'
import Skills              from './components/Skills'
import Projects            from './components/Projects'
import ChessChallenge      from './components/ChessChallenge'
import Contact             from './components/Contact'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!loaded) return
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    setLenis(lenis)
    lenis.on('scroll', () => ScrollTrigger.update())
    gsap.ticker.add((time: number) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
    return () => { lenis.destroy() }
  }, [loaded])

  return (
    <div className="chess-bg min-h-screen bg-[#050816] text-[#f0f2ff] relative">
      <Cursor />
      <ScrollProgress />
      <AmbientParticles />
      <KnightTransition />
      <KonamiEgg />
      <WebGLGrain />

      <LoadingScreen onComplete={() => setLoaded(true)} />

      {loaded && (
        <>
          <SectionTicker />
          <Navbar />
          <main>
            <Hero />
            <About />
            <Experience />
            <Skills />
            <Projects />
            <ChessChallenge />
            <Contact />
          </main>
          <footer className="py-10 text-center text-muted text-xs uppercase tracking-[0.2em] border-t border-stroke">
            <p>Designed & built by{' '}
              <motion.span
                className="text-accent font-semibold"
                animate={{ textShadow: ['0 0 0px transparent', '0 0 14px rgba(212,168,67,0.85)', '0 0 0px transparent'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              >
                Aryan Anand
              </motion.span>
            </p>
          </footer>
        </>
      )}
    </div>
  )
}
