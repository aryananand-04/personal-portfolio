import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useInView, AnimatePresence, LayoutGroup } from 'framer-motion'
import { ExternalLink, Github, X, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { projects, teardowns, type Teardown, type Project } from '../data/portfolio'
import SectionLabel, { GoldLine } from './SectionLabel'
import { useProximityGlow } from '../hooks/useProximityGlow'

/* ─── 3-D tilt wrapper ───────────────────────────────────────────────────── */
/* ── Idea #8: Global-mouse distance-based tilt with exponential falloff ──── */
function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const rx  = useMotionValue(0); const ry  = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 25 })
  const sry = useSpring(ry, { stiffness: 200, damping: 25 })
  const { ref, boxShadow } = useProximityGlow(280)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current as HTMLElement | null
      if (!el) return
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width  / 2
      const cy = r.top  + r.height / 2
      const dist     = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2)
      const strength = Math.max(0, 1 - dist / 420) ** 2
      rx.set(((e.clientY - cy) / (r.height / 2)) * 12 * strength)
      ry.set(-((e.clientX - cx) / (r.width  / 2)) * 12 * strength)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [rx, ry, ref])

  return (
    <motion.div
      ref={ref}
      style={{ ...style, rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', transformPerspective: 1000, boxShadow }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Star-field canvas (Chess × Recovery card) ─────────────────────────── */
/* ── Idea #10: Supernova burst on click ───────────────────────────────────── */
function StarfieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => canvas.width
    const H = () => canvas.height

    /* Particles */
    const COLS = ['#d4a843', '#e6bc5a', '#f5d78a', '#fde68a', '#f0f2ff', '#fcd34d']
    const pts = Array.from({ length: 260 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.5 - 0.08,
      a: Math.random() * 0.7 + 0.2,
      da: (Math.random() - 0.5) * 0.008,
      c: COLS[Math.floor(Math.random() * COLS.length)],
    }))

    /* Nebula orbs (static radial gradients) */
    const nebulae = [
      { cx: 0.28, cy: 0.4,  r: 0.22, color: 'rgba(212,168,67,0.08)' },
      { cx: 0.72, cy: 0.55, r: 0.28, color: 'rgba(212,168,67,0.04)' },
      { cx: 0.5,  cy: 0.2,  r: 0.18, color: 'rgba(245,215,138,0.05)' },
    ]

    const draw = () => {
      const w = W(), h = H()

      /* Trail fade */
      ctx.fillStyle = 'rgba(3,7,25,0.22)'
      ctx.fillRect(0, 0, w, h)

      /* Nebulae */
      nebulae.forEach(n => {
        const grd = ctx.createRadialGradient(n.cx*w, n.cy*h, 0, n.cx*w, n.cy*h, n.r*w)
        grd.addColorStop(0, n.color)
        grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, w, h)
      })

      /* Stars */
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        p.a  = Math.max(0.1, Math.min(0.95, p.a + p.da))
        if (p.a >= 0.95 || p.a <= 0.1) p.da *= -1
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w }
        if (p.x < -4) p.x = w + 4
        if (p.x > w + 4) p.x = -4

        ctx.save()
        ctx.globalAlpha = p.a
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c
        if (p.r > 1.1) { ctx.shadowBlur = 7; ctx.shadowColor = p.c }
        ctx.fill()
        ctx.restore()
      })

      /* Connecting lines between nearby stars */
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < Math.min(i + 6, pts.length); j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d  = Math.sqrt(dx*dx + dy*dy)
          if (d < 70) {
            ctx.save()
            ctx.globalAlpha = (1 - d / 70) * 0.12
            ctx.beginPath()
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.strokeStyle = '#d4a843'
            ctx.lineWidth = 0.4
            ctx.stroke()
            ctx.restore()
          }
        }
      }

      raf = requestAnimationFrame(draw)
    }

    ctx.fillStyle = '#030719'
    ctx.fillRect(0, 0, W(), H())
    draw()

    /* Supernova: radiate all particles outward from click point, then reset */
    const onSupernova = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left
      const my = e.clientY - r.top
      pts.forEach(p => {
        const angle = Math.atan2(p.y - my, p.x - mx)
        const burst = 3 + Math.random() * 4
        p.vx = Math.cos(angle) * burst
        p.vy = Math.sin(angle) * burst
        p.a  = 0.95
        /* respawn at burst origin after flying off */
        setTimeout(() => {
          p.x = mx + (Math.random() - 0.5) * 30
          p.y = my + (Math.random() - 0.5) * 30
          p.vx = (Math.random() - 0.5) * 0.25
          p.vy = -Math.random() * 0.5 - 0.08
        }, 900 + Math.random() * 400)
      })
    }
    canvas.addEventListener('click', onSupernova)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('click', onSupernova)
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full block cursor-crosshair" />
}

/* ─── Matrix-rain canvas (CS50 card) ────────────────────────────────────── */
function MatrixCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let frame = 0

    const FS = 13
    const CHARS = '01アウイエオカサタナハABCDEF0123456789{}[]<>'

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const cols    = () => Math.floor(canvas.width / FS)
    let drops = Array.from({ length: cols() }, () => Math.random() * -60)

    const draw = () => {
      frame++
      if (frame % 2 === 0) { // ~30 fps
        const w = canvas.width, h = canvas.height

        ctx.fillStyle = 'rgba(0,4,0,0.045)'
        ctx.fillRect(0, 0, w, h)

        ctx.font = `${FS}px "Courier New", monospace`

        drops.forEach((y, i) => {
          const ch = CHARS[Math.floor(Math.random() * CHARS.length)]
          const x  = i * FS

          /* Lead glyph */
          ctx.fillStyle = '#00ff41'
          ctx.shadowBlur = 10; ctx.shadowColor = '#00ff41'
          ctx.fillText(ch, x, y * FS)

          /* 2nd */
          ctx.fillStyle = '#00cc33'; ctx.shadowBlur = 0
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, (y-1)*FS)

          /* Deep trail */
          ctx.fillStyle = '#005500'
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, (y-4)*FS)

          if (y * FS > h && Math.random() > 0.975) drops[i] = 0
          drops[i] += 0.5
        })

        /* Re-init drops array if cols changed after resize */
        const c = cols()
        if (drops.length !== c) drops = Array.from({ length: c }, () => Math.random() * -60)
      }

      raf = requestAnimationFrame(draw)
    }

    ctx.fillStyle = '#000400'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full block" />
}


/* ══════════════════════════════════════════════════════════════════════════
   PROJECT CARD CANVASES
   ══════════════════════════════════════════════════════════════════════════ */

