import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useLibraryStore } from '../store/libraryStore'
import LibraryGrid from '../components/library/LibraryGrid'
import Button from '../components/ui/Button'

export default function Favorites() {
  const favorites = useLibraryStore((s) => s.favorites)

  const items = favorites.map((e) => ({
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
          Favorites
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">
          The movies and series you&apos;ve starred and kept close.
        </p>
      </header>

      <div className="mt-10 pb-12">
        <LibraryGrid
          items={items}
          removeKind="favorite"
          emptyIcon={<Heart size={26} strokeWidth={1.5} />}
          emptyTitle="No favorites yet"
          emptyDescription="Tap the heart icon on any title to star it. Your favorites are saved locally on this device."
          emptyAction={
            <Link to="/tv">
              <Button variant="primary" size="md" glow>
                Browse Series
              </Button>
            </Link>
          }
        />
      </div>
    </div>
  )
}
