/**
 * Shimmer placeholder components with subtle light reflection sweep.
 */
export default function Skeleton({ className = '', shimmer = true }) {
  return (
    <div
      className={`rounded-[inherit] bg-white/[0.05] ${
        shimmer ? 'shimmer-mask' : 'animate-pulse'
      } ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ poster = true, className = '' }) {
  return (
    <div className={`group relative overflow-hidden rounded-poster ${className}`}>
      {/* Poster / Thumbnail Box */}
      <div className={`relative w-full overflow-hidden rounded-poster bg-elevated ${poster ? 'aspect-[2/3]' : 'aspect-video'}`}>
        <Skeleton className="h-full w-full" />
        {/* Subtle rating pill placeholder in top corner */}
        <div className="absolute top-2.5 right-2.5 h-4 w-9 rounded-full bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Metadata lines */}
      <div className="mt-3 space-y-1.5 px-0.5">
        <Skeleton className="h-3.5 w-4/5 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-1/4 rounded-md" />
          <Skeleton className="h-2.5 w-1/3 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 12, poster = true }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} poster={poster} />
      ))}
    </div>
  )
}

export function SkeletonRow({ count = 6, poster = true }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} poster={poster} />
      ))}
    </div>
  )
}
