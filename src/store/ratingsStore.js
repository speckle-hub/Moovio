import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const key = (e) => `${e.media_type}:${e.tmdb_id}`

/**
 * Personal ratings + "watched" tracking — persisted to localStorage.
 * Entries are snapshots enriched with data from the detail page:
 * { tmdb_id, media_type, title, poster_path, year?, tmdbRating?, genres?,
 *   runtimeMinutes?, rating? (1..10), watched?, watchedAt?, ratedAt? }
 */
export const useRatingsStore = create(
  persist(
    (set, get) => ({
      entries: {},

      rate: (entry, value) =>
        set((state) => {
          const k = key(entry)
          const next = {
            ...(state.entries[k] || {}),
            ...entry,
            rating: value,
            ratedAt: Date.now(),
          }
          if (value <= 0) delete next.rating
          return { entries: { ...state.entries, [k]: next } }
        }),

      toggleWatched: (entry) => {
        const existing = get().entries[key(entry)]
        const watched = !existing?.watched
        set((state) => {
          const k = key(entry)
          const next = { ...(existing || {}), ...entry, watched }
          if (watched) next.watchedAt = next.watchedAt || Date.now()
          else delete next.watchedAt
          return { entries: { ...state.entries, [k]: next } }
        })
      },

      setWatched: (entry, watched) => {
        const existing = get().entries[key(entry)]
        set((state) => {
          const k = key(entry)
          const next = { ...(existing || {}), ...entry, watched }
          if (watched) next.watchedAt = next.watchedAt || Date.now()
          else delete next.watchedAt
          return { entries: { ...state.entries, [k]: next } }
        })
      },

      getEntry: (tmdbId, mediaType) => get().entries[`${mediaType}:${tmdbId}`] || null,
    }),
    { name: 'moovio-ratings' },
  ),
)
