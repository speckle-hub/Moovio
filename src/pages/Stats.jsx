import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Bookmark,
  Clock,
  Film,
  Heart,
  List,
  Star,
  Activity,
  PieChart,
  Info,
} from 'lucide-react'
import { useRatingsStore } from '../store/ratingsStore'
import { useLibraryStore } from '../store/libraryStore'
import { useHistoryStore } from '../store/historyStore'
import PosterGrid from '../components/movie/PosterGrid'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import {
  HoursAreaChart,
  GenreDonutChart,
  ActivityBarChart,
  RatingGauge,
} from '../components/stats/StatsCharts'

const EASE = [0.16, 1, 0.3, 1]

function MetricCard({ icon: Icon, label, value, unit = '', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: EASE }}
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-surface/70 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_20px_-4px_var(--color-accent)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
          {label}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-sub transition-colors group-hover:border-accent/30 group-hover:text-accent">
          <Icon size={14} strokeWidth={1.75} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <p className="font-display text-3xl font-bold tracking-tight text-ink tabular-nums md:text-4xl">
          {value}
        </p>
        {unit && <span className="text-xs text-sub">{unit}</span>}
      </div>
    </motion.div>
  )
}

export default function Stats() {
  const entries = useRatingsStore((s) => s.entries)
  const watchlist = useLibraryStore((s) => s.watchlist)
  const favorites = useLibraryStore((s) => s.favorites)
  const customLists = useLibraryStore((s) => s.customLists)
  const recentlyViewed = useHistoryStore((s) => s.recentlyViewed)

  const all = Object.values(entries)
  const watched = all.filter((e) => e.watched)
  const rated = all.filter((e) => e.rating)

  const hours = watched.reduce((sum, e) => sum + (e.runtimeMinutes || 0), 0) / 60
  const avgRating = rated.length
    ? rated.reduce((sum, e) => sum + e.rating, 0) / rated.length
    : 0

  // 1. Genre breakdown data
  const genreData = useMemo(() => {
    const counts = {}
    watched.forEach((e) =>
      (e.genres || []).forEach((g) => {
        counts[g] = (counts[g] || 0) + 1
      }),
    )
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([label, count]) => ({ label, count }))
  }, [watched])

  // 2. Rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = { '9-10': 0, '7-8': 0, '5-6': 0, '1-4': 0 }
    rated.forEach((e) => {
      const r = e.rating || 0
      if (r >= 9) dist['9-10'] += 1
      else if (r >= 7) dist['7-8'] += 1
      else if (r >= 5) dist['5-6'] += 1
      else if (r > 0) dist['1-4'] += 1
    })
    return dist
  }, [rated])

  // 3. Monthly Activity & Watch Timeline (synthetic realistic buckets from timestamps)
  const { activityData, timelineData } = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    const months = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        label: monthNames[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth(),
        count: 0,
        hours: 0,
      })
    }

    // Populate data into months
    watched.forEach((e) => {
      const date = e.watchedAt ? new Date(e.watchedAt) : now
      const match = months.find(
        (m) => m.month === date.getMonth() && m.year === date.getFullYear(),
      )
      if (match) {
        match.count += 1
        match.hours += (e.runtimeMinutes || 105) / 60
      } else if (months.length > 0) {
        months[months.length - 1].count += 1
        months[months.length - 1].hours += (e.runtimeMinutes || 105) / 60
      }
    })

    const timeline = months.map((m) => ({
      label: m.label,
      hours: m.hours,
    }))

    const activity = months.map((m) => ({
      label: m.label,
      count: m.count,
    }))

    return { activityData: activity, timelineData: timeline }
  }, [watched])

  const totalInteractions =
    watched.length + rated.length + watchlist.length + favorites.length + customLists.length

  const metricCards = [
    { label: 'Watched', value: watched.length, icon: Film },
    { label: 'Rated', value: rated.length, icon: Star },
    { label: 'Watch Time', value: hours.toFixed(1), unit: 'hrs', icon: Clock },
    { label: 'In My List', value: watchlist.length, icon: Bookmark },
    { label: 'Favorites', value: favorites.length, icon: Heart },
    { label: 'Custom Lists', value: customLists.length, icon: List },
  ]

  return (
    <div className="pt-28 md:pt-36">
      <header className="container-x">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
          Your Stats
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">
          Everything you&apos;ve watched, rated, and curated — computed locally from your
          Moovio activity with Bklit-inspired visual analytics.
        </p>
      </header>

      {totalInteractions === 0 ? (
        <div className="container-x mt-10">
          <EmptyState
            icon={<BarChart3 size={26} strokeWidth={1.5} />}
            title="No activity recorded yet"
            description="Start exploring films and series, mark titles as watched, and rate them to unlock your visual analytics dashboard."
            action={
              <Link to="/movies">
                <Button variant="primary" size="md" glow>
                  Explore Movies
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 pb-16 space-y-10">
          {/* 6 Top Metric Cards */}
          <div className="container-x grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {metricCards.map((c, i) => (
              <MetricCard key={c.label} {...c} index={i} />
            ))}
          </div>

          {/* Interactive Visual Charts Grid */}
          <div className="container-x grid gap-6 lg:grid-cols-2">
            {/* 1. Watch Time Trend (Area Chart) */}
            <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-surface/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-5">
                <div>
                  <h2 className="font-display text-base font-semibold tracking-tight text-ink flex items-center gap-2">
                    <Clock size={16} className="text-accent" />
                    Hours Watched Over Time
                  </h2>
                  <p className="text-xs text-mute mt-0.5">
                    Cumulative movie watch time trajectory
                  </p>
                </div>
                <span className="rounded-full bg-accent/15 border border-accent/30 px-2.5 py-0.5 text-xs font-bold text-accent">
                  {hours.toFixed(1)} hrs total
                </span>
              </div>
              <HoursAreaChart data={timelineData} />
            </section>

            {/* 2. Genre Affinity (Donut Chart) */}
            <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-surface/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-5">
                <div>
                  <h2 className="font-display text-base font-semibold tracking-tight text-ink flex items-center gap-2">
                    <PieChart size={16} className="text-accent" />
                    Genre Affinity
                  </h2>
                  <p className="text-xs text-mute mt-0.5">
                    Categorical breakdown across your watched library
                  </p>
                </div>
                <span className="text-xs font-medium text-mute">
                  {genreData.length} genres
                </span>
              </div>
              <GenreDonutChart data={genreData} />
            </section>

            {/* 3. Activity Volume (Bar Chart) */}
            <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-surface/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-5">
                <div>
                  <h2 className="font-display text-base font-semibold tracking-tight text-ink flex items-center gap-2">
                    <Activity size={16} className="text-accent" />
                    Monthly Activity
                  </h2>
                  <p className="text-xs text-mute mt-0.5">
                    Titles watched & rated over the last 6 months
                  </p>
                </div>
              </div>
              <ActivityBarChart data={activityData} />
            </section>

            {/* 4. Personal Rating Distribution (Radial Gauge) */}
            <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-surface/70 p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-5">
                <div>
                  <h2 className="font-display text-base font-semibold tracking-tight text-ink flex items-center gap-2">
                    <Star size={16} className="text-accent" />
                    Rating Overview
                  </h2>
                  <p className="text-xs text-mute mt-0.5">
                    Score distribution across {rated.length} rated titles
                  </p>
                </div>
              </div>
              <RatingGauge
                avgRating={avgRating}
                totalRated={rated.length}
                distribution={ratingDistribution}
              />
            </section>
          </div>

          {/* Runtime Caveat Notice */}
          <div className="container-x">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-black/40 px-4 py-3 text-xs text-mute">
              <Info size={15} className="shrink-0 text-sub" />
              <p>
                <strong className="font-semibold text-sub">Note on watch time:</strong> Total hours are computed from movie runtimes only (per-episode TV series runtime is not tracked). All statistics remain stored locally in your browser.
              </p>
            </div>
          </div>

          {/* Recently Viewed Grid */}
          {recentlyViewed.length > 0 && (
            <div className="container-x pt-4">
              <h2 className="mb-5 font-display text-xl font-semibold tracking-[-0.02em] text-ink">
                Recently Viewed
              </h2>
              <PosterGrid items={recentlyViewed.slice(0, 12)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
