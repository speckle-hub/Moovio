import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, MapPin, Clapperboard, Link2, Check } from 'lucide-react'
import { fetchPerson } from '../lib/tmdb'
import { tmdbImage } from '../lib/images'
import { useAsync } from '../lib/hooks'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import SmartImage from '../components/ui/SmartImage'

const EASE = [0.16, 1, 0.3, 1]

const BIO_CUTOFF = 340

function formatDate(date) {
  if (!date) return null
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m || !d) return date
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function Meta({ icon: Icon, children }) {
  if (!children) return null
  return (
    <div className="flex items-center gap-2 text-sm text-sub">
      <Icon size={15} strokeWidth={1.75} className="shrink-0 text-mute" />
      <span>{children}</span>
    </div>
  )
}

function CreditRow({ credit }) {
  const mediaType = credit.media_type
  const role = mediaType === 'tv' ? credit.character || credit.job : credit.character || credit.job
  return (
    <Link
      to={`/${mediaType}/${credit.id}`}
      className="group flex items-center gap-4 rounded-xl p-2 transition-colors duration-300 hover:bg-white/[0.05]"
    >
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md bg-elevated">
        <SmartImage
          src={tmdbImage(credit.poster_path, 'w92')}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          draggable={false}
          fallback={<span className="text-[10px] text-mute">{credit.year || '—'}</span>}
        />
      </div>
      <div className="w-10 shrink-0 text-[13px] tabular-nums text-mute">
        {credit.year || '—'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium tracking-[-0.01em] transition-colors group-hover:text-ink">
          {credit.title}
        </p>
        {role && <p className="mt-0.5 truncate text-[13px] text-sub">{role}</p>}
      </div>
      <span className="hidden shrink-0 text-xs text-mute sm:block">
        {credit.episodeCount ? `${credit.episodeCount} eps` : ''}
      </span>
    </Link>
  )
}

export default function PersonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mediaFilter, setMediaFilter] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const copiedTimeoutRef = useRef(null)

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

  useEffect(() => () => clearTimeout(copiedTimeoutRef.current), [])

  const { data, loading, error } = useAsync(() => fetchPerson(id), ['person', id])

  const filmography = useMemo(() => {
    if (!data) return []
    const castGrouped = { Acting: data.cast }
    const crewGrouped = {}
    for (const c of data.crew) {
      const dept = c.department || 'Crew'
      ;(crewGrouped[dept] ||= []).push(c)
    }
    const groups = []
    for (const [dept, credits] of Object.entries({ ...castGrouped, ...crewGrouped })) {
      const filtered = credits.filter(
        (c) => mediaFilter === 'all' || c.media_type === mediaFilter,
      )
      if (filtered.length > 0) groups.push({ dept, credits: filtered })
    }
    return groups
  }, [data, mediaFilter])

  if (loading) {
    return (
      <div className="container-x pt-28 md:pt-36">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <Skeleton className="h-56 w-44 shrink-0 rounded-2xl md:h-72 md:w-56" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-2/3 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
            <Skeleton className="h-4 w-1/4 rounded" />
            <Skeleton className="mt-6 h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container-x flex min-h-[70vh] items-center justify-center">
        <EmptyState
          title="This person is unavailable"
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

  const { person, cast, crew } = data
  const bio = person.biography
  const bioTruncated = expanded || bio.length <= BIO_CUTOFF ? bio : bio.slice(0, BIO_CUTOFF).trimEnd() + '…'
  const born = formatDate(person.birthday)
  const died = formatDate(person.deathday)
  const hasCredits = cast.length > 0 || crew.length > 0

  return (
    <div>
      <section className="relative -mt-16 h-[46vh] min-h-[360px] overflow-hidden bg-gradient-to-b from-elevated to-bg md:-mt-[72px]">
        <SmartImage
          src={tmdbImage(person.profile_path, 'w780')}
          alt=""
          className="h-full w-full object-cover object-top opacity-40 blur-sm saturate-[0.8]"
          draggable={false}
          fallback={<div className="h-full w-full bg-gradient-to-b from-elevated to-bg" />}
        />
        <div className="absolute inset-0 hero-vignette" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-6 top-24 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-sub backdrop-blur-md transition-colors hover:text-ink sm:left-10"
          aria-label="Go back"
        >
          <ChevronLeft size={19} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={copyLink}
          aria-label={copied ? 'Link copied' : 'Copy link'}
          title={copied ? 'Link copied' : 'Copy link'}
          className="absolute right-6 top-24 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-sub backdrop-blur-md transition-colors hover:text-ink sm:right-10"
        >
          {copied ? <Check size={17} strokeWidth={2} /> : <Link2 size={16} strokeWidth={1.75} />}
        </button>
      </section>

      <div className="container-x relative -mt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10"
        >
          <div className="w-44 shrink-0 md:w-56">
            <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-hairline bg-elevated shadow-2xl">
              <SmartImage
                src={tmdbImage(person.profile_path, 'w342')}
                alt={person.name}
                className="h-full w-full object-cover"
                draggable={false}
                fallback={
                  <span className="font-display text-5xl font-semibold text-white/15">
                    {person.name?.slice(0, 1)}
                  </span>
                }
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] md:text-5xl">
              {person.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              {person.known_for_department && (
                <Meta icon={Clapperboard}>
                  {person.known_for_department}
                </Meta>
              )}
              {born && (
                <Meta icon={Calendar}>
                  {died ? `${born} — ${died}` : `Born ${born}`}
                </Meta>
              )}
              {person.place_of_birth && (
                <Meta icon={MapPin}>{person.place_of_birth}</Meta>
              )}
            </div>

            {bio && (
              <div className="mt-6 max-w-3xl">
                <p className="text-[15px] leading-relaxed text-sub">{bioTruncated}</p>
                {bio.length > BIO_CUTOFF && (
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => !e)}
                    className="mt-2 text-sm font-medium text-accent transition-colors hover:text-accent-strong"
                  >
                    {expanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {hasCredits && (
          <div className="mt-14">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                Filmography
              </h2>
              <div className="flex items-center gap-1 rounded-full border border-hairline p-1">
                {[
                  ['all', 'All'],
                  ['movie', 'Movies'],
                  ['tv', 'TV'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMediaFilter(value)}
                    className={`h-8 rounded-full px-4 text-[13px] font-medium transition-colors duration-300 ${
                      mediaFilter === value
                        ? 'bg-ink text-black'
                        : 'text-sub hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {filmography.length === 0 ? (
              <EmptyState title="No titles in this filter" description="Try a different filter." />
            ) : (
              filmography.map(({ dept, credits }) => (
                <section key={dept} className="mb-10">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-mute">
                    {dept}
                  </h3>
                  <div className="space-y-1">
                    {credits.map((credit) => (
                      <CreditRow key={`${credit.media_type}-${credit.id}`} credit={credit} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
