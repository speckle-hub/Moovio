import { motion } from 'framer-motion'

const VARIANTS = {
  primary:
    'bg-ink text-black hover:bg-white shadow-[0_1px_2px_rgba(0,0,0,0.5)]',
  secondary: 'bg-white/8 text-ink hover:bg-white/12',
  ghost: 'text-sub hover:text-ink',
  accent: 'bg-accent text-white hover:bg-accent-strong',
}

const SIZES = {
  sm: 'h-8 px-4 text-[13px]',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
}

const EASE = [0.16, 1, 0.3, 1]

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-[-0.01em] transition-colors duration-300 select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none'

const GLOW =
  'transition-[box-shadow,color,background-color,border-color] duration-500 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_40px_-12px_rgba(0,0,0,0.75),0_0_28px_var(--color-accent)]'

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  glow = false,
  className = '',
  children,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: EASE }}
      className={`${BASE} ${glow ? GLOW : ''} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
      {iconRight}
    </motion.button>
  )
}
