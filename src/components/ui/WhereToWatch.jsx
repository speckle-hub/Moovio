import { Tv, ExternalLink } from 'lucide-react'
import { tmdbImage } from '../../lib/images'
import SmartImage from './SmartImage'

const GROUPS = [
  { key: 'flatrate', label: 'Stream' },
  { key: 'ads', label: 'Free with ads' },
  { key: 'free', label: 'Free' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
  { key: 'cinema', label: 'In theaters' },
]

/** Streaming / rental availability for a region, from TMDB watch/providers. */
export default function WhereToWatch({ providers }) {
  if (!providers) return null

  const groups = GROUPS.map((g) => ({
    ...g,
    items: providers[g.key] || [],
  })).filter((g) => g.items.length > 0)

  if (groups.length === 0) return null

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface/70 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/20">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <Tv size={16} />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold tracking-[-0.01em] text-ink">
              Where to Watch
            </h2>
            <p className="text-xs text-mute">Available platforms & streaming providers</p>
          </div>
        </div>

        {providers.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-sub transition-colors hover:text-accent"
          >
            <span>Details</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      {/* Provider Categories */}
      <div className="mt-5 space-y-4">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
            <span className="w-28 shrink-0 text-[12.5px] font-semibold text-sub">
              {group.label}
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {group.items.map((p) => (
                <a
                  key={p.provider_id}
                  href={providers.link}
                  target="_blank"
                  rel="noreferrer"
                  title={p.provider_name}
                  className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-elevated shadow-md transition-all duration-200 hover:scale-110 hover:border-accent/40 hover:shadow-[0_0_16px_-4px_var(--color-accent)]"
                >
                  <SmartImage
                    src={tmdbImage(p.logo_path, 'w92')}
                    alt={p.provider_name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    draggable={false}
                    fallback={
                      <span className="px-1 text-center text-[9px] leading-tight text-mute">
                        {p.provider_name}
                      </span>
                    }
                  />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-white/8 pt-3 text-right text-[11px] text-mute">
        Powered by{' '}
        <a
          href={providers.link || 'https://www.themoviedb.org'}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sub underline-offset-2 transition-colors hover:text-ink hover:underline"
        >
          JustWatch / TMDB
        </a>
      </div>
    </section>
  )
}
