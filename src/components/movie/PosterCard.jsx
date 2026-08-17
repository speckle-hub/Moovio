import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Heart, Info, Trash2, Star } from 'lucide-react'
import { tmdbImage, tmdbSrcset } from '../../lib/images'
import { useLibraryStore } from '../../store/libraryStore'
import SmartImage from '../ui/SmartImage'

const EASE = [0.16, 1, 0.3, 1]

export default function PosterCard({ item, index = 0, showRemove = false, removeKind = 'watchlist', onRemove }) {
  const { toggleFavorite, toggleWatchlist, inFavorites } = useLibraryStore()
  const favorite = inFavorites(item.id, item.media_type)
  const href = `/${item.media_type || 'movie'}/${item.id}`
  const prefersReduced = useReducedMotion()

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const spring = { stiffness: 260, damping: 22 }
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), spring)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), spring)

  const onMouseMove = (e) => {
    if (prefersReduced) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  const onMouseLeave = () => {
    mx.set(0.5)
    my.set(0.5)
  }

  const entry = {
    tmdb_id: item.id,
    media_type: item.media_type ?? 'movie',
    title: item.title,
    poster_path: item.poster_path,
    year: item.year,
    rating: item.rating,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4), ease: EASE }}
      whileHover={{ y: -8, scale: prefersReduced ? 1.02 : 1.04 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={prefersReduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className="group relative aspect-[2/3] overflow-hidden rounded-poster bg-elevated shadow-lg will-change-transform"
    >
      <Link to={href} className="absolute inset-0" aria-label={item.title}>
        <SmartImage
          src={tmdbImage(item.poster_path, 'w342')}
          srcSet={tmdbSrcset(item.poster_path, ['w185', 'w342', 'w500'])}
          sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw"
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
          draggable={false}
          fallback={
            <span className="font-display text-4xl font-semibold text-white/15">
              {item.title?.slice(0, 1)}
            </span>
          }
        />
      </Link>

      {/* Vignette fade for mobile & desktop hover */}
      <div className="pointer-events-none absolute inset-0 poster-fade opacity-100 transition-opacity duration-500 sm:opacity-0 sm:group-hover:opacity-100" />

      {/* Progress tracking indicator */}
      {typeof item.progress === 'number' && (
        <div className="absolute inset-x-0 bottom-0 z-10 h-[3px] bg-white/20">
          <div
            className="h-full bg-accent"
            style={{ width: `${Math.min(100, Math.max(0, item.progress * 100))}%` }}
          />
        </div>
      )}

      {/* Top action buttons: Favorite toggle & Rating badge */}
      <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between pointer-events-none">
        {item.rating > 0 ? (
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md shadow-sm transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span>{typeof item.rating === 'number' ? item.rating.toFixed(1) : item.rating}</span>
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite(entry)
          }}
          className={`pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${
            favorite
              ? 'border-accent/40 bg-accent/25 text-accent shadow-[0_0_12px_-2px_var(--color-accent)]'
              : 'border-white/10 bg-black/45 text-white sm:opacity-0 sm:group-hover:opacity-100 hover:border-white/30 hover:bg-black/60'
          }`}
        >
          <Heart size={14} fill={favorite ? 'currentColor' : 'none'} strokeWidth={1.75} />
        </button>
      </div>

      {/* Bottom Kokonut-style frosted glass info card overlay */}
      <div className="absolute inset-x-2 bottom-2 z-10 overflow-hidden rounded-xl border border-white/10 bg-black/60 p-3 shadow-2xl backdrop-blur-xl transition-all duration-400 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[13.5px] font-semibold tracking-[-0.01em] text-ink">
              {item.title}
            </h3>
            <p className="mt-0.5 text-xs text-sub">{item.year || '—'}</p>
          </div>

          <div className="flex items-center gap-1.5">
            {showRemove ? (
              <button
                type="button"
                aria-label={`Remove ${item.title} from my list`}
                onClick={(e) => {
                  e.preventDefault()
                  if (onRemove) onRemove(entry)
                  else if (removeKind === 'favorite') toggleFavorite(entry)
                  else toggleWatchlist(entry)
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sub transition-all hover:scale-105 hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 size={13} strokeWidth={1.75} />
              </button>
            ) : (
              <Link
                to={href}
                aria-label={`More about ${item.title}`}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sub transition-all hover:scale-105 hover:border-white/30 hover:bg-white/15 hover:text-ink"
              >
                <Info size={13} strokeWidth={1.75} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
