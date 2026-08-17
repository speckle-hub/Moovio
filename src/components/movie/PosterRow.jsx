import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PosterCard from './PosterCard'

export default function PosterRow({ title, to, items }) {
  const scroller = useRef(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const update = () => {
    const el = scroller.current
    if (!el) return
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  const scrollBy = (dir) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  const onKeyDown = (e) => {
    const el = scroller.current
    if (!el) return
    const step = el.clientWidth * 0.9
    switch (e.key) {
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault()
        el.scrollBy({ left: -step, behavior: 'smooth' })
        break
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault()
        el.scrollBy({ left: step, behavior: 'smooth' })
        break
      default:
        break
    }
  }

  return (
    <section className="container-x">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em] md:text-2xl">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {to && (
            <Link
              to={to}
              className="text-[13px] font-medium text-sub transition-colors hover:text-ink"
            >
              See all
            </Link>
          )}
          <div className="hidden items-center gap-1.5 sm:flex">
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy(-1)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                canLeft
                  ? 'border-hairline text-sub hover:border-white/20 hover:text-ink'
                  : 'pointer-events-none border-white/[0.04] text-white/15'
              }`}
            >
              <ChevronLeft size={17} strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy(1)}
              className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                canRight
                  ? 'border-hairline text-sub hover:border-white/20 hover:text-ink'
                  : 'pointer-events-none border-white/[0.04] text-white/15'
              }`}
            >
              <ChevronRight size={17} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scroller}
        onScroll={update}
        onKeyDown={onKeyDown}
        role="region"
        aria-label={title}
        tabIndex={0}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pt-6 pb-2 -mt-6 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12"
      >
        {items.map((item, i) => (
          <div
            key={`${item.media_type}-${item.id}`}
            className="w-[46vw] max-w-[220px] shrink-0 snap-start sm:w-[240px]"
          >
            <PosterCard item={item} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}