/* Knowledge graph — HeritageRec · SocioPedia */
function GraphCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const COLS = ['#d4a843','#14b8a6','#a78bfa','#60a5fa','#f0f2ff']
    const nodes = Array.from({ length: 42 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random()-.5)*.32, vy: (Math.random()-.5)*.32,
      r: Math.random()*3+1.5, c: COLS[Math.floor(Math.random()*COLS.length)],
      phase: Math.random()*Math.PI*2,
    }))
    const pulses: { fi: number; ti: number; t: number }[] = []
    const draw = () => {
      const w=canvas.width, h=canvas.height
      ctx.fillStyle='rgba(3,6,20,0.2)'; ctx.fillRect(0,0,w,h)
      const g=ctx.createRadialGradient(w*.5,h*.4,0,w*.5,h*.4,w*.45)
      g.addColorStop(0,'rgba(20,184,166,0.07)'); g.addColorStop(1,'transparent')
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h)
      nodes.forEach(n=>{ n.x+=n.vx; n.y+=n.vy; n.phase+=.018
        if(n.x<0||n.x>w) n.vx*=-1; if(n.y<0||n.y>h) n.vy*=-1 })
      for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
        const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y, d=Math.sqrt(dx*dx+dy*dy)
        if(d<88){ ctx.save(); ctx.globalAlpha=(1-d/88)*.2; ctx.strokeStyle=nodes[i].c
          ctx.lineWidth=.6; ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y)
          ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke(); ctx.restore() }}
      for(let i=pulses.length-1;i>=0;i--){
        const p=pulses[i]; p.t+=.016; if(p.t>=1){pulses.splice(i,1);continue}
        const x=nodes[p.fi].x+(nodes[p.ti].x-nodes[p.fi].x)*p.t
        const y=nodes[p.fi].y+(nodes[p.ti].y-nodes[p.fi].y)*p.t
        ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2)
        ctx.fillStyle=nodes[p.fi].c; ctx.shadowBlur=10; ctx.shadowColor=nodes[p.fi].c; ctx.fill(); ctx.shadowBlur=0 }
      if(Math.random()<.07&&pulses.length<18){
        const fi=Math.floor(Math.random()*nodes.length); let best=-1,bd=Infinity
        nodes.forEach((n,i)=>{ if(i===fi)return; const d=Math.hypot(n.x-nodes[fi].x,n.y-nodes[fi].y)
          if(d<88&&d<bd){bd=d;best=i} }); if(best>=0)pulses.push({fi,ti:best,t:0}) }
      nodes.forEach(n=>{ const p=Math.sin(n.phase)*.35+.65
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2)
        ctx.fillStyle=n.c; ctx.globalAlpha=p; ctx.shadowBlur=8; ctx.shadowColor=n.c; ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1 })
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#030614'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block"/>
}

/* AI token flow — TaskGenie */
function AgentCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number; let t = 0
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const TOKENS = ['task','→','struct','parse','intent','context','plan','exec','[obj]','fn()','→','done','✓']
    const COLS   = ['#d4a843','#60a5fa','#34d399','#f472b6','#a78bfa','#fb923c']
    const pts = Array.from({length:30},(_,i)=>({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height+canvas.height*.2,
      vx:(Math.random()-.5)*.2, vy:-Math.random()*.6-.2,
      tok:TOKENS[i%TOKENS.length], col:COLS[Math.floor(Math.random()*COLS.length)],
      a:Math.random()*.7+.3, size:9+Math.random()*5,
    }))
    const draw = () => {
      const w=canvas.width, h=canvas.height; t+=1
      ctx.fillStyle='rgba(3,6,20,0.25)'; ctx.fillRect(0,0,w,h)
      const g=ctx.createLinearGradient(0,h,0,0)
      g.addColorStop(0,'rgba(212,168,67,0.06)'); g.addColorStop(1,'rgba(96,165,250,0.04)')
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h)
      pts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy
        if(p.y<-20){ p.y=h+20; p.x=Math.random()*w }
        if(p.x<-40) p.x=w+40; if(p.x>w+40) p.x=-40
        ctx.save(); ctx.globalAlpha=p.a*(Math.sin(t*.03+p.x*.02)*.2+.8)
        ctx.font=`bold ${p.size}px 'Courier New',monospace`; ctx.fillStyle=p.col
        ctx.shadowBlur=6; ctx.shadowColor=p.col; ctx.fillText(p.tok,p.x,p.y); ctx.restore() })
      // Flowing connection arcs
      for(let i=0;i<pts.length;i+=4){
        const a=pts[i],b=pts[(i+3)%pts.length]
        if(Math.hypot(a.x-b.x,a.y-b.y)>120)continue
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y)
        ctx.strokeStyle=`rgba(212,168,67,0.08)`; ctx.lineWidth=.5; ctx.stroke() }
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#030614'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block"/>
}

/* Edge detection scanner — OpenEdge · CV Python · Webcam Detection */
function EdgeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number; let scan=0; let t=0
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    // Target points that the detection box tracks
    const targets = Array.from({length:4},()=>({x:Math.random()*.8+.1,y:Math.random()*.8+.1}))
    let tIdx=0, box={x:.35,y:.3,w:.3,h:.35}
    const draw = () => {
      const w=canvas.width, h=canvas.height; t+=1; scan=(scan+.8)%h
      ctx.fillStyle='rgba(3,10,3,0.25)'; ctx.fillRect(0,0,w,h)
      // Grid dots
      ctx.fillStyle='rgba(0,200,80,0.07)'
      for(let gx=0;gx<w;gx+=16) for(let gy=0;gy<h;gy+=16){
        ctx.beginPath(); ctx.arc(gx,gy,1,0,Math.PI*2); ctx.fill() }
      // Scan line
      const slg=ctx.createLinearGradient(0,scan-8,0,scan+8)
      slg.addColorStop(0,'transparent'); slg.addColorStop(.5,'rgba(0,255,100,0.18)'); slg.addColorStop(1,'transparent')
      ctx.fillStyle=slg; ctx.fillRect(0,scan-8,w,16)
      // Edge highlights near scan
      if(t%3===0){
        ctx.strokeStyle='rgba(0,255,100,0.4)'; ctx.lineWidth=.5
        for(let i=0;i<3;i++){
          const ex=Math.random()*w, ey=scan+(Math.random()-0.5)*20
          ctx.beginPath(); ctx.moveTo(ex,ey); ctx.lineTo(ex+Math.random()*30-15,ey+(Math.random()-0.5)*4); ctx.stroke() }}
      // Move box toward target
      const tgt=targets[tIdx]
      box.x+=(tgt.x-box.x-box.w/2)*.015; box.y+=(tgt.y-box.y-box.h/2)*.015
      if(Math.abs(tgt.x-box.x-box.w/2)<.01&&Math.abs(tgt.y-box.y-box.h/2)<.01) tIdx=(tIdx+1)%targets.length
      const bx=box.x*w,by=box.y*h,bw=box.w*w,bh=box.h*h
      const blink=Math.sin(t*.08)>.3
      ctx.strokeStyle=blink?'rgba(0,255,100,0.9)':'rgba(0,255,100,0.5)'; ctx.lineWidth=1.2
      const cs=10 // corner size
      ;[0,1].forEach(xi=>[0,1].forEach(yi=>{
        const cx2=bx+xi*bw, cy2=by+yi*bh
        ctx.beginPath(); ctx.moveTo(cx2+(xi?-cs:cs),cy2)
        ctx.lineTo(cx2,cy2); ctx.lineTo(cx2,cy2+(yi?-cs:cs)); ctx.stroke() }))
      // Center dot
      ctx.beginPath(); ctx.arc(bx+bw/2,by+bh/2,3,0,Math.PI*2)
      ctx.fillStyle='rgba(0,255,100,0.8)'; ctx.shadowBlur=10; ctx.shadowColor='#00ff64'; ctx.fill(); ctx.shadowBlur=0
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#030a03'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block"/>
}

