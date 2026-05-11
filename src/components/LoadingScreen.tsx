import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { personal } from '../data/portfolio'

/* ── Idea #20: Knight's-tour chessboard reveal ──────────────────────────── */
function computeKnightTour(): number[] {
  const moves = [[-2,-1],[-1,-2],[1,-2],[2,-1],[2,1],[1,2],[-1,2],[-2,1]]
  const visited = Array(64).fill(false)
  const steps   = Array(64).fill(0)
  const degree  = (x: number, y: number) => {
    let d = 0
    for (const [dx, dy] of moves) {
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8 && !visited[ny * 8 + nx]) d++
    }
    return d
  }
  let x = 0, y = 0
  visited[0] = true; steps[0] = 0
  for (let s = 1; s < 64; s++) {
    let minD = 9, nx = -1, ny = -1
    for (const [dx, dy] of moves) {
      const cx = x + dx, cy = y + dy
      if (cx >= 0 && cx < 8 && cy >= 0 && cy < 8 && !visited[cy * 8 + cx]) {
        const d = degree(cx, cy)
        if (d < minD) { minD = d; nx = cx; ny = cy }
      }
    }
    if (nx === -1) break
    x = nx; y = ny; visited[y * 8 + x] = true; steps[y * 8 + x] = s
  }
  return steps
}

const TOUR = computeKnightTour()

interface Props { onComplete: () => void }

export default function LoadingScreen({ onComplete }: Props) {
  const [visible, setVisible] = useState(true)

  /* Board finishes at ~64 × 0.025 + 0.4 + 0.22 ≈ 2.2 s; fade after 2.7 s */
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2700)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="chess-bg fixed inset-0 z-[9999] bg-[#050816] flex flex-col items-center justify-center gap-8 select-none overflow-hidden"
        >
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs text-muted uppercase tracking-[0.3em]"
          >
            Portfolio
          </motion.p>

          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display italic font-black leading-[0.85] tracking-[-0.04em] text-[#f0f2ff]"
            style={{ fontSize: 'clamp(3rem, 12vw, 9rem)' }}
          >
            {personal.name}
          </motion.h1>

          {/* 8×8 chessboard — squares flip in on knight's-tour order */}
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: 'repeat(8, 1fr)', width: 'clamp(160px, 28vw, 240px)' }}
          >
            {Array.from({ length: 64 }, (_, idx) => {
              const row  = Math.floor(idx / 8)
              const col  = idx % 8
              const gold = (row + col) % 2 === 0
              const step = TOUR[idx]
              return (
                <motion.div
                  key={idx}
                  style={{ aspectRatio: '1' }}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.22, delay: step * 0.025 + 0.4, ease: 'easeOut' }}
                  className={`rounded-[2px] ${gold ? 'bg-accent' : 'bg-surface border border-stroke'}`}
                />
              )
            })}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-muted text-xs uppercase tracking-widest"
          >
            {personal.role}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
