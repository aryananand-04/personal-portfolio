import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import { X, RotateCcw, Flag } from 'lucide-react'
import { GoldLine } from './SectionLabel'

/* ── Stockfish Web Worker — loaded from public/stockfish.js ──────────────── */
function useStockfish(onBestMove: (move: string) => void) {
  const workerRef   = useRef<Worker | null>(null)
  const callbackRef = useRef(onBestMove)
  callbackRef.current = onBestMove   // always fresh, no stale closure

  useEffect(() => {
    // stockfish.js is served from the same origin via public/ — no CORS, no module issues
    const worker = new Worker('/stockfish.js')

    worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data)
      if (line.startsWith('bestmove ')) {
        const move = line.split(' ')[1]
        if (move && move !== '(none)') callbackRef.current(move)
      }
    }

    worker.onerror = (err) => console.error('Stockfish error:', err)

    worker.postMessage('uci')
    worker.postMessage('setoption name Skill Level value 15')
    worker.postMessage('setoption name UCI_LimitStrength value true')
    worker.postMessage('setoption name UCI_Elo value 2000')
    worker.postMessage('isready')
    workerRef.current = worker

    return () => { worker.terminate(); workerRef.current = null }
  }, [])  // run once — callbackRef keeps callback current

  const askMove = useCallback((fen: string) => {
    const w = workerRef.current
    if (!w) return
    w.postMessage('stop')                       // cancel any previous search
    w.postMessage(`position fen ${fen}`)
    w.postMessage('go movetime 800')
  }, [])

  return { askMove }
}

/* ── Piece maps ──────────────────────────────────────────────────────────── */
const PIECE_UNICODE: Record<string, { w: string; b: string }> = {
  p: { w: '♙', b: '♟' }, n: { w: '♘', b: '♞' },
  b: { w: '♗', b: '♝' }, r: { w: '♖', b: '♜' },
  q: { w: '♕', b: '♛' }, k: { w: '♔', b: '♚' },
}
const PIECE_VALUE: Record<string, number> = { p:1, n:3, b:3, r:5, q:9, k:0 }

/* ── Hardcoded scripted win — Caro-Kann Queen Sacrifice (11 moves) ───────── *
 * Verified checkmate sequence:
 * 1.e4 c6  2.d4 d5  3.Nc3 dxe4  4.Nxe4 Nf6  5.Qd3 e5  6.dxe5 Qa5+
 * 7.Bd2 Qxe5  8.0-0-0! Nxe4  9.Qd8+!! Kxd8  10.Bg5+ Kc7  11.Bd8#
 *
 * Checkmate proof (11.Bd8#, king on c7):
 *   b7=own pawn, b8=own knight, c6=own pawn, c8=own bishop block escapes
 *   b6 attacked by Bd8 (SW diagonal), d7 attacked by Rd1 (d-file)
 *   → CHECKMATE ✓
 */
const SCRIPT: { hint: { from: string; to: string }; label: string; botMove: string | null }[] = [
  { hint: { from: 'e2', to: 'e4' }, label: 'e4 — Control the centre',                 botMove: 'c7c6' },
  { hint: { from: 'd2', to: 'd4' }, label: 'd4 — Establish the pawn centre',           botMove: 'd7d5' },
  { hint: { from: 'b1', to: 'c3' }, label: 'Nc3 — Develop with tempo',                botMove: 'd5e4' },
  { hint: { from: 'c3', to: 'e4' }, label: 'Nxe4 — Recapture, knight active',         botMove: 'g8f6' },
  { hint: { from: 'd1', to: 'd3' }, label: 'Qd3 — Queen activates, eyes d8',          botMove: 'e7e5' },
  { hint: { from: 'd4', to: 'e5' }, label: 'dxe5 — Lure the queen out',               botMove: 'd8a5' },
  { hint: { from: 'c1', to: 'd2' }, label: 'Bd2 — Block the check, spring the trap',  botMove: 'a5e5' },
  { hint: { from: 'e1', to: 'c1' }, label: '0-0-0! — Rook to d1, pressure builds',    botMove: 'f6e4' },
  { hint: { from: 'd3', to: 'd8' }, label: 'Qd8+!! — Queen sacrifice, forced!',       botMove: 'e8d8' },
  { hint: { from: 'd2', to: 'g5' }, label: 'Bg5+! — King flushed into the open',      botMove: 'd8c7' },
  { hint: { from: 'g5', to: 'd8' }, label: 'Bd8# — The Signature Checkmate',          botMove: null   },
]

