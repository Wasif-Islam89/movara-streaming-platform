import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import heroFallbackBackdrop from '../assets/backgrounds/hero-backdrop.jpg';
import { isApiConfigured } from '../services/api';
import {
  getAllMovies,
  getBollywoodMovies,
  getActionMovies,
  getAdventureMovies,
  getFantasyMovies,
  getThrillerMovies,
  fetchMovieGenres,
  fetchMovieGenreMap,
  fetchPopularMovies,
  fetchMovieDetails,
  discoverMoviesPage,
} from '../services/movieService';

// Fallback Movie Genres for Offline / Unconfigured Mode
const FALLBACK_MOVIE_GENRES = [
  'All Genres',
  'Action',
  'Adventure',
  'Bollywood',
  'Dark Fantasy',
  'Crime & Mystery',
  'Drama',
  'Animation',
  'Thriller',
];

const INITIAL_ROW_STATE = {
  movies: [],
  isLoading: false,
  error: null,
};

const INITIAL_GRID_STATE = {
  movies: [],
  page: 1,
  totalPages: 1,
  totalResults: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  loadMoreError: null,
};

// Curated Featured Spotlight Real Movies for the Hero Section
const MOVIE_HERO_MOVIES = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    year: '2024',
    duration: '2h 46m',
    genre: 'Sci-Fi • Epic Adventure',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between love and the fate of the universe, he endeavours to prevent a terrible future.',
    detailsLink: '/movie/dune-part-two',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  },
  {
    id: 'jawan',
    title: 'Jawan',
    year: '2023',
    duration: '2h 49m',
    genre: 'Bollywood • Action • Thriller',
    description:
      'A high-stakes emotional journey of a prison warden who, driven by a personal vendetta and a sense of justice, recruits an army of women inmates to fight systemic corruption and protect the common man.',
    detailsLink: '/movie/jawan',
    trailerUrl: 'https://www.youtube.com/watch?v=COv52Qyctws',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    year: '2023',
    duration: '3h 00m',
    genre: 'Biography • Drama • History',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, examining the moral dilemmas and political fallout that forever changed humanity.',
    detailsLink: '/movie/oppenheimer',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
  },
  {
    id: 'rrr',
    title: 'RRR: Rise Roar Revolt',
    year: '2022',
    duration: '3h 07m',
    genre: 'Bollywood • Action • Epic Period',
    description:
      'A fearless revolutionary and an upright British-Indian officer forge an unbreakable friendship unaware of each other\'s identities, sparking an explosive historic uprising against colonial rule.',
    detailsLink: '/movie/rrr',
    trailerUrl: 'https://www.youtube.com/watch?v=NgBoAMXJ6iE',
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1920&q=80',
  },
];

