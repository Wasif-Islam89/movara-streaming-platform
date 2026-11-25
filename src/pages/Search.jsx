import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  X, 
  Film, 
  Tv, 
  Sparkles, 
  Clapperboard, 
  SlidersHorizontal,
  Flame,
  ArrowRight
} from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { searchCatalog, POPULAR_SEARCH_TERMS } from '../services/searchService';
import { getAllMovies } from '../services/movieService';
import { getAllTVShows } from '../services/tvService';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'movies' | 'tv'

  // Sync internal state when URL query changes
  useEffect(() => {
    setSearchTerm(queryParam);
  }, [queryParam]);

  // Dynamic SEO title
  useEffect(() => {
    if (queryParam.trim()) {
      document.title = `"${queryParam}" - Search | MOVORA`;
    } else {
      document.title = 'Search Movies & TV Shows | MOVORA';
    }
  }, [queryParam]);

  // Compute search results based on active query and filter
  const results = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return [];
    return searchCatalog(trimmed, { filter: activeFilter });
  }, [searchTerm, activeFilter]);

  // Count per category for badge counters
  const categoryCounts = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return { all: 0, movies: 0, tv: 0 };
    const allResults = searchCatalog(trimmed, { filter: 'all' });
    const moviesCount = allResults.filter((item) => item.mediaType === 'movie').length;
    const tvCount = allResults.filter((item) => item.mediaType === 'tv').length;
    return {
      all: allResults.length,
      movies: moviesCount,
      tv: tvCount,
    };
  }, [searchTerm]);

  // Default featured catalog when no query is typed
  const featuredExploreList = useMemo(() => {
    const movies = getAllMovies().slice(0, 6);
    const tvs = getAllTVShows().slice(0, 4);
    return [...movies, ...tvs];
  }, []);

  function handleFormSubmit(e) {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  }

  function handleTagClick(term) {
    setSearchTerm(term);
    setSearchParams({ q: term });
  }

  function handleClear() {
    setSearchTerm('');
    setSearchParams({});
  }

  const hasQuery = Boolean(searchTerm.trim());

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
                  <span>Results for &ldquo;{searchTerm}&rdquo;</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#AAA49A]">
                  Showing {results.length} {results.length === 1 ? 'match' : 'matches'} in MOVORA catalog
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
                  Movies ({categoryCounts.movies})
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
                  TV Shows ({categoryCounts.tv})
                </button>
              </div>
            </div>

            {/* Results Grid */}
            {results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4 sm:gap-6">
                {results.map((item) => (
                  <MovieCard
                    key={`${item.mediaType}-${item.id}`}
                    movie={item}
                    mediaType={item.mediaType}
                  />
                ))}
              </div>
            ) : (
              /* No Results State */
              <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] flex items-center justify-center mx-auto text-[#AAA49A]">
                  <SearchIcon className="w-8 h-8 text-[#AAA49A]/60" />
                </div>
                <h3 className="text-xl font-bold text-[#F3EEE4]">
                  No titles match &ldquo;{searchTerm}&rdquo;
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {featuredExploreList.map((item) => (
                <MovieCard
                  key={`${item.mediaType || 'movie'}-${item.id}`}
                  movie={item}
                  mediaType={item.mediaType || 'movie'}
                />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
