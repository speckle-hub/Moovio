import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, RotateCcw, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { fetchDiscover, fetchGenres } from '../lib/tmdb'
import PosterGrid from '../components/movie/PosterGrid'
import FilterPill from '../components/ui/FilterPill'
import { SkeletonGrid } from '../components/ui/Skeleton'

const SORTS = (isTv) => [
  { label: 'Popular', value: 'popularity.desc' },
  { label: 'Top Rated', value: 'vote_average.desc' },
  { label: 'Newest', value: isTv ? 'first_air_date.desc' : 'primary_release_date.desc' },
]

const DECADES = [
  { label: '2020s', value: 2020 },
  { label: '2010s', value: 2010 },
  { label: '2000s', value: 2000 },
  { label: '1990s', value: 1990 },
  { label: '1980s', value: 1980 },
]

const RATINGS = [
  { label: '6+', value: 6 },
  { label: '7+', value: 7 },
  { label: '8+', value: 8 },
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'zh', label: 'Chinese' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ru', label: 'Russian' },
  { code: 'ar', label: 'Arabic' },
  { code: 'tr', label: 'Turkish' },
  { code: 'th', label: 'Thai' },
  { code: 'tl', label: 'Filipino' },
]

function FilterGroup({ label, children }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-14 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute select-none">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  )
}

