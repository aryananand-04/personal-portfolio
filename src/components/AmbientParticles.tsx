import { useEffect, useRef } from 'react'

export default function AmbientParticles() {
  const ref    = useRef<HTMLCanvasElement>(null)
  const cursor = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number

    const setup = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      cursor.current = { x: canvas.width / 2, y: canvas.height / 2 }
    }
    setup()

    const pts = Array.from({ length: 55 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      a:  Math.random() * 0.18 + 0.04,
      da: (Math.random() - 0.5) * 0.002,
    }))

    const draw = () => {
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      pts.forEach(p => {
        /* Gentle cursor attraction (5% pull, only within 350px) */
        const cdx  = cursor.current.x - p.x
        const cdy  = cursor.current.y - p.y
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy)
        if (cdist > 0 && cdist < 350) {
          p.vx += (cdx / cdist) * 0.004
          p.vy += (cdy / cdist) * 0.004
        }

        /* Velocity damping so particles don't cluster permanently */
        p.vx *= 0.98
        p.vy *= 0.98

        /* Cap speed */
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 0.38) { p.vx *= 0.38 / speed; p.vy *= 0.38 / speed }

        p.x += p.vx; p.y += p.vy
        p.a  = Math.max(0.03, Math.min(0.22, p.a + p.da))
        if (p.a >= 0.22 || p.a <= 0.03) p.da *= -1

        if (p.x < -5)    p.x = w + 5
        if (p.x > w + 5) p.x = -5
        if (p.y < -5)    p.y = h + 5
        if (p.y > h + 5) p.y = -5

        ctx.save()
        ctx.globalAlpha = p.a
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = '#d4a843'
        ctx.shadowBlur = 8
        ctx.shadowColor = 'rgba(212,168,67,0.6)'
        ctx.fill()
        ctx.restore()
      })

      raf = requestAnimationFrame(draw)
    }

    draw()

    const onMove  = (e: MouseEvent) => { cursor.current = { x: e.clientX, y: e.clientY } }
    const onResize = () => setup()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize',    onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize',    onResize)
    }
  }, [])

  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-[1]" aria-hidden />
}
