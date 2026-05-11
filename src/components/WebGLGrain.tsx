import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv * 820.0;
  float grain = hash(uv + mod(uTime * 13.0, 100.0));
  gl_FragColor = vec4(vec3(grain), grain * 0.085);
}
`

function shader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src); gl.compileShader(s); return s
}

/* ── Idea #17: Grain blooms when a new section enters the viewport ────────── */
export default function WebGLGrain() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, shader(gl, gl.VERTEX_SHADER,   VERT))
    gl.attachShader(prog, shader(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'uTime')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf: number, t = 0
    const draw = () => {
      t += 0.016
      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(draw)
    }
    draw()

    /* Bloom: pulse canvas opacity up then down when any section enters viewport */
    let bloomTimer: ReturnType<typeof setTimeout> | null = null
    const sections = document.querySelectorAll('section')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        if (bloomTimer) clearTimeout(bloomTimer)
        canvas.style.transition = 'opacity 0.35s ease-out'
        canvas.style.opacity    = '0.28'
        bloomTimer = setTimeout(() => {
          canvas.style.transition = 'opacity 1.4s ease-in'
          canvas.style.opacity    = '0.07'
        }, 350)
      })
    }, { threshold: 0.12 })
    sections.forEach(s => obs.observe(s))

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      obs.disconnect()
      gl.deleteProgram(prog)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-[9997]"
      style={{ mixBlendMode: 'overlay', opacity: 0.07 }}
      aria-hidden
    />
  )
}