/* System metrics — Monitoring App · Python Dataset DV */
function MetricsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number; let t=0
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const CHANNELS=[
      {col:'#d4a843',freq:.04,amp:.28,off:0,phase:0},
      {col:'#14b8a6',freq:.07,amp:.18,off:.3,phase:1.1},
      {col:'#a78bfa',freq:.025,amp:.22,off:.6,phase:2.4},
    ]
    const hist: number[][] = CHANNELS.map(()=>[])
    const draw = () => {
      const w=canvas.width, h=canvas.height; t+=1
      ctx.fillStyle='rgba(3,6,20,0.22)'; ctx.fillRect(0,0,w,h)
      // Grid
      ctx.strokeStyle='rgba(30,35,64,0.5)'; ctx.lineWidth=.5
      for(let gx=0;gx<w;gx+=30){ ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,h); ctx.stroke() }
      for(let gy=0;gy<h;gy+=24){ ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(w,gy); ctx.stroke() }
      CHANNELS.forEach((ch,ci)=>{
        const val=h*.5+Math.sin(t*ch.freq+ch.phase)*h*ch.amp+Math.sin(t*ch.freq*.37+ch.phase*1.7)*h*ch.amp*.4
        hist[ci].push(val); if(hist[ci].length>w) hist[ci].shift()
        ctx.beginPath(); ctx.moveTo(0,hist[ci][0]||h*.5)
        hist[ci].forEach((v,xi)=>ctx.lineTo(xi,v))
        ctx.strokeStyle=ch.col; ctx.lineWidth=1.5
        ctx.shadowBlur=8; ctx.shadowColor=ch.col; ctx.stroke(); ctx.shadowBlur=0
        // Animated dot at tip
        const last=hist[ci][hist[ci].length-1]||h*.5
        ctx.beginPath(); ctx.arc(hist[ci].length-1,last,3.5,0,Math.PI*2)
        ctx.fillStyle=ch.col; ctx.shadowBlur=12; ctx.shadowColor=ch.col; ctx.fill(); ctx.shadowBlur=0 })
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#030614'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block"/>
}

/* Wireframe globe — Cultural Exchange */
function GlobeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number; let rot=0
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const PTS = Array.from({length:22},(_, i)=>({ lat:(Math.random()-.5)*Math.PI*.75, lon:(i/22)*Math.PI*2, phase:Math.random()*Math.PI*2 }))
    const draw = () => {
      const w=canvas.width, h=canvas.height, cx=w/2, cy=h/2, r=Math.min(w,h)*.38
      ctx.fillStyle='rgba(3,6,20,0.22)'; ctx.fillRect(0,0,w,h); rot+=.003
      const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,r)
      bg.addColorStop(0,'rgba(212,168,67,0.05)'); bg.addColorStop(1,'transparent')
      ctx.fillStyle=bg; ctx.fillRect(0,0,w,h)
      // Longitude ellipses
      for(let i=0;i<9;i++){
        const a=(i/9)*Math.PI+rot, xr=Math.abs(Math.cos(a))*r, front=Math.cos(a)>0
        ctx.beginPath(); ctx.ellipse(cx,cy,xr,r,0,0,Math.PI*2)
        ctx.strokeStyle=`rgba(212,168,67,${front?.22:.07})`; ctx.lineWidth=front?.7:.35; ctx.stroke() }
      // Latitude ellipses
      for(let li=-2;li<=2;li++){
        const ly=cy+(li/2.6)*r, xr2=Math.sqrt(Math.max(0,r*r-(ly-cy)*(ly-cy)))
        if(xr2<1)continue
        ctx.beginPath(); ctx.ellipse(cx,ly,xr2,xr2*.1,0,0,Math.PI*2)
        ctx.strokeStyle='rgba(212,168,67,0.12)'; ctx.lineWidth=.5; ctx.stroke() }
      // Outer circle
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2)
      ctx.strokeStyle='rgba(212,168,67,0.35)'; ctx.lineWidth=1; ctx.stroke()
      // Globe points
      PTS.forEach(p=>{ p.phase+=.022
        const px=cx+r*Math.cos(p.lat)*Math.sin(p.lon+rot)
        const py=cy+r*Math.sin(p.lat)
        const vis=Math.cos(p.lat)*Math.cos(p.lon+rot); if(vis<-.05)return
        const al=(vis+.05)*(Math.sin(p.phase)*.4+.6)
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2)
        ctx.fillStyle='#d4a843'; ctx.globalAlpha=al
        ctx.shadowBlur=8; ctx.shadowColor='#d4a843'; ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1 })
      // Connection arcs between visible close points
      for(let i=0;i<PTS.length;i++) for(let j=i+1;j<PTS.length;j++){
        const a=PTS[i],b=PTS[j]
        const ax2=cx+r*Math.cos(a.lat)*Math.sin(a.lon+rot),ay2=cy+r*Math.sin(a.lat)
        const bx2=cx+r*Math.cos(b.lat)*Math.sin(b.lon+rot),by2=cy+r*Math.sin(b.lat)
        if(Math.cos(a.lat)*Math.cos(a.lon+rot)<0||Math.cos(b.lat)*Math.cos(b.lon+rot)<0)continue
        if(Math.hypot(ax2-bx2,ay2-by2)>r*.6)continue
        ctx.beginPath(); ctx.moveTo(ax2,ay2); ctx.lineTo(bx2,by2)
        ctx.strokeStyle='rgba(212,168,67,0.14)'; ctx.lineWidth=.5; ctx.stroke() }
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#030614'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block"/>
}

/* Floating content cards — X Clone · ClashVision · Fun Projects */
function StreamCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const ICONS=['♥','↺','★','◆','●','▲']
    const cards = Array.from({length:18},()=>({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height+canvas.height,
      w:60+Math.random()*80, h:28+Math.random()*18,
      vy:-.4-Math.random()*.5, a:Math.random()*.55+.15,
      col:Math.random()>.5?'rgba(96,165,250,':'rgba(148,163,184,',
      icon:ICONS[Math.floor(Math.random()*ICONS.length)],
      hasIcon:Math.random()>.5,
    }))
    const draw = () => {
      const w=canvas.width, h=canvas.height
      ctx.fillStyle='rgba(3,6,20,0.22)'; ctx.fillRect(0,0,w,h)
      cards.forEach(c=>{ c.y+=c.vy
        if(c.y<-c.h-20){ c.y=h+20; c.x=Math.random()*w }
        ctx.save(); ctx.globalAlpha=c.a
        ctx.strokeStyle=c.col+'0.6)'; ctx.lineWidth=1
        ctx.beginPath(); ctx.roundRect(c.x,c.y,c.w,c.h,4); ctx.stroke()
        // Lines inside card
        ctx.fillStyle=c.col+'0.3)'; ctx.fillRect(c.x+8,c.y+8,c.w*.55,3); ctx.fillRect(c.x+8,c.y+16,c.w*.35,3)
        if(c.hasIcon){
          ctx.font='9px serif'; ctx.fillStyle='rgba(96,165,250,0.7)'; ctx.fillText(c.icon,c.x+c.w-14,c.y+c.h-8) }
        ctx.restore() })
      // Subtle nebula
      const g=ctx.createRadialGradient(w*.4,h*.5,0,w*.4,h*.5,w*.4)
      g.addColorStop(0,'rgba(96,165,250,0.04)'); g.addColorStop(1,'transparent')
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h)
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#030614'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block"/>
}

