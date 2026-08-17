import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X, Star, ArrowUpRight, Sparkles } from 'lucide-react'
import { tmdbImage } from '../../lib/images'
import SmartImage from './SmartImage'
import AnimatedList, { AnimatedListItem } from './AnimatedList'

function TypeBadge({ mediaType }) {
  return (
    <span
      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
        mediaType === 'tv' ? 'bg-white/10 text-sub' : 'bg-accent/15 text-accent'
      }`}
    >
      {mediaType === 'tv' ? 'TV' : 'Movie'}
    </span>
  )
}

export default function SearchBox({
  query,
  onChange,
  results = [],
  loading = false,
  autoFocus = false,
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  const items = results.slice(0, 8)
  const hasQuery = query.trim().length > 0

  const querySig = query.trim()
  const [lastQuerySig, setLastQuerySig] = useState(querySig)
  if (querySig !== lastQuerySig) {
    setLastQuerySig(querySig)
    setActive(-1)
    if (hasQuery) setOpen(true)
  }

  const resultsSig = results.length
  const [lastResultsSig, setLastResultsSig] = useState(resultsSig)
  if (resultsSig !== lastResultsSig) {
    setLastResultsSig(resultsSig)
    setActive(-1)
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const go = (item) => {
    setOpen(false)
    navigate(`/${item.media_type}/${item.id}`)
  }

  const onKeyDown = (e) => {
    if (!open || items.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      go(items[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="group relative flex items-center rounded-2xl border border-white/12 bg-surface/70 px-4 py-1.5 backdrop-blur-xl transition-all duration-300 focus-within:border-accent focus-within:bg-elevated/90 focus-within:shadow-[0_0_24px_-4px_var(--color-accent)]">
        <SearchIcon
          size={20}
          strokeWidth={1.75}
          className="shrink-0 text-mute transition-colors duration-200 group-focus-within:text-accent"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => hasQuery && setOpen(true)}
          placeholder="Search films, series, actors..."
          autoFocus={autoFocus}
          aria-label="Search"
          aria-expanded={open}
          className="h-11 w-full bg-transparent px-3 text-[15px] text-ink placeholder:text-mute focus:outline-none"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onChange('')
                inputRef.current?.focus()
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-mute transition-colors hover:bg-white/10 hover:text-ink"
            >
              <X size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Command-Palette Style Dropdown Overlay */}
      <AnimatePresence>
        {open && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full z-40 mt-2.5 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c10]/95 shadow-2xl shadow-black/80 backdrop-blur-2xl"
          >
            {/* Header / Category Label */}
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-accent" />
                Suggested Matches
              </span>
              {loading && <span className="animate-pulse text-accent">Searching…</span>}
            </div>

            {/* Results List */}
            <AnimatedList className="max-h-[380px] overflow-y-auto p-1.5" stagger={0.03}>
              {items.map((item, i) => {
                const isSelected = i === active
                return (
                  <AnimatedListItem
                    key={`${item.media_type}-${item.id}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      go(item)
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-all duration-150 ${
                      isSelected
                        ? 'bg-white/[0.09] text-white shadow-sm'
                        : 'text-sub hover:bg-white/[0.05] hover:text-ink'
                    }`}
                  >
                    {/* Poster thumbnail */}
                    <div className="relative h-13 w-9 shrink-0 overflow-hidden rounded-md bg-elevated shadow-sm">
                      <SmartImage
                        src={tmdbImage(item.poster_path, 'w92')}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        draggable={false}
                        fallback={<span className="text-[9px] text-mute">{item.year || '—'}</span>}
                      />
                    </div>

                    {/* Title & Metadata */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium tracking-[-0.01em] text-ink">
                        {item.title}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-mute">
                        <span>{item.year || 'Unknown'}</span>
                        {item.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-400/90">
                            <Star className="h-2.5 w-2.5 fill-amber-400/90 text-amber-400/90" />
                            {item.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TypeBadge mediaType={item.media_type} />
                      <ArrowUpRight className="h-3.5 w-3.5 text-mute opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </AnimatedListItem>
                )
              })}
            </AnimatedList>

            {/* Keyboard hints footer */}
            <div className="flex items-center justify-between border-t border-white/8 bg-black/40 px-4 py-2 text-[11px] text-mute">
              <span>
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px]">↑↓</kbd> navigate ·{' '}
                <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px]">↵</kbd> select
              </span>
              <kbd className="rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px]">esc</kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
