import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (custom = { delay: 0, stagger: 0.035 }) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.delay || 0,
      staggerChildren: custom.stagger || 0.035,
    },
  }),
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 28,
    },
  },
}

export default function AnimatedList({
  children,
  className = '',
  stagger = 0.035,
  delay = 0,
  as = 'div',
}) {
  const Component = motion[as] || motion.div

  return (
    <Component
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={{ delay, stagger }}
      className={className}
    >
      {children}
    </Component>
  )
}

export function AnimatedListItem({ children, className = '', as = 'div', ...props }) {
  const Component = motion[as] || motion.div

  return (
    <Component variants={itemVariants} className={className} {...props}>
      {children}
    </Component>
  )
}
