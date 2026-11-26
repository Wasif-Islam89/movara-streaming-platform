import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import { isApiConfigured } from '../services/api';
import {
  getTrendingTVShows,
  getTopRatedTVShows,
  getBingeWorthyTVShows,
  getCrimeMysteryTVShows,
  getSciFiWorldsTVShows,
  fetchTVGenres,
  fetchTVGenreMap,
  fetchTrendingTVShows,
  fetchTopRatedTVShows,
  fetchPopularTVShows,
  fetchTVShowDetails,
  discoverTVPage,
} from '../services/tvService';

import heroTvBackdrop from '../assets/backgrounds/hero-tv-shows.jpg';

// Fallback TV Show Genres for Offline / Unconfigured Mode
const FALLBACK_TV_GENRES = [
  'All Genres',
  'Action & Adventure',
  'Comedy',
  'Crime & Mystery',
  'Drama',
  'Horror & Supernatural',
  'Romance',
  'Sci-Fi & Fantasy',
  'Animation & Anime',
  'Documentary',
];

const INITIAL_ROW_STATE = {
  movies: [],
  isLoading: false,
  error: null,
};

const INITIAL_GRID_STATE = {
  shows: [],
  page: 1,
  totalPages: 1,
  totalResults: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  loadMoreError: null,
};

// Featured Spotlight Real TV Shows for the Hero Section
const TV_HERO_SHOWS = [
  {
    id: 'breaking-bad',
    title: 'Breaking Bad',
    badge: 'Masterpiece',
    rating: '9.5',
    year: '2008',
    duration: '5 Seasons',
    genre: 'Crime • Drama • Thriller',
    description:
      'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his familys future.',
    detailsLink: '/tv/breaking-bad',
    trailerUrl: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9faGSFi5jam6pDWGNdcu8f8L1gQ.jpg',
  },
  {
    id: 'the-last-of-us',
    title: 'The Last of Us',
    badge: 'Critically Acclaimed',
    rating: '8.8',
    year: '2023',
    duration: '1 Season',
    genre: 'Drama • Post-Apocalyptic • Action',
    description:
      'Twenty years after modern civilization has been destroyed, Joel is hired to smuggle 14-year-old Ellie out of an oppressive quarantine zone.',
    detailsLink: '/tv/the-last-of-us',
    trailerUrl: 'https://www.youtube.com/watch?v=uLtkt8BonwM',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
  },
  {
    id: 'stranger-things',
    title: 'Stranger Things',
    badge: 'Global Phenomenon',
    rating: '8.7',
    year: '2016',
    duration: '4 Seasons',
    genre: 'Sci-Fi • Horror • Supernatural',
    description:
      'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    detailsLink: '/tv/stranger-things',
    trailerUrl: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
  },
  {
    id: 'the-vampire-diaries',
    title: 'The Vampire Diaries',
    badge: 'Binge Worthy Series',
    rating: '8.9',
    year: '2009',
    duration: '8 Seasons',
    genre: 'Drama • Supernatural • Romance',
    description:
      'Ian Somerhalder and Nina Dobrev star in this soapy teen drama where two vampire brothers battle for the soul of Elena Gilbert and the fate of Mystic Falls.',
    detailsLink: '/tv/the-vampire-diaries',
    trailerUrl: 'https://www.youtube.com/watch?v=BmVmhjjkN4E',
    backdropUrl: heroTvBackdrop,
  },
];

