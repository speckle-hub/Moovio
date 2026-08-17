import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Maximize,
  Minimize,
  RotateCcw,
  SkipForward,
  X,
  Link2,
  Check,
  Radio,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { STREAM_PROVIDERS, buildStreamUrl } from '../../lib/streams'
import { useFocusTrap } from '../../lib/hooks'
import { usePlaybackStore } from '../../store/playbackStore'

const EASE = [0.16, 1, 0.3, 1]
const REMEMBER_AFTER_MS = 3000
const FAIL_TIMEOUT_MS = 12000
const SWITCH_GRACE_MS = 4000

export default function WatchModal({
  open,
  title,
  mediaType,
  tmdbId,
  imdbId,
  season,
  episode,
  onClose,
  onProgress,
  onNextEpisode,
}) {
  const [index, setIndex] = useState(0)
  const mediaKey = `${tmdbId}|${season ?? ''}|${episode ?? ''}`
  const [prevOpen, setPrevOpen] = useState(open)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [toast, setToast] = useState(null)
  const chipScroller = useRef(null)
  const dialogRef = useRef(null)
  const iframeRef = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const loadedRef = useRef(false)
  const stalledRef = useRef(false)
  const toastTimeoutRef = useRef(null)
  const { setPreferred, markBad, unmarkBad, isBad, getPreferred } = usePlaybackStore()

  useFocusTrap(dialogRef, open)

  const ctx = { tmdbId, imdbId, season: season ?? 1, episode: episode ?? 1, mediaType }
  const provider = STREAM_PROVIDERS[index]
  const src = provider ? buildStreamUrl(provider, ctx) : null
  const mountKey = `${mediaKey}|${provider?.id}`
  const [prevMount, setPrevMount] = useState(mountKey)

  const showToast = (message, icon = Check) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToast({ message, icon })
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null)
    }, 2800)
  }

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setHasLoaded(false)
      const preferredId = getPreferred(mediaType, tmdbId)
      const preferredIndex = preferredId
        ? STREAM_PROVIDERS.findIndex((p) => p.id === preferredId && buildStreamUrl(p, ctx))
        : -1
      setIndex(preferredIndex >= 0 ? preferredIndex : 0)
    }
  }

  if (mountKey !== prevMount) {
    setPrevMount(mountKey)
    setHasLoaded(false)
  }

  const updateChips = useCallback(() => {
    const el = chipScroller.current
    if (!el) return
    const left = el.scrollLeft > 4
    const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 4
    setCanLeft((p) => (p === left ? p : left))
    setCanRight((p) => (p === right ? p : right))
  }, [])

  const scrollChips = (dir) => {
    const el = chipScroller.current
    if (el) el.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !onProgress) return
    const onMessage = (e) => {
      try {
        if (e.source !== iframeRef.current?.contentWindow) return
        const d = e.data
        if (!d || typeof d !== 'object') return
        const duration = Number(d.duration ?? d.durationSec)
        const pos = Number(d.currentTime ?? d.position ?? d.pos)
        if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(pos)) return
        onProgress(Math.min(1, Math.max(0, pos / duration)))
      } catch {
        /* ignore malformed postMessage payloads */
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [open, onProgress])

  const remember = () => {
    setPreferred(mediaType, tmdbId, provider?.id)
    showToast(`Saved ${provider?.name} as preferred player`, Sparkles)
  }

  const next = () => {
    if (provider && !loadedRef.current && stalledRef.current) {
      markBad(mediaType, tmdbId, provider.id)
    }
    let i = index
    let found = false
    for (let n = 0; n < STREAM_PROVIDERS.length; n++) {
      i = (i + 1) % STREAM_PROVIDERS.length
      const p = STREAM_PROVIDERS[i]
      if (buildStreamUrl(p, ctx) && !isBad(mediaType, tmdbId, p.id)) {
        setIndex(i)
        showToast(`Switched to ${p.name}`, Radio)
        found = true
        break
      }
    }
    if (!found) showToast('All sources exhausted', RotateCcw)
  }

  const selectProvider = (i) => {
    if (i !== index && provider && !loadedRef.current && stalledRef.current) {
      markBad(mediaType, tmdbId, provider.id)
    }
    setIndex(i)
    setPreferred(mediaType, tmdbId, STREAM_PROVIDERS[i].id)
    showToast(`Loaded ${STREAM_PROVIDERS[i].name}`, Radio)
  }

  const copyStreamUrl = async () => {
    if (!src) return
    try {
      await navigator.clipboard.writeText(src)
      showToast('Stream link copied to clipboard', Link2)
    } catch {
      /* clipboard unavailable */
    }
  }

  const openExternal = () => {
    if (src) window.open(src, '_blank', 'noopener')
  }

  const toggleFullscreen = () => {
    const doc = document
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      ;(doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc)
    } else {
      ;(doc.documentElement.requestFullscreen || doc.documentElement.webkitRequestFullscreen)?.call(
        doc.documentElement,
      )
    }
  }

  useEffect(() => {
    const onChange = () => {
      const el = document.fullscreenElement || document.webkitFullscreenElement
      setIsFullscreen(Boolean(el))
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  useEffect(() => {
    loadedRef.current = hasLoaded
  }, [hasLoaded])

  useEffect(() => {
    stalledRef.current = false
    const t = setTimeout(() => {
      stalledRef.current = true
    }, SWITCH_GRACE_MS)
    return () => clearTimeout(t)
  }, [open, provider?.id, mediaKey])

  useEffect(() => {
    if (!open || !provider || !hasLoaded) return
    unmarkBad(mediaType, tmdbId, provider.id)
    const t = setTimeout(remember, REMEMBER_AFTER_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, provider?.id, hasLoaded, mediaKey, mediaType, tmdbId])

  useEffect(() => {
    if (!open || !provider) return
    const t = setTimeout(() => {
      if (!loadedRef.current) {
        markBad(mediaType, tmdbId, provider.id)
        showToast(`Auto-advancing past unresponsive ${provider.name}`, RotateCcw)
        next()
      }
    }, FAIL_TIMEOUT_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, provider?.id, mediaKey, mediaType, tmdbId])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-0 z-[100] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={`Watch ${title || 'title'}`}
        >
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

          <div className="relative z-10 flex h-full w-full max-w-6xl flex-col self-center px-4 py-5 sm:px-8">
            {/* Header / Title & Controls */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-lg font-semibold tracking-[-0.01em] md:text-xl">
                  {title}
                </h2>
                {mediaType === 'tv' && (
                  <p className="mt-0.5 text-xs text-sub">
                    Season {season ?? 1} · Episode {episode ?? 1}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {mediaType === 'tv' && onNextEpisode && (
                  <button
                    type="button"
                    onClick={onNextEpisode}
                    className="flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-surface/70 px-4 text-[13px] font-medium text-sub backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:text-ink"
                    title="Play the next episode"
                  >
                    <SkipForward size={14} strokeWidth={1.75} />
                    Next episode
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-surface/70 px-4 text-[13px] font-medium text-sub backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:text-ink"
                  title="Try the next source"
                >
                  <RotateCcw size={14} strokeWidth={1.75} />
                  Next source
                </button>
                <button
                  type="button"
                  onClick={copyStreamUrl}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-surface/70 px-3.5 text-[13px] font-medium text-sub backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:text-ink"
                  title="Copy stream link"
                >
                  <Link2 size={14} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={openExternal}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-surface/70 px-3.5 text-[13px] font-medium text-sub backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:text-ink"
                  title="Open stream in a new tab"
                >
                  <ExternalLink size={14} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface/70 text-sub backdrop-blur-md transition-all hover:scale-105 hover:text-ink"
                >
                  {isFullscreen ? (
                    <Minimize size={15} strokeWidth={1.75} />
                  ) : (
                    <Maximize size={15} strokeWidth={1.75} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close player"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-surface/70 text-sub backdrop-blur-md transition-all hover:scale-105 hover:text-ink"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Provider Carousel */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous sources"
                onClick={() => scrollChips(-1)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  canLeft
                    ? 'border-hairline text-sub hover:border-white/20 hover:text-ink'
                    : 'pointer-events-none border-white/[0.04] text-white/15'
                }`}
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>

              <div
                ref={(el) => {
                  chipScroller.current = el
                  if (el) updateChips()
                }}
                onScroll={updateChips}
                className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-smooth py-1"
              >
                {STREAM_PROVIDERS.map((p, i) => {
                  const url = buildStreamUrl(p, ctx)
                  if (!url) return null
                  const active = i === index
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectProvider(i)}
                      className={`h-8 shrink-0 rounded-full border px-4 text-[12px] font-medium transition-all duration-200 ${
                        active
                          ? 'border-accent bg-accent text-white shadow-[0_0_14px_-2px_var(--color-accent)]'
                          : 'border-white/12 bg-surface/50 text-sub hover:border-white/30 hover:bg-surface hover:text-ink'
                      }`}
                    >
                      {p.name}
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                aria-label="More sources"
                onClick={() => scrollChips(1)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  canRight
                    ? 'border-hairline text-sub hover:border-white/20 hover:text-ink'
                    : 'pointer-events-none border-white/[0.04] text-white/15'
                }`}
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Main Player Frame with React Bits Ambient Loading Overlay */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
              key={`${provider?.id}-${mediaType}-${tmdbId}-${season}-${episode}`}
              className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 shadow-2xl"
            >
              {src ? (
                <>
                  <iframe
                    ref={iframeRef}
                    src={src}
                    title={`${title || 'Stream'} via ${provider?.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                    onLoad={() => setHasLoaded(true)}
                    className="h-full w-full"
                  />

                  {/* React Bits Ambient Spinner Overlay */}
                  <AnimatePresence>
                    {!hasLoaded && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md text-center px-4"
                      >
                        {/* Glowing radial pulse indicator */}
                        <div className="relative mb-5 flex items-center justify-center">
                          <div className="absolute h-20 w-20 rounded-full bg-accent/20 blur-xl animate-pulse" />
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-surface/90 text-accent shadow-[0_0_20px_-4px_var(--color-accent)]">
                            <Loader2 size={24} className="animate-spin" />
                          </div>
                        </div>

                        <h3 className="font-display text-base font-semibold text-ink">
                          Connecting to {provider?.name}…
                        </h3>
                        <p className="mt-1 text-xs text-mute max-w-sm">
                          Loading secure player embed. Auto-advancing if source is unresponsive.
                        </p>

                        {/* 12s radar progress line */}
                        <div className="mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: FAIL_TIMEOUT_MS / 1000, ease: 'linear' }}
                            className="h-full bg-accent"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-mute">
                  This source can&apos;t play this title — try another.
                </div>
              )}
            </motion.div>

            {/* Kokonut Floating Glass Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="pointer-events-none fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-[#0c0c10]/95 px-4 py-2 text-xs font-medium text-white shadow-2xl shadow-black/80 backdrop-blur-2xl"
                >
                  <toast.icon size={14} className="text-accent shrink-0" />
                  <span>{toast.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-3 text-center text-[11px] text-mute">
              Streams are provided by third-party embed sources and may not always be
              available.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
