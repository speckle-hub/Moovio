/**
 * Third-party stream embed providers.
 *
 * URL patterns are best-effort and change often — this whole table is data,
 * so fixing a dead domain is a one-line change. Providers are ordered by
 * probe-verified reliability (defaults on top, questionable ones below).
 * Broken/unresponsive providers have been pruned; only manually verified
 * sources are kept here.
 *
 * `movie`/`tv` builders take ({ tmdbId, imdbId, season, episode }) and return
 * a URL, or null when a provider can't serve that kind of request.
 */

export const STREAM_PROVIDERS = [
  {
    id: 'vidsrc.to',
    name: 'VidSrc',
    movie: ({ tmdbId }) => `https://vidsrc.to/embed/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    movie: ({ tmdbId }) => `https://www.2embed.cc/embed/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://www.2embed.cc/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'vidsrc.mov',
    name: 'VidSrc mov',
    movie: ({ tmdbId }) => `https://vidsrc.mov/embed/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://vidsrc.mov/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'vidsrc-embed',
    name: 'VidSrc ru',
    movie: ({ tmdbId }) => `https://vidsrc-embed.ru/embed/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://vidsrc-embed.ru/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'vsembed',
    name: 'VSembed',
    movie: ({ tmdbId }) => `https://vsembed.ru/embed/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://vsembed.ru/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'filmu',
    name: 'FilmU',
    movie: ({ tmdbId }) => `https://embed.filmu.in/embed/movie/${tmdbId}?debug=savu`,
    tv: ({ tmdbId, season, episode }) =>
      `https://embed.filmu.in/embed/tv/${tmdbId}/${season}/${episode}?debug=savu`,
  },
  {
    id: 'videasy',
    name: 'Videasy',
    movie: ({ tmdbId }) => `https://player.videasy.net/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'vidrock',
    name: 'Vidrock',
    movie: ({ tmdbId }) => `https://vidrock.net/embed/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://vidrock.net/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'vidapi',
    name: 'Vidapi',
    movie: ({ tmdbId }) => `https://vidapi.xyz/embed/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://vidapi.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 'vidcore',
    name: 'VidCore',
    movie: ({ tmdbId }) => `https://vidcore.org/embed/movie/${tmdbId}`,
    tv: ({ tmdbId, season, episode }) =>
      `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`,
  },
]

/** Build a playable URL for a given provider, or null if unsupported. */
export function buildStreamUrl(provider, ctx) {
  try {
    return provider[ctx.mediaType === 'tv' ? 'tv' : 'movie'](ctx)
  } catch {
    return null
  }
}
