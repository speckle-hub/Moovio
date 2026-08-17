import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Bklit-inspired Area Chart for viewing hours watched over time.
 */
export function HoursAreaChart({ data = [], height = 180 }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  if (data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-hairline text-xs text-mute">
        Watch titles to generate watch time trends
      </div>
    )
  }

  const values = data.map((d) => d.hours)
  const maxVal = Math.max(...values, 1)
  const paddingX = 24
  const paddingY = 20
  const width = 460
  const chartHeight = height - paddingY * 2

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (width - paddingX * 2)
    const y = height - paddingY - (d.hours / maxVal) * chartHeight
    return { x, y, ...d }
  })

  // Create smooth bezier curve path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`
    const prev = arr[i - 1]
    const cx1 = prev.x + (pt.x - prev.x) / 2
    const cy1 = prev.y
    const cx2 = prev.x + (pt.x - prev.x) / 2
    const cy2 = pt.y
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
      >
        <defs>
          <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = height - paddingY - pct * chartHeight
          return (
            <line
              key={i}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
            />
          )
        })}

        {/* Gradient fill area */}
        <motion.path
          d={areaD}
          fill="url(#hoursGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* Stroke line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 6 : 3.5}
              fill={hoverIndex === i ? '#fff' : 'var(--color-accent)'}
              stroke="var(--color-surface)"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          </g>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          className="pointer-events-none absolute -top-1 transform -translate-x-1/2 rounded-lg border border-white/10 bg-black/85 px-2.5 py-1 text-center shadow-xl backdrop-blur-md"
          style={{ left: `${(points[hoverIndex].x / width) * 100}%` }}
        >
          <p className="text-[11px] font-semibold text-white">
            {points[hoverIndex].hours.toFixed(1)} hrs
          </p>
          <p className="text-[9px] text-mute">{points[hoverIndex].label}</p>
        </div>
      )}

      {/* X-axis labels */}
      <div className="mt-2 flex justify-between px-2 text-[11px] text-mute">
        <span>{data[0]?.label || ''}</span>
        <span>{data[Math.floor(data.length / 2)]?.label || ''}</span>
        <span>{data[data.length - 1]?.label || ''}</span>
      </div>
    </div>
  )
}

/**
 * Interactive Donut Chart for Genre Breakdown.
 */
export function GenreDonutChart({ data = [] }) {
  const [hovered, setHovered] = useState(null)

  if (data.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-hairline text-xs text-mute">
        Mark titles as watched to view genre distribution
      </div>
    )
  }

  const total = data.reduce((acc, d) => acc + d.count, 0)
  const size = 180
  const radius = 64
  const strokeWidth = 22
  const center = size / 2
  const circumference = 2 * Math.PI * radius

  // Palette of subtle harmonious tones derived from theme
  const colors = [
    'var(--color-accent)',
    '#38bdf8',
    '#a855f7',
    '#ec4899',
    '#f59e0b',
    '#10b981',
    '#6366f1',
    '#64748b',
  ]

  const arcs = []
  let cumulative = 0
  for (let i = 0; i < data.length; i++) {
    const d = data[i]
    const fraction = d.count / total
    arcs.push({
      ...d,
      color: colors[i % colors.length],
      fraction,
      strokeDasharray: `${fraction * circumference} ${circumference}`,
      strokeDashoffset: -cumulative * circumference,
    })
    cumulative += fraction
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
      {/* Donut SVG */}
      <div className="relative flex h-[180px] w-[180px] shrink-0 items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90 transform">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc, i) => (
            <motion.circle
              key={arc.label}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={hovered === i ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={arc.strokeDasharray}
              strokeDashoffset={arc.strokeDashoffset}
              strokeLinecap="round"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">
            {hovered !== null ? arcs[hovered].count : total}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-mute">
            {hovered !== null ? arcs[hovered].label : 'Titles'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        {arcs.slice(0, 6).map((arc, i) => (
          <div
            key={arc.label}
            className={`flex items-center gap-2 cursor-pointer transition-opacity duration-150 ${
              hovered !== null && hovered !== i ? 'opacity-40' : 'opacity-100'
            }`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: arc.color }}
            />
            <span className="truncate max-w-[90px] font-medium text-sub">{arc.label}</span>
            <span className="font-bold text-ink">{Math.round(arc.fraction * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Activity Bar Chart for Monthly / Weekly Volume.
 */
export function ActivityBarChart({ data = [] }) {
  const [hovered, setHovered] = useState(null)

  if (data.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-hairline text-xs text-mute">
        No recent activity logged
      </div>
    )
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="w-full select-none">
      <div className="flex h-36 items-end gap-2 px-1">
        {data.map((item, i) => {
          const heightPct = Math.max(8, (item.count / maxVal) * 100)
          const isHovered = hovered === i

          return (
            <div
              key={item.label}
              className="group relative flex flex-1 flex-col items-center"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="pointer-events-none absolute -top-8 z-20 rounded-md border border-white/10 bg-black/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg backdrop-blur-sm">
                  {item.count} titles
                </div>
              )}

              {/* Bar */}
              <div className="relative w-full flex-1 flex items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full rounded-t-lg transition-all duration-200 ${
                    isHovered
                      ? 'bg-accent shadow-[0_0_14px_var(--color-accent)]'
                      : 'bg-white/15 hover:bg-white/30'
                  }`}
                />
              </div>

              {/* X label */}
              <span className="mt-2 truncate text-[10.5px] font-medium text-mute">
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Radial Rating Gauge with Score Breakdown.
 */
export function RatingGauge({ avgRating = 0, totalRated = 0, distribution = {} }) {
  const size = 150
  const radius = 54
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(10, Math.max(0, avgRating)) / 10
  const strokeDashoffset = circumference - progress * circumference

  const tiers = [
    { label: 'Masterpiece (9-10)', count: distribution['9-10'] || 0, color: 'var(--color-accent)' },
    { label: 'Great (7-8)', count: distribution['7-8'] || 0, color: '#38bdf8' },
    { label: 'Good (5-6)', count: distribution['5-6'] || 0, color: '#94a3b8' },
    { label: 'Mediocre (1-4)', count: distribution['1-4'] || 0, color: '#64748b' },
  ]

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
      {/* Radial Meter */}
      <div className="relative flex h-[150px] w-[150px] shrink-0 items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90 transform">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            className="drop-shadow-[0_0_12px_var(--color-accent)]"
          />
        </svg>

        <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
          <span className="font-display text-3xl font-extrabold tracking-tight text-ink">
            {avgRating > 0 ? avgRating.toFixed(1) : '—'}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-mute">Avg Rating</span>
        </div>
      </div>

      {/* Tier Distribution Bars */}
      <div className="w-full max-w-[200px] space-y-2.5 text-xs">
        {tiers.map((t) => (
          <div key={t.label}>
            <div className="flex justify-between text-[11px] font-medium text-sub mb-1">
              <span>{t.label}</span>
              <span className="font-bold text-ink">{t.count}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: totalRated > 0 ? `${(t.count / totalRated) * 100}%` : '0%',
                }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full"
                style={{ backgroundColor: t.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
