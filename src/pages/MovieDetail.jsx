import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play,
  Heart,
  Plus,
  Check,
  ChevronLeft,
  Link2,
  Circle,
  CheckCircle2,
} from 'lucide-react'
import {
  fetchDetails,
  fetchSeasonEpisodes,
  formatRuntime,
} from '../lib/tmdb'
import { tmdbImage } from '../lib/images'
import { useAsync } from '../lib/hooks'
import { useLibraryStore } from '../store/libraryStore'
import { useHistoryStore } from '../store/historyStore'
import { useRatingsStore } from '../store/ratingsStore'
import PosterRow from '../components/movie/PosterRow'
import CastCard from '../components/movie/CastCard'
import Rating from '../components/ui/Rating'
import Button from '../components/ui/Button'
import TrailerModal from '../components/ui/TrailerModal'
import WatchModal from '../components/ui/WatchModal'
import AddToListMenu from '../components/library/AddToListMenu'
import EmptyState from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import SmartImage from '../components/ui/SmartImage'
import RatingInput from '../components/ui/RatingInput'
import WhereToWatch from '../components/ui/WhereToWatch'
import FilterPill from '../components/ui/FilterPill'
import AnimatedList, { AnimatedListItem } from '../components/ui/AnimatedList'
import NotFound from './NotFound'

const EASE = [0.16, 1, 0.3, 1]

function DetailSkeleton() {
  return (
    <div>
      <div className="h-[65vh] min-h-[440px] animate-pulse bg-white/[0.04]" />
      <div className="container-x -mt-32 relative space-y-6">
        <div className="space-y-4 max-w-2xl">
          <div className="h-12 w-3/4 rounded-xl bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-1/3 rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-full rounded-lg bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-4/5 rounded-lg bg-white/[0.06] animate-pulse" />
        </div>
        <div className="pt-12">
          <SkeletonGrid count={6} />
        </div>
      </div>
    </div>
  )
}

