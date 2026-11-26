import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import ContinueWatching from '../components/ContinueWatching';
import TrendingMovies from '../components/TrendingMovies';
import TopRatedDiscoveries from '../components/TopRatedDiscoveries';
import PopularMovies from '../components/PopularMovies';
import ComingSoon from '../components/ComingSoon';
import heroFallbackBackdrop from '../assets/backgrounds/hero-backdrop.jpg';
import { isApiConfigured } from '../services/api';
import {
  fetchMovieGenreMap,
  fetchTrendingMovies,
  fetchTopRatedMovies,
  fetchPopularMovies,
  fetchUpcomingMovies,
  fetchMovieDetails,
} from '../services/movieService';

const INITIAL_SECTION_STATE = {
  movies: [],
  isLoading: false,
  error: null,
};

export default function Home() {
  const location = useLocation();
  const apiReady = isApiConfigured();

  const [heroMovies, setHeroMovies] = useState(undefined);
  const [trending, setTrending] = useState(() => ({
    ...INITIAL_SECTION_STATE,
    isLoading: apiReady,
  }));
  const [topRated, setTopRated] = useState(() => ({
    ...INITIAL_SECTION_STATE,
    isLoading: apiReady,
  }));
  const [popular, setPopular] = useState(() => ({
    ...INITIAL_SECTION_STATE,
    isLoading: apiReady,
  }));
  const [upcoming, setUpcoming] = useState(() => ({
    ...INITIAL_SECTION_STATE,
    isLoading: apiReady,
  }));

  const genreMapRef = useRef({});

  useEffect(() => {
    document.title = 'MOVORA — Discover Movies & TV Shows';
  }, []);

  // Scroll to targeted section if hash is present
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const loadSection = useCallback(async (fetcher, setState, signal, onLoaded) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetcher(signal, genreMapRef.current);
      if (signal?.aborted) return;
      setState({ movies: data, isLoading: false, error: null });
      if (onLoaded) onLoaded(data);
    } catch (err) {
      if (err?.name === 'AbortError' || signal?.aborted) return;
      setState({
        movies: [],
        isLoading: false,
        error: 'Unable to load movies right now. Please try again.',
      });
    }
  }, []);

  const populateHeroFromTrending = useCallback(async (trendingList, signal) => {
    if (!Array.isArray(trendingList) || trendingList.length === 0) return;

    const spotlightBase = trendingList.slice(0, 4).map((m) => ({
      ...m,
      backdropUrl: m.backdropUrl || heroFallbackBackdrop,
      detailsLink: `/movie/${m.id}`,
    }));
    setHeroMovies(spotlightBase);

    const enriched = await Promise.all(
      spotlightBase.map(async (item) => {
        try {
          const details = await fetchMovieDetails(item.id, { signal });
          if (!details) return item;
          return {
            ...item,
            ...details,
            backdropUrl: details.backdropUrl || item.backdropUrl || heroFallbackBackdrop,
            detailsLink: `/movie/${item.id}`,
          };
        } catch {
          return item;
        }
      })
    );

    if (!signal?.aborted) {
      setHeroMovies(enriched);
    }
  }, []);

  useEffect(() => {
    if (!apiReady) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function initHomeFeeds() {
      try {
        genreMapRef.current = await fetchMovieGenreMap({ signal });
      } catch (err) {
        if (err?.name === 'AbortError' || signal.aborted) return;
      }

      if (signal.aborted) return;

      await Promise.all([
        loadSection(
          (sig, gMap) => fetchTrendingMovies('week', 1, { signal: sig }, gMap),
          setTrending,
          signal,
          (data) => populateHeroFromTrending(data, signal)
        ),
        loadSection(
          (sig, gMap) => fetchTopRatedMovies(1, { signal: sig }, gMap),
          setTopRated,
          signal
        ),
        loadSection(
          (sig, gMap) => fetchPopularMovies(1, { signal: sig }, gMap),
          setPopular,
          signal
        ),
        loadSection(
          (sig, gMap) => fetchUpcomingMovies(1, { signal: sig }, gMap),
          setUpcoming,
          signal
        ),
      ]);
    }

    initHomeFeeds();

    return () => {
      controller.abort();
    };
  }, [apiReady, loadSection, populateHeroFromTrending]);

  const retryTrending = () =>
    loadSection(
      (sig, gMap) => fetchTrendingMovies('week', 1, { signal: sig }, gMap),
      setTrending,
      undefined,
      (data) => populateHeroFromTrending(data)
    );

  const retryTopRated = () =>
    loadSection(
      (sig, gMap) => fetchTopRatedMovies(1, { signal: sig }, gMap),
      setTopRated
    );

  const retryPopular = () =>
    loadSection(
      (sig, gMap) => fetchPopularMovies(1, { signal: sig }, gMap),
      setPopular
    );

  const retryUpcoming = () =>
    loadSection(
      (sig, gMap) => fetchUpcomingMovies(1, { signal: sig }, gMap),
      setUpcoming
    );

  return (
    <div>
      {/* 1. Featured Cinematic Hero Section */}
      <Hero movies={heroMovies} />

      {/* Main Movie Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-6 pb-12">
        <ContinueWatching />

        <div id="trending" className="scroll-mt-20">
          <TrendingMovies
            movies={apiReady ? trending.movies : undefined}
            isLoading={trending.isLoading}
            error={trending.error}
            onRetry={retryTrending}
          />
        </div>

        <div id="top-rated" className="scroll-mt-20">
          <TopRatedDiscoveries
            movies={apiReady ? topRated.movies : undefined}
            isLoading={topRated.isLoading}
            error={topRated.error}
            onRetry={retryTopRated}
          />
        </div>

        <div id="popular" className="scroll-mt-20">
          <PopularMovies
            movies={apiReady ? popular.movies : undefined}
            isLoading={popular.isLoading}
            error={popular.error}
            onRetry={retryPopular}
          />
        </div>

        <div id="coming-soon" className="scroll-mt-20">
          <ComingSoon
            movies={apiReady ? upcoming.movies : undefined}
            isLoading={upcoming.isLoading}
            error={upcoming.error}
            onRetry={retryUpcoming}
          />
        </div>
      </div>
    </div>
  );
}
