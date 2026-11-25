import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Film, Tv, Trash2 } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import MovieCard from '../components/MovieCard';

export default function MyList() {
  const { watchlist, clearWatchlist } = useWatchlist();
  const [filter, setFilter] = useState('all'); // 'all' | 'movie' | 'tv'

  // Update browser tab title
  useEffect(() => {
    document.title = 'Watchlist | MOVORA';
  }, []);

  const movieItems = watchlist.filter((item) => (item.mediaType || 'movie') === 'movie');
  const tvItems = watchlist.filter((item) => (item.mediaType || 'movie') === 'tv');

  const filteredItems = filter === 'movie' 
    ? movieItems 
    : filter === 'tv' 
    ? tvItems 
    : watchlist;

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] pb-20">
      
      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1D1C1A]">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3EEE4] tracking-tight">
              Watchlist
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#AAA49A]">
              Your personal collection. Track movies and TV shows to watch next.
            </p>
          </div>

          {/* Quick Actions & Clear Option */}
          {watchlist.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your entire saved watchlist?')) {
                    clearWatchlist();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#2A2926] bg-[#1D1C1A] text-[#AAA49A] hover:text-[#E58B43] hover:border-[#E58B43]/50 transition-colors cursor-pointer"
                aria-label="Clear all items from watchlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Navigation Tabs */}
        {watchlist.length > 0 && (
          <div className="pt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#F2B84B] text-[#121212] shadow-md shadow-[#F2B84B]/20'
                  : 'bg-[#1D1C1A] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/30'
              }`}
            >
              All Titles ({watchlist.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('movie')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                filter === 'movie'
                  ? 'bg-[#F2B84B] text-[#121212] shadow-md shadow-[#F2B84B]/20'
                  : 'bg-[#1D1C1A] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/30'
              }`}
            >
              Movies ({movieItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('tv')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                filter === 'tv'
                  ? 'bg-[#F2B84B] text-[#121212] shadow-md shadow-[#F2B84B]/20'
                  : 'bg-[#1D1C1A] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/30'
              }`}
            >
              TV Shows ({tvItems.length})
            </button>
          </div>
        )}

        {/* Watchlist Grid Content */}
        {filteredItems.length > 0 ? (
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {filteredItems.map((item) => (
              <MovieCard
                key={`${item.mediaType || 'movie'}-${item.id}`}
                movie={item}
                id={item.id}
                title={item.title}
                posterUrl={item.posterUrl}
                year={item.year}
                rating={item.rating}
                mediaType={item.mediaType || 'movie'}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-3xl bg-[#1D1C1A] border border-[#2A2926] flex items-center justify-center text-[#AAA49A] mb-5 shadow-xl">
              <Bookmark className="w-10 h-10 opacity-40 text-[#F2B84B]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4]">
              {filter === 'all'
                ? 'Your Watchlist is Empty'
                : `No ${filter === 'movie' ? 'Movies' : 'TV Shows'} in Your List`}
            </h2>

            <p className="mt-2 text-sm sm:text-base text-[#AAA49A] max-w-md leading-relaxed">
              {filter === 'all'
                ? 'Explore top-rated releases and add films or series to your personal queue to watch later.'
                : `You haven't saved any ${filter === 'movie' ? 'movies' : 'TV shows'} yet.`}
            </p>

            {/* Quick Actions to Populate List */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/movies"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#f5c366] hover:to-[#eb9955] transition-all duration-200 shadow-md shadow-[#F2B84B]/10 active:scale-95"
              >
                <Film className="w-4 h-4" />
                <span>Explore Movies</span>
              </Link>
              <Link
                to="/tv-shows"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#F3EEE4] bg-[#1D1C1A] hover:bg-[#252422] border border-[#2A2926] hover:border-[#F2B84B]/40 transition-all duration-200 active:scale-95"
              >
                <Tv className="w-4 h-4 text-[#F2B84B]" />
                <span>Explore TV Shows</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
