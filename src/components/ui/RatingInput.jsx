import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'

/**
 * Interactive 10-point rating input rendered as 5 animated stars with hover feedback.
 */
export default function RatingInput({ value = 0, onChange, className = '' }) {
  const [hovered, setHovered] = useState(null)
  const currentStar = Math.round(value / 2)
  const activeStar = hovered !== null ? hovered : currentStar
  const activeScore = hovered !== null ? hovered * 2 : value

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= activeStar
          return (
            <motion.button
              key={star}
              type="button"
              aria-label={`Rate ${star * 2} out of 10`}
              aria-pressed={star <= currentStar}
              title={`${star * 2}/10`}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHovered(star)}
              onClick={() => {
                const targetScore = star * 2
                onChange(targetScore === value ? 0 : targetScore)
              }}
              className="p-1 transition-colors duration-150 focus:outline-none"
            >
              <Star
                size={20}
                strokeWidth={1.5}
                fill={filled ? 'currentColor' : 'none'}
                className={`transition-all duration-200 ${
                  filled
                    ? 'text-accent drop-shadow-[0_0_8px_var(--color-accent)]'
                    : 'text-white/20 hover:text-white/50'
                }`}
              />
            </motion.button>
          )
        })}
      </div>

      {/* Active / Hover Score Readout */}
      <AnimatePresence mode="wait">
        {activeScore > 0 && (
          <motion.div
            key={activeScore}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 pl-1"
          >
            <span
              className={`rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                hovered !== null
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-white/10 text-white'
              }`}
            >
              {activeScore}/10
            </span>

            {value > 0 && hovered === null && (
              <button
                type="button"
                aria-label="Clear rating"
                onClick={() => onChange(0)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-mute transition-colors hover:bg-white/10 hover:text-ink"
              >
                <X size={12} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
