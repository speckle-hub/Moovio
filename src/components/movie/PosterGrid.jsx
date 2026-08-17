import PosterCard from './PosterCard'
import { SkeletonGrid } from '../ui/Skeleton'

export default function PosterGrid({ items, loading, error, showRemove = false, removeKind = 'watchlist', onRemove, onRetry }) {
  if (loading) {
    return (
      <div className="container-x">
        <SkeletonGrid count={12} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-x">
        <div className="rounded-2xl border border-hairline bg-surface">
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <h3 className="font-display text-xl font-semibold tracking-[-0.01em]">
              Couldn't reach the library
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-sub">
              {error} — try again in a moment.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-7 h-10 rounded-lg bg-ink px-6 text-sm font-medium text-black transition-colors hover:bg-white"
              >
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-5">
        {items.map((item, i) => (
          <PosterCard key={`${item.media_type}-${item.id}`} item={item} index={i} showRemove={showRemove} removeKind={removeKind} onRemove={onRemove} />
        ))}
      </div>
    </div>
  )
}
