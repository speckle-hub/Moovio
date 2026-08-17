import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useFocusTrap } from '../../lib/hooks'

const EASE = [0.16, 1, 0.3, 1]

export default function TrailerModal({ open, youtubeKey, title, onClose }) {
  const dialogRef = useRef(null)
  useFocusTrap(dialogRef, open)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${title || 'Trailer'}`}
        >
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.94, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative w-full max-w-4xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close trailer"
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-sub transition-colors hover:text-ink"
            >
              <X size={17} />
            </button>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
              {youtubeKey && (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&rel=0`}
                  title={title ? `${title} trailer` : 'Trailer'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
