import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const key = (entry) => `${entry.media_type}:${entry.tmdb_id}`

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `list-${Date.now()}-${Math.random().toString(36).slice(2)}`

function toggleEntry(list, entry) {
  const exists = list.some((e) => key(e) === key(entry))
  return exists ? list.filter((e) => key(e) !== key(entry)) : [...list, { ...entry, addedAt: Date.now() }]
}

/**
 * Local library — persisted to localStorage via zustand's persist middleware.
 * Entries are lightweight snapshots:
 * { tmdb_id, media_type, title, poster_path, year?, rating?, addedAt }
 */
export const useLibraryStore = create(
  persist(
    (set, get) => ({
      watchlist: [],
      favorites: [],
      customLists: [],

      toggleWatchlist: (entry) =>
        set((state) => ({ watchlist: toggleEntry(state.watchlist, entry) })),
      toggleFavorite: (entry) =>
        set((state) => ({ favorites: toggleEntry(state.favorites, entry) })),

      inWatchlist: (tmdbId, mediaType) =>
        get().watchlist.some(
          (e) => e.tmdb_id === tmdbId && (!mediaType || e.media_type === mediaType),
        ),
      inFavorites: (tmdbId, mediaType) =>
        get().favorites.some(
          (e) => e.tmdb_id === tmdbId && (!mediaType || e.media_type === mediaType),
        ),

      /* ------- Custom named lists ------- */

      createList: (name) => {
        const trimmed = name.trim()
        if (!trimmed) return null
        const id = uid()
        set((state) => ({
          customLists: [{ id, name: trimmed, createdAt: Date.now(), items: [] }, ...state.customLists],
        }))
        return id
      },

      deleteList: (id) =>
        set((state) => ({ customLists: state.customLists.filter((l) => l.id !== id) })),

      renameList: (id, name) =>
        set((state) => ({
          customLists: state.customLists.map((l) =>
            l.id === id ? { ...l, name: name.trim() || l.name } : l,
          ),
        })),

      addToList: (listId, entry) =>
        set((state) => ({
          customLists: state.customLists.map((l) =>
            l.id === listId ? { ...l, items: toggleEntry(l.items, entry) } : l,
          ),
        })),

      removeFromList: (listId, entry) =>
        set((state) => ({
          customLists: state.customLists.map((l) =>
            l.id === listId ? { ...l, items: l.items.filter((e) => key(e) !== key(entry)) } : l,
          ),
        })),

      inList: (listId, entry) =>
        Boolean(
          get().customLists.find((l) => l.id === listId)?.items.some((e) => key(e) === key(entry)),
        ),
    }),
    { name: 'moovio-library' },
  ),
)