/* ECG heartbeat — Hack4HEARTs */
function PulseCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number; let t=0
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const ECG_CYCLE=120 // frames per beat
    const draw = () => {
      const w=canvas.width, h=canvas.height; t++
      ctx.fillStyle='rgba(3,4,4,0.28)'; ctx.fillRect(0,0,w,h)
      // Grid
      ctx.strokeStyle='rgba(239,68,68,0.08)'; ctx.lineWidth=.5
      for(let gx=0;gx<w;gx+=20){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,h);ctx.stroke()}
      for(let gy=0;gy<h;gy+=20){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke()}
      // Draw full ECG history
      const mid=h*.55
      ctx.beginPath()
      for(let x=0;x<w;x++){
        const phase=((x-t*.8)%ECG_CYCLE+ECG_CYCLE)%ECG_CYCLE/ECG_CYCLE
        let y=mid
        if(phase<.08)       y=mid-phase/.08*h*.04           // P wave up
        else if(phase<.16)  y=mid-(1-(phase-.08)/.08)*h*.04 // P wave down
        else if(phase<.28)  y=mid                           // flat
        else if(phase<.31)  y=mid+(phase-.28)/.03*h*.06     // pre-Q down
        else if(phase<.34)  y=mid-(phase-.31)/.03*h*.35     // R spike
        else if(phase<.37)  y=mid+h*.06+(phase-.34)/.03*h*.04 // S trough
        else if(phase<.42)  y=mid-(1-(phase-.37)/.05)*h*.06   // return
        else if(phase<.6)   y=mid-(Math.sin((phase-.42)/.18*Math.PI))*h*.05 // T wave
        else                y=mid
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y) }
      // Glow on the leading edge
      const leadX=(t*.8)%w
      const grd=ctx.createLinearGradient(leadX-80,0,leadX,0)
      grd.addColorStop(0,'rgba(239,68,68,0)'); grd.addColorStop(1,'rgba(239,68,68,0.9)')
      ctx.strokeStyle=grd; ctx.lineWidth=1.8; ctx.shadowBlur=14; ctx.shadowColor='#ef4444'; ctx.stroke(); ctx.shadowBlur=0
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#030404'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block"/>
}

/* Scrolling code terminal — Portfolio v1 · Python Projects */
function TerminalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number; let scroll=0
    const resize = () => { canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    const LINES=[
      {t:'def solve(board, step=0):',    c:'#60a5fa'},
      {t:"  if step == len(moves): return True",c:'#f0f2ff'},
      {t:'  from_, to_ = moves[step]',   c:'#f0f2ff'},
      {t:'  board.move(from_, to_)',      c:'#a78bfa'},
      {t:'  if board.is_legal():',        c:'#f0f2ff'},
      {t:'    return solve(board, step+1)',c:'#34d399'},
      {t:'  board.undo()',                c:'#f472b6'},
      {t:'  return False',               c:'#f472b6'},
      {t:'',                              c:'#f0f2ff'},
      {t:'# Minimax with α-β pruning',   c:'#6b7280'},
      {t:'def minimax(pos, depth, α, β):',c:'#60a5fa'},
      {t:'  if depth == 0: return eval(pos)',c:'#f0f2ff'},
      {t:'  for move in pos.legal_moves:',c:'#f0f2ff'},
      {t:'    pos.push(move)',            c:'#a78bfa'},
      {t:'    score = -minimax(pos, depth-1, -β, -α)',c:'#f0f2ff'},
      {t:'    pos.pop()',                 c:'#a78bfa'},
      {t:'    if score >= β: return β',  c:'#f472b6'},
      {t:'    α = max(α, score)',         c:'#34d399'},
      {t:'  return α',                   c:'#34d399'},
    ]
    const LH=16, FS=10
    const draw = () => {
      const w=canvas.width, h=canvas.height
      ctx.fillStyle='rgba(2,4,14,0.28)'; ctx.fillRect(0,0,w,h); scroll+=.25
      ctx.font=`${FS}px 'Courier New',monospace`
      LINES.forEach((l,i)=>{
        const y=i*LH-(scroll%((LINES.length)*LH))+h*.1
        if(y<-LH||y>h+LH)return
        ctx.globalAlpha=Math.max(0,Math.min(1,(h-y)/(h*.3)))
        ctx.fillStyle=l.c; ctx.fillText(l.t,12,y) })
      ctx.globalAlpha=1
      // Blinking cursor
      if(Math.floor(scroll/18)%2===0){
        const curY=h*.8; ctx.fillStyle='rgba(212,168,67,0.85)'
        ctx.fillRect(12,curY-FS,6,FS+2) }
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#02040e'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block"/>
}

/* Canvas lookup by project title */
function getProjectCanvas(title: string): React.ComponentType | null {
  const t = title.toLowerCase()
  if (t.includes('heritage'))                      return GraphCanvas
  if (t.includes('taskgenie') || t.includes('task genie')) return AgentCanvas
  if (t.includes('openedge')  || t.includes('open edge'))  return EdgeCanvas
  if (t.includes('monitoring'))                    return MetricsCanvas
  if (t.includes('cv python'))                     return EdgeCanvas
  if (t.includes('webcam'))                        return EdgeCanvas
  if (t.includes('socio'))                         return GraphCanvas
  if (t.includes('cultural'))                      return GlobeCanvas
  if (t.includes('x clone'))                       return StreamCanvas
  if (t.includes('clash'))                         return StreamCanvas
  if (t.includes('hack4') || t.includes('heart'))  return PulseCanvas
  if (t.includes('portfolio'))                     return TerminalCanvas
  if (t.includes('dataset'))                       return MetricsCanvas
  if (t.includes('python'))                        return TerminalCanvas
  if (t.includes('fun'))                           return StreamCanvas
  return StreamCanvas
}


/* ══════════════════════════════════════════════════════════════════════════
   EXPANDED PROJECT SPOTLIGHT MODAL
   ══════════════════════════════════════════════════════════════════════════ */
function ExpandedProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const sections = [
    { label: 'Overview',             text: project.description },
    { label: 'Problem Solved',       text: project.problem },
    { label: 'Technical Challenges', text: project.challenges },
    { label: 'Results & Outcomes',   text: project.results },
    { label: 'Lessons Learned',      text: project.lessons },
  ].filter(s => s.text)

  return (
    <motion.div
      layoutId={`proj-${project.title}`}
      className="fixed z-[9985] overflow-hidden"
      style={{
        inset: 0,
        margin: 'auto',
        width: 'min(90vw, 1080px)',
        height: 'min(88vh, 700px)',
        borderRadius: '24px',
        boxShadow: '0 32px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px rgba(212,168,67,0.06)',
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}
    >
      {/* Inner layout — LEFT image | RIGHT content */}
      <div
        className="relative w-full h-full flex flex-col sm:flex-row"
        style={{ background: '#08091d', borderRadius: '24px' }}
      >

        {/* ── LEFT: hero image + meta ─────────────────────────────────────── */}
        <div className="relative sm:w-[38%] shrink-0 h-52 sm:h-full overflow-hidden"
          style={{ borderRadius: '24px 0 0 24px' }}>
          {project.image
            ? <img src={project.image} alt={project.title} className="w-full h-full object-cover object-top" />
            : <div className="w-full h-full bg-[#060919]" />
          }
          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, #08091d 12%, rgba(8,9,29,0.35) 55%, transparent 100%)' }} />
          <div className="hidden sm:block absolute inset-0"
            style={{ background: 'linear-gradient(to right, transparent 60%, #08091d 100%)' }} />

          {/* Tags + buttons — pinned to bottom */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.4 }}
            className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 flex flex-col gap-3"
          >
            <div className="flex flex-wrap gap-1.5">
              {project.tags.slice(0, 9).map((tag, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.28 + i * 0.025 }}
                  className="text-[#f0f2ff]/65 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              className="flex gap-2"
            >
              {project.repo && (
                <a href={project.repo} target="_blank" rel="noreferrer" data-cursor="pointer"
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-bold text-[#f0f2ff] hover:bg-white hover:text-black transition-all"
                  style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <Github size={12} /> GitHub
                </a>
              )}
              {project.link && (
                <a href={project.link} target="_blank" rel="noreferrer" data-cursor="pointer"
                  className="flex items-center gap-2 bg-accent text-black rounded-xl px-4 py-2 text-[11px] font-bold hover:brightness-110 transition-all">
                  <ExternalLink size={12} /> Live Demo
                </a>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* ── RIGHT: scrollable case study ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 sm:px-8 py-6 sm:py-8">

          {/* Title + impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <h2 className="font-display italic font-black text-[1.65rem] sm:text-[2rem] text-[#f0f2ff] leading-tight mb-1.5">
              {project.title}
            </h2>
            {project.impact && (
              <p className="text-accent text-sm font-semibold leading-snug">{project.impact}</p>
            )}
          </motion.div>

          {/* Text sections */}
          {sections.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 + idx * 0.07, duration: 0.38 }}
              className="mb-5"
            >
              <p className="text-[9px] text-accent/55 uppercase tracking-[0.38em] font-bold mb-1.5">{s.label}</p>
              <p className="text-muted text-[13px] leading-relaxed">{s.text}</p>
            </motion.div>
          ))}

          {/* Key features */}
          {project.features && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52 }}
              className="mb-5"
            >
              <p className="text-[9px] text-accent/55 uppercase tracking-[0.38em] font-bold mb-2">Key Features</p>
              <ul className="space-y-2">
                {project.features.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.58 + i * 0.05 }}
                    className="flex gap-2.5 text-[13px] text-muted leading-relaxed"
                  >
                    <span className="text-accent shrink-0 mt-0.5">▹</span>
                    {f}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-[#f0f2ff] transition-colors"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)' }}
          data-cursor="pointer" aria-label="Close"
        >
          <X size={14} />
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ── Horizontal-scroll project card (sized for the strip) ───────────────── */
function HScrollProjectCard({ project, i, selectedProject, onSelect }: {
  project: Project; i: number;
  selectedProject: Project | null;
  onSelect: (p: Project) => void;
}) {
  const outerRef  = useRef<HTMLDivElement>(null)
  const inView    = useInView(outerRef, { once: true, amount: 0.05 })
  const { ref: glowRef, boxShadow } = useProximityGlow(220)
  const Canvas    = getProjectCanvas(project.title)
  const isSelected = selectedProject?.title === project.title
  const isDimmed   = selectedProject !== null && !isSelected

  return (
    /* Outer div preserves scroll space when card is "hidden" by the modal */
    <div ref={outerRef} className="shrink-0" style={{ width: '300px', height: '400px' }}>
      <motion.div
        ref={glowRef}
        layoutId={`proj-${project.title}`}
        onClick={() => !selectedProject && onSelect(project)}
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity:  !inView ? 0 : isSelected ? 0 : isDimmed ? 0.32 : 1,
          y:        inView ? 0 : 30,
          scale:    isDimmed ? 0.96 : 1,
          filter:   isDimmed ? 'blur(3px)' : 'blur(0px)',
        }}
        transition={{
          layout:  { type: 'spring', stiffness: 280, damping: 32 },
          opacity: { duration: isSelected || isDimmed ? 0.22 : 0.55, delay: !inView ? 0 : isSelected || isDimmed ? 0 : i * 0.06 },
          y:       { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
          scale:   { duration: 0.25 },
          filter:  { duration: 0.25 },
        }}
        style={{ boxShadow, width: '100%', height: '100%', borderRadius: '16px', cursor: selectedProject ? 'default' : 'pointer' }}
      >
        <TiltCard className="relative rounded-2xl overflow-hidden group depth-card w-full h-full">
          {project.image
            ? <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover object-top" />
            : Canvas && <Canvas />
          }
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#060919]/98 via-[#060919]/70 to-transparent" />
          <div className="absolute inset-0 bg-[#060919]/15" />

          <div className="absolute bottom-0 left-0 right-0 z-10 p-5 flex flex-col gap-2.5">
            <h3 className="font-display italic font-black text-base text-[#f0f2ff] group-hover:text-accent transition-colors duration-300 leading-tight">
              {project.title}
            </h3>
            {project.impact
              ? <p className="text-accent/80 text-[11px] leading-relaxed line-clamp-2">{project.impact}</p>
              : <p className="text-muted text-[11px] leading-relaxed line-clamp-2">{project.description}</p>
            }
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 4).map((t, j) => (
                <span key={j} className="liquid-glass text-accent/70 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-accent/15">
                  {t}
                </span>
              ))}
              {project.tags.length > 4 && (
                <span className="text-muted text-[8px] font-mono self-center">+{project.tags.length - 4}</span>
              )}
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  )
}

