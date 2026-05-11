import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'

const SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight']

/* ── Warnsdorff's knight's tour algorithm ───────────────────────────────── */
function computeTour(startCol = 0, startRow = 0): [number, number][] {
  const MOVES: [number, number][] = [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]
  const visited = Array.from({ length: 8 }, () => new Array(8).fill(false))
  const path: [number, number][] = []
  let col = startCol, row = startRow
  visited[row][col] = true
  path.push([col, row])

  const degree = (c: number, r: number) =>
    MOVES.filter(([dc, dr]) => {
      const nc = c + dc, nr = r + dr
      return nc >= 0 && nc < 8 && nr >= 0 && nr < 8 && !visited[nr][nc]
    }).length

  for (let step = 1; step < 64; step++) {
    const next = MOVES
      .map(([dc, dr]) => [col + dc, row + dr] as [number, number])
      .filter(([nc, nr]) => nc >= 0 && nc < 8 && nr >= 0 && nr < 8 && !visited[nr][nc])
      .sort((a, b) => degree(a[0], a[1]) - degree(b[0], b[1]))[0]

    if (!next) break
    const [nc, nr] = next
    visited[nr][nc] = true
    path.push([nc, nr])
    col = nc; row = nr
  }
  return path
}

const TOUR = computeTour(0, 0)  // computed once at module load

export default function KonamiEgg() {
  const [active, setActive] = useState(false)
  const [done,   setDone]   = useState(false)
  const bufRef     = useRef<string[]>([])
  const knightRef  = useRef<HTMLDivElement>(null)
  const boardRef   = useRef<HTMLDivElement>(null)
  const tlRef      = useRef<gsap.core.Timeline | null>(null)

  /* ── Keydown listener ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      bufRef.current = [...bufRef.current, e.key].slice(-SEQUENCE.length)
      if (bufRef.current.join(',') === SEQUENCE.join(',')) {
        bufRef.current = []
        setActive(true)
        setDone(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ── Run GSAP tour after board is fully rendered ── */
  const runTour = useCallback(() => {
    const board  = boardRef.current
    const knight = knightRef.current
    if (!board || !knight) return

    const CELL = board.getBoundingClientRect().width / 8
    if (CELL < 1) return  // board not ready yet

    tlRef.current?.kill()
    gsap.set(knight, { x: 0, y: 0 })

    const tl = gsap.timeline({ onComplete: () => setDone(true) })
    tlRef.current = tl

    TOUR.forEach(([col, row]) => {
      tl.to(knight, {
        x: col * CELL + CELL / 2 - 12,
        y: row * CELL + CELL / 2 - 12,
        duration: 0.07,
        ease: 'power1.inOut',
      })
    })
  }, [])

  useEffect(() => {
    if (!active) {
      tlRef.current?.kill()
      return
    }
    // Wait for AnimatePresence + board layout — 600ms is safe
    const id = setTimeout(runTour, 600)
    return () => clearTimeout(id)
  }, [active, runTour])

  const dismiss = () => { setActive(false); setDone(false); tlRef.current?.kill() }

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="konami"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9994] flex flex-col items-center justify-center"
          style={{ background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(8px)' }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6 px-4"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-muted text-[10px] uppercase tracking-[0.4em] font-mono">Knight's Tour · All 64 squares</p>

            {/* Board */}
            <div
              ref={boardRef}
              className="relative rounded-lg overflow-hidden border border-accent/25"
              style={{ width: 'min(400px, 86vw)', aspectRatio: '1' }}
            >
              {/* Squares */}
              {Array.from({ length: 64 }, (_, i) => {
                const col = i % 8, row = Math.floor(i / 8)
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${col * 12.5}%`, top: `${row * 12.5}%`,
                      width: '12.5%', height: '12.5%',
                      background: (col + row) % 2 === 0
                        ? 'rgba(212,168,67,0.12)'
                        : 'rgba(5,8,22,0.85)',
                    }}
                  />
                )
              })}

              {/* Visit trail — one div per square, lit up by GSAP onComplete */}
              {TOUR.map(([col, row], i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  initial={{ opacity: 0 }}
                  style={{
                    left: `${col * 12.5}%`, top: `${row * 12.5}%`,
                    width: '12.5%', height: '12.5%',
                    background: 'rgba(212,168,67,0.4)',
                  }}
                  animate={done || i < (active ? TOUR.length : 0)
                    ? { opacity: [0, 0.7, 0.2] }
                    : { opacity: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                />
              ))}

              {/* Knight */}
              <div
                ref={knightRef}
                className="absolute pointer-events-none"
                style={{
                  fontSize: 'clamp(14px, 3.2vw, 22px)',
                  color: '#d4a843',
                  textShadow: '0 0 14px rgba(212,168,67,1)',
                  lineHeight: 1,
                  zIndex: 10,
                }}
              >
                ♞
              </div>
            </div>

            {/* Reveal message */}
            <AnimatePresence>
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center max-w-sm px-4"
                >
                  <p className="font-display italic font-bold text-[#f0f2ff] text-xl md:text-2xl leading-snug mb-3">
                    "You solved the puzzle.<br />
                    That's the kind of pattern recognition<br />
                    I bring to code."
                  </p>
                  <p className="text-accent font-mono text-sm">— Aryan Anand</p>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-muted text-[9px] uppercase tracking-widest">
              {done ? 'Click anywhere to close' : 'Watch the knight visit every square…'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
