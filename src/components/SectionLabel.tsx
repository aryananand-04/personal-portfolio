import { motion } from 'framer-motion'

/* ── Idea #15: Cinema-curtain gold line — expands from center outward ────── */
export function GoldLine() {
  return (
    <div className="relative h-px overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-accent"
        style={{ originX: '50%' }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

/* Two bars that sweep outward from center — use inside a relative container */
export function CurtainReveal({ delay = 0 }: { delay?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 bg-[#050816]"
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.75, delay, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: 'right' }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 bg-[#050816]"
        initial={{ scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.75, delay, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  )
}

/* Section label with per-character stagger on the text */
interface Props {
  num: string
  label: string
  right?: React.ReactNode
}

export default function SectionLabel({ num, label, right }: Props) {
  return (
    <div className="overflow-hidden mb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="text-accent font-mono text-sm"
          >
            {num}
          </motion.span>

          <div className="w-8 h-px bg-stroke" />

          {/* Character stagger on label text */}
          <h2 className="text-base md:text-lg text-[#f0f2ff] uppercase tracking-[0.25em] font-bold flex">
            {label.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: 6, skewX: -8 }}
                whileInView={{ opacity: 1, y: 0, skewX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.015, ease: [0.16, 1, 0.3, 1] }}
              >
                {ch === ' ' ? ' ' : ch}
              </motion.span>
            ))}
          </h2>
        </div>

        {right && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {right}
          </motion.div>
        )}
      </div>
    </div>
  )
}