/* ── Horizontal scroll strip for projects ───────────────────────────────── */
function ProjectScrollStrip({ items, selectedProject, onSelect }: {
  items: Project[];
  selectedProject: Project | null;
  onSelect: (p: Project) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      setCanLeft(el.scrollLeft > 1)
      setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > 5) return
      e.preventDefault()
      el.scrollLeft += e.deltaY * 0.8
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const scrollBy = (dir: 'left' | 'right') => {
    containerRef.current?.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Strip header with nav buttons */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <span className="text-accent font-mono text-xs">↳</span>
          <div className="w-6 h-px bg-stroke" />
          <p className="text-sm text-[#f0f2ff] uppercase tracking-[0.25em] font-bold">More Projects</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scrollBy('left')}
            disabled={!canLeft}
            className="w-7 h-7 rounded-full liquid-glass border border-stroke flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 transition-all disabled:opacity-25 disabled:pointer-events-none"
            data-cursor="pointer" aria-label="Scroll left"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => scrollBy('right')}
            disabled={!canRight}
            className="w-7 h-7 rounded-full liquid-glass border border-stroke flex items-center justify-center text-muted hover:text-accent hover:border-accent/40 transition-all disabled:opacity-25 disabled:pointer-events-none"
            data-cursor="pointer" aria-label="Scroll right"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="overflow-x-auto scrollbar-hide pb-4">
        <div className="flex gap-4">
          {items.map((p, i) => (
            <HScrollProjectCard key={p.title} project={p} i={i} selectedProject={selectedProject} onSelect={onSelect} />
          ))}
          <div className="shrink-0 w-20" aria-hidden />
        </div>
      </div>
    </div>
  )
}

/* ─── Projects section ───────────────────────────────────────────────────── */

/* Titles shown in the horizontal scroll strip (others are hidden) */
const SCROLL_TITLES = ['heritagerec', 'openedge', 'monitoring app', 'sociopedia', 'clashvision']

