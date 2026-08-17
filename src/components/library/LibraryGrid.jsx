import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronDown, Sparkles } from 'lucide-react'
import PosterGrid from '../movie/PosterGrid'
import EmptyState from '../ui/EmptyState'

const SORTS = [
  { label: 'Recently Added', value: 'added' },
  { label: 'Rating', value: 'rating' },
  { label: 'Release Year', value: 'year' },
  { label: 'Title (A-Z)', value: 'title' },
]

export default function LibraryGrid({
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  removeKind = 'watchlist',
  onRemove,
}) {
  const [mediaFilter, setMediaFilter] = useState('all')
  const [sortBy, setSortBy] = useState('added')
  const [desc, setDesc] = useState(true)

  const visible = useMemo(() => {
    const filtered = items.filter(
      (i) => mediaFilter === 'all' || i.media_type === mediaFilter,
    )
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'year':
          return (b.year || 0) - (a.year || 0)
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        default:
          return (b.addedAt || 0) - (a.addedAt || 0)
      }
    })
    return desc ? sorted : sorted.reverse()
  }, [items, mediaFilter, sortBy, desc])

  const mediaTabs = [
    { value: 'all', label: 'All' },
    { value: 'movie', label: 'Movies' },
    { value: 'tv', label: 'TV Series' },
  ]

  return (
    <div>
      {items.length > 0 && (
        <div className="container-x mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          {/* Media Type Tabs with sliding pill indicator */}
          <div className="relative flex items-center rounded-full border border-hairline bg-surface/60 p-1 backdrop-blur-md">
            {mediaTabs.map((tab) => {
              const active = mediaFilter === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setMediaFilter(tab.value)}
                  className={`relative z-10 h-8 rounded-full px-4 text-[13px] font-medium transition-colors duration-200 ${
                    active ? 'text-white' : 'text-sub hover:text-ink'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="libraryMediaTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full border border-accent/40 bg-accent text-white shadow-[0_0_16px_-2px_var(--color-accent)]"
                    />
                  )}
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Sort selector & direction toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort by"
                className="h-8 cursor-pointer appearance-none rounded-full border border-hairline bg-surface/60 pl-3.5 pr-8 text-[12.5px] font-medium text-sub transition-all duration-200 hover:border-white/25 hover:text-ink focus:border-accent focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-elevated text-ink">
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-mute" />
            </div>

            <motion.button
              type="button"
              onClick={() => setDesc((d) => !d)}
              whileTap={{ scale: 0.92 }}
              aria-label={desc ? 'Sort ascending' : 'Sort descending'}
              title={desc ? 'Sort ascending' : 'Sort descending'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface/60 text-sub transition-all duration-200 hover:border-white/25 hover:text-ink hover:scale-105"
            >
              {desc ? <ArrowDownWideNarrow size={14} /> : <ArrowUpNarrowWide size={14} />}
            </motion.button>

            <span className="ml-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-mute">
              {visible.length}
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {visible.length === 0 ? (
          <motion.div
            key="empty-library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {items.length === 0 ? (
              <EmptyState
                icon={emptyIcon}
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
              />
            ) : (
              <EmptyState
                icon={Sparkles}
                title="Nothing matches these filters"
                description="Try switching to another media category or changing the sort direction."
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${mediaFilter}-${sortBy}-${desc}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PosterGrid
              items={visible}
              loading={false}
              showRemove
              removeKind={removeKind}
              onRemove={onRemove}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
