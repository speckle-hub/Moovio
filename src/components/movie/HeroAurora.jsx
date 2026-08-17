import { lazy, Suspense, useMemo } from 'react'
import { ACCENTS, useSettingsStore } from '../../store/settingsStore'

const Aurora = lazy(() => import('../Aurora'))

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, (n >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (n & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/**
 * Lazy WebGL aurora wash (React Bits) rendered behind the hero backdrop.
 * Color stops are derived from the active accent so it stays on-token
 * across all six accent options. Low opacity keeps the title readable.
 */
export default function HeroAurora() {
  const accent = useSettingsStore((s) => s.accent)
  const base = (ACCENTS[accent] || ACCENTS.blue).accent
  const stops = useMemo(() => [shade(base, -70), base, shade(base, -30)], [base])

  return (
    <Suspense fallback={null}>
      <Aurora colorStops={stops} amplitude={0.9} blend={0.6} speed={0.45} />
    </Suspense>
  )
}
