import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  fetchTrending,
  fetchNowPlaying,
  fetchDiscover,
  fetchTopRated,
  fetchUpcoming,
  fetchOnTheAir,
  fetchAnime,
  fetchDetails,
} from '../lib/tmdb'
import { useAsync } from '../lib/hooks'
import { useHistoryStore } from '../store/historyStore'
import HeroBanner from '../components/movie/HeroBanner'
import PosterRow from '../components/movie/PosterRow'
import { SkeletonRow } from '../components/ui/Skeleton'
import TrailerModal from '../components/ui/TrailerModal'
import WatchModal from '../components/ui/WatchModal'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { Film } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [trailer, setTrailer] = useState(null)
  const [watch, setWatch] = useState(null)
  const [retryKey, setRetryKey] = useState(0)
  const continueWatching = useHistoryStore((s) => s.continueWatching)
  const recentlyViewed = useHistoryStore((s) => s.recentlyViewed)
  const recordStart = useHistoryStore((s) => s.recordStart)
  const updateProgress = useHistoryStore((s) => s.updateProgress)

  const { data, loading, error } = useAsync(
    async () => {
      const [trending, nowPlaying, popularMovies, popularTv, topRated, upcoming, onTheAir, anime] =
        await Promise.all([
          fetchTrending({ mediaType: 'all', window: 'week' }),
          fetchNowPlaying(),
          fetchDiscover({ mediaType: 'movie' }),
          fetchDiscover({ mediaType: 'tv' }),
          fetchTopRated('movie'),
          fetchUpcoming(),
          fetchOnTheAir(),
          fetchAnime(),
        ])
      return { trending, nowPlaying, popularMovies, popularTv, topRated, upcoming, onTheAir, anime }
    },
    ['home', retryKey],
  )

  if (loading) {
    return (
      <div>
        <div className="flex h-[92vh] min-h-[560px] items-end">
          <div className="container-x w-full">
            <div className="max-w-xl space-y-4">
              <div className="h-16 w-2/3 animate-pulse rounded-lg bg-white/[0.06] md:h-24" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </div>
        </div>
        <div className="space-y-16 py-16 md:space-y-20">
          <SkeletonRow count={5} />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container-x flex min-h-[70vh] items-center justify-center">
        <EmptyState
          icon={<Film size={22} strokeWidth={1.5} />}
          title="Couldn't reach the library"
          description={`${error || 'Something went wrong.'} Check your connection and try again.`}
          action={
            <Button variant="primary" size="md" onClick={() => setRetryKey((k) => k + 1)}>
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  const heroItem = data.trending.items.find((i) => i.backdrop_path) || data.trending.items[0]

  const continueItems = continueWatching.map((e) => ({
    id: e.tmdb_id,
    media_type: e.media_type,
    title: e.title,
    poster_path: e.poster_path,
    year: e.year,
    rating: e.rating,
    progress: e.progress,
  }))

  const viewedItems = recentlyViewed.slice(0, 20).map((e) => ({
    id: e.tmdb_id,
    media_type: e.media_type,
    title: e.title,
    poster_path: e.poster_path,
    year: e.year,
    rating: e.rating,
  }))

  if (!heroItem) {
    return (
      <div className="container-x flex min-h-[70vh] items-center justify-center">
        <EmptyState
          icon={<Film size={22} strokeWidth={1.5} />}
          title="Nothing trending right now"
          description="The catalog is quiet — try again in a moment."
          action={
            <Button variant="primary" size="md" onClick={() => setRetryKey((k) => k + 1)}>
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  const playHeroTrailer = async () => {
    if (!heroItem) return
    const res = await fetchDetails(heroItem.media_type, heroItem.id).catch(() => null)
    if (res?.trailerKey) setTrailer({ key: res.trailerKey, title: res.detail.title })
  }

  const watchHero = async () => {
    if (!heroItem) return
    const res = await fetchDetails(heroItem.media_type, heroItem.id).catch(() => null)
    recordStart({
      tmdb_id: heroItem.id,
      media_type: heroItem.media_type,
      title: res?.detail?.title || heroItem.title,
      poster_path: heroItem.poster_path,
      year: heroItem.year,
      rating: heroItem.rating,
    })
    setWatch({
      mediaType: heroItem.media_type,
      tmdbId: heroItem.id,
      imdbId: res?.imdbId || null,
      season: 1,
      episode: 1,
      title: res?.detail?.title || heroItem.title,
    })
  }

  return (
    <>
      <HeroBanner
        item={heroItem}
        onWatch={watchHero}
        onTrailer={playHeroTrailer}
        onDetails={() => navigate(`/${heroItem.media_type}/${heroItem.id}`)}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="space-y-20 py-16 md:space-y-24 md:py-20"
      >
        {continueItems.length > 0 && (
          <PosterRow title="Continue Watching" items={continueItems} />
        )}
        {viewedItems.length > 0 && (
          <PosterRow title="Recently Viewed" items={viewedItems} />
        )}
        <PosterRow title="Trending This Week" to="/movies" items={data.trending.items} />
        <PosterRow title="In Theaters" to="/movies" items={data.nowPlaying.items} />
        <PosterRow title="Popular Movies" to="/movies" items={data.popularMovies.items} />
        <PosterRow title="Popular Series" to="/tv" items={data.popularTv.items} />
        <PosterRow title="Anime" items={data.anime.items} />
        <PosterRow title="Top Rated" to="/movies" items={data.topRated.items} />
        <PosterRow title="Upcoming Releases" to="/movies" items={data.upcoming.items} />
        <PosterRow title="Airing Today" to="/tv" items={data.onTheAir.items} />
      </motion.div>

      <TrailerModal
        open={Boolean(trailer)}
        youtubeKey={trailer?.key}
        title={trailer?.title}
        onClose={() => setTrailer(null)}
      />

      <WatchModal
        open={Boolean(watch)}
        title={watch?.title}
        mediaType={watch?.mediaType}
        tmdbId={watch?.tmdbId}
        imdbId={watch?.imdbId}
        season={watch?.season}
        episode={watch?.episode}
        onClose={() => setWatch(null)}
        onProgress={(p) => updateProgress(watch?.tmdbId, watch?.mediaType, p)}
      />
    </>
  )
}
