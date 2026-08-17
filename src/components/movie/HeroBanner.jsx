import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Play } from 'lucide-react'
import { tmdbImage, tmdbSrcset } from '../../lib/images'
import Button from '../ui/Button'
import Rating from '../ui/Rating'
import SmartImage from '../ui/SmartImage'
import BlurText from '../BlurText'
import HeroAurora from './HeroAurora'

const EASE = [0.16, 1, 0.3, 1]

export default function HeroBanner({ item, onWatch, onTrailer, onDetails }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 140])
  const fade = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <section ref={ref} className="relative -mt-16 h-[92vh] min-h-[560px] max-h-[920px] overflow-hidden md:-mt-[72px]">
      <div className="absolute inset-0 opacity-70" aria-hidden="true">
        <HeroAurora />
      </div>
      <motion.div style={{ y }} className="absolute inset-0 -bottom-24 opacity-90">
        <SmartImage
          src={tmdbImage(item.backdrop_path, 'w1280')}
          srcSet={tmdbSrcset(item.backdrop_path, ['w342', 'w500', 'w780', 'w1280'])}
          sizes="100vw"
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
          fallback={<div className="h-full w-full bg-gradient-to-b from-elevated to-bg" />}
        />
      </motion.div>
      <div className="absolute inset-0 hero-vignette" />

      <motion.div
        style={{ opacity: fade }}
        className="absolute inset-0 flex items-end"
      >
        <div className="container-x pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="max-w-2xl"
          >
            <BlurText
              as="h1"
              key={item.id}
              text={item.title}
              animateBy="words"
              direction="top"
              delay={70}
              stepDuration={0.28}
              className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-bold leading-[1.05] tracking-[-0.03em]"
            />

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-sub">
              {item.year && <span>{item.year}</span>}
              {item.runtime && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                  <span>{item.runtime}</span>
                </>
              )}
              {item.genres && (
                <>
                  <span className="h-0.5 w-0.5 rounded-full bg-white/25" />
                  <span>{item.genres.join(', ')}</span>
                </>
              )}
              {item.rating > 0 && <Rating value={item.rating} className="ml-1" />}
            </div>

            <p className="clamp-3 mt-5 max-w-xl text-[15px] leading-relaxed text-sub">
              {item.overview}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" glow icon={<Play size={16} fill="currentColor" />} onClick={onWatch}>
                Watch Now
              </Button>
              {onTrailer && (
                <Button variant="secondary" size="lg" onClick={onTrailer}>
                  Trailer
                </Button>
              )}
              <Button variant="secondary" size="lg" onClick={onDetails}>
                View Details
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
