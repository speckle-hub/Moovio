import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  Home,
  Film,
  Tv,
  List,
  Heart,
  Bookmark,
  BarChart3,
  Shuffle,
} from 'lucide-react'
import { fetchRandomTitle, fetchSearch } from '../../lib/tmdb'
import { useAsync, useDebouncedValue, useFocusTrap } from '../../lib/hooks'
import { ACCENTS, useSettingsStore } from '../../store/settingsStore'
import { tmdbImage } from '../../lib/images'
import SmartImage from './SmartImage'

const EASE = [0.16, 1, 0.3, 1]

const ACTIONS = [
  { id: 'home', label: 'Go to Home', to: '/', icon: Home },
  { id: 'movies', label: 'Browse Movies', to: '/movies', icon: Film },
  { id: 'tv', label: 'Browse TV', to: '/tv', icon: Tv },
  { id: 'search', label: 'Open Search', to: '/search', icon: Search },
  { id: 'watchlist', label: 'My List', to: '/watchlist', icon: Bookmark },
  { id: 'favorites', label: 'Favorites', to: '/favorites', icon: Heart },
  { id: 'lists', label: 'Lists', to: '/lists', icon: List },
  { id: 'stats', label: 'Your Stats', to: '/stats', icon: BarChart3 },
  { id: 'surprise', label: 'Surprise me', kind: 'surprise', icon: Shuffle },
]

function TypeBadge({ mediaType }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
        mediaType === 'tv' ? 'bg-white/10 text-sub' : 'bg-accent/15 text-accent'
      }`}
    >
      {mediaType === 'tv' ? 'TV' : 'Movie'}
    </span>
  )
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const navigate = useNavigate()
  const setAccent = useSettingsStore((s) => s.setAccent)
  const debounced = useDebouncedValue(query.trim(), 350)

  const { data, loading } = useAsync(
    () => (debounced ? fetchSearch(debounced) : Promise.resolve({ items: [] })),
    ['palette-search', debounced],
  )
  const results = data?.items || []

  useFocusTrap(panelRef, open)

  const [prevOpen, setPrevOpen] = useState(false)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setQuery('')
      setActive(-1)
    }
  }

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      } else if (e.key === '/' && !open) {
        const t = e.target
        const editable =
          t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
        if (!editable) {
          e.preventDefault()
          setOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const hasQuery = debounced.length > 0
  const searching = hasQuery && loading
  const searchItem = hasQuery
    ? [{ id: 'go-search', label: `Search "${debounced}"`, kind: 'gosearch', icon: Search }]
    : []
  const surpriseItem = hasQuery
    ? []
    : [ACTIONS.find((a) => a.id === 'surprise')]
  const items = [
    ...searchItem,
    ...ACTIONS.filter((a) => a.id !== 'surprise'),
    ...results.map((r) => ({
      id: `result-${r.media_type}-${r.id}`,
      label: r.title,
      kind: 'result',
      item: r,
    })),
    ...surpriseItem,
  ]

  const close = () => setOpen(false)

  const go = async (entry) => {
    if (entry.kind === 'gosearch') {
      close()
      navigate(`/search?q=${encodeURIComponent(debounced)}`)
      return
    }
    if (entry.kind === 'surprise') {
      if (busy) return
      setBusy(true)
      try {
        const item = await fetchRandomTitle()
        if (item) navigate(`/${item.media_type}/${item.id}`)
      } finally {
        setBusy(false)
        close()
      }
      return
    }
    if (entry.kind === 'result') {
      close()
      navigate(`/${entry.item.media_type}/${entry.item.id}`)
      return
    }
    close()
    navigate(entry.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      go(items[active])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-4 pt-[18vh] backdrop-blur-sm"
          onMouseDown={close}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0e]/95 shadow-2xl shadow-black/70 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-5">
              <Search size={18} strokeWidth={1.75} className="text-mute" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search films, series, or type a command…"
                aria-label="Command palette search"
                className="h-14 w-full bg-transparent text-[15px] text-ink placeholder:text-mute focus:outline-none"
              />
              <kbd className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-mute">
                esc
              </kbd>
            </div>

            <div className="max-h-[45vh] overflow-y-auto p-2">
              {items.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-mute">
                  {searching ? 'Searching…' : 'No matches'}
                </p>
              )}
              {items.map((entry, i) => {
                const Icon = entry.icon
                const isResult = entry.kind === 'result'
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      go(entry)
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100 ${
                      i === active ? 'bg-white/[0.08]' : ''
                    }`}
                  >
                    {isResult ? (
                      <>
                        <div className="h-12 w-8 shrink-0 overflow-hidden rounded-md bg-elevated">
                          <SmartImage
                            src={tmdbImage(entry.item.poster_path, 'w92')}
                            alt=""
                            className="h-full w-full object-cover"
                            draggable={false}
                            fallback={<span className="text-[9px] text-mute">{entry.item.year || '—'}</span>}
                          />
                        </div>
                        <span className="min-w-0 flex-1 truncate text-[14px] font-medium tracking-[-0.01em]">
                          {entry.label}
                        </span>
                        <span className="text-xs text-mute">{entry.item.year}</span>
                        <TypeBadge mediaType={entry.item.media_type} />
                      </>
                    ) : (
                      <>
                        {Icon && (
                          <Icon size={17} strokeWidth={1.75} className="shrink-0 text-sub" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-[14px] font-medium tracking-[-0.01em]">
                          {entry.label}
                        </span>
                        {busy && entry.id === 'surprise' && (
                          <span className="animate-pulse text-xs text-mute">Picking…</span>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
              <p className="text-[11px] text-mute">
                <kbd className="rounded border border-white/10 px-1 text-[10px]">↵</kbd> open ·{' '}
                <kbd className="rounded border border-white/10 px-1 text-[10px]">/</kbd> quick search
              </p>
              <div className="flex items-center gap-2">
                {Object.entries(ACCENTS).map(([id, c]) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={`Set accent to ${c.label}`}
                    title={c.label}
                    onClick={() => setAccent(id)}
                    className="h-4 w-4 rounded-full transition-transform duration-150 hover:scale-125"
                    style={{ backgroundColor: c.accent }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
