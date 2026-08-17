import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import PageLoader from '../ui/PageLoader'
import CommandPalette from '../ui/CommandPalette'
import { ACCENTS, useSettingsStore } from '../../store/settingsStore'

const EASE = [0.16, 1, 0.3, 1]

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}
const PAGE_TRANSITION = { duration: 0.3, ease: [0.16, 1, 0.3, 1] }

export default function Layout() {
  const accent = useSettingsStore((s) => s.accent)
  const location = useLocation()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const c = ACCENTS[accent] || ACCENTS.blue
    const root = document.documentElement
    root.style.setProperty('--color-accent', c.accent)
    root.style.setProperty('--color-accent-strong', c.strong)
  }, [accent])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <main>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={PAGE_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={PAGE_TRANSITION}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />

      <CommandPalette />

      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            onClick={backToTop}
            initial={{ opacity: 0, y: 16, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.85 }}
            transition={{ duration: 0.3, ease: EASE }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Back to top"
            title="Back to top"
            className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-elevated/80 text-sub shadow-xl backdrop-blur-md transition-all duration-200 hover:border-accent/50 hover:text-accent hover:shadow-[0_0_18px_-4px_var(--color-accent)]"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