export default function Projects() {
  const [active,           setActive]           = useState<Teardown | null>(null)
  const [selectedProject,  setSelectedProject]  = useState<Project | null>(null)

  const chess        = projects.find(p => p.title.toLowerCase().includes('chess'))
  const cs50         = projects.find(p => p.title.toLowerCase().includes('cs50'))
  const scrollProjects = projects.filter(p =>
    SCROLL_TITLES.some(t => p.title.toLowerCase().includes(t))
  )

  /* Lock body scroll while spotlight is open */
  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [selectedProject])

  /* ESC to close */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedProject(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <LayoutGroup>
    <section id="projects" className="chess-bg relative py-24 md:py-36 px-6 md:px-12 lg:px-20 bg-[#060919]">
      <GoldLine />
      <div className="max-w-7xl mx-auto">
        <SectionLabel
          num="04"
          label="Projects"
          right={<p className="hidden md:block text-muted text-xs border-l-2 border-stroke pl-5">Built from raw problems — shipped as working solutions.</p>}
        />

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* ── Chess card — entrance animation wraps TiltCard ── */}
          {chess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-6"
              style={{ minHeight: '480px' }}
            >
              <motion.div
                layoutId={`proj-${chess.title}`}
                onClick={() => !selectedProject && setSelectedProject(chess)}
                animate={{
                  opacity: selectedProject?.title === chess.title ? 0 : selectedProject ? 0.32 : 1,
                  scale:   selectedProject && selectedProject.title !== chess.title ? 0.97 : 1,
                  filter:  selectedProject && selectedProject.title !== chess.title ? 'blur(3px)' : 'blur(0px)',
                }}
                transition={{ duration: 0.25, layout: { type: 'spring', stiffness: 280, damping: 32 } }}
                style={{ height: '100%', borderRadius: '24px', cursor: selectedProject ? 'default' : 'pointer' }}
              >
              <TiltCard className="relative rounded-3xl overflow-hidden group depth-card w-full" style={{ minHeight: '480px' }}>
                {chess.image
                  ? <img src={chess.image} alt={chess.title} className="absolute inset-0 w-full h-full object-cover object-top" />
                  : <StarfieldCanvas />
                }
                <div className="bg-noise absolute inset-0 opacity-[0.06] mix-blend-overlay z-[1]" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent z-[2]" />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-[2]" />
                <div className="absolute top-5 left-5 z-10">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="liquid-glass text-amber-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-amber-400/30"
                  >
                    In Progress
                  </motion.span>
                </div>
                <div className="absolute top-5 right-5 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {chess.repo && (
                    <a href={chess.repo} target="_blank" rel="noreferrer"
                      className="liquid-glass rounded-full p-2 text-[#f0f2ff] hover:bg-white hover:text-black transition-all">
                      <Github size={14} />
                    </a>
                  )}
                  {chess.link && (
                    <a href={chess.link} target="_blank" rel="noreferrer"
                      className="liquid-glass rounded-full p-2 text-[#f0f2ff] hover:bg-white hover:text-black transition-all">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-9 z-10">
                  <h3 className="font-display italic font-black text-2xl md:text-3xl text-[#f0f2ff] mb-3 group-hover:text-amber-300 transition-colors duration-500"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                    Chess × Recovery Pipeline
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed max-w-md">{chess.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {chess.tags.map((t, i) => (
                      <span key={i} className="liquid-glass text-amber-300/80 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-amber-400/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
              </motion.div>  {/* close layoutId wrapper */}
            </motion.div>
          )}

          {/* ── CS50 card ── */}
          {cs50 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-6"
              style={{ minHeight: '480px' }}
            >
              <motion.div
                layoutId={`proj-${cs50.title}`}
                onClick={() => !selectedProject && setSelectedProject(cs50)}
                animate={{
                  opacity: selectedProject?.title === cs50.title ? 0 : selectedProject ? 0.32 : 1,
                  scale:   selectedProject && selectedProject.title !== cs50.title ? 0.97 : 1,
                  filter:  selectedProject && selectedProject.title !== cs50.title ? 'blur(3px)' : 'blur(0px)',
                }}
                transition={{ duration: 0.25, layout: { type: 'spring', stiffness: 280, damping: 32 } }}
                style={{ height: '100%', borderRadius: '24px', cursor: selectedProject ? 'default' : 'pointer' }}
              >
              <TiltCard className="relative rounded-3xl overflow-hidden group depth-card w-full" style={{ minHeight: '480px' }}>
                {cs50.image
                  ? <img src={cs50.image} alt={cs50.title} className="absolute inset-0 w-full h-full object-cover object-top" />
                  : <div className="absolute inset-0 z-0"><MatrixCanvas /></div>
                }
                <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#020a02] via-[#020a02]/90 to-transparent z-[2]" />
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#020a02]/60 to-transparent z-[2]" />
                <div className="absolute top-5 left-5 z-10">
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="liquid-glass text-amber-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-amber-400/30"
                  >
                    In Progress
                  </motion.span>
                </div>
                <div className="absolute top-5 right-5 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cs50.repo && (
                    <a href={cs50.repo} target="_blank" rel="noreferrer"
                      className="liquid-glass rounded-full p-2 text-[#f0f2ff] hover:bg-white hover:text-black transition-all">
                      <Github size={14} />
                    </a>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-8 z-10">
                  <h3 className="font-display italic font-black text-2xl md:text-3xl text-[#f0f2ff] mb-3 group-hover:text-green-400 transition-colors duration-500">
                    CS50 Problem Sets
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">{cs50.description}</p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-white/50">
                    {['C & Python', 'Data Structures', 'SQL & Web', 'Memory Mgmt'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-green-400 shrink-0" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-5">
                    {cs50.tags.map((t, i) => (
                      <span key={i} className="liquid-glass text-green-400/80 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-green-400/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
              </motion.div>  {/* close layoutId wrapper */}
            </motion.div>
          )}

        </div>

        {/* ── Horizontal project scroll strip ── */}
        {scrollProjects.length > 0 && (
          <div className="mt-14">
            <ProjectScrollStrip items={scrollProjects} selectedProject={selectedProject} onSelect={setSelectedProject} />
          </div>
        )}

        {/* ── Product Teardowns sub-section ── */}
        <div className="overflow-hidden mt-16 mb-8">
          <motion.div
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            <span className="text-accent font-mono text-xs">↳</span>
            <div className="w-6 h-px bg-stroke" />
            <p className="text-xs text-muted uppercase tracking-[0.3em] font-bold">Product Teardowns</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {teardowns.map((t, i) => (
            <TeardownCard key={i} teardown={t} index={i} onOpen={setActive} />
          ))}
        </div>

      </div>

      {/* ── Fullscreen teardown modal ── */}
      <TeardownModal teardown={active} onClose={() => setActive(null)} />

    </section>

    {/* ── Project spotlight overlay + expanded modal ── */}
    <AnimatePresence>
      {selectedProject && (
        <>
          {/* Dark backdrop — click outside to close */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[9984]"
            style={{ background: 'rgba(3,5,16,0.82)', backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedProject(null)}
            aria-hidden
          />
          {/* Expanded spotlight card */}
          <ExpandedProjectModal
            key="modal"
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        </>
      )}
    </AnimatePresence>

    </LayoutGroup>
  )
}

/* ── Teardown Canvas 1: ChatGPT — dense constellation + rapid pulses ──────── */
function NeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    const COLS = ['#10a37f','#34d399','#60a5fa','#a78bfa','#f0f2ff']
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2.8 + 1, phase: Math.random() * Math.PI * 2,
      c: COLS[Math.floor(Math.random() * COLS.length)],
    }))
    const pulses: { fi: number; ti: number; t: number; col: string }[] = []
    const draw = () => {
      const w = canvas.width, h = canvas.height
      ctx.fillStyle = 'rgba(3,8,18,0.2)'; ctx.fillRect(0, 0, w, h)
      // Nebula background
      const g1 = ctx.createRadialGradient(w*.3,h*.4,0,w*.3,h*.4,w*.4)
      g1.addColorStop(0,'rgba(16,163,127,0.07)'); g1.addColorStop(1,'transparent')
      ctx.fillStyle=g1; ctx.fillRect(0,0,w,h)
      const g2 = ctx.createRadialGradient(w*.75,h*.65,0,w*.75,h*.65,w*.35)
      g2.addColorStop(0,'rgba(96,165,250,0.05)'); g2.addColorStop(1,'transparent')
      ctx.fillStyle=g2; ctx.fillRect(0,0,w,h)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.phase += 0.022
        if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1
      })
      // Edges
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < Math.min(i+8, nodes.length); j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y
        const d = Math.sqrt(dx*dx + dy*dy)
        if (d < 110) { ctx.save(); ctx.globalAlpha = (1-d/110) * 0.18
          ctx.strokeStyle = nodes[i].c; ctx.lineWidth = 0.6
          ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke(); ctx.restore() }
      }
      // Pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]; p.t += 0.018; if (p.t >= 1) { pulses.splice(i, 1); continue }
        const x = nodes[p.fi].x + (nodes[p.ti].x - nodes[p.fi].x) * p.t
        const y = nodes[p.fi].y + (nodes[p.ti].y - nodes[p.fi].y) * p.t
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2)
        ctx.fillStyle = p.col; ctx.shadowBlur = 14; ctx.shadowColor = p.col; ctx.fill(); ctx.shadowBlur = 0
      }
      nodes.forEach(n => {
        const pulse = Math.sin(n.phase) * 0.4 + 0.6
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2)
        ctx.fillStyle = n.c; ctx.globalAlpha = pulse
        ctx.shadowBlur = 8; ctx.shadowColor = n.c; ctx.fill(); ctx.shadowBlur = 0; ctx.globalAlpha = 1
      })
      if (Math.random() < 0.1 && pulses.length < 28) {
        const fi = Math.floor(Math.random() * nodes.length); let best = -1, bd = Infinity
        nodes.forEach((n, i) => { if (i === fi) return
          const d = Math.hypot(n.x - nodes[fi].x, n.y - nodes[fi].y)
          if (d < 110 && d < bd) { bd = d; best = i } })
        if (best >= 0) pulses.push({ fi, ti: best, t: 0, col: nodes[fi].c })
      }
      raf = requestAnimationFrame(draw)
    }
    ctx.fillStyle = '#030812'; ctx.fillRect(0, 0, canvas.width, canvas.height); draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block" />
}

