import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { fetchDiscover, fetchGenres } from '../lib/tmdb'
import { useAsync } from '../lib/hooks'
import PosterGrid from '../components/movie/PosterGrid'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

export default function Genre() {
  const { genreId } = useParams()
  const [params] = useSearchParams()
  const mediaType = params.get('mediaType') === 'tv' ? 'tv' : 'movie'

  const { data: genres } = useAsync(() => fetchGenres(mediaType), ['genres', mediaType])
  const genreName =
    genres?.find((g) => String(g.id) === genreId)?.name || 'Titles'

  const [list, setList] = useState({ items: [], page: 0, hasMore: true, error: null })
  const [prevKey, setPrevKey] = useState(genreId)
  const [loadingMore, setLoadingMore] = useState(false)

  if (genreId !== prevKey) {
    setPrevKey(genreId)
    setList({ items: [], page: 0, hasMore: true, error: null })
  }

  const { data, loading, error } = useAsync(
    () => fetchDiscover({ mediaType, genre: genreId }),
    ['genre', mediaType, genreId],
  )

  useEffect(() => {
    if (data) {
      setList({ items: data.items, page: data.page, hasMore: data.page < data.totalPages, error: null })
    }
  }, [data])

  const loadMore = async () => {
    if (loadingMore || !list.hasMore) return
    setLoadingMore(true)
    try {
      const next = await fetchDiscover({
        mediaType,
        genre: genreId,
        page: list.page + 1,
      })
      setList((s) => ({
        items: [...s.items, ...next.items],
        page: next.page,
        hasMore: next.page < next.totalPages,
        error: null,
      }))
    } catch (err) {
      setList((s) => ({ ...s, error: err.message }))
    } finally {
      setLoadingMore(false)
    }
  }

  const initialError = error && list.items.length === 0

  return (
    <div className="pt-28 md:pt-36">
      <header className="container-x">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            {genreName}
          </h1>
          <Link
            to={mediaType === 'tv' ? '/tv' : '/movies'}
            className="text-[13px] font-medium text-sub transition-colors hover:text-ink"
          >
            All {mediaType === 'tv' ? 'series' : 'movies'}
          </Link>
        </div>
      </header>

      <div className="mt-10 pb-8">
        {initialError ? (
          <EmptyState
            title="Couldn't load this genre"
            description={`${error} — try again.`}
            action={
              <Link to="/movies">
                <Button variant="primary" size="md">Back to movies</Button>
              </Link>
            }
          />
        ) : (
          <PosterGrid
            items={list.items}
            loading={loading && list.items.length === 0}
            error={list.error && list.items.length === 0 ? list.error : null}
          />
        )}

        {list.hasMore && !loading && !list.error && (
          <div className="container-x flex justify-center pt-10">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="h-11 rounded-lg border border-hairline px-8 text-sm font-medium text-sub transition-colors duration-300 hover:border-white/25 hover:text-ink disabled:opacity-40"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