type GameResult = 'player-wins' | 'aryan-wins' | 'resigned' | 'draw' | null

/* ── Confetti canvas (player wins) ───────────────────────────────────────── */
function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!; const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const CHARS = ['♛','♞','♟','♝','♜','✦','★','◆']
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width, y: -60 - Math.random() * 400,
      vy: 3 + Math.random() * 4, vx: (Math.random() - 0.5) * 2.5,
      rot: Math.random() * 360, rv: (Math.random() - 0.5) * 7,
      ch: CHARS[Math.floor(Math.random() * CHARS.length)],
      col: Math.random() > 0.4 ? '#d4a843' : '#f5d78a',
      size: 14 + Math.random() * 22,
    }))
    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.y += p.vy; p.x += p.vx; p.rot += p.rv
        if (p.y > canvas.height + 60) { p.y = -60; p.x = Math.random() * canvas.width }
        ctx.save()
        ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180)
        ctx.font = `${p.size}px serif`; ctx.fillStyle = p.col
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height * 0.5)
        ctx.fillText(p.ch, 0, 0); ctx.restore()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-[9994]" />
}

/* ── End-game overlay ────────────────────────────────────────────────────── */
function GameEndOverlay({ result, onNewGame, onClose }: {
  result: GameResult; onNewGame: () => void; onClose: () => void
}) {
  if (!result) return null

  const configs = {
    'player-wins': {
      bg: 'rgba(5,8,22,0.92)',
      icon: '🏆',
      title: 'Checkmate!',
      sub: 'You beat Aryan Anand',
      color: '#d4a843',
      confetti: true,
    },
    'aryan-wins': {
      bg: 'rgba(5,8,22,0.95)',
      icon: '♞',
      title: 'Aryan Anand Wins',
      sub: 'Better luck next time',
      color: '#f0f2ff',
      confetti: false,
    },
    'resigned': {
      bg: 'rgba(5,8,22,0.93)',
      icon: '♚',
      title: 'You Resigned',
      sub: 'Good game.',
      color: '#8891b0',
      confetti: false,
    },
    'draw': {
      bg: 'rgba(5,8,22,0.93)',
      icon: '🤝',
      title: '½ – ½',
      sub: 'Draw — well played',
      color: '#d4a843',
      confetti: false,
    },
  }

  const cfg = configs[result]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: cfg.bg, backdropFilter: 'blur(6px)' }}
    >
      {cfg.confetti && <Confetti />}

      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        className="relative z-10 flex flex-col items-center gap-5 text-center px-8"
      >
        {/* Icon */}
        <motion.div
          animate={result === 'aryan-wins'
            ? { rotate: [0, -8, 8, -5, 5, 0], scale: [1, 1.15, 1] }
            : result === 'resigned'
            ? { rotate: [0, 0, -75], transition: { delay: 0.3, duration: 0.6 } }
            : { scale: [1, 1.2, 1], transition: { repeat: 3, duration: 0.4 } }
          }
          className="text-7xl"
          style={{ lineHeight: 1 }}
        >
          {cfg.icon}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={{ clipPath: 'inset(0% 0 0 0)' }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <h2
            className="font-display italic font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', color: cfg.color }}
          >
            {cfg.title}
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted text-base"
        >
          {cfg.sub}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 mt-2"
        >
          <button
            onClick={onNewGame}
            className="bg-[#f0f2ff] text-[#050816] rounded-full px-6 py-2.5 font-bold text-sm"
            data-cursor="pointer"
          >
            Play Again
          </button>
          <button
            onClick={onClose}
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-muted"
            data-cursor="pointer"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

/* ── Chess Modal ─────────────────────────────────────────────────────────── */
function ChessModal({ onClose }: { onClose: () => void }) {
  const [game,        setGame]        = useState(new Chess())
  const [status,      setStatus]      = useState<string>('Your move · White')
  const [thinking,    setThinking]    = useState(false)
  const [lastMove,    setLastMove]    = useState<{ from: string; to: string } | null>(null)
  const [result,      setResult]      = useState<GameResult>(null)
  const [capturedW,   setCapturedW]   = useState<string[]>([])
  const [capturedB,   setCapturedB]   = useState<string[]>([])
  const [selectedSq,  setSelectedSq]  = useState<string | null>(null)
  const [legalMoves,  setLegalMoves]  = useState<string[]>([])
  const [hintVisible, setHintVisible] = useState(false)
  const [takebacks,   setTakebacks]   = useState(3)
  const [scriptStep,  setScriptStep]  = useState(0)
  /* onScript: true = player is still on the secret sequence; false = regular Stockfish game */
  const [onScript,    setOnScript]    = useState(true)

  const gameRef       = useRef(game)
  const scriptStepRef = useRef(0)
  const onScriptRef   = useRef(true)   // sync mirror of onScript for use inside callbacks
  const undoStack     = useRef<{ fen: string; cW: string[]; cB: string[]; step: number; wasOnScript: boolean }[]>([])

  scriptStepRef.current = scriptStep
  onScriptRef.current   = onScript

  const advW = capturedW.reduce((s, p) => s + (PIECE_VALUE[p.toLowerCase()] ?? 0), 0)
  const advB = capturedB.reduce((s, p) => s + (PIECE_VALUE[p.toLowerCase()] ?? 0), 0)

  const clearSel  = useCallback(() => { setSelectedSq(null); setLegalMoves([]) }, [])

  const addCapture = useCallback((color: 'w'|'b', type: string) => {
    const sym = PIECE_UNICODE[type]?.[color === 'w' ? 'b' : 'w'] ?? type
    if (color === 'w') setCapturedW(p => [...p, sym])
    else               setCapturedB(p => [...p, sym])
  }, [])

  const updateStatus = useCallback((g: Chess) => {
    if (g.isCheckmate()) {
      const r: GameResult = g.turn() === 'w' ? 'aryan-wins' : 'player-wins'
      setResult(r)
      setStatus(r === 'player-wins' ? 'Checkmate — You win! 🎉' : 'Checkmate — Aryan Anand wins!')
    } else if (g.isDraw()) {
      setResult('draw'); setStatus('Draw — well played.')
    } else if (g.isCheck()) {
      setStatus(g.turn() === 'w' ? 'Check! Your move · White' : 'Check! Aryan Anand is calculating…')
    } else {
      setStatus(g.turn() === 'w' ? 'Your move · White' : 'Aryan Anand is calculating…')
    }
  }, [])

  /* Apply a bot move (scripted or Stockfish) */
  const applyBotMove = useCallback((uciMove: string) => {
    setThinking(false)
    const g = new Chess(gameRef.current.fen())
    const from = uciMove.slice(0, 2), to = uciMove.slice(2, 4)
    const promo = uciMove[4] as 'q'|'r'|'b'|'n'|undefined
    const mv = g.move({ from, to, promotion: promo ?? 'q' })
    if (mv) {
      if (mv.captured) addCapture('b', mv.captured)
      gameRef.current = g; setGame(new Chess(g.fen()))
      setLastMove({ from, to }); updateStatus(g); clearSel()
    }
  }, [updateStatus, addCapture, clearSel])

  const { askMove } = useStockfish(applyBotMove)

  /* Schedule next engine/scripted move.
     Uses scripted response ONLY when still on the secret sequence. */
  const scheduleEngine = useCallback((g: Chess) => {
    if (g.isGameOver()) return
    setThinking(true)
    const step     = scriptStepRef.current
    const onPath   = onScriptRef.current
    const scripted = onPath ? SCRIPT[step]?.botMove : undefined

    if (onPath && scripted !== undefined) {
      setScriptStep(s => s + 1)
      setTimeout(() => {
        if (scripted) applyBotMove(scripted)
      }, 500 + Math.random() * 300)
    } else {
      // Regular Stockfish game
      setTimeout(() => askMove(g.fen()), 300)
    }
  }, [askMove, applyBotMove])

  const onDrop = useCallback((from: string, to: string) => {
    if (game.turn() !== 'w' || game.isGameOver() || result) return false
    const g = new Chess(game.fen())
    const mv = g.move({ from, to, promotion: 'q' })
    if (!mv) return false

    /* ── Secret sequence check ──────────────────────────────────────────────
       If the player is currently on the scripted path, verify their move
       matches the expected hint. Any deviation permanently exits the script
       for this game — Stockfish takes over from that point on.             */
    if (onScriptRef.current) {
      const expected = SCRIPT[scriptStepRef.current]?.hint
      const matches  = expected && from === expected.from && to === expected.to
      if (!matches) {
        onScriptRef.current = false
        setOnScript(false)
        setHintVisible(false)
      }
    }

    // Save undo snapshot (before applying move consequences)
    undoStack.current.push({
      fen:          game.fen(),
      cW:           [...capturedW],
      cB:           [...capturedB],
      step:         scriptStepRef.current,
      wasOnScript:  onScriptRef.current,   // already updated above
    })

    if (mv.captured) addCapture('w', mv.captured)
    gameRef.current = g; setGame(new Chess(g.fen()))
    setLastMove({ from, to }); updateStatus(g); clearSel(); setHintVisible(false)
    if (!g.isGameOver()) scheduleEngine(g)
    return true
  }, [game, scheduleEngine, updateStatus, addCapture, result, clearSel, capturedW, capturedB])

  /* Takeback — restores full state including onScript flag */
  const takeback = useCallback(() => {
    if (takebacks <= 0 || undoStack.current.length === 0 || result) return
    const prev = undoStack.current.pop()!
    const g = new Chess(prev.fen)
    gameRef.current = g; setGame(g)
    setCapturedW(prev.cW); setCapturedB(prev.cB)
    setScriptStep(prev.step)
    onScriptRef.current = prev.wasOnScript
    setOnScript(prev.wasOnScript)
    setStatus('Your move · White'); setThinking(false)
    setResult(null); setLastMove(null); clearSel(); setHintVisible(false)
    setTakebacks(t => t - 1)
  }, [takebacks, result, clearSel])

  /* New game — reset everything, re-arm the secret sequence */
  const newGame = () => {
    const g = new Chess(); gameRef.current = g; setGame(g)
    setStatus('Your move · White'); setThinking(false)
    setLastMove(null); setResult(null); setScriptStep(0)
    setCapturedW([]); setCapturedB([]); clearSel()
    setHintVisible(false); setTakebacks(3)
    onScriptRef.current = true; setOnScript(true)
    undoStack.current = []
  }

  const resign = () => { setResult('resigned'); setStatus('You resigned. Good game.') }

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const boardSize = Math.min(480, typeof window !== 'undefined' ? window.innerWidth - 80 : 480)
  /* Hint only meaningful while on the scripted path */
  const currentHint = onScript ? SCRIPT[scriptStep]?.hint : undefined

  /* Square styles */
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { background: 'rgba(212,168,67,0.28)' }
    squareStyles[lastMove.to]   = { background: 'rgba(212,168,67,0.42)' }
  }
  if (selectedSq) squareStyles[selectedSq] = { background: 'rgba(108,142,191,0.72)' }
  legalMoves.forEach(sq => {
    const occupied = !!game.get(sq as Parameters<typeof game.get>[0])
    squareStyles[sq] = occupied
      ? { background: 'radial-gradient(circle, transparent 58%, rgba(108,142,191,0.82) 60%)' }
      : { background: 'radial-gradient(circle, rgba(108,142,191,0.7) 22%, transparent 24%)' }
  })
  // Hint highlights override legal-move styles (only shown when on script)
  if (hintVisible && currentHint) {
    squareStyles[currentHint.from] = { background: 'rgba(80,200,120,0.65)' }
    squareStyles[currentHint.to]   = { background: 'radial-gradient(circle, rgba(80,200,120,0.7) 24%, transparent 26%)' }
  }

  const selectSquare = useCallback((sq: string) => {
    if (game.turn() !== 'w' || result) return
    const piece = game.get(sq as Parameters<typeof game.get>[0])
    if (!piece || piece.color !== 'w') { clearSel(); return }
    const moves = game.moves({ square: sq as Parameters<typeof game.get>[0], verbose: true })
    setSelectedSq(sq)
    setLegalMoves((moves as { to: string }[]).map(m => m.to))
  }, [game, result, clearSel])

  const handlePieceClick  = useCallback(({ square }: { square: string | null; piece: unknown; isSparePiece: boolean }) => {
    if (square) selectSquare(square)
  }, [selectSquare])

  const handleSquareClick = useCallback(({ square }: { square: string; piece: unknown }) => {
    if (selectedSq && legalMoves.includes(square)) onDrop(selectedSq, square)
    else selectSquare(square)
  }, [selectedSq, legalMoves, onDrop, selectSquare])

  return (
    <motion.div
      key="chess-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9990] flex flex-col"
      style={{ background: 'rgba(5,8,22,0.98)', backdropFilter: 'blur(12px)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between px-6 py-4 border-b border-stroke shrink-0"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">♞</span>
          <div>
            <p className="text-[#f0f2ff] font-bold text-sm">Aryan Anand</p>
            <p className="text-muted text-[10px] font-mono uppercase tracking-widest">International Competitor · Chess.com 2200</p>
          </div>
        </div>
        <button onClick={onClose} className="liquid-glass w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-[#f0f2ff] transition-colors" data-cursor="pointer">
          <X size={16} />
        </button>
      </motion.div>

      {/* Board area */}
      <div className="relative flex-1 flex flex-col items-center justify-center gap-3 p-4 overflow-auto">

        {/* Aryan's captures (black captured white) */}
        <div className="flex items-center justify-between w-full" style={{ maxWidth: boardSize }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#f0f2ff]" />
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">You · White</span>
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <span className="text-sm leading-none" title="Aryan's captures">{capturedB.join('')}</span>
            {advB > advW && <span className="text-accent text-[10px] font-bold ml-1">+{advB - advW}</span>}
          </div>
        </div>

        {/* Board */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <Chessboard
            options={{
              position: game.fen(),
              onPieceDrop: ({ sourceSquare, targetSquare }) =>
                onDrop(sourceSquare ?? '', targetSquare ?? ''),
              boardStyle: {
                width: `${boardSize}px`, height: `${boardSize}px`,
                borderRadius: '8px',
                boxShadow: '0 0 50px rgba(212,168,67,0.18), 0 0 100px rgba(212,168,67,0.08)',
              },
              darkSquareStyle:  { backgroundColor: '#1e3a1e' },
              lightSquareStyle: { backgroundColor: '#d4a843' },
              squareStyles,
              onPieceClick: handlePieceClick,
              onSquareClick: handleSquareClick,
              allowDragging: game.turn() === 'w' && !game.isGameOver() && !result,
            }}
          />

          {/* End-game overlay sits inside the board container */}
          <AnimatePresence>
            {result && (
              <GameEndOverlay
                result={result}
                onNewGame={newGame}
                onClose={onClose}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Your captures (white captured black) */}
        <div className="flex items-center justify-between w-full" style={{ maxWidth: boardSize }}>
          <div className="flex items-center gap-1">
            <span className="text-sm leading-none" title="Your captures">{capturedW.join('')}</span>
            {advW > advB && <span className="text-accent text-[10px] font-bold ml-1">+{advW - advB}</span>}
          </div>
          <div className="flex items-center gap-2">
            {thinking && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-accent text-[10px] font-mono"
              >
                calculating…
              </motion.span>
            )}
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">Aryan Anand · Black</span>
            <div className="w-3 h-3 rounded-full bg-[#1a1a1a] border border-stroke" />
          </div>
        </div>

        {/* Status */}
        {!result && (
          <motion.p key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="text-[#f0f2ff] text-sm font-mono tracking-wider">
            {status}
          </motion.p>
        )}

        {/* Hint label — only while on the scripted path */}
        {!result && onScript && hintVisible && currentHint && (
          <motion.p
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-mono uppercase tracking-widest"
            style={{ color: 'rgba(80,200,120,0.9)' }}
          >
            {SCRIPT[scriptStep]?.label}
          </motion.p>
        )}

        {/* Controls */}
        {!result && (
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Hint — only shown while player is still on the secret sequence */}
            {onScript && currentHint && (
              <button
                onClick={() => setHintVisible(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors ${hintVisible ? 'bg-green-900/40 text-green-400 border border-green-600/40' : 'liquid-glass text-muted hover:text-green-400'}`}
                data-cursor="pointer"
              >
                💡 Hint
              </button>
            )}

            {/* Takeback */}
            <button
              onClick={takeback}
              disabled={takebacks <= 0 || undoStack.current.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider liquid-glass text-muted hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              data-cursor="pointer"
            >
              <RotateCcw size={11} />
              Takeback
              <span className="flex gap-0.5 ml-0.5">
                {[0,1,2].map(i => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < takebacks ? 'bg-accent' : 'bg-stroke'}`} />
                ))}
              </span>
            </button>

            <button onClick={newGame}
              className="liquid-glass flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] text-muted hover:text-[#f0f2ff] transition-colors font-mono uppercase tracking-wider"
              data-cursor="pointer">
              <RotateCcw size={11} /> New Game
            </button>
            <button onClick={resign}
              className="liquid-glass flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] text-muted hover:text-red-400 transition-colors font-mono uppercase tracking-wider"
              data-cursor="pointer">
              <Flag size={11} /> Resign
            </button>
          </div>
        )}

        {!result && (
          <p className="text-muted text-[9px] font-mono uppercase tracking-widest">
            You're playing Aryan Anand · Press Esc to close
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ── Chess Challenge Section ─────────────────────────────────────────────── */
const PERSONAS = [
  {
    title: 'International Competitor',
    detail: 'Asian Youth Championship & Commonwealth Chess Championship 2018',
    flag: '🌏',
    rating: '2200',
    ratingLabel: 'Chess.com Blitz',
  },
  {
    title: 'National Level',
    detail: 'University Captain · Rapid Junior Progression to national level',
    flag: '🇮🇳',
    rating: '3 yr',
    ratingLabel: 'University Captain',
  },
]

export default function ChessChallenge() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section id="challenge" className="chess-bg relative py-24 md:py-36 px-6 md:px-12 lg:px-20 bg-[#060919]">
        <GoldLine />

        <div className="max-w-7xl mx-auto">
          {/* Section label */}
          <div className="overflow-hidden mb-16">
            <motion.div
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4"
            >
              <span className="text-accent font-mono text-xs">06</span>
              <div className="w-8 h-px bg-stroke" />
              <h2 className="text-base md:text-lg text-[#f0f2ff] uppercase tracking-[0.25em] font-bold">Chess Challenge</h2>
            </motion.div>
          </div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14"
          >
            <h3
              className="font-display italic font-black text-[#f0f2ff] leading-[0.9] tracking-[-0.04em] mb-4"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}
            >
              Quick game,{' '}
              <span className="text-accent">mate?</span>
            </h3>
            <p className="text-muted text-base max-w-lg leading-relaxed">
              You're not playing a bot. You're playing Aryan Anand — international competitor,
              VTU captain, Chess.com 2200. Don't worry there are hints , also takebacks. Good luck.
            </p>
          </motion.div>

          {/* Persona cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {PERSONAS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="liquid-glass rounded-2xl p-6 border border-stroke hover:border-accent/40 transition-colors depth-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-accent text-[9px] uppercase tracking-[0.4em] font-bold mb-1">{p.flag} {p.title}</p>
                    <p className="text-muted text-xs leading-relaxed max-w-xs">{p.detail}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-display italic font-black text-3xl text-[#f0f2ff] leading-none">{p.rating}</p>
                    <p className="text-muted text-[9px] uppercase tracking-widest mt-1">{p.ratingLabel}</p>
                  </div>
                </div>
                <div className="h-px bg-stroke" />
                <div className="mt-4 flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-400"
                  />
                  <span className="text-green-400 text-[9px] uppercase tracking-widest font-mono">Aryan online</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <motion.button
              onClick={() => setOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden bg-[#f0f2ff] text-[#050816] rounded-full px-10 py-4 font-black text-base flex items-center gap-3"
              data-cursor="pointer"
            >
              <span className="text-xl">♞</span>
              Accept the Challenge
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              >→</motion.span>
            </motion.button>
            <p className="text-muted text-xs font-mono">No login · No install · Runs in your browser</p>
          </motion.div>
        </div>
      </section>

      {/* Chess modal */}
      <AnimatePresence>
        {open && <ChessModal onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
