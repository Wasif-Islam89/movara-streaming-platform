import { Routes, Route, Navigate } from 'react-router-dom';
import { useProfile } from './context/ProfileContext';
import ScrollToTop from './components/ScrollToTop';
import RootLayout from './layouts/RootLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Kids from './pages/Kids';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import TVDetails from './pages/TVDetails';
import MyList from './pages/MyList';
import WatchHistory from './pages/WatchHistory';
import WatchMovie from './pages/WatchMovie';
import WatchTVEpisode from './pages/WatchTVEpisode';
import Profiles from './pages/Profiles';
import NotFound from './pages/NotFound';

/**
 * MOVORA Main Application Router
 * Provides seamless navigation across all streaming pages:
 * - Home (/)
 * - Movies (/movies)
 * - TV Shows (/tv-shows)
 * - Kids (/kids)
 * - Search (/search)
 * - Movie Details (/movie/:id)
 * - TV Series Details (/tv/:id)
 * - Watchlist (/my-list)
 * - Marketing Landing Preview (/landing)
 */
function HomeEntry() {
  const { hasSelectedProfile } = useProfile();
  if (!hasSelectedProfile) {
    return <Navigate to="/profiles" replace />;
  }
  return <Home />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Explicit Landing / Welcome Preview Route */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/welcome" element={<Landing />} />

        {/* Profile Selection & Management Route */}
        <Route path="/profiles" element={<Profiles />} />

        {/* Dedicated In-App Video Player Routes */}
        <Route path="/watch/movie/:id" element={<WatchMovie />} />
        <Route path="/watch/tv/:id/season/:seasonNumber/episode/:episodeNumber" element={<WatchTVEpisode />} />

        {/* Main MOVORA Streaming Application Routes with Persistent Navbar, Footer & Modals */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomeEntry />} />
          <Route path="movies" element={<Movies />} />
          <Route path="tv-shows" element={<TVShows />} />
          <Route path="kids" element={<Kids />} />
          <Route path="discover" element={<Kids />} />
          <Route path="search" element={<Search />} />
          <Route path="movie/:id" element={<MovieDetails />} />
          <Route path="tv/:id" element={<TVDetails />} />
          <Route path="my-list" element={<MyList />} />
          <Route path="watch-history" element={<WatchHistory />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
