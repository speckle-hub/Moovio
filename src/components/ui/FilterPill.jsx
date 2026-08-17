import { motion } from 'framer-motion'

export default function FilterPill({
  active = false,
  onClick,
  children,
  icon = null,
  count = null,
  size = 'md',
  className = '',
}) {
  const sizeClasses =
    size === 'sm'
      ? 'h-8 px-3.5 text-[12.5px] gap-1.5'
      : 'h-9 px-4 text-[13px] gap-2'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full border font-medium transition-colors select-none ${sizeClasses} ${
        active
          ? 'border-accent bg-accent text-white shadow-[0_0_16px_-2px_var(--color-accent)]'
          : 'border-hairline bg-surface/50 text-sub hover:border-white/25 hover:bg-surface hover:text-ink'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {count !== null && count > 0 && (
        <span
          className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
            active
              ? 'bg-white/25 text-white'
              : 'bg-white/10 text-sub group-hover:text-ink'
          }`}
        >
          {count}
        </span>
      )}
    </motion.button>
  )
}
