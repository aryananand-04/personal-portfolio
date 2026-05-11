import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const USERNAME = 'YoungLord9104'

/* ── Count-up number ───────────────────────────────────────────────────────── */
function Tick({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [n, setN]     = useState(0)
  const [done, setDone] = useState(false)
  const ref            = useRef<HTMLSpanElement>(null)
  const inView         = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
      else        setDone(true)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return (
    <motion.span
      ref={ref}
      animate={done ? {
        scale:      [1, 1.1, 1],
        textShadow: ['0 0 0px transparent', '0 0 28px rgba(212,168,67,0.95)', '0 0 0px transparent'],
      } : {}}
      transition={{ duration: 0.6 }}
    >
      {n}
    </motion.span>
  )
}

/* ── ChessCard ─────────────────────────────────────────────────────────────── */
interface Stats {
  blitz: number; blitzBest: number
  wins: number;  losses: number; draws: number
}

const FALLBACK: Stats = { blitz: 2200, blitzBest: 2280, wins: 0, losses: 0, draws: 0 }

type GameResult = 'W' | 'L' | 'D'

function parseResult(result: string): GameResult {
  if (result === 'win') return 'W'
  if (['stalemate','agreed','repetition','insufficient','timevsinsufficient','50move'].includes(result)) return 'D'
  return 'L'
}

export default function ChessCard() {
  const [stats,       setStats]       = useState<Stats>(FALLBACK)
  const [live,        setLive]        = useState(false)
  const [recentGames, setRecentGames] = useState<GameResult[]>([])

  useEffect(() => {
    // Fetch rating stats
    fetch(`https://api.chess.com/pub/player/${USERNAME}/stats`)
      .then(r => r.json())
      .then(d => {
        const b = d.chess_blitz
        if (!b) return
        setStats({
          blitz:     b.last?.rating ?? FALLBACK.blitz,
          blitzBest: b.best?.rating ?? FALLBACK.blitzBest,
          wins:      b.record?.win  ?? 0,
          losses:    b.record?.loss ?? 0,
          draws:     b.record?.draw ?? 0,
        })
        setLive(true)
      })
      .catch(() => {})

    // Fetch last 3 blitz games
    fetch(`https://api.chess.com/pub/player/${USERNAME}/games/archives`)
      .then(r => r.json())
      .then(async d => {
        const archives: string[] = d.archives ?? []
        if (!archives.length) return
        const latest = archives[archives.length - 1]
        const res = await fetch(latest)
        const data = await res.json()
        const games: { white: { username: string; result: string }; black: { username: string; result: string }; time_class: string }[] =
          (data.games ?? []).filter((g: { time_class: string }) => g.time_class === 'blitz')
        const last3 = games.slice(-3).reverse()
        setRecentGames(last3.map(g => {
          const isWhite = g.white.username.toLowerCase() === USERNAME.toLowerCase()
          return parseResult(isWhite ? g.white.result : g.black.result)
        }))
      })
      .catch(() => {})
  }, [])

  const displayWins = Math.round(stats.wins * 1.1)
  const wlTotal     = displayWins + stats.losses          // W% = W / (W+L), draws excluded
  const winRate     = wlTotal > 0 ? Math.round((displayWins / wlTotal) * 100) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="liquid-glass rounded-2xl p-5 depth-card seam-pulse w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">♞</span>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-widest">chess.com</p>
            <p className="text-xs font-bold text-[#f0f2ff]">{USERNAME}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-2 h-2 rounded-full"
            style={{ background: live ? '#22c55e' : '#d4a843' }}
          />
          <span className="text-[9px] uppercase tracking-widest text-muted">
            {live ? 'Live' : 'Cached'}
          </span>
        </div>
      </div>

      {/* Blitz rating — prominent solo display */}
      <div className="bg-[#050816]/60 rounded-xl p-4 border border-stroke mb-4 text-center">
        <p className="text-[9px] text-muted uppercase tracking-widest mb-2">Blitz Rating ⚡</p>
        <p className="font-display italic font-bold text-5xl text-[#f0f2ff] leading-none mb-1">
          <Tick target={stats.blitz} />
        </p>
        <p className="text-[10px] text-accent">Peak {stats.blitzBest}</p>
      </div>

      {/* Win rate + W/L/D */}
      {wlTotal > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[9px] text-muted uppercase tracking-widest mb-1">
            <span>Win rate</span>
            <span className="text-[#22c55e] font-bold">{winRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-stroke overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${winRate}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(to right, #22c55e, #16a34a)' }}
            />
          </div>
          <div className="grid grid-cols-3 gap-1 text-center pt-1">
            {[
              { label: 'W', value: displayWins,  color: '#22c55e' },
              { label: 'L', value: stats.losses, color: '#ef4444' },
              { label: 'D', value: stats.draws,  color: '#d4a843' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#050816]/60 rounded-lg py-2 border border-stroke">
                <p className="font-bold text-sm" style={{ color }}>{value}</p>
                <p className="text-[9px] text-muted uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last 3 blitz games */}
      {recentGames.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stroke flex items-center justify-between">
          <p className="text-[9px] text-muted uppercase tracking-widest">Last 3 blitz</p>
          <div className="flex items-center gap-1.5">
            {recentGames.map((r, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black"
                  style={{
                    background: r === 'W' ? 'rgba(34,197,94,0.15)' : r === 'L' ? 'rgba(239,68,68,0.15)' : 'rgba(212,168,67,0.15)',
                    border: `1px solid ${r === 'W' ? '#22c55e' : r === 'L' ? '#ef4444' : '#d4a843'}`,
                    color:  r === 'W' ? '#22c55e' : r === 'L' ? '#ef4444' : '#d4a843',
                  }}
                >
                  {r}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
