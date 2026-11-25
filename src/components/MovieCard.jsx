import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';
import { useWatchlist } from '../hooks/useWatchlist';
import { getTmdbImageUrl } from '../services/api';
import dune2Poster from '../assets/posters/dune-2.jpg';

// Safe default placeholder for visual development when rendered without props
const DEFAULT_PLACEHOLDER = {
  id: 'dune-part-two',
  title: 'Dune: Part Two',
  year: '2024',
  rating: 8.5,
  posterUrl: dune2Poster,
  mediaType: 'movie',
};

/**
 * Premium Cinematic MovieCard Component for MOVORA.
 * 
 * Features:
 * - Responsive 2:3 cinematic poster presentation with smooth hover scaling
 * - Working "Add to My List" / "Remove from My List" toggle with localStorage persistence
 * - Working navigation to `/movie/:id` or `/tv/:id` when a valid ID is present
 * - Gold-accented rating badge and dark gradient overlays
 * - Graceful degradation for missing poster images, titles, years, or ratings
 * - TMDB schema forward-compatibility (supports raw TMDB movie objects or direct props)
 * 
 * @param {Object} props
 * @param {Object} [props.movie] - Movie or TV data object (supports TMDB schema).
 * @param {string|number} [props.id] - Unique identifier for navigation and My List.
 * @param {string} [props.title] - Title override.
 * @param {string} [props.posterUrl] - Poster image URL override.
 * @param {string|number} [props.year] - Release year.
 * @param {string|number} [props.rating] - Rating score.
 * @param {string} [props.mediaType] - 'movie' or 'tv' (defaults to 'movie').
 * @param {string} [props.className] - Additional wrapper CSS classes.
 */
