import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Calendar, 
  Tv, 
  Layers, 
  Bookmark, 
  BookmarkCheck, 
  Globe, 
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { getTVShowById, getRelatedTVShows } from '../services/tvService';
import { useWatchlist } from '../hooks/useWatchlist';
import MovieRow from '../components/MovieRow';

/**
 * Premium Cinematic TV Show Details Page for MOVORA.
 * 
 * Features:
 * - Dynamic route lookup matching /tv/:id
 * - Rich cinematic backdrop banner with atmospheric gradient overlays
 * - High-resolution poster with fallback handling
 * - TV-specific metadata chips (Rating, First-air Year, Seasons, Episodes, Content Rating, Status)
 * - Watch Series primary action linking to official trailer/stream
 * - Watchlist (My List) integration using useWatchlist hook
 * - In-depth Storyline & TV specifications grid (Seasons, Episodes, Status, Language, Rating)
 * - "More Like This" related series row reusing shared MovieRow component
 * - Graceful Not-Found state for invalid or missing TV show IDs
 */
export default function TVDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [imageError, setImageError] = useState(false);

  // Retrieve TV show data from local catalog service
  const show = getTVShowById(id);
  const relatedShows = show ? getRelatedTVShows(show.id, 6) : [];

  // Scroll to top whenever ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setImageError(false);
  }, [id]);

  // Graceful Not-Found state for invalid IDs
  if (!show) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#F2B84B]/10 border border-[#F2B84B]/30 flex items-center justify-center mx-auto text-[#F2B84B]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#F3EEE4]">
            TV Show Not Found
          </h1>
          <p className="text-sm text-[#AAA49A]">
            We could not find any television show matching &quot;<span className="text-[#F2B84B] font-mono">{id}</span>&quot; in the MOVORA catalog.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/tv-shows"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F2B84B] text-[#121212] font-semibold text-sm hover:bg-[#E58B43] transition-colors"
            >
              Browse TV Shows
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#121212] border border-[#2A2926] text-[#F3EEE4] font-medium text-sm hover:border-[#F2B84B]/40 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(show.id, 'tv');

  const handleWatchlistClick = () => {
    toggleWatchlist({
      id: show.id,
      title: show.title,
      posterUrl: show.posterUrl,
      year: show.year,
      rating: show.rating,
      mediaType: 'tv',
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] pb-16">
      
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-[#AAA49A]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2926] bg-[#1D1C1A] text-[#AAA49A] hover:text-[#F2B84B] hover:border-[#F2B84B]/40 transition-all cursor-pointer"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <span className="text-[#2A2926]">/</span>
          <Link to="/" className="hover:text-[#F3EEE4] transition-colors">Home</Link>
          <span className="text-[#2A2926]">/</span>
          <Link to="/tv-shows" className="hover:text-[#F3EEE4] transition-colors">TV Shows</Link>
          <span className="text-[#2A2926]">/</span>
          <span className="text-[#F2B84B] truncate max-w-[200px] sm:max-w-none">{show.title}</span>
        </div>
      </div>

      {/* Cinematic Hero Backdrop Banner */}
      <div className="relative w-full overflow-hidden bg-[#121212] min-h-[440px] sm:min-h-[520px] lg:min-h-[580px] flex items-end">
        
        {/* Background Image with Dark Vignettes */}
        <div className="absolute inset-0 z-0">
          <img
            src={show.backdropUrl || show.posterUrl}
            alt={show.title}
            className="w-full h-full object-cover object-center filter brightness-90 transform scale-105"
          />
          {/* Bottom fade into page */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/85 to-transparent z-10" />
          {/* Left darkening for high contrast readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/80 to-transparent z-10" />
          {/* Top subtle fade from Navbar */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/70 via-transparent to-transparent z-10" />
          {/* Ambient Gold Spotlight */}
          <div className="absolute top-1/4 left-10 z-10 w-80 h-80 bg-[#F2B84B]/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 lg:gap-10">
            
            {/* Poster Card */}
            <div className="w-44 sm:w-52 md:w-60 lg:w-64 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden bg-[#1D1C1A] border-2 border-[#2A2926] shadow-2xl shadow-black/90 group">
              {show.posterUrl && !imageError ? (
                <img
                  src={show.posterUrl}
                  alt={show.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#AAA49A]">
                  <Tv className="w-10 h-10 mb-2 opacity-50 text-[#F2B84B]" />
                  <span className="text-xs font-semibold">{show.title}</span>
                </div>
              )}
            </div>

            {/* Show Title & TV-Specific Metadata */}
            <div className="flex-1 text-center md:text-left space-y-3 sm:space-y-4">
              
              {/* Meta Chips */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm">
                {show.year && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1C1A]/80 border border-[#2A2926] text-[#F3EEE4] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#AAA49A]" />
                    <span>{show.year}</span>
                  </span>
                )}

                {show.seasons && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1C1A]/80 border border-[#2A2926] text-[#F3EEE4] font-medium">
                    <Layers className="w-3.5 h-3.5 text-[#AAA49A]" />
                    <span>{show.seasons}</span>
                  </span>
                )}

                {show.contentRating && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1C1A]/80 border border-[#2A2926] text-[#F3EEE4] font-medium">
                    <span>{show.contentRating}</span>
                  </span>
                )}

                {show.status && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1C1A]/80 border border-[#2A2926] text-[#F3EEE4] font-medium">
                    <span>{show.status}</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3EEE4] tracking-tight leading-tight">
                {show.title}
              </h1>

              {/* Tagline */}
              {show.tagline && (
                <p className="text-sm sm:text-base italic text-[#F2B84B]/90 font-medium">
                  &ldquo;{show.tagline}&rdquo;
                </p>
              )}

              {/* Action Buttons: Watch Series & Watchlist */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                
                {/* Watch Series Primary Action */}
                <a
                  href={show.trailerUrl || 'https://www.youtube.com/watch?v=BmVmhjjkN4E'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-lg shadow-[#F2B84B]/20 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/60 cursor-pointer"
                  aria-label={`Watch ${show.title} trailer/stream (opens in new tab)`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Series</span>
                </a>

                {/* Add to / Remove from Watchlist Toggle */}
                <button
                  type="button"
                  onClick={handleWatchlistClick}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm sm:text-base border transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/50 cursor-pointer ${
                    inWatchlist
                      ? 'bg-[#F2B84B]/20 border-[#F2B84B] text-[#F2B84B] shadow-md'
                      : 'bg-[#1D1C1A]/90 border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/40 hover:text-[#F2B84B]'
                  }`}
                  aria-pressed={inWatchlist}
                >
                  {inWatchlist ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 fill-[#F2B84B] text-[#F2B84B]" />
                      <span>In My List</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Add to My List</span>
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Main Details & TV Specifications Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Storyline / Synopsis (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] tracking-tight">
                Series Synopsis
              </h2>
              <p className="text-sm sm:text-base text-[#AAA49A] leading-relaxed">
                {show.description}
              </p>
            </div>
          </div>

          {/* TV Specifications (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-4 text-xs sm:text-sm">
              <h3 className="font-semibold uppercase tracking-wider text-[#F2B84B] text-xs">
                Series Specifications
              </h3>

              <div className="space-y-3 divide-y divide-[#2A2926]/60">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[#AAA49A]">Genre</span>
                  <span className="text-[#F3EEE4] font-medium text-right">{show.genre || 'Drama'}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-[#AAA49A]">Seasons / Episodes</span>
                  <span className="text-[#F3EEE4] font-medium">{show.seasons} &bull; {show.episodes || 'Multiple'}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-[#AAA49A]">Production Status</span>
                  <span className="text-[#F3EEE4] font-medium">{show.status || 'Ongoing'}</span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-[#AAA49A]">Content Rating</span>
                  <span className="text-[#F3EEE4] font-medium flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#F2B84B]" />
                    {show.contentRating || '16+'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <span className="text-[#AAA49A]">Original Language</span>
                  <span className="text-[#F3EEE4] font-medium flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#F2B84B]" />
                    {show.language || 'English (Original)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Related TV Series Section (Reusing MovieRow) */}
      {relatedShows.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1D1C1A] pt-4">
          <MovieRow
            title="More Like This"
            badge="Recommended Series"
            movies={relatedShows}
          />
        </div>
      )}

    </div>
  );
}
