import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, Layers, Pencil, Trash2, X } from 'lucide-react'
import { useLibraryStore } from '../store/libraryStore'
import PosterGrid from '../components/movie/PosterGrid'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

export default function ListDetail() {
  const { listId } = useParams()
  const navigate = useNavigate()
  const customLists = useLibraryStore((s) => s.customLists)
  const renameList = useLibraryStore((s) => s.renameList)
  const deleteList = useLibraryStore((s) => s.deleteList)
  const removeFromList = useLibraryStore((s) => s.removeFromList)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const list = customLists.find((l) => l.id === listId)

  if (!list) {
    return (
      <div className="container-x flex min-h-[70vh] items-center justify-center">
        <EmptyState
          icon={<Layers size={26} strokeWidth={1.5} />}
          title="List not found"
          description="This list may have been deleted or moved."
          action={
            <Link to="/lists">
              <Button variant="primary" size="md" glow>
                Back to Lists
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const items = list.items.map((e) => ({
    id: e.tmdb_id,
    media_type: e.media_type,
    title: e.title,
    poster_path: e.poster_path,
    year: e.year,
    rating: e.rating,
  }))

  const saveRename = () => {
    if (draft.trim() && draft.trim() !== list.name) renameList(list.id, draft)
    setEditing(false)
  }

  const removeList = () => {
    deleteList(list.id)
    navigate('/lists')
  }

  return (
    <div className="pt-28 md:pt-36">
      <header className="container-x">
        <div className="flex flex-wrap items-center gap-3">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                autoFocus
                className="h-11 w-64 rounded-xl border border-accent bg-elevated px-3 font-display text-2xl font-bold tracking-[-0.03em] text-ink shadow-[0_0_16px_-2px_var(--color-accent)] focus:outline-none md:text-3xl"
              />
              <button
                type="button"
                onClick={saveRename}
                aria-label="Save name"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-surface text-ink transition-colors hover:border-white/40 hover:bg-elevated"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Cancel rename"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-sub transition-colors hover:border-white/25 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">
              {list.name}
            </h1>
          )}
        </div>

        <p className="mt-2 text-sm text-sub">
          {list.items.length} {list.items.length === 1 ? 'title' : 'titles'} in this collection
        </p>

        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setDraft(list.name)
              setEditing(true)
            }}
            className="flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-4 text-[13px] font-medium text-sub backdrop-blur-md transition-all hover:border-white/25 hover:bg-elevated hover:text-ink"
          >
            <Pencil size={13} strokeWidth={1.75} />
            Rename
          </button>
          <button
            type="button"
            onClick={removeList}
            className="flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-4 text-[13px] font-medium text-sub backdrop-blur-md transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={13} strokeWidth={1.75} />
            Delete list
          </button>
        </div>
      </header>

      <div className="mt-10 pb-12">
        {items.length === 0 ? (
          <EmptyState
            icon={<Layers size={26} strokeWidth={1.5} />}
            title="This collection is empty"
            description="Open any movie or TV show and use the Lists button to add it to this collection."
            action={
              <Link to="/movies">
                <Button variant="primary" size="md" glow>
                  Browse Movies
                </Button>
              </Link>
            }
          />
        ) : (
          <PosterGrid
            items={items}
            loading={false}
            showRemove
            onRemove={(entry) => removeFromList(list.id, entry)}
          />
        )}
      </div>
    </div>
  )
}
