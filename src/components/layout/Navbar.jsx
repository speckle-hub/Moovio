import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, X, Shuffle } from 'lucide-react'
import { fetchRandomTitle } from '../../lib/tmdb'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/movies', label: 'Movies' },
  { to: '/tv', label: 'TV' },
  { to: '/lists', label: 'Lists' },
  { to: '/watchlist', label: 'My List' },
  { to: '/stats', label: 'Stats' },
]

const EASE = [0.16, 1, 0.3, 1]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [surprising, setSurprising] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const [lastPath, setLastPath] = useState(location.pathname)
  if (location.pathname !== lastPath) {
    setLastPath(location.pathname)
    setOpen(false)
  }

  const surprise = async () => {
    if (surprising) return
    setSurprising(true)
    try {
      const item = await fetchRandomTitle()
      if (item) navigate(`/${item.media_type}/${item.id}`)
    } finally {
      setSurprising(false)
    }
  }

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color,box-shadow] duration-500 ${scrolled ? 'glass border-b border-hairline' : 'bg-transparent'}`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-[72px]">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="font-display text-[22px] font-bold tracking-[-0.03em]"
          >
            Moovio
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-[13px] font-medium tracking-[-0.01em] transition-colors duration-300 ${isActive ? 'text-accent' : 'text-sub hover:text-ink'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Surprise me"
            onClick={surprise}
            disabled={surprising}
            title="Surprise me"
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sub transition-colors duration-300 hover:bg-white/8 hover:text-ink disabled:opacity-50 ${surprising ? 'animate-pulse' : ''}`}
          >
            <Shuffle size={19} strokeWidth={1.75} />
          </button>

          <Link
            to="/search"
            aria-label="Search"
            title="Quick search ( / )"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sub transition-colors duration-300 hover:bg-white/8 hover:text-ink"
          >
            <Search size={19} strokeWidth={1.75} />
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sub transition-colors duration-300 hover:bg-white/8 hover:text-ink md:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="glass overflow-hidden border-b border-hairline md:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${isActive ? 'text-accent' : 'text-sub hover:bg-white/6 hover:text-ink'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
