import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const key = (entry) => `${entry.media_type}:${entry.tmdb_id}`
const CAP = 24

/**
 * Bump an entry to the front (or insert it), keeping the most useful fields.
 * `extra` (e.g. viewedAt / startedAt) is applied last so it always wins.
 */
function upsert(list, entry, extra) {
  const existing = list.find((e) => key(e) === key(entry))
  const next = existing
    ? { ...existing, ...entry, ...extra }
    : { ...entry, ...extra }
  return [next, ...list.filter((e) => key(e) !== key(entry))].slice(0, CAP)
}

/**
 * Local watch history — persisted to localStorage.
 * Recently viewed: any title whose detail page was opened.
 * Continue watching: titles opened in the player, best-effort progress (0..1)
 * from embed postMessage events when a player reports them.
 */
export const useHistoryStore = create(
  persist(
    (set) => ({
      recentlyViewed: [],
      continueWatching: [],

      recordView: (entry) =>
        set((state) => ({
          recentlyViewed: upsert(state.recentlyViewed, entry, { viewedAt: Date.now() }),
        })),

      recordStart: (entry) =>
        set((state) => ({
          continueWatching: upsert(state.continueWatching, entry, { startedAt: Date.now() }),
        })),

      updateProgress: (tmdbId, mediaType, progress, durationSec = null) =>
        set((state) => ({
          continueWatching: state.continueWatching.map((e) =>
            e.tmdb_id === tmdbId && e.media_type === mediaType
              ? { ...e, progress, durationSec, startedAt: Date.now() }
              : e,
          ),
        })),

      clearContinue: (tmdbId, mediaType) =>
        set((state) => ({
          continueWatching: state.continueWatching.filter(
            (e) => !(e.tmdb_id === tmdbId && e.media_type === mediaType),
          ),
        })),
    }),
    { name: 'moovio-history' },
  ),
)