export default function TVShows() {
  const apiReady = isApiConfigured();
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dynamic TMDB TV genre list & lookup map
  const [tmdbGenres, setTmdbGenres] = useState([]);
  const genreMapRef = useRef({});

  // Hero & 5 Row states for "All Genres" view
  const [heroShows, setHeroShows] = useState(TV_HERO_SHOWS);
  const [trendingRow, setTrendingRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [topRatedRow, setTopRatedRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [popularRow, setPopularRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [crimeRow, setCrimeRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [scifiRow, setScifiRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));

  // Filtered genre grid + pagination state
  const [genreGrid, setGenreGrid] = useState(INITIAL_GRID_STATE);
  const gridAbortRef = useRef(null);

  // Update browser tab title
  useEffect(() => {
    document.title = 'TV Shows | MOVORA';
  }, []);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGenresOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsGenresOpen(false);
      }
    }

    if (isGenresOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGenresOpen]);

  // Helper to resolve TMDB genre ID by name without hardcoding IDs
  const findGenreIdByName = useCallback((genresList, ...candidateNames) => {
    for (const target of candidateNames) {
      const match = genresList.find(
        (g) => g.name.toLowerCase() === target.toLowerCase()
      );
      if (match?.id) return match.id;
    }
    return undefined;
  }, []);

  const loadTVRow = useCallback(async (fetcher, setRowState, signal, onLoaded) => {
    setRowState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetcher(signal, genreMapRef.current);
      if (signal?.aborted) return;
      setRowState({ movies: data, isLoading: false, error: null });
      if (onLoaded) onLoaded(data);
    } catch (err) {
      if (err?.name === 'AbortError' || signal?.aborted) return;
      setRowState({
        movies: [],
        isLoading: false,
        error: 'Unable to load TV shows right now. Please try again.',
      });
    }
  }, []);

  const populateHeroFromTrending = useCallback(async (trendingList, signal) => {
    if (!Array.isArray(trendingList) || trendingList.length === 0) return;

    const base = trendingList.slice(0, 4).map((s) => ({
      ...s,
      backdropUrl: s.backdropUrl || heroTvBackdrop,
      detailsLink: `/tv/${s.id}`,
    }));
    setHeroShows(base);

    const enriched = await Promise.all(
      base.map(async (item) => {
        try {
          const details = await fetchTVShowDetails(item.id, { signal });
          if (!details) return item;
          return {
            ...item,
            ...details,
            duration: details.seasons || item.seasons || '',
            backdropUrl: details.backdropUrl || item.backdropUrl || heroTvBackdrop,
            detailsLink: `/tv/${item.id}`,
          };
        } catch {
          return item;
        }
      })
    );

    if (!signal?.aborted) {
      setHeroShows(enriched);
    }
  }, []);

  // Load TMDB TV genres, Hero, and 5 TV rows on mount when API is configured
  useEffect(() => {
    if (!apiReady) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function initTVShowsPage() {
      let genresList = [];
      try {
        genresList = await fetchTVGenres({ signal });
        genreMapRef.current = await fetchTVGenreMap({ signal });
        if (!signal.aborted) {
          setTmdbGenres(genresList);
        }
      } catch (err) {
        if (err?.name === 'AbortError' || signal.aborted) return;
      }

      if (signal.aborted) return;

      const crimeId = findGenreIdByName(genresList, 'Crime', 'Mystery');
      const scifiId = findGenreIdByName(genresList, 'Sci-Fi & Fantasy', 'Animation');

      await Promise.all([
        loadTVRow(
          (sig, gMap) => fetchTrendingTVShows('week', 1, { signal: sig }, gMap),
          setTrendingRow,
          signal,
          (data) => populateHeroFromTrending(data, signal)
        ),
        loadTVRow(
          (sig, gMap) => fetchTopRatedTVShows(1, { signal: sig }, gMap),
          setTopRatedRow,
          signal
        ),
        loadTVRow(
          (sig, gMap) => fetchPopularTVShows(1, { signal: sig }, gMap),
          setPopularRow,
          signal
        ),
        loadTVRow(
          async (sig, gMap) => {
            const res = await discoverTVPage(
              { ...(crimeId ? { with_genres: crimeId } : {}), sort_by: 'popularity.desc', page: 1 },
              { signal: sig },
              gMap
            );
            return res.results;
          },
          setCrimeRow,
          signal
        ),
        loadTVRow(
          async (sig, gMap) => {
            const res = await discoverTVPage(
              { ...(scifiId ? { with_genres: scifiId } : {}), sort_by: 'popularity.desc', page: 1 },
              { signal: sig },
              gMap
            );
            return res.results;
          },
          setScifiRow,
          signal
        ),
      ]);
    }

    initTVShowsPage();

    return () => {
      controller.abort();
    };
  }, [apiReady, findGenreIdByName, loadTVRow, populateHeroFromTrending]);

  // Fetch filtered genre page via /discover/tv
  const fetchGenrePage = useCallback(
    async (genreName, page = 1, append = false) => {
      if (!apiReady || genreName === 'All Genres') return;

      if (gridAbortRef.current) {
        gridAbortRef.current.abort();
      }
      const controller = new AbortController();
      gridAbortRef.current = controller;
      const { signal } = controller;

      if (append) {
        setGenreGrid((prev) => ({
          ...prev,
          isLoadingMore: true,
          loadMoreError: null,
        }));
      } else {
        setGenreGrid({
          ...INITIAL_GRID_STATE,
          isLoading: true,
        });
      }

      try {
        const genreId = findGenreIdByName(tmdbGenres, genreName);
        const data = await discoverTVPage(
          { ...(genreId ? { with_genres: genreId } : {}), sort_by: 'popularity.desc', page },
          { signal },
          genreMapRef.current
        );
        if (signal.aborted) return;

        setGenreGrid((prev) => {
          if (!append) {
            return {
              shows: data.results,
              page: data.page,
              totalPages: data.totalPages,
              totalResults: data.totalResults,
              isLoading: false,
              isLoadingMore: false,
              error: null,
              loadMoreError: null,
            };
          }

          const existingIds = new Set(prev.shows.map((s) => String(s.id)));
          const uniqueNext = data.results.filter((s) => !existingIds.has(String(s.id)));
          return {
            shows: [...prev.shows, ...uniqueNext],
            page: data.page,
            totalPages: data.totalPages,
            totalResults: data.totalResults,
            isLoading: false,
            isLoadingMore: false,
            error: null,
            loadMoreError: null,
          };
        });
      } catch (err) {
        if (err?.name === 'AbortError' || signal.aborted) return;
        setGenreGrid((prev) =>
          append
            ? {
                ...prev,
                isLoadingMore: false,
                loadMoreError: 'Could not load more TV shows. Please try again.',
              }
            : {
                ...prev,
                shows: [],
                isLoading: false,
                isLoadingMore: false,
                error: 'Unable to load TV shows for this genre right now. Please try again.',
              }
        );
      }
    },
    [apiReady, findGenreIdByName, tmdbGenres]
  );

  useEffect(() => {
    if (!apiReady || selectedGenre === 'All Genres') {
      if (gridAbortRef.current) {
        gridAbortRef.current.abort();
      }
      return;
    }

    fetchGenrePage(selectedGenre, 1, false);

    return () => {
      if (gridAbortRef.current) {
        gridAbortRef.current.abort();
      }
    };
  }, [apiReady, selectedGenre, fetchGenrePage]);

  // Genre dropdown options: dynamic TMDB TV genres when online, fallback offline
  const genreOptions = apiReady && tmdbGenres.length > 0
    ? ['All Genres', ...tmdbGenres.map((g) => g.name)]
    : FALLBACK_TV_GENRES;

  // Offline / fallback local filtering
  const filterByGenre = (list) => {
    if (selectedGenre === 'All Genres') return list;
    const keywords = selectedGenre
      .split('&')
      .map((k) => k.trim().toLowerCase());
    return list.filter((item) => {
      const showGenre = (item.genre || '').toLowerCase();
      return keywords.some((kw) => showGenre.includes(kw));
    });
  };

  const trendingFallback = filterByGenre(getTrendingTVShows());
  const topRatedFallback = filterByGenre(getTopRatedTVShows());
  const bingeFallback = filterByGenre(getBingeWorthyTVShows());
  const crimeFallback = filterByGenre(getCrimeMysteryTVShows());
  const scifiFallback = filterByGenre(getSciFiWorldsTVShows());

  const hasAnyFallbackMatches =
    trendingFallback.length > 0 ||
    topRatedFallback.length > 0 ||
    bingeFallback.length > 0 ||
    crimeFallback.length > 0 ||
    scifiFallback.length > 0;

  const hasMorePages = apiReady && genreGrid.page < genreGrid.totalPages;

  const handleLoadMore = () => {
    if (!apiReady || genreGrid.isLoadingMore || genreGrid.isLoading || !hasMorePages) return;
    fetchGenrePage(selectedGenre, genreGrid.page + 1, true);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4]">
      
      {/* Top Header Bar: "TV Shows" + "Genres ▾" Dropdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3EEE4] tracking-tight">
            TV Shows
          </h1>

          {/* Genres Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsGenresOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40 ${
                isGenresOpen || selectedGenre !== 'All Genres'
                  ? 'bg-[#1D1C1A] text-[#F2B84B] border-[#F2B84B]/80 shadow-sm'
                  : 'bg-[#1D1C1A]/90 text-[#F3EEE4] border-[#2A2926] hover:border-[#F2B84B]/50 hover:text-[#F2B84B]'
              }`}
              aria-expanded={isGenresOpen}
              aria-haspopup="listbox"
              title="Filter by Genre"
            >
              <span>{selectedGenre === 'All Genres' ? 'Genres' : selectedGenre}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isGenresOpen ? 'rotate-180 text-[#F2B84B]' : 'text-[#AAA49A]'
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown Menu Overlay */}
            {isGenresOpen && (
              <div 
                role="listbox"
                aria-label="Filter TV Shows by Genre"
                className="absolute left-0 mt-1.5 w-52 sm:w-56 max-h-72 overflow-y-auto rounded-lg bg-[#1D1C1A] border border-[#2A2926] shadow-xl shadow-black/90 p-1 z-50 backdrop-blur-md animate-fadeIn focus:outline-none [scrollbar-width:thin]"
              >
                {genreOptions.map((genre) => {
                  const isSelected = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedGenre(genre);
                        setIsGenresOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2B84B]/15 text-[#F2B84B] font-semibold'
                          : 'text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#2A2926]/60'
                      }`}
                    >
                      <span>{genre}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#F2B84B]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured TV Shows Hero Spotlight */}
      <Hero movies={heroShows} />

      {/* TV Shows Content: 5 Curated Rows ("All Genres") OR Dynamic TMDB Genre Grid */}
      {apiReady && selectedGenre !== 'All Genres' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-16">
          <p className="text-xs sm:text-sm text-[#AAA49A] mb-5">
            Showing {genreGrid.shows.length} {genreGrid.shows.length === 1 ? 'series' : 'series'}
            {genreGrid.totalResults > genreGrid.shows.length
              ? ` of ${genreGrid.totalResults.toLocaleString()}`
              : ''}{' '}
            in <span className="text-[#F2B84B] font-semibold">{selectedGenre}</span>
          </p>

          {genreGrid.isLoading ? (
            <div
              aria-label={`Loading ${selectedGenre} TV shows`}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5"
            >
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={`tv-grid-skeleton-${idx}`}
                  className="aspect-[2/3] w-full rounded-xl bg-[#1D1C1A] border border-[#2A2926] animate-pulse relative overflow-hidden"
                >
                  <div className="absolute inset-x-3 bottom-3 space-y-2">
                    <div className="h-3.5 w-3/4 rounded bg-[#2A2926]" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-10 rounded bg-[#2A2926]" />
                      <div className="h-3 w-10 rounded bg-[#2A2926]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : genreGrid.error ? (
            <div className="py-16 text-center rounded-2xl bg-[#1D1C1A]/60 border border-[#2A2926] space-y-3">
              <AlertCircle className="w-8 h-8 text-[#E58B43] mx-auto" />
              <p className="text-sm text-[#AAA49A]">{genreGrid.error}</p>
              <button
                type="button"
                onClick={() => fetchGenrePage(selectedGenre, 1, false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#F2B84B] text-[#121212] hover:bg-[#E58B43] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : genreGrid.shows.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {genreGrid.shows.map((show) => (
                  <MovieCard key={show.id} movie={show} mediaType="tv" />
                ))}
              </div>

              {(hasMorePages || genreGrid.loadMoreError) && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  {genreGrid.loadMoreError && (
                    <p className="text-xs text-[#E58B43]">{genreGrid.loadMoreError}</p>
                  )}
                  {hasMorePages && (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={genreGrid.isLoadingMore}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#1D1C1A] border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/60 hover:text-[#F2B84B] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      {genreGrid.isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#F2B84B]" />
                          <span>Loading More...</span>
                        </>
                      ) : (
                        <span>
                          {genreGrid.loadMoreError ? 'Retry Load More' : 'Load More Shows'}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-[#AAA49A]">
              <p className="text-base font-medium text-[#F3EEE4]">
                No TV shows found in {selectedGenre}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedGenre('All Genres')}
                className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-[#F2B84B] text-[#121212] hover:bg-[#E58B43] transition-colors cursor-pointer"
              >
                Reset to All Genres
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-4 pb-16">
          {apiReady ? (
            <>
              <MovieRow
                title="Trending TV Shows"
                badge="Popular"
                movies={trendingRow.movies}
                isLoading={trendingRow.isLoading}
                error={trendingRow.error}
                onRetry={() =>
                  loadTVRow(
                    (sig, gMap) => fetchTrendingTVShows('week', 1, { signal: sig }, gMap),
                    setTrendingRow,
                    undefined,
                    (data) => populateHeroFromTrending(data)
                  )
                }
              />

              <MovieRow
                title="Top Rated Series"
                badge="Critically Acclaimed"
                movies={topRatedRow.movies}
                isLoading={topRatedRow.isLoading}
                error={topRatedRow.error}
                onRetry={() =>
                  loadTVRow(
                    (sig, gMap) => fetchTopRatedTVShows(1, { signal: sig }, gMap),
                    setTopRatedRow
                  )
                }
              />

              <MovieRow
                title="Fan Favorites & Binge Hits"
                badge="Must Watch"
                movies={popularRow.movies}
                isLoading={popularRow.isLoading}
                error={popularRow.error}
                onRetry={() =>
                  loadTVRow(
                    (sig, gMap) => fetchPopularTVShows(1, { signal: sig }, gMap),
                    setPopularRow
                  )
                }
              />

              <MovieRow
                title="Crime, Mystery & Suspense"
                badge="Edge of Your Seat"
                movies={crimeRow.movies}
                isLoading={crimeRow.isLoading}
                error={crimeRow.error}
                onRetry={() => {
                  const id = findGenreIdByName(tmdbGenres, 'Crime', 'Mystery');
                  loadTVRow(
                    async (sig, gMap) => {
                      const res = await discoverTVPage(
                        { ...(id ? { with_genres: id } : {}), sort_by: 'popularity.desc', page: 1 },
                        { signal: sig },
                        gMap
                      );
                      return res.results;
                    },
                    setCrimeRow
                  );
                }}
              />

              <MovieRow
                title="Sci-Fi, Epic Worlds & Anime"
                badge="Extraordinary Worlds"
                movies={scifiRow.movies}
                isLoading={scifiRow.isLoading}
                error={scifiRow.error}
                onRetry={() => {
                  const id = findGenreIdByName(tmdbGenres, 'Sci-Fi & Fantasy', 'Animation');
                  loadTVRow(
                    async (sig, gMap) => {
                      const res = await discoverTVPage(
                        { ...(id ? { with_genres: id } : {}), sort_by: 'popularity.desc', page: 1 },
                        { signal: sig },
                        gMap
                      );
                      return res.results;
                    },
                    setScifiRow
                  );
                }}
              />
            </>
          ) : hasAnyFallbackMatches ? (
            <>
              {trendingFallback.length > 0 && (
                <MovieRow
                  title="Trending TV Shows"
                  badge="Popular"
                  movies={trendingFallback}
                />
              )}

              {topRatedFallback.length > 0 && (
                <MovieRow
                  title="Top Rated Series"
                  badge="Critically Acclaimed"
                  movies={topRatedFallback}
                />
              )}

              {bingeFallback.length > 0 && (
                <MovieRow
                  title="Fan Favorites & Binge Hits"
                  badge="Must Watch"
                  movies={bingeFallback}
                />
              )}

              {crimeFallback.length > 0 && (
                <MovieRow
                  title="Crime, Mystery & Suspense"
                  badge="Edge of Your Seat"
                  movies={crimeFallback}
                />
              )}

              {scifiFallback.length > 0 && (
                <MovieRow
                  title="Sci-Fi, Epic Worlds & Anime"
                  badge="Extraordinary Worlds"
                  movies={scifiFallback}
                />
              )}
            </>
          ) : (
            <div className="py-16 text-center text-[#AAA49A]">
              <p className="text-base font-medium text-[#F3EEE4]">
                No TV shows found in {selectedGenre}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedGenre('All Genres')}
                className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-[#F2B84B] text-[#121212] hover:bg-[#E58B43] transition-colors cursor-pointer"
              >
                Reset to All Genres
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
