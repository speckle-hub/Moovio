import { useEffect, useState } from 'react'

export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, iframe, [tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab/Shift+Tab focus inside `ref` while `active`, focuses the first
 * focusable element on open, and restores focus on close.
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    const container = ref.current
    if (!active || !container) return

    const previous = document.activeElement
    const focusables = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null)
    focusables()[0]?.focus()

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => {
      container.removeEventListener('keydown', onKeyDown)
      previous?.focus?.()
    }
  }, [active, ref])
}

/**
 * Runs `loader` whenever `deps` changes. Resets to a loading state via
 * render-time state adjustment (avoids synchronous setState inside effects).
 */
export function useAsync(loader, deps = []) {
  const key = deps.join('|')
  const [state, setState] = useState({ data: null, error: null })
  const [prevKey, setPrevKey] = useState(key)

  if (key !== prevKey) {
    setPrevKey(key)
    setState({ data: null, error: null })
  }

  useEffect(() => {
    let alive = true
    loader()
      .then((data) => alive && setState({ data, error: null }))
      .catch((err) => alive && setState({ data: null, error: err.message }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { ...state, loading: state.data === null && state.error === null }
}
