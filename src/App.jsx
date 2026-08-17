import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/ScrollToTop'

const Home = lazy(() => import('./pages/Home'))
const Browse = lazy(() => import('./pages/Browse'))
const Search = lazy(() => import('./pages/Search'))
const Watchlist = lazy(() => import('./pages/Watchlist'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Genre = lazy(() => import('./pages/Genre'))
const MovieDetail = lazy(() => import('./pages/MovieDetail'))
const PersonDetail = lazy(() => import('./pages/PersonDetail'))
const Lists = lazy(() => import('./pages/Lists'))
const ListDetail = lazy(() => import('./pages/ListDetail'))
const Stats = lazy(() => import('./pages/Stats'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Browse mediaType="movie" />} />
          <Route path="/tv" element={<Browse mediaType="tv" />} />
          <Route path="/search" element={<Search />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/genre/:genreId" element={<Genre />} />
          <Route path="/person/:id" element={<PersonDetail />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/lists/:listId" element={<ListDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/:mediaType/:id" element={<MovieDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
