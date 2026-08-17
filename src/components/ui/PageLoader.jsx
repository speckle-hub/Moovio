export default function PageLoader() {
  return (
    <div
      className="flex min-h-[55vh] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <span className="animate-pulse font-display text-sm font-semibold tracking-[0.35em] text-mute">
        MOOVIO
      </span>
    </div>
  )
}
