import { useEffect, useRef, useState } from 'react'
import { Check, ListPlus, Plus } from 'lucide-react'
import { useLibraryStore } from '../../store/libraryStore'
import Button from '../ui/Button'

export default function AddToListMenu({ entry }) {
  const customLists = useLibraryStore((s) => s.customLists)
  const addToList = useLibraryStore((s) => s.addToList)
  const createList = useLibraryStore((s) => s.createList)
  const inList = useLibraryStore((s) => s.inList)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const createAndAdd = () => {
    const id = createList(name)
    if (id) {
      addToList(id, entry)
      setName('')
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="secondary"
        size="lg"
        icon={<ListPlus size={16} strokeWidth={2} />}
        onClick={() => setOpen((v) => !v)}
      >
        Lists
      </Button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-72 overflow-hidden rounded-2xl border border-hairline bg-[#0c0c0e]/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="max-h-72 overflow-y-auto py-1">
            {customLists.length === 0 ? (
              <p className="px-4 py-4 text-[13px] leading-relaxed text-mute">
                No lists yet. Create one below, then add this title to it.
              </p>
            ) : (
              customLists.map((list) => {
                const on = inList(list.id, entry)
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => addToList(list.id, entry)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.07]"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
                        on ? 'border-accent bg-accent text-white' : 'border-white/20 text-transparent'
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium">
                      {list.name}
                    </span>
                    <span className="text-xs tabular-nums text-mute">{list.items.length}</span>
                  </button>
                )
              })
            )}
          </div>

          <div className="border-t border-hairline p-3">
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
                placeholder="New list name…"
                className="h-9 min-w-0 flex-1 rounded-lg border border-hairline bg-white/[0.03] px-3 text-[13px] text-ink placeholder:text-mute focus:border-white/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={createAndAdd}
                disabled={!name.trim()}
                aria-label="Create list"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-black transition-colors hover:bg-white disabled:opacity-40"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