/* ── Teardown Canvas 2: Notion — live document being AI-written ───────────── */
function BlockCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number; let t = 0
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    // Document blocks that "type in" sequentially
    const BLOCKS = [
      { type:'h1',  text:'Product Analysis',       col:'#f0f2ff', size:16, bold:true  },
      { type:'h2',  text:'Key Insights',            col:'#d4a843', size:12, bold:true  },
      { type:'p',   text:'100M users · $500M ARR',  col:'#8891b0', size:10, bold:false },
      { type:'p',   text:'AI activation < 10%',     col:'#8891b0', size:10, bold:false },
      { type:'code',text:'cursor.analyze(doc)',      col:'#34d399', size:9,  bold:false },
      { type:'h2',  text:'Growth Levers',           col:'#d4a843', size:12, bold:true  },
      { type:'p',   text:'Paywall at $10/user',      col:'#8891b0', size:10, bold:false },
      { type:'p',   text:'No pre-built templates',   col:'#8891b0', size:10, bold:false },
      { type:'code',text:'model.suggest()',          col:'#34d399', size:9,  bold:false },
    ]
    const LH = 22; const PAD = 18
    let visChars = 0; const TOTAL = BLOCKS.reduce((s,b)=>s+b.text.length,0)
    const draw = () => {
      const w = canvas.width, h = canvas.height; t++
      ctx.fillStyle = 'rgba(8,9,20,0.28)'; ctx.fillRect(0, 0, w, h)
      // Page background hint
      ctx.fillStyle = 'rgba(15,16,30,0.5)'
      ctx.beginPath(); ctx.roundRect(PAD*.5, PAD*.5, w-PAD, h-PAD, 4); ctx.fill()
      // AI glow stripe
      const aiY = ((t*0.4)%(h+40))-20
      const ag = ctx.createLinearGradient(0, aiY-6, 0, aiY+6)
      ag.addColorStop(0,'transparent'); ag.addColorStop(.5,'rgba(212,168,67,0.08)'); ag.addColorStop(1,'transparent')
      ctx.fillStyle = ag; ctx.fillRect(0, aiY-6, w, 12)
      // Slowly reveal chars
      if (visChars < TOTAL && t % 2 === 0) visChars++
      let rendered = 0; let y = PAD + LH
      BLOCKS.forEach(b => {
        if (rendered >= visChars) return
        const show = b.text.slice(0, visChars - rendered)
        rendered += b.text.length; if (!show) return
        ctx.font = `${b.bold?'bold ':''} ${b.size}px 'Space Grotesk',system-ui`
        ctx.fillStyle = b.col
        if (b.type === 'code') {
          ctx.fillStyle = 'rgba(52,211,153,0.12)'
          ctx.beginPath(); ctx.roundRect(PAD-2, y-b.size-1, w-PAD*1.5, b.size+4, 3); ctx.fill()
          ctx.fillStyle = b.col }
        ctx.fillText(show, PAD, y); y += LH
      })
      // Blinking cursor at tip
      if (Math.floor(t/22)%2===0 && visChars < TOTAL) {
        ctx.fillStyle = 'rgba(212,168,67,0.9)'; ctx.fillRect(PAD, y-6, 7, 2) }
      // Loop
      if (visChars >= TOTAL && t % 160 === 0) visChars = 0
      raf = requestAnimationFrame(draw)
    }
    ctx.fillStyle = '#08091e'; ctx.fillRect(0, 0, canvas.width, canvas.height); draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block" />
}

/* ── Teardown Canvas 3: Zepto — delivery network with radiating riders ───── */
function SpeedCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    // Hub dark-kitchen nodes
    const hubs = Array.from({length:5},()=>({ x:Math.random()*.7+.15, y:Math.random()*.7+.15 }))
    // Destination nodes
    const dests = Array.from({length:18},()=>({ x:Math.random(),y:Math.random() }))
    // Active riders
    type Rider = { hx:number;hy:number;dx:number;dy:number;t:number;speed:number;col:string }
    const riders: Rider[] = []
    const COLS=['#7c3aed','#9333ea','#a855f7','#c084fc','#e879f9']
    const spawn = () => {
      const h=hubs[Math.floor(Math.random()*hubs.length)]
      const d=dests[Math.floor(Math.random()*dests.length)]
      riders.push({ hx:h.x,hy:h.y,dx:d.x,dy:d.y,t:0,speed:.006+Math.random()*.01,
        col:COLS[Math.floor(Math.random()*COLS.length)] })
    }
    for(let i=0;i<12;i++) spawn()
    const draw = () => {
      const w=canvas.width,h=canvas.height
      ctx.fillStyle='rgba(3,3,18,0.25)'; ctx.fillRect(0,0,w,h)
      // Background nebula
      const bg=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,w*.55)
      bg.addColorStop(0,'rgba(124,58,237,0.07)'); bg.addColorStop(1,'transparent')
      ctx.fillStyle=bg; ctx.fillRect(0,0,w,h)
      // Destination dots
      dests.forEach(d=>{ ctx.beginPath(); ctx.arc(d.x*w,d.y*h,1.5,0,Math.PI*2)
        ctx.fillStyle='rgba(196,154,255,0.25)'; ctx.fill() })
      // Hub circles
      hubs.forEach(hb=>{ ctx.beginPath(); ctx.arc(hb.x*w,hb.y*h,5,0,Math.PI*2)
        ctx.fillStyle='rgba(124,58,237,0.5)'; ctx.shadowBlur=12; ctx.shadowColor='#7c3aed'; ctx.fill(); ctx.shadowBlur=0 })
      // Riders
      for(let i=riders.length-1;i>=0;i--){
        const r=riders[i]; r.t+=r.speed
        if(r.t>=1){ riders.splice(i,1); spawn(); continue }
        const x=r.hx*w+(r.dx-r.hx)*w*r.t
        const y=r.hy*h+(r.dy-r.hy)*h*r.t
        // Tail
        const tx=r.hx*w+(r.dx-r.hx)*w*Math.max(0,r.t-.12)
        const ty=r.hy*h+(r.dy-r.hy)*h*Math.max(0,r.t-.12)
        const grad=ctx.createLinearGradient(tx,ty,x,y)
        grad.addColorStop(0,'transparent'); grad.addColorStop(1,r.col)
        ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(x,y)
        ctx.strokeStyle=grad; ctx.lineWidth=1.5; ctx.stroke()
        // Rider dot
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2)
        ctx.fillStyle=r.col; ctx.shadowBlur=10; ctx.shadowColor=r.col; ctx.fill(); ctx.shadowBlur=0 }
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#030312'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block" />
}

