import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, X, Film, Tv } from 'lucide-react';
import { useWatchProgress } from '../context/WatchProgressContext';

/**
 * Continue Watching Row Component for MOVORA Home Page.
 *
 * Displays unfinished movies and TV episodes (< 90% watched) sorted by most recently watched,
 * with a visible playback progress bar, percentage watched, and direct resume link.
 */
export default function ContinueWatching({ className = '' }) {
  const { continueWatching, removeProgress } = useWatchProgress();
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollBounds = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

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
  }, [continueWatching, checkScrollBounds]);

  const scroll = (direction) => {
    const el = rowRef.current;
    if (!el) return;

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

    setTimeout(checkScrollBounds, 350);
  };

  if (!Array.isArray(continueWatching) || continueWatching.length === 0) {
    return null;
  }

  return (
    <section aria-label="Continue Watching" className={`py-6 sm:py-8 ${className}`}>
      {/* Row Header */}
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] tracking-tight">
            Continue Watching
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/30 tracking-wide">
            Resume
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll Continue Watching left"
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
            aria-label="Scroll Continue Watching right"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/50 ${
              canScrollRight
                ? 'bg-[#1D1C1A] text-[#F3EEE4] hover:text-[#F2B84B] border-[#2A2926] hover:border-[#F2B84B]/40 active:scale-95 cursor-pointer shadow-md'
                : 'bg-[#1D1C1A]/40 text-[#AAA49A]/30 border-[#2A2926]/40 cursor-not-allowed opacity-40'
            }`}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Row */}
      <div
        ref={rowRef}
        className="flex items-center gap-3.5 sm:gap-4 md:gap-5 overflow-x-auto overflow-y-hidden pt-2 pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {continueWatching.map((item) => {
          const imageSrc = item.posterPath || item.backdropPath;
          const isTv = item.mediaType === 'tv';

          return (
            <div
              key={item.id}
              className="w-[160px] sm:w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-3*1.25rem)/4)] lg:w-[calc((100%-4*1.25rem)/5)] flex-shrink-0"
            >
              <Link
                to={item.resumeRoute}
                className="group relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#1D1C1A] border border-[#2A2926] hover:border-[#F2B84B]/60 hover:shadow-2xl hover:shadow-black/80 hover:scale-[1.03] transition-all duration-300 ease-out select-none block focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/50"
                aria-label={`Resume ${item.title}${isTv ? ` Season ${item.seasonNumber} Episode ${item.episodeNumber}` : ''}`}
              >
                {/* Background Poster / Fallback */}
                <div className="absolute inset-0 bg-[#1D1C1A] overflow-hidden">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#AAA49A]">
                      {isTv ? (
                        <Tv className="w-8 h-8 mb-2 opacity-50 text-[#F2B84B]" />
                      ) : (
                        <Film className="w-8 h-8 mb-2 opacity-50 text-[#F2B84B]" />
                      )}
                      <span className="text-xs text-center font-medium line-clamp-2">{item.title}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/55 to-transparent opacity-90" />
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/65 to-transparent pointer-events-none" />
                </div>

                {/* Top Badges & Dismiss */}
                <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-[#121212]/85 text-[#F2B84B] border border-[#F2B84B]/30 backdrop-blur-md">
                    {isTv ? `S${item.seasonNumber} E${item.episodeNumber}` : 'Movie'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeProgress(item.id);
                    }}
                    title="Remove from Continue Watching"
                    aria-label={`Remove ${item.title} from Continue Watching`}
                    className="w-7 h-7 rounded-lg bg-[#121212]/80 border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/50 flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Center Play Badge */}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <span className="w-11 h-11 rounded-full bg-[#F2B84B]/90 text-[#121212] flex items-center justify-center shadow-lg opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </span>
                </div>

                {/* Bottom Metadata & Progress Bar */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-3.5 space-y-1.5">
                  <h3 className="text-sm font-semibold text-[#F3EEE4] group-hover:text-[#F2B84B] transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {isTv && item.episodeTitle && (
                    <p className="text-[11px] text-[#AAA49A] line-clamp-1">
                      {item.episodeTitle}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#AAA49A]">
                    <span>{item.watchedPercent}% watched</span>
                    <span className="text-[#F2B84B] font-medium">Resume</span>
                  </div>

                  {/* Playback Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#2A2926] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F2B84B] to-[#E58B43]"
                      style={{ width: `${Math.min(Math.max(item.watchedPercent || 0, 2), 100)}%` }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
