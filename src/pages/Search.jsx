import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search as SearchIcon,
  X,
  Sparkles,
  Clapperboard,
  Flame,
  AlertCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { isApiConfigured } from '../services/api';
import {
  searchCatalog,
  searchTMDB,
  searchMoviesTMDB,
  searchTVTMDB,
  POPULAR_SEARCH_TERMS,
} from '../services/searchService';
import { getAllMovies, fetchTrendingMovies } from '../services/movieService';
import { getAllTVShows, fetchTrendingTVShows } from '../services/tvService';

const INITIAL_SEARCH_STATE = {
  results: [],
  page: 1,
  totalPages: 1,
  totalResults: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  loadMoreError: null,
};

export default function Search() {
  const apiReady = isApiConfigured();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [debouncedQuery, setDebouncedQuery] = useState(queryParam);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'movies' | 'tv'
  const [tmdbState, setTmdbState] = useState(INITIAL_SEARCH_STATE);
  const abortRef = useRef(null);

  // Sync internal state immediately when URL query changes
  useEffect(() => {
    setSearchTerm(queryParam);
    setDebouncedQuery(queryParam);
  }, [queryParam]);

  // Debounce typed search input (350ms) to prevent firing on every keystroke
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setDebouncedQuery('');
      return;
    }
    if (trimmed === debouncedQuery.trim()) return;

    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedQuery]);

  // Dynamic SEO title
  useEffect(() => {
    if (queryParam.trim()) {
      document.title = `"${queryParam}" - Search | MOVORA`;
    } else {
      document.title = 'Search Movies & TV Shows | MOVORA';
    }
  }, [queryParam]);

  // Execute live TMDB search with AbortController cleanup
  const runTmdbSearch = useCallback(
    async (query, filter, page = 1, append = false) => {
      const trimmed = (query || '').trim();
      if (!apiReady || !trimmed) {
        setTmdbState(INITIAL_SEARCH_STATE);
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const { signal } = controller;

      if (append) {
        setTmdbState((prev) => ({
          ...prev,
          isLoadingMore: true,
          loadMoreError: null,
        }));
      } else {
        setTmdbState({
          ...INITIAL_SEARCH_STATE,
          isLoading: true,
        });
      }

      try {
        let data;
        if (filter === 'movies') {
          data = await searchMoviesTMDB(trimmed, page, signal);
        } else if (filter === 'tv') {
          data = await searchTVTMDB(trimmed, page, signal);
        } else {
          data = await searchTMDB(trimmed, { filter: 'all', page, signal });
        }

        if (signal.aborted) return;

        setTmdbState((prev) => {
          if (!append) {
            return {
              results: data.results,
              page: data.page,
              totalPages: data.totalPages,
              totalResults: data.totalResults,
              isLoading: false,
              isLoadingMore: false,
              error: null,
              loadMoreError: null,
            };
          }

          const existingKeys = new Set(
            prev.results.map((item) => `${item.mediaType}-${item.id}`)
          );
          const uniqueNext = data.results.filter(
            (item) => !existingKeys.has(`${item.mediaType}-${item.id}`)
          );
          return {
            results: [...prev.results, ...uniqueNext],
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
        setTmdbState((prev) =>
          append
            ? {
                ...prev,
                isLoadingMore: false,
                loadMoreError: 'Could not load more results. Please try again.',
              }
            : {
                ...prev,
                results: [],
                isLoading: false,
                isLoadingMore: false,
                error: 'Unable to fetch search results right now. Please try again.',
              }
        );
      }
    },
    [apiReady]
  );

  useEffect(() => {
    if (!apiReady) return;
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      if (abortRef.current) abortRef.current.abort();
      setTmdbState(INITIAL_SEARCH_STATE);
      return;
    }

    runTmdbSearch(trimmed, activeFilter, 1, false);

    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [apiReady, debouncedQuery, activeFilter, runTmdbSearch]);

  // Offline / unconfigured local catalog search fallback
  const localResults = useMemo(() => {
    if (apiReady) return [];
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return [];
    return searchCatalog(trimmed, { filter: activeFilter });
  }, [apiReady, debouncedQuery, activeFilter]);

  const results = apiReady ? tmdbState.results : localResults;

  // Count per category for filter tab badges
  const categoryCounts = useMemo(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) return { all: 0, movies: 0, tv: 0 };

    if (!apiReady) {
      const allResults = searchCatalog(trimmed, { filter: 'all' });
      return {
        all: allResults.length,
        movies: allResults.filter((item) => item.mediaType === 'movie').length,
        tv: allResults.filter((item) => item.mediaType === 'tv').length,
      };
    }

    if (activeFilter === 'all') {
      return {
        all: tmdbState.results.length,
        movies: tmdbState.results.filter((item) => item.mediaType === 'movie').length,
        tv: tmdbState.results.filter((item) => item.mediaType === 'tv').length,
      };
    }

    return {
      all: tmdbState.results.length,
      movies: activeFilter === 'movies' ? tmdbState.results.length : 0,
      tv: activeFilter === 'tv' ? tmdbState.results.length : 0,
    };
  }, [apiReady, debouncedQuery, activeFilter, tmdbState.results]);

  // Default featured catalog when no query is typed (live TMDB trending with local fallback)
  const localFeaturedExploreList = useMemo(() => {
    const movies = getAllMovies().slice(0, 6);
    const tvs = getAllTVShows().slice(0, 4);
    return [...movies, ...tvs];
  }, []);

  const [liveFeaturedExploreList, setLiveFeaturedExploreList] = useState([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(() => apiReady && !queryParam.trim());

  useEffect(() => {
    if (!apiReady || debouncedQuery.trim()) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function loadFeaturedShowcase() {
      setIsFeaturedLoading(true);
      try {
        const [trendingMovies, trendingTV] = await Promise.all([
          fetchTrendingMovies('week', 1, { signal }),
          fetchTrendingTVShows('week', 1, { signal }),
        ]);
        if (signal.aborted) return;
        const combined = [
          ...trendingMovies.slice(0, 6),
          ...trendingTV.slice(0, 4),
        ];
        setLiveFeaturedExploreList(combined);
        setIsFeaturedLoading(false);
      } catch (err) {
        if (err?.name === 'AbortError' || signal.aborted) return;
        setLiveFeaturedExploreList([]);
        setIsFeaturedLoading(false);
      }
    }

    loadFeaturedShowcase();

    return () => {
      controller.abort();
    };
  }, [apiReady, debouncedQuery]);

  const featuredExploreList =
    apiReady && liveFeaturedExploreList.length > 0
      ? liveFeaturedExploreList
      : localFeaturedExploreList;

  function handleFormSubmit(e) {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
      setDebouncedQuery(trimmed);
    } else {
      setSearchParams({});
      setDebouncedQuery('');
    }
  }

  function handleTagClick(term) {
    setSearchTerm(term);
    setDebouncedQuery(term);
    setSearchParams({ q: term });
  }

  function handleClear() {
    setSearchTerm('');
    setDebouncedQuery('');
    setSearchParams({});
  }

  const hasQuery = Boolean(debouncedQuery.trim());
  const hasMorePages = apiReady && tmdbState.page < tmdbState.totalPages;

  function handleLoadMore() {
    if (!apiReady || tmdbState.isLoadingMore || tmdbState.isLoading || !hasMorePages) return;
    runTmdbSearch(debouncedQuery, activeFilter, tmdbState.page + 1, true);
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] pb-20">
      {/* Search Header Banner */}
      <section className="relative border-b border-[#1D1C1A] bg-gradient-to-b from-[#1D1C1A]/80 via-[#121212] to-[#121212] pt-8 sm:pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2B84B]/10 text-[#F2B84B] border border-[#F2B84B]/20">
              <Sparkles className="w-3.5 h-3.5" />
              Instant Catalog Search
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F3EEE4]">
              Find Movies &amp; TV Shows
            </h1>
            <p className="text-sm sm:text-base text-[#AAA49A] max-w-xl mx-auto">
              Explore thousands of titles, directors, franchises, and cinematic masterpieces on MOVORA.
            </p>
          </div>

          {/* Search Input Bar */}
          <form 
            onSubmit={handleFormSubmit}
            className="relative max-w-3xl mx-auto shadow-2xl rounded-2xl overflow-hidden border border-[#2A2926] bg-[#1D1C1A]/90 focus-within:border-[#F2B84B]/70 focus-within:ring-2 focus-within:ring-[#F2B84B]/20 transition-all"
          >
            <div className="flex items-center px-4 sm:px-5 py-3 sm:py-3.5 gap-3">
              <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#F2B84B] shrink-0" />
              <input
                id="search-page-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title (e.g. The Quantum Enigma, Arrakis, Embers)..."
                autoFocus
                className="w-full bg-transparent text-[#F3EEE4] placeholder-[#AAA49A] text-sm sm:text-lg focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear input"
                  className="p-1 rounded-md text-[#AAA49A] hover:text-[#F3EEE4] transition-colors focus:outline-none shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:opacity-95 transition-opacity shadow-md shadow-[#F2B84B]/10 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Suggested Tags */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-1 max-w-3xl mx-auto">
            <span className="text-xs text-[#AAA49A] flex items-center gap-1 mr-1">
              <Flame className="w-3.5 h-3.5 text-[#E58B43]" />
              Popular:
            </span>
            {POPULAR_SEARCH_TERMS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleTagClick(term)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  searchTerm.toLowerCase() === term.toLowerCase()
                    ? 'bg-[#F2B84B] text-[#121212] font-semibold border-[#F2B84B]'
                    : 'bg-[#1D1C1A] text-[#AAA49A] border-[#2A2926] hover:text-[#F3EEE4] hover:border-[#F2B84B]/40'
                }`}
              >
                {term}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Results with Filter Controls */}
        {hasQuery ? (
          <div className="space-y-6">
            
            {/* Filter Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D1C1A]">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] flex items-center gap-2">
                  <span>Results for &ldquo;{debouncedQuery.trim()}&rdquo;</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#AAA49A]">
                  Showing {results.length} {results.length === 1 ? 'match' : 'matches'}
                  {apiReady && tmdbState.totalResults > results.length
                    ? ` of ${tmdbState.totalResults.toLocaleString()}`
                    : ''}{' '}
                  in MOVORA catalog
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1D1C1A] border border-[#2A2926] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeFilter === 'all'
                      ? 'bg-[#F2B84B] text-[#121212] shadow-sm'
                      : 'text-[#AAA49A] hover:text-[#F3EEE4]'
                  }`}
                >
                  All ({categoryCounts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('movies')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeFilter === 'movies'
                      ? 'bg-[#F2B84B] text-[#121212] shadow-sm'
                      : 'text-[#AAA49A] hover:text-[#F3EEE4]'
                  }`}
                >
                  Movies{activeFilter === 'all' || activeFilter === 'movies' ? ` (${categoryCounts.movies})` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('tv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeFilter === 'tv'
                      ? 'bg-[#F2B84B] text-[#121212] shadow-sm'
                      : 'text-[#AAA49A] hover:text-[#F3EEE4]'
                  }`}
                >
                  TV Shows{activeFilter === 'all' || activeFilter === 'tv' ? ` (${categoryCounts.tv})` : ''}
                </button>
              </div>
            </div>

            {/* Loading, Error, Results Grid, or Empty State */}
            {apiReady && tmdbState.isLoading ? (
              <div
                aria-label="Loading search results"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6"
              >
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={`search-skeleton-${idx}`}
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
            ) : apiReady && tmdbState.error ? (
              <div className="py-16 text-center rounded-2xl bg-[#1D1C1A]/60 border border-[#2A2926] space-y-3 max-w-lg mx-auto px-4">
                <AlertCircle className="w-8 h-8 text-[#E58B43] mx-auto" />
                <p className="text-sm text-[#AAA49A]">{tmdbState.error}</p>
                <button
                  type="button"
                  onClick={() => runTmdbSearch(debouncedQuery, activeFilter, 1, false)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#121212] bg-[#F2B84B] hover:bg-[#E58B43] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6">
                  {results.map((item) => (
                    <MovieCard
                      key={`${item.mediaType}-${item.id}`}
                      movie={item}
                      mediaType={item.mediaType}
                    />
                  ))}
                </div>

                {(hasMorePages || tmdbState.loadMoreError) && (
                  <div className="pt-4 flex flex-col items-center gap-3">
                    {tmdbState.loadMoreError && (
                      <p className="text-xs text-[#E58B43]">{tmdbState.loadMoreError}</p>
                    )}
                    {hasMorePages && (
                      <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={tmdbState.isLoadingMore}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#1D1C1A] border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/60 hover:text-[#F2B84B] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        {tmdbState.isLoadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-[#F2B84B]" />
                            <span>Loading More...</span>
                          </>
                        ) : (
                          <span>
                            {tmdbState.loadMoreError ? 'Retry Load More' : 'Load More Results'}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* No Results State */
              <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] flex items-center justify-center mx-auto text-[#AAA49A]">
                  <SearchIcon className="w-8 h-8 text-[#AAA49A]/60" />
                </div>
                <h3 className="text-xl font-bold text-[#F3EEE4]">
                  No titles match &ldquo;{debouncedQuery.trim()}&rdquo;
                </h3>
                <p className="text-sm text-[#AAA49A]">
                  We couldn&apos;t find anything matching your query. Try searching with a different term, checking for typos, or browse popular movies.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#121212] bg-[#F2B84B] hover:bg-[#E58B43] transition-colors cursor-pointer"
                  >
                    Clear Search &amp; Explore
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Empty Search / Discover Showcase */
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#1D1C1A]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] flex items-center gap-2">
                  <Clapperboard className="w-5 h-5 text-[#F2B84B]" />
                  <span>Trending &amp; Recommended</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#AAA49A] mt-0.5">
                  Popular titles to get your cinematic journey started
                </p>
              </div>
            </div>

            {/* Showcase Grid */}
            {apiReady && isFeaturedLoading && liveFeaturedExploreList.length === 0 ? (
              <div
                aria-label="Loading trending recommendations"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
              >
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={`explore-skeleton-${idx}`}
                    className="aspect-[2/3] w-full rounded-xl bg-[#1D1C1A] border border-[#2A2926] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {featuredExploreList.map((item) => (
                  <MovieCard
                    key={`${item.mediaType || 'movie'}-${item.id}`}
                    movie={item}
                    mediaType={item.mediaType || 'movie'}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
