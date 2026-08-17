import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const titleKey = (mediaType, tmdbId) => `${mediaType}:${tmdbId}`

const clearEntry = (obj, key) => {
  const rest = { ...obj }
  delete rest[key]
  return rest
}

/**
 * Local playback preferences — persisted to localStorage.
 * - preferredSource: provider id keyed by `${media_type}:${tmdb_id}` (last
 *   provider the user picked or that played without being switched).
 * - knownBad: provider ids marked as not working for a specific title, so the
 *   "Next source" button and initial index skip them.
 */
export const usePlaybackStore = create(
  persist(
    (set, get) => ({
      preferredSource: {},
      knownBad: {},

      setPreferred: (mediaType, tmdbId, providerId) =>
        set((state) => ({
          preferredSource: {
            ...state.preferredSource,
            [titleKey(mediaType, tmdbId)]: providerId,
          },
        })),

      getPreferred: (mediaType, tmdbId) =>
        get().preferredSource[titleKey(mediaType, tmdbId)] ?? null,

      markBad: (mediaType, tmdbId, providerId) =>
        set((state) => {
          const key = titleKey(mediaType, tmdbId)
          const set = new Set(state.knownBad[key] || [])
          if (set.has(providerId)) return state
          set.add(providerId)
          return {
            knownBad: { ...state.knownBad, [key]: Array.from(set) },
          }
        }),

      clearBad: (mediaType, tmdbId) =>
        set((state) => {
          const key = titleKey(mediaType, tmdbId)
          if (!state.knownBad[key]) return state
          return { knownBad: clearEntry(state.knownBad, key) }
        }),

      unmarkBad: (mediaType, tmdbId, providerId) =>
        set((state) => {
          const key = titleKey(mediaType, tmdbId)
          const set = state.knownBad[key]
          if (!set || !set.includes(providerId)) return state
          const next = set.filter((id) => id !== providerId)
          return {
            knownBad: next.length ? { ...state.knownBad, [key]: next } : clearEntry(state.knownBad, key),
          }
        }),

      isBad: (mediaType, tmdbId, providerId) =>
        Boolean(get().knownBad[titleKey(mediaType, tmdbId)]?.includes(providerId)),
    }),
    { name: 'moovio-playback' },
  ),
)