export default function MovieCard({
  movie,
  id,
  title,
  posterUrl,
  year,
  rating,
  mediaType,
  className = '',
}) {
  const [imageError, setImageError] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // 1. Resolve identifier
  const activeId = id ?? movie?.id ?? (movie === undefined && id === undefined ? DEFAULT_PLACEHOLDER.id : null);

  // 2. Resolve title
  const activeTitle =
    title ??
    movie?.title ??
    movie?.name ??
    (movie === undefined && title === undefined ? DEFAULT_PLACEHOLDER.title : 'Untitled');

  // 3. Resolve poster URL (supports full URL, TMDB relative path, local asset, or default placeholder)
  const rawPoster =
    posterUrl ??
    movie?.posterUrl ??
    movie?.poster_path ??
    movie?.poster ??
    (movie === undefined && posterUrl === undefined ? DEFAULT_PLACEHOLDER.posterUrl : null);

  const isLocalOrFullUrl =
    typeof rawPoster === 'string' &&
    (rawPoster.startsWith('http://') ||
      rawPoster.startsWith('https://') ||
      rawPoster.startsWith('data:') ||
      rawPoster.startsWith('blob:') ||
      rawPoster.startsWith('/src/') ||
      rawPoster.startsWith('/assets/') ||
      rawPoster.startsWith('/@'));

  const resolvedPoster = rawPoster
    ? isLocalOrFullUrl
      ? rawPoster
      : getTmdbImageUrl(rawPoster, 'w500')
    : null;

  // 4. Resolve release year (extract 4-digit year from release_date or year prop)
  const rawDate =
    year ??
    movie?.release_date ??
    movie?.first_air_date ??
    movie?.year ??
    (movie === undefined && year === undefined ? DEFAULT_PLACEHOLDER.year : null);
  const activeYear = rawDate ? String(rawDate).slice(0, 4) : null;

  // 5. Resolve rating (format float to 1 decimal place)
  const rawRating =
    rating ??
    movie?.vote_average ??
    movie?.rating ??
    (movie === undefined && rating === undefined ? DEFAULT_PLACEHOLDER.rating : null);

  const activeRating =
    typeof rawRating === 'number'
      ? rawRating > 0
        ? rawRating.toFixed(1)
        : null
      : rawRating
      ? String(rawRating)
      : null;

  // 6. Resolve media type ('movie' | 'tv')
  const activeMediaType =
    mediaType ??
    movie?.media_type ??
    movie?.mediaType ??
    (movie === undefined && mediaType === undefined ? DEFAULT_PLACEHOLDER.mediaType : 'movie');

  // 7. Watchlist state for this card (composite identity: id + mediaType)
  const inWatchlist = activeId ? isInWatchlist(activeId, activeMediaType) : false;

  const handleWatchlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!activeId) return;

    toggleWatchlist({
      id: activeId,
      title: activeTitle,
      posterUrl: resolvedPoster,
      year: activeYear,
      rating: activeRating,
      mediaType: activeMediaType,
    });
  };

  // 8. Navigation route: only connect if a valid ID is present
  const detailsRoute = activeId
    ? activeMediaType === 'tv'
      ? `/tv/${activeId}`
      : `/movie/${activeId}`
    : null;

  // Shared card inner content
  const cardBody = (
    <div className="relative w-full h-full flex flex-col justify-end">
      {/* Poster Background Image or Styled Fallback */}
      <div className="absolute inset-0 bg-[#1D1C1A] overflow-hidden">
        {resolvedPoster && !imageError ? (
          <img
            src={resolvedPoster}
            alt={activeTitle}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          /* Styled Fallback for Missing or Broken Posters */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1D1C1A] via-[#161514] to-[#121212] text-[#AAA49A]">
            <div className="w-12 h-12 rounded-xl bg-[#2A2926]/80 border border-[#3A3835] flex items-center justify-center mb-2.5 group-hover:border-[#F2B84B]/40 group-hover:text-[#F2B84B] transition-colors shadow-inner">
              <Film className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="text-xs text-center font-medium line-clamp-2 px-2 text-[#AAA49A] group-hover:text-[#F3EEE4] transition-colors">
              {activeTitle}
            </span>
          </div>
        )}

        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Top Controls: Add/Remove Watchlist Button */}
      <div className="absolute top-2.5 inset-x-2.5 z-20 flex items-center justify-between pointer-events-none">
        
        {/* Working Add / Remove from My List Control */}
        {activeId ? (
          <button
            type="button"
            onClick={handleWatchlistToggle}
            aria-pressed={inWatchlist}
            aria-label={inWatchlist ? `Remove ${activeTitle} from My List` : `Add ${activeTitle} to My List`}
            title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
            className={`pointer-events-auto group/btn w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-md border shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/60 ${
              inWatchlist
                ? 'bg-[#F2B84B]/20 border-[#F2B84B]/60 text-[#F2B84B] hover:bg-[#F2B84B]/30'
                : 'bg-[#121212]/80 border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#1D1C1A] hover:border-[#F2B84B]/40'
            }`}
          >
            {inWatchlist ? (
              <BookmarkCheck className="w-4 h-4 fill-[#F2B84B] text-[#F2B84B]" />
            ) : (
              <Bookmark className="w-4 h-4 group-hover/btn:text-[#F2B84B] transition-colors" />
            )}
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Bottom Content Metadata */}
      <div className="relative z-10 p-3 sm:p-4 space-y-1">
        <h3
          className="text-sm sm:text-base font-semibold text-[#F3EEE4] group-hover:text-[#F2B84B] transition-colors line-clamp-1 drop-shadow-sm"
          title={activeTitle}
        >
          {activeTitle}
        </h3>

        <div className="flex items-center justify-between text-xs text-[#AAA49A]">
          {activeYear ? (
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3 h-3 text-[#AAA49A]" />
              {activeYear}
            </span>
          ) : (
            <span className="text-[#AAA49A]/60">MOVORA</span>
          )}

          <span className="text-[11px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#2A2926]/80 text-[#AAA49A] border border-[#3A3835]/50 group-hover:border-[#F2B84B]/30 group-hover:text-[#F3EEE4] transition-colors">
            {activeMediaType === 'tv' ? 'TV' : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );

  const baseStyles = `group relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#1D1C1A] border border-[#2A2926] hover:border-[#F2B84B]/50 hover:shadow-2xl hover:shadow-black/80 hover:scale-[1.03] transition-all duration-300 ease-out select-none block ${className}`;

  // If a valid ID is available, wrap in React Router Link to navigate to details route
  if (detailsRoute) {
    return (
      <Link
        to={detailsRoute}
        className={`${baseStyles} focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/50`}
        aria-label={`View details for ${activeTitle}${activeYear ? ` (${activeYear})` : ''}`}
      >
        {cardBody}
      </Link>
    );
  }

  // Fallback presentation article when no valid ID is present
  return (
    <article 
      className={baseStyles}
      aria-label={`${activeTitle}${activeYear ? ` (${activeYear})` : ''}`}
    >
      {cardBody}
    </article>
  );
}