export default function Browse({ mediaType }) {
  const [genres, setGenres] = useState([])
  const [selected, setSelected] = useState([])
  const [year, setYear] = useState('')
  const [minRating, setMinRating] = useState('')
  const [language, setLanguage] = useState('')
  const [sort, setSort] = useState('popularity.desc')
  const [retryKey, setRetryKey] = useState(0)

  const genreScrollRef = useRef(null)

  const params = {
    mediaType,
    genre: selected.length > 0 ? selected : undefined,
    sortBy: sort,
    year: year || undefined,
    minRating: minRating || undefined,
    language: language || undefined,
  }

  const key = `${mediaType}|${selected.join(',')}|${year}|${minRating}|${language}|${sort}|${retryKey}`
  const [list, setList] = useState({ items: [], page: 0, hasMore: true, error: null })
  const [prevKey, setPrevKey] = useState(key)
  const [loadingMore, setLoadingMore] = useState(false)

  if (key !== prevKey) {
    setPrevKey(key)
    setList({ items: [], page: 0, hasMore: true, error: null })
  }

  useEffect(() => {
    let alive = true
    fetchDiscover(params)
      .then((data) =>
        alive &&
        setList({
          items: data.items,
          page: data.page,
          hasMore: data.page < data.totalPages,
          error: null,
        }),
      )
      .catch((err) =>
        alive &&
        setList({ items: [], page: 0, hasMore: true, error: err.message }),
      )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    let alive = true
    fetchGenres(mediaType)
      .then((g) => alive && setGenres(g))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [mediaType])

  const loadMore = async () => {
    if (loadingMore || !list.hasMore) return
    setLoadingMore(true)
    try {
      const data = await fetchDiscover({ ...params, page: list.page + 1 })
      setList((s) => ({
        items: [...s.items, ...data.items],
        page: data.page,
        hasMore: data.page < data.totalPages,
        error: null,
      }))
    } catch (err) {
      setList((s) => ({ ...s, error: err.message }))
    } finally {
      setLoadingMore(false)
    }
  }

  const loading = list.items.length === 0 && list.error === null
  const isTv = mediaType === 'tv'
  const label = isTv ? 'Series' : 'Movies'

  const toggleGenre = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((g) => g !== id) : [...s, id]))

  const decadeActive = (decade) =>
    year !== '' && Number(year) >= decade && Number(year) < decade + 10

  const hasActiveFilters =
    selected.length > 0 || year !== '' || minRating !== '' || language !== '' || sort !== 'popularity.desc'

  const resetFilters = () => {
    setSelected([])
    setYear('')
    setMinRating('')
    setLanguage('')
    setSort('popularity.desc')
  }

  const scrollGenres = (direction) => {
    if (!genreScrollRef.current) return
    const offset = direction === 'left' ? -260 : 260
    genreScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <div className="pt-24 md:pt-32">
      <header className="container-x">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
              {label}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">
              Browse the {isTv ? 'series' : 'films'} worth your time — combine genres,
              pick an era and a minimum rating, then sort by what matters.
            </p>
          </div>

          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                type="button"
                onClick={resetFilters}
                className="inline-flex h-8 items-center gap-1.5 self-start rounded-full border border-white/15 bg-surface/80 px-3 text-xs font-medium text-sub transition-colors hover:border-white/30 hover:bg-elevated hover:text-ink sm:self-auto"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset filters</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Genre Pill Bar with horizontal scroller */}
        <div className="relative mt-8 group">
          {/* Scroll fade edges & buttons for desktop */}
          <div className="no-scrollbar -mx-5 flex items-center gap-2 overflow-x-auto px-5 scroll-smooth py-1 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12" ref={genreScrollRef}>
            <FilterPill
              active={selected.length === 0}
              onClick={() => setSelected([])}
            >
              All
            </FilterPill>
            {genres.map((g) => {
              const id = String(g.id)
              const on = selected.includes(id)
              return (
                <FilterPill
                  key={id}
                  active={on}
                  onClick={() => toggleGenre(id)}
                >
                  {g.name}
                </FilterPill>
              )
            })}
          </div>

          {/* Desktop scroller buttons */}
          <div className="pointer-events-none absolute inset-y-0 -left-3 hidden items-center lg:flex">
            <button
              type="button"
              onClick={() => scrollGenres('left')}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-surface/90 text-sub shadow-lg backdrop-blur-md transition-all hover:border-white/30 hover:text-ink hover:scale-110 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 -right-3 hidden items-center lg:flex">
            <button
              type="button"
              onClick={() => scrollGenres('right')}
              className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-surface/90 text-sub shadow-lg backdrop-blur-md transition-all hover:border-white/30 hover:text-ink hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Multi-filter Controls Bar */}
        <div className="mt-5 flex flex-col gap-4 border-t border-hairline pt-5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-10 lg:gap-y-4">
          {/* Era / Decade */}
          <FilterGroup label="Year">
            <FilterPill
              size="sm"
              active={year === ''}
              onClick={() => setYear('')}
            >
              Any
            </FilterPill>
            {DECADES.map((d) => (
              <FilterPill
                key={d.value}
                size="sm"
                active={decadeActive(d.value)}
                onClick={() =>
                  setYear(decadeActive(d.value) ? '' : String(d.value))
                }
              >
                {d.label}
              </FilterPill>
            ))}
            <div className="relative inline-flex items-center">
              <input
                type="text"
                inputMode="numeric"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value.replace(/\D/g, '').slice(0, 4))
                }
                placeholder="Custom"
                aria-label="Custom year"
                className={`h-8 w-[74px] rounded-full border bg-surface/50 px-2.5 text-center text-[12.5px] font-medium text-ink placeholder:text-mute transition-all duration-200 focus:border-accent focus:bg-elevated focus:outline-none ${
                  year !== '' && !DECADES.some((d) => decadeActive(d.value))
                    ? 'border-accent text-accent shadow-[0_0_12px_-2px_var(--color-accent)]'
                    : 'border-hairline hover:border-white/20'
                }`}
              />
              {year !== '' && (
                <button
                  type="button"
                  onClick={() => setYear('')}
                  className="absolute right-2 text-mute hover:text-ink"
                  aria-label="Clear custom year"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </FilterGroup>

          {/* Rating Filters */}
          <FilterGroup label="Rating">
            <FilterPill
              size="sm"
              active={minRating === ''}
              onClick={() => setMinRating('')}
            >
              Any
            </FilterPill>
            {RATINGS.map((r) => {
              const v = String(r.value)
              const on = minRating === v
              return (
                <FilterPill
                  key={v}
                  size="sm"
                  active={on}
                  icon={<Star className={`h-3 w-3 ${on ? 'fill-white text-white' : 'fill-amber-400/80 text-amber-400/80'}`} />}
                  onClick={() => setMinRating(on ? '' : v)}
                >
                  {r.label}
                </FilterPill>
              )
            })}
          </FilterGroup>

          {/* Language Dropdown */}
          <FilterGroup label="Language">
            <div className="relative inline-flex items-center">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Original language"
                className={`h-8 cursor-pointer appearance-none rounded-full border bg-surface/50 pl-3.5 pr-8 text-[12.5px] font-medium text-sub transition-all duration-200 hover:border-white/25 hover:text-ink focus:border-accent focus:outline-none ${
                  language ? 'border-accent text-accent shadow-[0_0_12px_-2px_var(--color-accent)]' : 'border-hairline'
                }`}
              >
                <option value="" className="bg-elevated text-ink">All languages</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-elevated text-ink">
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-mute" />
            </div>
          </FilterGroup>

          {/* Animated Sort Tabs with sliding indicator */}
          <div className="relative flex items-center rounded-lg border border-hairline bg-surface/60 p-0.5 lg:ml-auto">
            {SORTS(isTv).map((s) => {
              const active = sort === s.value
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSort(s.value)}
                  className={`relative z-10 h-7 rounded-md px-3 text-[12.5px] font-medium transition-colors duration-200 ${
                    active ? 'text-ink' : 'text-mute hover:text-sub'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="browseSortTab"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-md bg-elevated border border-white/10 shadow-sm"
                    />
                  )}
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Grid Content & Load States */}
      <div className="mt-10 space-y-6 pb-12">
        <PosterGrid
          items={list.items}
          loading={loading}
          error={list.error && list.items.length === 0 ? list.error : null}
          onRetry={() => setRetryKey((k) => k + 1)}
        />

        {/* Shimmer skeleton row during infinite-scroll loadMore */}
        {loadingMore && (
          <div className="container-x">
            <SkeletonGrid count={6} />
          </div>
        )}

        {list.error && list.items.length > 0 && (
          <div className="container-x text-center text-sm text-mute">
            Couldn&apos;t load more —{' '}
            <button
              type="button"
              onClick={loadMore}
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              retry
            </button>
          </div>
        )}

        {list.hasMore && !loading && !list.error && !loadingMore && (
          <div className="container-x flex justify-center pt-4">
            <motion.button
              type="button"
              onClick={loadMore}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-11 rounded-full border border-hairline bg-surface/60 px-8 text-sm font-medium text-sub backdrop-blur-sm transition-colors duration-200 hover:border-white/25 hover:bg-elevated hover:text-ink"
            >
              Load more
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}