export default function MovieDetail() {
  const { mediaType, id } = useParams()
  const navigate = useNavigate()
  const { toggleWatchlist, toggleFavorite, inWatchlist, inFavorites } =
    useLibraryStore()
  const recordView = useHistoryStore((s) => s.recordView)
  const recordStart = useHistoryStore((s) => s.recordStart)
  const updateProgress = useHistoryStore((s) => s.updateProgress)
  const ratingEntries = useRatingsStore((s) => s.entries)
  const rate = useRatingsStore((s) => s.rate)
  const toggleWatched = useRatingsStore((s) => s.toggleWatched)
  const setWatched = useRatingsStore((s) => s.setWatched)
  const [season, setSeason] = useState(null)
  const [trailer, setTrailer] = useState(null)
  const [watch, setWatch] = useState(null)
  const [copied, setCopied] = useState(false)
  const copiedTimeoutRef = useRef(null)

  const valid = mediaType === 'movie' || mediaType === 'tv'
  const { data, loading, error } = useAsync(
    () => (valid ? fetchDetails(mediaType, id) : Promise.reject(new Error('Unknown media type'))),
    ['detail', mediaType, id],
  )

  useEffect(() => {
    if (!data) return
    recordView({
      tmdb_id: data.detail.id,
      media_type: mediaType,
      title: data.detail.title,
      poster_path: data.detail.poster_path,
      year: data.detail.year,
      rating: data.detail.rating,
    })
  }, [data, mediaType, recordView])

  if (mediaType === 'tv' && data?.seasons?.length && season == null) {
    const first = data.seasons.find((s) => s.season_number > 0) || data.seasons[0]
    if (first) setSeason(first.season_number)
  }

  const episodes = useAsync(
    () =>
      valid && mediaType === 'tv' && season != null
        ? fetchSeasonEpisodes(id, season)
        : Promise.resolve([]),
    ['episodes', mediaType, id, season ?? 'none'],
  )

  useEffect(() => () => clearTimeout(copiedTimeoutRef.current), [])

  if (!valid) return <NotFound />

  if (loading) return <DetailSkeleton />

  if (error || !data) {
    return (
      <div className="container-x flex min-h-[70vh] items-center justify-center">
        <EmptyState
          title="This title is unavailable"
          description={`${error || 'Something went wrong.'}`}
          action={
            <Link to="/">
              <Button variant="primary" size="md">Back to home</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const { detail, genreList, trailerKey, cast, recommendations, seasons, watchProviders, runtimeMinutes } =
    data
  const isTv = mediaType === 'tv'
  const entry = {
    tmdb_id: detail.id,
    media_type: mediaType,
    title: detail.title,
    poster_path: detail.poster_path,
    year: detail.year,
    rating: detail.rating,
  }
  const ratingEntry = {
    tmdb_id: detail.id,
    media_type: mediaType,
    title: detail.title,
    poster_path: detail.poster_path,
    year: detail.year,
    tmdbRating: detail.rating,
    genres: genreList.map((g) => g.name),
    runtimeMinutes,
  }
  const ratingRecord = ratingEntries[`${mediaType}:${detail.id}`] || null
  const myRating = ratingRecord?.rating || 0
  const watched = Boolean(ratingRecord?.watched)
  const inList = inWatchlist(detail.id, mediaType)
  const fav = inFavorites(detail.id, mediaType)
  const airedSeasons = (seasons || []).filter((s) => s.season_number > 0)
  const activeSeason =
    season ?? airedSeasons[0]?.season_number ?? seasons?.[0]?.season_number ?? 1

  const openTrailer = () => setTrailer({ key: trailerKey, title: detail.title })
  const openWatch = (ep) => {
    recordStart(entry)
    setWatch({
      mediaType,
      tmdbId: detail.id,
      imdbId: data.imdbId,
      season: ep?.season_number ?? activeSeason,
      episode: ep?.episode_number ?? 1,
      title: detail.title,
    })
  }

  const goToNextEpisode = () => {
    if (!isTv || !watch) return
    const curSeason = watch.season ?? activeSeason
    const curEpisode = watch.episode ?? 1
    const list = episodes.data || []
    const currentIndex = list.findIndex((e) => e.episode_number === curEpisode)
    const nextInSeason = currentIndex >= 0 ? list[currentIndex + 1] : null
    if (nextInSeason) {
      openWatch({ season_number: curSeason, episode_number: nextInSeason.episode_number })
      return
    }
    const idx = airedSeasons.findIndex((s) => s.season_number === curSeason)
    const nextSeason = idx >= 0 ? airedSeasons[idx + 1] : null
    if (nextSeason) {
      setSeason(nextSeason.season_number)
      openWatch({ season_number: nextSeason.season_number, episode_number: 1 })
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      clearTimeout(copiedTimeoutRef.current)
      copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <div>
      {/* Backdrop header with vignette */}
      <section className="relative -mt-16 h-[72vh] min-h-[480px] overflow-hidden md:-mt-[72px]">
        <SmartImage
          src={tmdbImage(detail.backdrop_path, 'w1280')}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          fallback={<div className="h-full w-full bg-gradient-to-b from-elevated to-bg" />}
        />
        <div className="absolute inset-0 hero-vignette" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-6 top-24 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-sub backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:text-ink sm:left-10"
          aria-label="Go back"
        >
          <ChevronLeft size={19} strokeWidth={2} />
        </button>
      </section>

      {/* Content */}
      <div className="container-x relative -mt-44 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
        >
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-5xl">
              {detail.title}
            </h1>

            {detail.tagline && (
              <p className="mt-3 text-[15px] italic text-sub">{detail.tagline}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sub">
              {detail.year && <span className="font-medium text-ink">{detail.year}</span>}
              {detail.runtime && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                  <span>{detail.runtime}</span>
                </>
              )}
              {isTv && airedSeasons.length > 0 && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                  <span>{airedSeasons.length} {airedSeasons.length === 1 ? 'Season' : 'Seasons'}</span>
                </>
              )}
              {genreList.length > 0 && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                  <span className="flex flex-wrap items-center gap-1">
                    {genreList.map((g, i) => (
                      <span key={g.id}>
                        {i > 0 && <span className="text-white/25">, </span>}
                        <Link
                          to={`/genre/${g.id}?mediaType=${mediaType}`}
                          className="transition-colors underline-offset-4 hover:text-accent hover:underline"
                        >
                          {g.name}
                        </Link>
                      </span>
                    ))}
                  </span>
                </>
              )}
              <Rating value={detail.rating} className="ml-1" />
            </div>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-sub">
              {detail.overview}
            </p>

            {/* Actions Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                glow
                icon={<Play size={16} fill="currentColor" />}
                onClick={openWatch}
              >
                Watch Now
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={trailerKey ? openTrailer : undefined}
                className={trailerKey ? '' : 'opacity-50'}
              >
                Trailer
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={inList ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
                onClick={() => toggleWatchlist(entry)}
                className={inList ? '!border-accent/40 !bg-accent/15 !text-accent' : ''}
              >
                {inList ? 'In My List' : 'My List'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<Heart size={16} strokeWidth={1.75} fill={fav ? 'currentColor' : 'none'} />}
                onClick={() => toggleFavorite(entry)}
                className={fav ? '!border-accent/40 !bg-accent/15 !text-accent' : ''}
              >
                {fav ? 'Favorited' : 'Favorite'}
              </Button>
              <AddToListMenu entry={entry} />
              <Button
                variant="secondary"
                size="lg"
                icon={copied ? <Check size={16} strokeWidth={2} /> : <Link2 size={16} strokeWidth={1.75} />}
                onClick={copyLink}
                className={copied ? '!text-accent' : ''}
              >
                {copied ? 'Copied' : 'Copy link'}
              </Button>
            </div>

            {/* Personal Rating & Watched Tracker */}
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-6">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
                  Your rating
                </span>
                <RatingInput value={myRating} onChange={(v) => rate(ratingEntry, v)} />
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleWatched(ratingEntry)}
                aria-pressed={watched}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-all duration-300 ${
                  watched
                    ? 'border-accent/50 bg-accent/15 text-accent shadow-[0_0_14px_-2px_var(--color-accent)]'
                    : 'border-white/12 bg-surface/50 text-sub hover:border-white/25 hover:bg-surface hover:text-ink'
                }`}
              >
                {watched ? <CheckCircle2 size={15} strokeWidth={2} /> : <Circle size={15} strokeWidth={1.75} />}
                {watched ? 'Watched' : 'Mark as watched'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Where to Watch (Kokonut Glass Panel) */}
        {watchProviders && (
          <div className="mt-12 max-w-3xl">
            <WhereToWatch providers={watchProviders} />
          </div>
        )}

        {/* Cast Carousel with AnimatedList */}
        {cast.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
              Top Cast
            </h2>
            <div className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 py-2 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
              {cast.map((p) => (
                <CastCard
                  key={p.id}
                  person={{ id: p.id, name: p.name, character: p.character, profile_path: p.profile_path }}
                />
              ))}
            </div>
          </div>
        )}

        {/* TV Seasons + Episode Guide with AnimatedList */}
        {isTv && seasons && seasons.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                Seasons & Episodes
              </h2>
            </div>

            {/* Season selection pills */}
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
              {seasons.map((s) => (
                <FilterPill
                  key={s.id}
                  active={activeSeason === s.season_number}
                  onClick={() => setSeason(s.season_number)}
                >
                  {s.season_number === 0 ? 'Specials' : `Season ${s.season_number}`}
                </FilterPill>
              ))}
            </div>

            {/* Episode Cards */}
            <div className="mt-6">
              {episodes.loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4 rounded-2xl border border-hairline bg-surface/50 p-4">
                      <div className="aspect-video w-36 shrink-0 shimmer-mask rounded-xl bg-white/[0.06] sm:w-52" />
                      <div className="flex-1 space-y-2.5 py-1">
                        <div className="h-3.5 w-1/3 shimmer-mask rounded-md bg-white/[0.06]" />
                        <div className="h-3 w-full shimmer-mask rounded-md bg-white/[0.06]" />
                        <div className="h-3 w-3/4 shimmer-mask rounded-md bg-white/[0.06]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <AnimatedList className="space-y-3" stagger={0.04}>
                  {episodes.data?.map((ep) => (
                    <AnimatedListItem
                      key={ep.id}
                      className="group relative flex gap-4 overflow-hidden rounded-2xl border border-white/8 bg-surface/70 p-3.5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-accent/30 hover:bg-surface/90 hover:shadow-[0_0_24px_-4px_var(--color-accent)] sm:p-4"
                    >
                      {/* Episode Still thumbnail */}
                      <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-elevated sm:w-52">
                        <SmartImage
                          src={tmdbImage(ep.still_path, 'w342')}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          draggable={false}
                          fallback={
                            <span className="text-[11px] text-mute">Episode {ep.episode_number}</span>
                          }
                        />
                      </div>

                      {/* Episode Details */}
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-xs font-bold tabular-nums text-accent">
                            S{activeSeason} E{ep.episode_number}
                          </span>
                          <h3 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink">
                            {ep.name}
                          </h3>
                          {ep.runtime > 0 && (
                            <span className="text-xs text-mute">{formatRuntime(ep.runtime)}</span>
                          )}
                          {ep.vote_average > 0 && <Rating value={ep.vote_average} showMax={false} />}
                        </div>
                        {ep.overview && (
                          <p className="clamp-2 mt-2 max-w-2xl text-[13px] leading-relaxed text-sub">
                            {ep.overview}
                          </p>
                        )}
                      </div>

                      {/* Play Action Button */}
                      <button
                        type="button"
                        onClick={() => openWatch(ep)}
                        aria-label={`Watch ${ep.name}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full border border-white/12 bg-white/5 text-sub transition-all duration-200 hover:scale-110 hover:border-accent hover:bg-accent hover:text-white hover:shadow-[0_0_14px_var(--color-accent)]"
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <PosterRow title="More Like This" items={recommendations} />
          </div>
        )}
      </div>

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
        onProgress={(p) => {
          updateProgress(detail.id, mediaType, p)
          if (p >= 0.92) setWatched(ratingEntry, true)
        }}
        onNextEpisode={goToNextEpisode}
      />
    </div>
  )
}
