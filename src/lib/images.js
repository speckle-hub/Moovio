const IMAGE_BASE = 'https://image.tmdb.org/t/p'

const WIDTHS = {
  w92: 92,
  w154: 154,
  w185: 185,
  w342: 342,
  w500: 500,
  w780: 780,
  w1280: 1280,
}

/** Build a single TMDB image URL for a given size token. */
export function tmdbImage(path, size = 'w500') {
  if (!path) return null
  return `${IMAGE_BASE}/${size}${path}`
}

/** Build a srcset string across responsive sizes with proper width descriptors. */
export function tmdbSrcset(path, sizes = ['w342', 'w500', 'w780']) {
  if (!path) return null
  return sizes
    .map((size) => `${tmdbImage(path, size)} ${WIDTHS[size]}w`)
    .join(', ')
}

/** Logical size for a given width (used by posters/heros). */
export function sizeForWidth(width) {
  if (width <= 342) return 'w342'
  if (width <= 500) return 'w500'
  if (width <= 780) return 'w780'
  return 'w1280'
}
