import { Star } from 'lucide-react'

/** Monochrome score — no badges, no color; just a star and a number. */
export default function Rating({ value, className = '', showMax = true }) {
  if (value == null) return null
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm ${className}`}
      title={`TMDB score ${value.toFixed(1)}/10`}
    >
      <Star size={14} strokeWidth={1.75} className="text-sub fill-none" />
      <span className="text-ink font-medium tracking-[-0.01em] tabular-nums">
        {value.toFixed(1)}
      </span>
      {showMax && <span className="text-mute text-xs">/ 10</span>}
    </span>
  )
}