/* ── Teardown Canvas 4: Sarvam AI — Indic scripts rising through wave field ─ */
function WaveCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!; let raf: number; let t = 0
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    // Unicode chars from Devanagari, Tamil, Telugu, Bengali
    const SCRIPTS = ['अ','आ','इ','क','ग','न','म','र','स','ह','ā','த','ந','ம','వ','క','ন','ম','র','স','ਅ','ਕ','ਨ','ਮ','ਰ']
    const chars = Array.from({length:40},()=>({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height+canvas.height*.5,
      vy:-.3-Math.random()*.5, ch:SCRIPTS[Math.floor(Math.random()*SCRIPTS.length)],
      a:Math.random()*.7+.2, size:11+Math.random()*9, phase:Math.random()*Math.PI*2,
      col:Math.random()>.5?'#F97316':Math.random()>.5?'#FCD34D':'#FB923C',
    }))
    const layers = [
      {freq:.016,amp:32,speed:.022,a:.55,w:2,col:'#F97316'},
      {freq:.028,amp:20,speed:.038,a:.35,w:1.2,col:'#FB923C'},
      {freq:.011,amp:42,speed:.014,a:.2, w:2.8,col:'#F97316'},
      {freq:.038,amp:14,speed:.06, a:.18,w:.8, col:'#FCD34D'},
    ]
    const draw = () => {
      const w=canvas.width,h=canvas.height; t++
      ctx.fillStyle='rgba(3,6,14,0.2)'; ctx.fillRect(0,0,w,h)
      // Wave layers
      layers.forEach((l,li)=>{
        ctx.beginPath()
        for(let x=0;x<=w;x+=2){
          const y=h*.5+Math.sin(x*l.freq+t*l.speed+li*.8)*l.amp+Math.sin(x*l.freq*2.1+t*l.speed*1.3)*l.amp*.35
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y) }
        ctx.strokeStyle=l.col; ctx.lineWidth=l.w; ctx.globalAlpha=l.a
        ctx.shadowBlur=10; ctx.shadowColor=l.col; ctx.stroke(); ctx.shadowBlur=0; ctx.globalAlpha=1 })
      // Script chars
      chars.forEach(c=>{ c.y+=c.vy; c.phase+=.025
        if(c.y<-30){ c.y=h+30; c.x=Math.random()*w }
        // Glow when near wave peaks
        const waveY=h*.5+Math.sin(c.x*.016+t*.022)*32
        const onWave=Math.abs(c.y-waveY)<25
        ctx.save(); ctx.globalAlpha=c.a*(Math.sin(c.phase)*.25+.75)
        ctx.font=`${c.size}px serif`; ctx.fillStyle=c.col
        if(onWave){ctx.shadowBlur=14;ctx.shadowColor=c.col}
        ctx.fillText(c.ch,c.x,c.y); ctx.restore() })
      raf=requestAnimationFrame(draw) }
    ctx.fillStyle='#03060e'; ctx.fillRect(0,0,canvas.width,canvas.height); draw()
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block" />
}

const CARD_CANVASES = [NeuralCanvas, BlockCanvas, SpeedCanvas, WaveCanvas]

/* ── TeardownCard ────────────────────────────────────────────────────────── */
function TeardownCard({ teardown, index, onOpen }: {
  teardown: Teardown; index: number; onOpen: (t: Teardown) => void
}) {
  const { ref, boxShadow } = useProximityGlow(220)

  const inView = useInView(ref, { once: true, amount: 0 })

  return (
    <motion.div
      ref={ref}
      style={{ boxShadow }}
      initial={false}
      animate={{
        clipPath: inView
          ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
          : 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
        opacity: inView ? 1 : 0,
      }}
      transition={{ duration: 0.65, delay: inView ? index * 0.09 : 0, ease: [0.76, 0, 0.24, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => onOpen(teardown)}
      className="md:col-span-6 relative bg-[#080d1e] border border-stroke rounded-2xl p-7 cursor-pointer group hover:border-accent/40 transition-colors duration-300 flex flex-col gap-5 overflow-hidden"
      data-cursor="pointer"
    >
      {/* Background — image if available, canvas otherwise */}
      {teardown.image
        ? <img src={teardown.image} alt={teardown.product} className="absolute inset-0 w-full h-full object-cover object-top" />
        : (() => { const Canvas = CARD_CANVASES[index % CARD_CANVASES.length]; return <Canvas /> })()
      }
      {/* Dark scrim so text stays readable */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(8,13,30,0.72)' }} />

      <div className="relative z-10 flex flex-col gap-5 flex-1">
        {/* Label + number */}
        <div className="flex items-center justify-between">
          <span className="text-accent text-[9px] uppercase tracking-[0.4em] font-bold">Product Teardown</span>
          <span className="font-display italic font-black text-4xl text-accent/15 leading-none select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Product name */}
        <div className="overflow-hidden">
          <motion.h3
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.06 + 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display italic font-black text-2xl md:text-3xl text-[#f0f2ff] group-hover:text-accent transition-colors duration-300"
          >
            {teardown.product}
          </motion.h3>
        </div>

        {/* Description */}
        <p className="text-muted text-sm leading-relaxed flex-1">{teardown.description}</p>

        {/* Tags + CTA */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {teardown.tags.map((tag, j) => (
              <span key={j} className="liquid-glass text-accent/70 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-accent/15">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider shrink-0 group-hover:gap-2.5 transition-all">
            Read <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── TeardownModal ───────────────────────────────────────────────────────── */
function TeardownModal({ teardown, onClose }: { teardown: Teardown | null; onClose: () => void }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!teardown) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [teardown, onClose])

  /* Relay mousemove from the iframe's document to the parent window
     so the custom cursor keeps tracking inside the teardown */
  const onIframeLoad = () => {
    try {
      const iframe = iframeRef.current
      if (!iframe) return
      const doc = iframe.contentDocument
      if (!doc) return
      doc.body.style.cursor = 'none'          // hide default cursor inside iframe
      doc.addEventListener('mousemove', ev => {
        const rect = iframe.getBoundingClientRect()
        window.dispatchEvent(new MouseEvent('mousemove', {
          clientX: ev.clientX + rect.left,
          clientY: ev.clientY + rect.top,
          bubbles: true,
        }))
      })
    } catch { /* cross-origin safety */ }
  }

  return (
    <AnimatePresence>
      {teardown && (
        <motion.div
          key="teardown-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9990] flex flex-col"
          style={{ background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center justify-between px-6 py-4 border-b border-stroke shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-accent text-[10px] uppercase tracking-widest font-bold">Product Teardown</span>
              <span className="w-px h-4 bg-stroke" />
              <span className="font-display italic font-black text-[#f0f2ff] text-lg">{teardown.product}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg liquid-glass flex items-center justify-center text-muted hover:text-[#f0f2ff] transition-colors"
              data-cursor="pointer"
            >
              <X size={16} />
            </button>
          </motion.div>

          {/* iframe */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="flex-1 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {teardown.file ? (
              <iframe
                ref={iframeRef}
                src={teardown.file}
                className="w-full h-full border-none"
                title={`${teardown.product} Teardown`}
                onLoad={onIframeLoad}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center px-8">
                <span className="text-6xl">♞</span>
                <p className="text-[#f0f2ff] font-bold text-lg">Teardown coming soon</p>
                <p className="text-muted text-sm max-w-sm">
                  Drop your HTML file into <code className="text-accent">public/teardowns/</code> and
                  set the <code className="text-accent">file</code> path in <code className="text-accent">portfolio.ts</code>
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
