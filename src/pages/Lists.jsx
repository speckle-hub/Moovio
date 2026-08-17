import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Layers, Trash2 } from 'lucide-react'
import { useLibraryStore } from '../store/libraryStore'
import { tmdbImage } from '../lib/images'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import SmartImage from '../components/ui/SmartImage'

function ListCard({ list, index = 0 }) {
  const deleteList = useLibraryStore((s) => s.deleteList)
  const preview = list.items.slice(0, 4)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface/70 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_24px_-4px_var(--color-accent)]"
    >
      <Link to={`/lists/${list.id}`} className="block">
        {/* 4-Poster Collage Box */}
        <div className="grid aspect-[16/9] grid-cols-2 grid-rows-2 gap-0.5 bg-black/40 overflow-hidden">
          {preview.length > 0 ? (
            preview.map((e) => (
              <div key={`${e.media_type}:${e.tmdb_id}`} className="relative overflow-hidden bg-elevated">
                <SmartImage
                  src={tmdbImage(e.poster_path, 'w185')}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
              </div>
            ))
          ) : (
            <div className="col-span-2 row-span-2 flex flex-col items-center justify-center gap-1.5 text-mute bg-elevated/40">
              <Layers size={28} strokeWidth={1.25} />
              <span className="text-[11px] font-medium tracking-wide">Empty collection</span>
            </div>
          )}
        </div>

        {/* Card Footer with Frosted Glass styling */}
        <div className="flex items-center justify-between gap-3 border-t border-white/8 bg-black/30 p-4 backdrop-blur-lg">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
              {list.name}
            </h2>
            <p className="mt-0.5 text-xs text-mute">
              {list.items.length} {list.items.length === 1 ? 'title' : 'titles'}
            </p>
          </div>

          <button
            type="button"
            aria-label={`Delete ${list.name}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              deleteList(list.id)
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sub transition-all duration-200 hover:scale-105 hover:border-red-500/30 hover:bg-red-500/15 hover:text-red-400"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Lists() {
  const customLists = useLibraryStore((s) => s.customLists)

  return (
    <div className="pt-28 md:pt-36">
      <header className="container-x">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
          Lists
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-sub">
          Curate custom collections — add any movie or series to a list from its title page.
        </p>
      </header>

      <div className="mt-10 pb-12">
        {customLists.length === 0 ? (
          <EmptyState
            icon={<Layers size={26} strokeWidth={1.5} />}
            title="No collections yet"
            description="Open any movie or TV series and click the Lists button to start your first custom collection."
            action={
              <Link to="/movies">
                <Button variant="primary" size="md" glow>
                  Browse Movies
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="container-x grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {customLists.map((list, i) => (
              <ListCard key={list.id} list={list} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
