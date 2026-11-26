import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import RootLayout from './layouts/RootLayout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Kids from './pages/Kids';
import MovieDetails from './pages/MovieDetails';
import TVDetails from './pages/TVDetails';
import MyList from './pages/MyList';
import WatchHistory from './pages/WatchHistory';
import WatchMovie from './pages/WatchMovie';
import WatchTVEpisode from './pages/WatchTVEpisode';
import Account from './pages/Account';
import NotFound from './pages/NotFound';

function PublicRoute({ children }) {
  const { isAuthenticated, isSigningOut, clearSigningOut } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && isSigningOut) {
      clearSigningOut();
    }
  }, [isAuthenticated, isSigningOut, clearSigningOut]);

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isSigningOut } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={isSigningOut ? '/' : '/login'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Landing, Sign In, and Sign Up Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Landing initialAuthOpen initialAuthMode="signin" />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Landing initialAuthOpen initialAuthMode="signup" />
            </PublicRoute>
          }
        />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/welcome" element={<Navigate to="/" replace />} />

        {/* Protected In-App Video Player Routes */}
        <Route
          path="/watch/movie/:id"
          element={
            <ProtectedRoute>
              <WatchMovie />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watch/tv/:id/season/:seasonNumber/episode/:episodeNumber"
          element={
            <ProtectedRoute>
              <WatchTVEpisode />
            </ProtectedRoute>
          }
        />

        {/* Protected MOVORA Streaming Application Routes */}
        <Route
          element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv-shows" element={<TVShows />} />
          <Route path="/kids" element={<Kids />} />
          <Route path="/discover" element={<Kids />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/tv/:id" element={<TVDetails />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/watch-history" element={<WatchHistory />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
