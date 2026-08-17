import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import { useLibraryStore } from '../store/libraryStore'
import LibraryGrid from '../components/library/LibraryGrid'
import Button from '../components/ui/Button'

export default function Watchlist() {
  const watchlist = useLibraryStore((s) => s.watchlist)

  const items = watchlist.map((e) => ({
    id: e.tmdb_id,
    media_type: e.media_type,
    title: e.title,
    poster_path: e.poster_path,
    year: e.year,
    rating: e.rating,
    addedAt: e.addedAt,
  }))

  return (
    <div className="pt-28 md:pt-36">
      <header className="container-x">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
          My List
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">
          Everything you&apos;ve saved to watch, in one place.
        </p>
      </header>

      <div className="mt-10 pb-12">
        <LibraryGrid
          items={items}
          removeKind="watchlist"
          emptyIcon={<Bookmark size={26} strokeWidth={1.5} />}
          emptyTitle="Your list is empty"
          emptyDescription="Save movies and TV series to My List from any card or detail page and they'll show up here."
          emptyAction={
            <Link to="/movies">
              <Button variant="primary" size="md" glow>
                Browse Movies
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  )
}
