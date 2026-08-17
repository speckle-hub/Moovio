const KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE = 'https://api.themoviedb.org/3'

const cache = new Map()
const TTL = 10 * 60 * 1000 // 10 minutes

async function api(path, params = {}) {
  if (!KEY) throw new Error('Missing VITE_TMDB_API_KEY')
  const qs = new URLSearchParams({ api_key: KEY, language: 'en-US', ...params })
  const cacheKey = `${path}?${qs}`
  const hit = cache.get(cacheKey)
  if (hit) {
    if (Date.now() - hit.t <= TTL) return hit.data
    cache.delete(cacheKey)
  }
  const res = await fetch(`${BASE}${path}?${qs}`)
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.status_message || `TMDB request failed (${res.status})`)
  }
  const data = await res.json()
  cache.set(cacheKey, { t: Date.now(), data })
  return data
}

export function formatRuntime(minutes) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

export function normalize(media, explicitType) {
  const isTv =
    explicitType === 'tv' ||
    media.media_type === 'tv' ||
    Boolean(media.first_air_date && !media.release_date)
  const date = isTv ? media.first_air_date : media.release_date
  return {
    id: media.id,
    media_type: isTv ? 'tv' : 'movie',
    title: isTv ? media.name : media.title,
    year: date ? date.slice(0, 4) : null,
    rating: media.vote_average || 0,
    votes: media.vote_count || 0,
    overview: media.overview || '',
    poster_path: media.poster_path || null,
    backdrop_path: media.backdrop_path || null,
    genres: media.genres?.map((g) => g.name) || null,
    runtime: formatRuntime(media.runtime),
    tagline: media.tagline || null,
  }
}

function normalizePage(data, explicitType) {
  return {
    items: (data.results || []).map((m) => normalize(m, explicitType)),
    page: data.page,
    totalPages: data.total_pages || 1,
  }
}

/* ---------------- Discovery ---------------- */

export async function fetchTrending({ mediaType = 'all', window = 'week', page = 1 } = {}) {
  const data = await api(`/trending/${mediaType}/${window}`, { page })
  return normalizePage(data)
}

export async function fetchDiscover({
  mediaType = 'movie',
  genre,
  sortBy = 'popularity.desc',
  page = 1,
  year,
  minRating,
  language,
  originCountry,
} = {}) {
  const params = { page, sort_by: sortBy }
  const genreIds = Array.isArray(genre) ? genre : genre ? [genre] : []
  if (genreIds.length > 0) params.with_genres = genreIds.join(',')
  if (year) params[mediaType === 'tv' ? 'first_air_date_year' : 'primary_release_year'] = year
  if (minRating) params['vote_average.gte'] = minRating
  if (language) params.with_original_language = language
  if (originCountry) params.with_origin_country = originCountry
  const data = await api(`/discover/${mediaType}`, params)
  return normalizePage(data, mediaType)
}

/* Anime proxy: Animation genre (16) + Japan origin + Japanese original language. */
const ANIME_GENRE = 16
const ANIME_ORIGIN = 'JP'
const ANIME_LANG = 'ja'

export async function fetchAnime({ page = 1 } = {}) {
  const [movies, tv] = await Promise.all([
    fetchDiscover({
      mediaType: 'movie',
      genre: [ANIME_GENRE],
      originCountry: ANIME_ORIGIN,
      language: ANIME_LANG,
      page,
    }),
    fetchDiscover({
      mediaType: 'tv',
      genre: [ANIME_GENRE],
      originCountry: ANIME_ORIGIN,
      language: ANIME_LANG,
      page,
    }),
  ])
  const items = [...movies.items, ...tv.items]
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, 20)
  return { items, page, totalPages: 1 }
}

export async function fetchNowPlaying(page = 1) {
  return normalizePage(await api('/movie/now_playing', { page }), 'movie')
}

export async function fetchUpcoming(page = 1) {
  return normalizePage(await api('/movie/upcoming', { page }), 'movie')
}

