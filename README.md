# Moovio

A cinematic movie & TV discovery experience built with React 19, Vite, and Tailwind CSS 4. Powered by the [TMDB API](https://www.themoviedb.org/documentation/api).

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## Features

- **Discover** trending, now playing, upcoming, and top-rated movies & TV shows
- **Browse** with multi-genre, era, rating, and language filters
- **Search** across movies, TV shows, and people with real-time results
- **Watch trailers** and stream via integrated embed players with provider switching
- **Personal library** — watchlist, favorites, custom lists, and watch history
- **Rate & track** — personal 10-point ratings, mark as watched, progress tracking
- **Stats dashboard** — watch time, genre breakdown, activity charts, rating distribution
- **Anime section** curated from Japanese animation
- **Surprise Me** — random title discovery
- **Command palette** (⌘K / Ctrl+K) for quick navigation
- **PWA** — installable with offline app shell
- **6 accent themes** with a live color picker

## Getting Started

### Prerequisites

- Node.js 18+
- A [TMDB API key](https://www.themoviedb.org/settings/api) (v3)

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/moovio.git
cd moovio
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Add your TMDB API key to `.env`:

```
VITE_TMDB_API_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 19** with React Router v7
- **Vite 8** with PWA plugin
- **Tailwind CSS 4** (Vite plugin)
- **Framer Motion** for animations
- **Zustand** for state management (persisted)
- **OGL** for WebGL aurora effect
- **Lucide React** for icons

## Project Structure

```
src/
├── components/
│   ├── layout/       # Layout, Navbar, Footer
│   ├── movie/        # PosterCard, PosterRow, HeroBanner, CastCard
│   ├── library/      # LibraryGrid, AddToListMenu
│   ├── stats/        # StatsCharts (SVG visualizations)
│   └── ui/           # Button, WatchModal, SearchBox, Skeleton, etc.
├── pages/            # Home, Browse, Search, MovieDetail, Stats, etc.
├── store/            # Zustand stores (library, history, ratings, settings, playback)
├── lib/              # TMDB API, streams, hooks, image utils
└── index.css         # Tailwind + custom tokens
```

## License

This project uses the [TMDB API](https://www.themoviedb.org/documentation/api) but is not endorsed or certified by TMDB.