export default function Movies() {
  const apiReady = isApiConfigured();
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Dynamic TMDB genre list & lookup map
  const [tmdbGenres, setTmdbGenres] = useState([]);
  const genreMapRef = useRef({});

  // Hero & 5 Row states for "All Genres" view
  const [heroMovies, setHeroMovies] = useState(MOVIE_HERO_MOVIES);
  const [bollywoodRow, setBollywoodRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [actionRow, setActionRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [adventureRow, setAdventureRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [fantasyRow, setFantasyRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [thrillerRow, setThrillerRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));

  // Filtered genre grid + pagination state
  const [genreGrid, setGenreGrid] = useState(INITIAL_GRID_STATE);
  const gridAbortRef = useRef(null);

  // Update browser tab title
  useEffect(() => {
    document.title = 'Movies | MOVORA';
  }, []);

  // Close dropdown when clicking outside or pressing Escape
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

  const loadDiscoverRow = useCallback(async (params, setRowState, signal) => {
    setRowState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await discoverMoviesPage(params, { signal }, genreMapRef.current);
      if (signal?.aborted) return;
      setRowState({ movies: data.results, isLoading: false, error: null });
    } catch (err) {
      if (err?.name === 'AbortError' || signal?.aborted) return;
      setRowState({
        movies: [],
        isLoading: false,
        error: 'Unable to load movies right now. Please try again.',
      });
    }
  }, []);

  const populateHeroFromPopular = useCallback(async (signal) => {
    try {
      const popular = await fetchPopularMovies(1, { signal }, genreMapRef.current);
      if (signal?.aborted || !popular.length) return;

      const base = popular.slice(0, 4).map((m) => ({
        ...m,
        backdropUrl: m.backdropUrl || heroFallbackBackdrop,
        detailsLink: `/movie/${m.id}`,
      }));
      setHeroMovies(base);

      const enriched = await Promise.all(
        base.map(async (item) => {
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
    } catch {
      // Keep curated MOVIE_HERO_MOVIES fallback silently
    }
  }, []);

  // Helper to resolve TMDB genre ID by name without hardcoding IDs
  const findGenreIdByName = useCallback((genresList, targetName) => {
    const match = genresList.find(
      (g) => g.name.toLowerCase() === targetName.toLowerCase()
    );
    return match?.id;
  }, []);

  // Load TMDB genres, Hero, and 5 topic rows on mount when API is configured
  useEffect(() => {
    if (!apiReady) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function initMoviesPage() {
      let genresList = [];
      try {
        genresList = await fetchMovieGenres({ signal });
        genreMapRef.current = await fetchMovieGenreMap({ signal });
        if (!signal.aborted) {
          setTmdbGenres(genresList);
        }
      } catch (err) {
        if (err?.name === 'AbortError' || signal.aborted) return;
      }

      if (signal.aborted) return;

      const actionId = findGenreIdByName(genresList, 'Action');
      const adventureId = findGenreIdByName(genresList, 'Adventure');
      const fantasyId = findGenreIdByName(genresList, 'Fantasy');
      const thrillerId = findGenreIdByName(genresList, 'Thriller');

      await Promise.all([
        populateHeroFromPopular(signal),
        loadDiscoverRow(
          { with_origin_country: 'IN', with_original_language: 'hi', sort_by: 'popularity.desc', page: 1 },
          setBollywoodRow,
          signal
        ),
        loadDiscoverRow(
          { ...(actionId ? { with_genres: actionId } : {}), sort_by: 'popularity.desc', page: 1 },
          setActionRow,
          signal
        ),
        loadDiscoverRow(
          { ...(adventureId ? { with_genres: adventureId } : {}), sort_by: 'popularity.desc', page: 1 },
          setAdventureRow,
          signal
        ),
        loadDiscoverRow(
          { ...(fantasyId ? { with_genres: fantasyId } : {}), sort_by: 'popularity.desc', page: 1 },
          setFantasyRow,
          signal
        ),
        loadDiscoverRow(
          { ...(thrillerId ? { with_genres: thrillerId } : {}), sort_by: 'popularity.desc', page: 1 },
          setThrillerRow,
          signal
        ),
      ]);
    }

    initMoviesPage();

    return () => {
      controller.abort();
    };
  }, [apiReady, findGenreIdByName, loadDiscoverRow, populateHeroFromPopular]);

  // Build Discover params for the active selectedGenre
  const getDiscoverParamsForGenre = useCallback(
    (genreName, page = 1) => {
      if (genreName === 'Bollywood') {
        return {
          with_origin_country: 'IN',
          with_original_language: 'hi',
          sort_by: 'popularity.desc',
          page,
        };
      }
      const genreId = findGenreIdByName(tmdbGenres, genreName);
      return {
        ...(genreId ? { with_genres: genreId } : {}),
        sort_by: 'popularity.desc',
        page,
      };
    },
    [findGenreIdByName, tmdbGenres]
  );

  // Fetch page 1 of filtered genre whenever selectedGenre changes (when apiReady)
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
        const params = getDiscoverParamsForGenre(genreName, page);
        const data = await discoverMoviesPage(params, { signal }, genreMapRef.current);
        if (signal.aborted) return;

        setGenreGrid((prev) => {
          if (!append) {
            return {
              movies: data.results,
              page: data.page,
              totalPages: data.totalPages,
              totalResults: data.totalResults,
              isLoading: false,
              isLoadingMore: false,
              error: null,
              loadMoreError: null,
            };
          }

          const existingIds = new Set(prev.movies.map((m) => String(m.id)));
          const uniqueNext = data.results.filter((m) => !existingIds.has(String(m.id)));
          return {
            movies: [...prev.movies, ...uniqueNext],
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
                loadMoreError: 'Could not load more movies. Please try again.',
              }
            : {
                ...prev,
                movies: [],
                isLoading: false,
                isLoadingMore: false,
                error: 'Unable to load movies for this genre right now. Please try again.',
              }
        );
      }
    },
    [apiReady, getDiscoverParamsForGenre]
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

  // Genre dropdown options: dynamic TMDB genres + Bollywood when online, fallback offline
  const genreOptions = apiReady && tmdbGenres.length > 0
    ? ['All Genres', 'Bollywood', ...tmdbGenres.map((g) => g.name)]
    : FALLBACK_MOVIE_GENRES;

  // Offline / fallback local lists
  const allLocalMovies = getAllMovies();
  const bollywoodFallback = getBollywoodMovies();
  const actionFallback = getActionMovies();
  const adventureFallback = getAdventureMovies();
  const fantasyFallback = getFantasyMovies();
  const thrillerFallback = getThrillerMovies();

  const localFilteredMovies = selectedGenre === 'All Genres'
    ? allLocalMovies
    : allLocalMovies.filter((movie) => {
        if (selectedGenre.toLowerCase() === 'bollywood') {
          return movie.isBollywood || movie.genre?.toLowerCase().includes('bollywood');
        }
        const keywords = selectedGenre
          .split('&')
          .map((k) => k.trim().toLowerCase());
        const movieGenre = (movie.genre || '').toLowerCase();
        return keywords.some((kw) => movieGenre.includes(kw));
      });

  const displayedGridMovies = apiReady ? genreGrid.movies : localFilteredMovies;
  const hasMorePages = apiReady && genreGrid.page < genreGrid.totalPages;

  const handleLoadMore = () => {
    if (!apiReady || genreGrid.isLoadingMore || genreGrid.isLoading || !hasMorePages) return;
    fetchGenrePage(selectedGenre, genreGrid.page + 1, true);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4]">
      
      {/* Top Header Bar: "Movies" + "Genres ▾" Dropdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3EEE4] tracking-tight">
            Movies
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
                aria-label="Filter Movies by Genre"
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

      {/* Featured Movies Hero Spotlight */}
      <Hero movies={heroMovies} />

      {/* Main Content: 5 Curated Topic Rows OR Filtered Grid */}
      {selectedGenre === 'All Genres' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-4 pb-16">
          
          {/* Topic 1: Bollywood Hits & Blockbusters */}
          <MovieRow
            title="Bollywood Blockbusters"
            badge="Trending Cinema"
            movies={apiReady ? bollywoodRow.movies : bollywoodFallback}
            isLoading={bollywoodRow.isLoading}
            error={bollywoodRow.error}
            onRetry={() =>
              loadDiscoverRow(
                { with_origin_country: 'IN', with_original_language: 'hi', sort_by: 'popularity.desc', page: 1 },
                setBollywoodRow
              )
            }
          />

          {/* Topic 2: High-Octane Action */}
          <MovieRow
            title="Action Movies"
            badge="Adrenaline"
            movies={apiReady ? actionRow.movies : actionFallback}
            isLoading={actionRow.isLoading}
            error={actionRow.error}
            onRetry={() => {
              const id = findGenreIdByName(tmdbGenres, 'Action');
              loadDiscoverRow(
                { ...(id ? { with_genres: id } : {}), sort_by: 'popularity.desc', page: 1 },
                setActionRow
              );
            }}
          />

          {/* Topic 3: Adventure Movies */}
          <MovieRow
            title="Adventure Movies"
            badge="Exploration"
            movies={apiReady ? adventureRow.movies : adventureFallback}
            isLoading={adventureRow.isLoading}
            error={adventureRow.error}
            onRetry={() => {
              const id = findGenreIdByName(tmdbGenres, 'Adventure');
              loadDiscoverRow(
                { ...(id ? { with_genres: id } : {}), sort_by: 'popularity.desc', page: 1 },
                setAdventureRow
              );
            }}
          />

          {/* Topic 4: Dark Fantasy & Epic Sagas */}
          <MovieRow
            title="Dark Fantasy & Sagas"
            badge="Mythical"
            movies={apiReady ? fantasyRow.movies : fantasyFallback}
            isLoading={fantasyRow.isLoading}
            error={fantasyRow.error}
            onRetry={() => {
              const id = findGenreIdByName(tmdbGenres, 'Fantasy');
              loadDiscoverRow(
                { ...(id ? { with_genres: id } : {}), sort_by: 'popularity.desc', page: 1 },
                setFantasyRow
              );
            }}
          />

          {/* Topic 5: Thriller Movies */}
          <MovieRow
            title="Thriller Movies"
            badge="Suspense"
            movies={apiReady ? thrillerRow.movies : thrillerFallback}
            isLoading={thrillerRow.isLoading}
            error={thrillerRow.error}
            onRetry={() => {
              const id = findGenreIdByName(tmdbGenres, 'Thriller');
              loadDiscoverRow(
                { ...(id ? { with_genres: id } : {}), sort_by: 'popularity.desc', page: 1 },
                setThrillerRow
              );
            }}
          />

        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-16">
          <p className="text-xs sm:text-sm text-[#AAA49A] mb-5">
            Showing {displayedGridMovies.length} {displayedGridMovies.length === 1 ? 'title' : 'titles'}
            {apiReady && genreGrid.totalResults > displayedGridMovies.length
              ? ` of ${genreGrid.totalResults.toLocaleString()}`
              : ''}{' '}
            in <span className="text-[#F2B84B] font-semibold">{selectedGenre}</span>
          </p>

          {apiReady && genreGrid.isLoading ? (
            <div
              aria-label={`Loading ${selectedGenre} movies`}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5"
            >
              {Array.from({ length: 10 }).map((_, idx) => (
                <div
                  key={`grid-skeleton-${idx}`}
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
          ) : apiReady && genreGrid.error ? (
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
          ) : displayedGridMovies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {displayedGridMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>

              {/* Pagination / Load More */}
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
                          {genreGrid.loadMoreError ? 'Retry Load More' : 'Load More Movies'}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-[#AAA49A]">
              <p className="text-base font-medium text-[#F3EEE4]">No movies found in this genre.</p>
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