export async function fetchTopRated(mediaType = 'movie', page = 1) {
  return normalizePage(await api(`/${mediaType}/top_rated`, { page }), mediaType)
}

export async function fetchOnTheAir(page = 1) {
  return normalizePage(await api('/tv/airing_today', { page }), 'tv')
}

export async function fetchGenres(mediaType = 'movie') {
  const data = await api(`/genre/${mediaType}/list`)
  return data.genres || []
}

export async function fetchRandomTitle() {
  const mediaType = Math.random() < 0.5 ? 'movie' : 'tv'
  const first = await fetchDiscover({ mediaType, sortBy: 'popularity.desc' })
  const totalPages = Math.min(first.totalPages, 100)
  const page = Math.max(1, Math.floor(Math.random() * totalPages) + 1)
  const data = page === 1 ? first : await fetchDiscover({ mediaType, sortBy: 'popularity.desc', page })
  const items = data.items
  if (items.length === 0) return null
  return items[Math.floor(Math.random() * items.length)]
}

export async function fetchSearch(query, { page = 1 } = {}) {
  if (!query.trim()) return { items: [], page: 1, totalPages: 0 }
  const data = await api('/search/multi', { query, page, include_adult: 'false' })
  const results = (data.results || []).filter(
    (r) => r.media_type === 'movie' || r.media_type === 'tv',
  )
  return {
    items: results.map((m) => normalize(m)),
    page: data.page,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || 0,
  }
}

/* ---------------- Detail ---------------- */

export function getTrailerKey(videos) {
  const candidates = videos || []
  const trailer =
    candidates.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    candidates.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
    candidates.find((v) => v.site === 'YouTube')
  return trailer?.key || null
}

export async function fetchDetails(mediaType, id, region = 'US') {
  const data = await api(`/${mediaType}/${id}`, {
    append_to_response: 'videos,credits,recommendations,watch/providers',
  })
  const detail = normalize(data, mediaType)
  const trailerKey = getTrailerKey(data.videos?.results)
  return {
    detail,
    genreList: data.genres || [],
    imdbId: data.imdb_id || null,
    trailerKey,
    cast: (data.credits?.cast || []).slice(0, 18),
    crew: data.credits?.crew || [],
    videos: data.videos?.results || [],
    recommendations: (data.recommendations?.results || [])
      .map((m) => normalize(m))
      .slice(0, 12),
    seasons: data.seasons || null,
    runtimeMinutes: data.runtime || null,
    episodeRunTime: data.episode_run_time?.[0] || null,
    watchProviders: data['watch/providers']?.results?.[region] || null,
  }
}

export async function fetchSeasonEpisodes(tvId, seasonNumber) {
  const data = await api(`/tv/${tvId}/season/${seasonNumber}`)
  return data.episodes || []
}

/* ---------------- People ---------------- */

function normalizeCredit(credit, explicitType) {
  return {
    ...normalize(credit, explicitType),
    character: credit.character || null,
    job: credit.job || null,
    department: credit.department || null,
    episodeCount: credit.episode_count || null,
  }
}

export async function fetchPerson(id) {
  const [person, credits] = await Promise.all([
    api(`/person/${id}`),
    api(`/person/${id}/combined_credits`),
  ])
  return {
    person: {
      id: person.id,
      name: person.name,
      profile_path: person.profile_path || null,
      biography: person.biography || '',
      birthday: person.birthday || null,
      deathday: person.deathday || null,
      place_of_birth: person.place_of_birth || null,
      known_for_department: person.known_for_department || null,
      popularity: person.popularity || 0,
    },
    cast: (credits.cast || [])
      .map((c) => normalizeCredit(c, c.media_type))
      .sort((a, b) => (b.year || 0) - (a.year || 0)),
    crew: (credits.crew || [])
      .map((c) => normalizeCredit(c, c.media_type))
      .sort((a, b) => (b.year || 0) - (a.year || 0)),
  }
}
