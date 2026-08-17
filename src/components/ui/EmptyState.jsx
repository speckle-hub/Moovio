import { motion } from 'framer-motion'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  const renderedIcon =
    typeof Icon === 'function' ? <Icon size={26} strokeWidth={1.5} /> : Icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center px-6 py-20 text-center ${className}`}
    >
      {renderedIcon && (
        <div className="relative mb-6 flex items-center justify-center">
          {/* Ambient colored background pulse */}
          <div className="absolute h-24 w-24 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
          
          {/* Outer ring */}
          <div className="relative flex h-18 w-18 items-center justify-center rounded-3xl border border-white/10 bg-surface/80 p-4 shadow-2xl shadow-black/60 backdrop-blur-xl transition-transform duration-300 hover:scale-105">
            {/* Inner accent badge */}
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent shadow-[0_0_20px_-4px_var(--color-accent)]">
              {renderedIcon}
            </div>
          </div>
        </div>
      )}

      <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h3>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-sub">
          {description}
        </p>
      )}

      {action && <div className="mt-7">{action}</div>}
    </motion.div>
  )
}
