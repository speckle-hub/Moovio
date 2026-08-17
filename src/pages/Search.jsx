import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Search as SearchIcon } from 'lucide-react'
import { fetchSearch } from '../lib/tmdb'
import { useAsync, useDebouncedValue } from '../lib/hooks'
import PosterGrid from '../components/movie/PosterGrid'
import SearchBox from '../components/ui/SearchBox'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import FilterPill from '../components/ui/FilterPill'

const POPULAR_SUGGESTIONS = [
  'Sci-Fi',
  'Anime',
  'Cyberpunk',
  'Christopher Nolan',
  'Studio Ghibli',
  'Thriller',
  'Marvel',
  'HBO',
]

export default function Search() {
  const [query, setQuery] = useState(() => {
    const q = new URLSearchParams(window.location.search).get('q')
    return q || ''
  })
  const debounced = useDebouncedValue(query.trim(), 350)

  const { data, loading, error } = useAsync(
    () => fetchSearch(debounced),
    ['search', debounced],
  )

  const searching = debounced.length > 0

  return (
    <div className="pt-28 md:pt-36">
      <header className="container-x">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
          Search
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">
          Search across the entire catalog of movies, television series, and talent.
        </p>

        <div className="mt-7 max-w-2xl">
          <SearchBox
            query={query}
            onChange={setQuery}
            results={data?.items || []}
            loading={loading}
            autoFocus
          />
        </div>

        {/* Quick Discovery Suggestions when empty */}
        {!searching && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-2 max-w-2xl"
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-mute mr-1">
              <Sparkles className="h-3 w-3 text-accent" />
              Try searching:
            </span>
            {POPULAR_SUGGESTIONS.map((s) => (
              <FilterPill
                key={s}
                size="sm"
                onClick={() => setQuery(s)}
              >
                {s}
              </FilterPill>
            ))}
          </motion.div>
        )}
      </header>

      <div className="mt-10 pb-12">
        <AnimatePresence mode="wait">
          {!searching ? (
            <motion.div
              key="empty-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={<SearchIcon size={24} strokeWidth={1.5} />}
                title="Find something great to watch"
                description="Search across thousands of movies and TV shows from the TMDB database."
              />
            </motion.div>
          ) : loading ? (
            <motion.div
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container-x"
            >
              <SkeletonGrid count={12} />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                title="Search failed"
                description={`${error} — try again in a moment.`}
              />
            </motion.div>
          ) : data?.items?.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                title={`No results for “${debounced}”`}
                description="Try checking for typos or searching with a broader title."
              />
            </motion.div>
          ) : (
            <motion.div
              key={`results-${debounced}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="container-x mb-6 text-[13px] text-mute">
                Found <span className="font-semibold text-ink">{data.totalResults}</span> results for “{debounced}”
              </p>
              <PosterGrid items={data.items} loading={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
