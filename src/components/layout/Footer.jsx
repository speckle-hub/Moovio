import { Link } from 'react-router-dom'
import { ACCENTS, useSettingsStore } from '../../store/settingsStore'

export default function Footer() {
  const accent = useSettingsStore((s) => s.accent)
  const setAccent = useSettingsStore((s) => s.setAccent)

  return (
    <footer className="mt-24 border-t border-hairline">
      <div className="container-x flex flex-col gap-8 py-12">
        <div className="flex flex-col gap-6 text-xs text-mute md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-display text-base font-bold tracking-[-0.03em] text-ink">
              Moovio
            </span>
            <span>A cinematic movie discovery concept.</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link to="/lists" className="transition-colors hover:text-ink">
              Lists
            </Link>
            <Link to="/watchlist" className="transition-colors hover:text-ink">
              My List
            </Link>
            <Link to="/favorites" className="transition-colors hover:text-ink">
              Favorites
            </Link>
            <Link to="/stats" className="transition-colors hover:text-ink">
              Stats
            </Link>
          </nav>

          <p>
            Data provided by{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noreferrer"
              className="text-sub transition-colors hover:text-ink"
            >
              TMDB
            </a>
            . Trailers hosted by YouTube.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
            Accent
          </span>
          <div className="flex items-center gap-3">
            {Object.entries(ACCENTS).map(([id, c]) => (
              <button
                key={id}
                type="button"
                aria-label={c.label}
                title={c.label}
                onClick={() => setAccent(id)}
                className={`h-6 w-6 rounded-full transition-all duration-200 hover:scale-110 ${
                  accent === id
                    ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-black'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.accent }}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
