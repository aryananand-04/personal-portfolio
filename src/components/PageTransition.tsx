import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Ctx { go: (href: string) => void }
const TransitionCtx = createContext<Ctx>({ go: () => {} })
export const usePageTransition = () => useContext(TransitionCtx)

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  const go = useCallback((href: string) => {
    setVisible(true)
    setTimeout(() => {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'instant' })
      setTimeout(() => setVisible(false), 380)
    }, 380)
  }, [])

  return (
    <TransitionCtx.Provider value={{ go }}>
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            key="curtain"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9996] pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, #050816 0%, #0d1120 30%, #d4a843 45%, #f5d78a 50%, #d4a843 55%, #0d1120 70%, #050816 100%)',
            }}
          />
        )}
      </AnimatePresence>
    </TransitionCtx.Provider>
  )
}
