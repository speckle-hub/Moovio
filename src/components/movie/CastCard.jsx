import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { tmdbImage } from '../../lib/images'
import SmartImage from '../ui/SmartImage'

export default function CastCard({ person }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
      <Link to={`/person/${person.id}`} className="group block w-[116px] shrink-0 select-none">
        <div className="relative aspect-square overflow-hidden rounded-full border border-white/10 bg-elevated shadow-md transition-all duration-300 group-hover:border-accent/40 group-hover:shadow-[0_0_18px_-4px_var(--color-accent)]">
          <SmartImage
            src={tmdbImage(person.profile_path, 'w185')}
            alt={person.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
            draggable={false}
            fallback={
              <span className="font-display text-xl font-semibold text-white/15">
                {person.name?.slice(0, 1)}
              </span>
            }
          />
        </div>
        <p className="mt-3 truncate text-center text-[13px] font-medium tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
          {person.name}
        </p>
        <p className="mt-0.5 truncate text-center text-xs text-mute">
          {person.character}
        </p>
      </Link>
    </motion.div>
  )
}
