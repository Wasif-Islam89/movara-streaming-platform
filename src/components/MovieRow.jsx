import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Film, AlertCircle, RotateCcw } from 'lucide-react';
import MovieCard from './MovieCard';

/**
 * Premium Cinematic MovieRow Component for MOVORA.
 * 
 * Features:
 * - Smooth horizontal scrolling with accessible Left / Right arrow controls
 * - Dynamic scroll boundaries: disables arrows when edge is reached
 * - Touch & swipe enabled on mobile and tablet devices
 * - Hidden scrollbars for clean cinematic presentation
 * - Reusable with MovieCard component and future TMDB feeds
 * - Graceful handling of empty or missing movie arrays
 * 
 * @param {Object} props
 * @param {string} props.title - Section title (e.g. "Trending Movies").
 * @param {string} [props.subtitle] - Optional descriptive subtitle.
 * @param {string} [props.badge] - Optional badge tag (e.g. "Popular").
 * @param {Array<Object>} [props.movies] - Array of movie objects to render.
 * @param {string} [props.className] - Additional wrapper CSS classes.
 */
export default function MovieRow({
  title = 'Featured Movies',
  subtitle,
  badge,
  movies = [],
  isLoading = false,
  error = null,
  onRetry = null,
  className = '',
}) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to dynamically enable/disable arrows
  const checkScrollBounds = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    // Allow small epsilon tolerance for floating-point calculations
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  // Update bounds on mount, movie data changes, and window resize
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    checkScrollBounds();
    const timer = setTimeout(checkScrollBounds, 100);

    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [movies, checkScrollBounds]);

  // Horizontal scroll handler: slides exactly 1 card + gap per arrow click
  const scroll = (direction) => {
    const el = rowRef.current;
    if (!el) return;

    // Get exact width of single card + container gap
    const firstCard = el.firstElementChild;
    let scrollStep;
    if (firstCard) {
      const cardRect = firstCard.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const gap = parseFloat(style.columnGap || style.gap) || 20;
      scrollStep = cardRect.width + gap;
    } else {
      scrollStep = Math.max(el.clientWidth / 5, 200);
    }

    el.scrollBy({
      left: direction === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth',
    });

    // Re-check scroll bounds after smooth scrolling animation completes
    setTimeout(checkScrollBounds, 350);
  };

  // Keyboard navigation when row container is focused
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll('right');
    }
  };

  const hasMovies = Array.isArray(movies) && movies.length > 0;

  return (
    <section 
      aria-label={title}
      className={`py-6 sm:py-8 ${className}`}
    >
      {/* Row Header with Title, Badge, and Scroll Controls */}
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] tracking-tight">
              {title}
            </h2>
            {badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/30 tracking-wide">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-[#AAA49A]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Scroll Control Arrows (only rendered if movies list has items) */}
        {hasMovies && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
              title="Scroll left"
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/50 ${
                canScrollLeft
                  ? 'bg-[#1D1C1A] text-[#F3EEE4] hover:text-[#F2B84B] border-[#2A2926] hover:border-[#F2B84B]/40 active:scale-95 cursor-pointer shadow-md'
                  : 'bg-[#1D1C1A]/40 text-[#AAA49A]/30 border-[#2A2926]/40 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
              title="Scroll right"
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/50 ${
                canScrollRight
                  ? 'bg-[#1D1C1A] text-[#F3EEE4] hover:text-[#F2B84B] border-[#2A2926] hover:border-[#F2B84B]/40 active:scale-95 cursor-pointer shadow-md'
                  : 'bg-[#1D1C1A]/40 text-[#AAA49A]/30 border-[#2A2926]/40 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Scrollable Container */}
      {isLoading ? (
        <div
          aria-label={`Loading ${title}`}
          className="flex items-center gap-3.5 sm:gap-4 md:gap-5 overflow-hidden pt-2 pb-4"
        >
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="w-[160px] sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1.25rem)/4)] lg:w-[calc((100%-4*1.25rem)/5)] flex-shrink-0"
            >
              <div className="aspect-[2/3] w-full rounded-xl bg-[#1D1C1A] border border-[#2A2926] animate-pulse relative overflow-hidden">
                <div className="absolute inset-x-3 bottom-3 space-y-2">
                  <div className="h-3.5 w-3/4 rounded bg-[#2A2926]" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-10 rounded bg-[#2A2926]" />
                    <div className="h-3 w-10 rounded bg-[#2A2926]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="rounded-xl border border-[#2A2926] bg-[#1D1C1A]/60 p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#E58B43] mx-auto" />
          <p className="text-sm text-[#AAA49A]">
            {error}
          </p>
          {typeof onRetry === 'function' && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#F2B84B] text-[#121212] hover:bg-[#E58B43] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      ) : hasMovies ? (
        <div
          ref={rowRef}
          tabIndex={0}
          role="region"
          aria-label={`${title} movie list`}
          onKeyDown={handleKeyDown}
          className="flex items-center gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto overflow-y-hidden pt-2 pb-4 scroll-smooth focus:outline-none focus:ring-1 focus:ring-[#F2B84B]/20 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {movies.map((movie, index) => (
            <div
              key={movie?.id || `movie-${index}`}
              className="w-[160px] sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1.25rem)/4)] lg:w-[calc((100%-4*1.25rem)/5)] flex-shrink-0"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-[#2A2926] bg-[#1D1C1A]/50 p-8 text-center">
          <Film className="w-8 h-8 text-[#AAA49A]/50 mx-auto mb-2" />
          <p className="text-sm text-[#AAA49A]">
            No movies available in this category right now.
          </p>
        </div>
      )}
    </section>
  );
}
