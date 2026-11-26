import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Search as SearchIcon, ImageOff, Loader2 } from 'lucide-react';
import { isApiConfigured } from '../services/api';
import { searchCatalog, searchTMDB } from '../services/searchService';

/**
 * Dropdown preview component for real-time search suggestions in Navbar.
 * 
 * @param {Object} props
 * @param {string} props.query - Current search query
 * @param {boolean} props.isOpen - Whether the dropdown is open
 * @param {() => void} props.onClose - Callback to close dropdown & search overlay
 */
export default function SearchDropdown({ query, isOpen, onClose }) {
  const apiReady = isApiConfigured();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Update results whenever query changes (live TMDB with 300ms debounce + local fallback)
  useEffect(() => {
    const trimmed = (query || '').trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    if (!apiReady) {
      const matches = searchCatalog(trimmed, { limit: 5 });
      setResults(matches);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchTMDB(trimmed, {
          filter: 'all',
          page: 1,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setResults((data.results || []).slice(0, 5));
        setSelectedIndex(-1);
        setIsLoading(false);
      } catch (err) {
        if (err?.name === 'AbortError' || controller.signal.aborted) return;
        setResults(searchCatalog(trimmed, { limit: 5 }));
        setSelectedIndex(-1);
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, apiReady]);

  // Handle keyboard navigation (Arrow Up, Down, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (!results.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          handleSelect(selected);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  if (!isOpen || !query?.trim()) return null;

  function handleSelect(item) {
    const route = item.mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
    navigate(route);
    onClose();
  }

  function handleViewAll() {
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 mx-auto max-w-3xl bg-[#1D1C1A] border border-[#2A2926] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2A2926]/70 bg-[#121212]/40 text-xs text-[#AAA49A]">
        <div className="flex items-center gap-1.5 font-medium">
          <SearchIcon className="w-3.5 h-3.5 text-[#F2B84B]" />
          <span>Quick Results</span>
        </div>
        <span>{results.length} found</span>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="py-8 px-4 flex items-center justify-center gap-2 text-xs text-[#AAA49A]">
          <Loader2 className="w-4 h-4 animate-spin text-[#F2B84B]" />
          <span>Searching MOVORA...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="divide-y divide-[#2A2926]/50 max-h-[60vh] overflow-y-auto">
          {results.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={`${item.mediaType}-${item.id}`}
                type="button"
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-center gap-3.5 p-3 text-left transition-all duration-150 group cursor-pointer focus:outline-none ${
                  isSelected ? 'bg-[#121212] ring-1 ring-inset ring-[#F2B84B]/40' : 'hover:bg-[#121212]/60'
                }`}
              >
                {/* Poster / Thumbnail */}
                <div className="relative w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-[#121212] border border-[#2A2926]">
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#AAA49A]">
                      <ImageOff className="w-5 h-5" />
                    </div>
                  )}
                  {/* Subtle media indicator badge */}
                  <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-[9px] font-semibold uppercase bg-black/70 text-[#F3EEE4] backdrop-blur-xs">
                    {item.mediaType === 'tv' ? 'TV' : 'Film'}
                  </div>
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-semibold text-[#F3EEE4] group-hover:text-[#F2B84B] transition-colors truncate">
                      {item.title}
                    </h4>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-[#AAA49A]">
                    {item.rating && (
                      <span className="flex items-center gap-1 text-[#F2B84B] font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        {Number(item.rating).toFixed(1)}
                      </span>
                    )}
                    {item.year && <span>• {item.year}</span>}
                    {item.genre && (
                      <span className="hidden sm:inline text-[#AAA49A]/80 truncate max-w-[220px]">
                        • {item.genre}
                      </span>
                    )}
                  </div>

                  {/* Tagline or Description preview */}
                  {(item.tagline || item.description) && (
                    <p className="mt-1 text-xs text-[#AAA49A]/70 line-clamp-1 italic">
                      {item.tagline || item.description}
                    </p>
                  )}
                </div>

                {/* Arrow Action */}
                <div className="shrink-0 pl-2 text-[#AAA49A] group-hover:text-[#F2B84B] group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-8 px-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#121212] border border-[#2A2926] flex items-center justify-center mx-auto mb-2.5 text-[#AAA49A]">
            <SearchIcon className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-[#F3EEE4]">
            No titles found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-[#AAA49A] mt-1 max-w-xs mx-auto">
            Try checking for spelling errors or searching by actor, director, or genre.
          </p>
        </div>
      )}

      {/* Footer / View Full Results Button */}
      <div className="p-2.5 border-t border-[#2A2926] bg-[#121212]/70 flex items-center justify-end">
        <button
          type="button"
          onClick={handleViewAll}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#121212] bg-[#F2B84B] hover:bg-[#E58B43] transition-colors cursor-pointer"
        >
          <span>View all results for &ldquo;{query}&rdquo;</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
