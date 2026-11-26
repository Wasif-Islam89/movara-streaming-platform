import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Calendar,
  Clock,
  Film,
  Bookmark,
  BookmarkCheck,
  Globe,
  AlertCircle,
  Star,
  User,
  RotateCcw,
  VideoOff,
} from 'lucide-react';
import { getTmdbImageUrl, isApiConfigured } from '../services/api';
import {
  getMovieById,
  getRelatedMovies,
  fetchMovieDetails,
  fetchSimilarMovies,
} from '../services/movieService';
import { hasPlaybackSource } from '../services/playbackSourceService';
import { useWatchlist } from '../hooks/useWatchlist';
import MovieRow from '../components/MovieRow';
import Loader from '../components/Loader';

/**
 * Premium Cinematic Movie Details Page for MOVORA.
 */
export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [imageError, setImageError] = useState(false);

  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMovie = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError(null);
      setImageError(false);

      const localMatch = getMovieById(id);
      const isNumericId = !isNaN(Number(id));

      // Use local catalog immediately for slug/alias routes or when API is not configured
      if (!isApiConfigured() || (localMatch && !isNumericId)) {
        setMovie(localMatch);
        setRelatedMovies(localMatch ? getRelatedMovies(localMatch.id, 6) : []);
        setIsLoading(false);
        return;
      }

      if (!isNumericId && !localMatch) {
        setMovie(null);
        setRelatedMovies([]);
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchMovieDetails(id, { signal });
        if (signal?.aborted) return;

        if (!data) {
          setMovie(null);
          setRelatedMovies([]);
          setIsLoading(false);
          return;
        }

        setMovie(data);

        if (Array.isArray(data.similar) && data.similar.length > 0) {
          setRelatedMovies(data.similar.slice(0, 10));
        } else {
          try {
            const sim = await fetchSimilarMovies(data.id, 1, { signal });
            if (!signal?.aborted) {
              setRelatedMovies(sim.filter((m) => String(m.id) !== String(data.id)).slice(0, 10));
            }
          } catch {
            if (!signal?.aborted) setRelatedMovies([]);
          }
        }

        setIsLoading(false);
      } catch (err) {
        if (err?.name === 'AbortError' || signal?.aborted) return;

        if (err?.status === 404) {
          setMovie(null);
          setRelatedMovies([]);
          setIsLoading(false);
          return;
        }

        if (localMatch) {
          setMovie(localMatch);
          setRelatedMovies(getRelatedMovies(localMatch.id, 6));
          setIsLoading(false);
          return;
        }

        setError('Unable to load movie details right now. Please try again.');
        setIsLoading(false);
      }
    },
    [id]
  );

  // Scroll to top and load details whenever ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const controller = new AbortController();
    loadMovie(controller.signal);

    return () => {
      controller.abort();
    };
  }, [id, loadMovie]);

  // Dynamic page title
  useEffect(() => {
    if (movie?.title) {
      document.title = `${movie.title} | MOVORA`;
    } else {
      document.title = 'Movie Details | MOVORA';
    }
  }, [movie?.title]);

  if (isLoading) {
    return <Loader fullScreen message="Loading movie details..." />;
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#E58B43]/10 border border-[#E58B43]/30 flex items-center justify-center mx-auto text-[#E58B43]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#F3EEE4]">Something went wrong</h1>
          <p className="text-sm text-[#AAA49A]">{error}</p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => loadMovie()}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F2B84B] text-[#121212] font-semibold text-sm hover:bg-[#E58B43] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <Link
              to="/movies"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#121212] border border-[#2A2926] text-[#F3EEE4] font-medium text-sm hover:border-[#F2B84B]/40 transition-colors"
            >
              Browse Movies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Graceful Not-Found state for invalid IDs
  if (!movie) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#F2B84B]/10 border border-[#F2B84B]/30 flex items-center justify-center mx-auto text-[#F2B84B]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#F3EEE4]">
            Movie Not Found
          </h1>
          <p className="text-sm text-[#AAA49A]">
            We could not find any movie matching &quot;<span className="text-[#F2B84B] font-mono">{id}</span>&quot; in the MOVORA catalog.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/movies"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F2B84B] text-[#121212] font-semibold text-sm hover:bg-[#E58B43] transition-colors"
            >
              Browse Movies
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

  const inWatchlist = isInWatchlist(movie.id, 'movie');

  const directors = Array.isArray(movie.credits?.crew)
    ? movie.credits.crew
        .filter((person) => person.job === 'Director')
        .map((person) => person.name)
        .filter(Boolean)
    : [];

  const castList = Array.isArray(movie.credits?.cast)
    ? movie.credits.cast.slice(0, 12)
    : [];

  const handleWatchlistClick = () => {
    toggleWatchlist({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      year: movie.year,
      rating: movie.rating,
      mediaType: 'movie',
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
          <Link to="/movies" className="hover:text-[#F3EEE4] transition-colors">Movies</Link>
          <span className="text-[#2A2926]">/</span>
          <span className="text-[#F2B84B] truncate max-w-[200px] sm:max-w-none">{movie.title}</span>
        </div>
      </div>

      {/* Cinematic Hero Backdrop Banner */}
      <div className="relative w-full overflow-hidden bg-[#121212] min-h-[440px] sm:min-h-[520px] lg:min-h-[580px] flex items-end">
        
        {/* Background Image with Dark Vignettes */}
        <div className="absolute inset-0 z-0">
          {(movie.backdropUrl || movie.posterUrl) && (
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover object-center filter brightness-90 transform scale-105"
            />
          )}
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
              {movie.posterUrl && !imageError ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#AAA49A]">
                  <Film className="w-10 h-10 mb-2 opacity-50 text-[#F2B84B]" />
                  <span className="text-xs font-semibold">{movie.title}</span>
                </div>
              )}
            </div>

            {/* Movie Title & Meta Information */}
            <div className="flex-1 text-center md:text-left space-y-3 sm:space-y-4">
              
              {/* Meta Chips */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm">
                {movie.rating && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F2B84B]/15 border border-[#F2B84B]/40 text-[#F2B84B] font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{movie.rating}</span>
                  </span>
                )}

                {movie.year && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1C1A]/80 border border-[#2A2926] text-[#F3EEE4] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#AAA49A]" />
                    <span>{movie.year}</span>
                  </span>
                )}

                {movie.duration && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1C1A]/80 border border-[#2A2926] text-[#F3EEE4] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#AAA49A]" />
                    <span>{movie.duration}</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1D1C1A]/80 border border-[#2A2926] text-[#F3EEE4] font-medium">
                  <span>4K</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F3EEE4] tracking-tight leading-tight">
                {movie.title}
              </h1>

              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-xs sm:text-sm text-[#AAA49A]">
                  Original Title: {movie.originalTitle}
                </p>
              )}

              {/* Tagline */}
              {movie.tagline && (
                <p className="text-sm sm:text-base italic text-[#F2B84B]/90 font-medium">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              {/* Action Buttons: Watch Movie (when available), Watch Trailer & Watchlist */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                {(() => {
                  const isStreamAvailable = hasPlaybackSource({
                    mediaType: 'movie',
                    id: movie.id,
                  });

                  return (
                    <>
                      {/* Watch Movie (only active when a verified full-film source exists) */}
                      {isStreamAvailable ? (
                        <Link
                          to={`/watch/movie/${movie.id}`}
                          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-lg shadow-[#F2B84B]/20 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/60 cursor-pointer"
                          aria-label={`Watch ${movie.title} in MOVORA player`}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Watch Movie</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          title="No authorized full-length video source is currently registered for this movie."
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm sm:text-base text-[#AAA49A] bg-[#1D1C1A]/70 border border-[#2A2926] cursor-not-allowed opacity-75"
                        >
                          <VideoOff className="w-4 h-4" />
                          <span>Stream Unavailable</span>
                        </button>
                      )}

                      {/* Watch Trailer Action (independent of full-movie playback availability) */}
                      {movie.trailerUrl ? (
                        <a
                          href={movie.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/50 cursor-pointer ${
                            isStreamAvailable
                              ? 'bg-[#1D1C1A]/90 border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/40 hover:text-[#F2B84B]'
                              : 'text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-lg shadow-[#F2B84B]/20'
                          }`}
                          aria-label={`Watch trailer for ${movie.title} (opens in new tab)`}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Watch Trailer</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm sm:text-base text-[#AAA49A] bg-[#1D1C1A]/70 border border-[#2A2926] cursor-not-allowed opacity-60"
                          aria-disabled="true"
                        >
                          <Play className="w-4 h-4" />
                          <span>Trailer Unavailable</span>
                        </button>
                      )}
                    </>
                  );
                })()}

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

      {/* Main Details & Information Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Storyline / Synopsis & Cast (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] tracking-tight">
                Storyline
              </h2>
              <p className="text-sm sm:text-base text-[#AAA49A] leading-relaxed">
                {movie.description || 'No synopsis is currently available for this title.'}
              </p>
            </div>

            {castList.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] tracking-tight">
                  Top Cast
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {castList.map((person) => {
                    const profileUrl = person.profile_path
                      ? getTmdbImageUrl(person.profile_path, 'w185')
                      : null;
                    return (
                      <div
                        key={person.credit_id || `${person.id}-${person.character}`}
                        className="rounded-xl bg-[#121212]/80 border border-[#2A2926] overflow-hidden flex flex-col"
                      >
                        <div className="aspect-[2/3] w-full bg-[#1D1C1A] flex items-center justify-center overflow-hidden">
                          {profileUrl ? (
                            <img
                              src={profileUrl}
                              alt={person.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-[#AAA49A]/40" />
                          )}
                        </div>
                        <div className="p-2.5 space-y-0.5">
                          <p className="text-xs font-semibold text-[#F3EEE4] truncate" title={person.name}>
                            {person.name}
                          </p>
                          {person.character && (
                            <p className="text-[11px] text-[#AAA49A] truncate" title={person.character}>
                              {person.character}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Specifications (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-4 text-xs sm:text-sm">
              <h3 className="font-semibold uppercase tracking-wider text-[#F2B84B] text-xs">
                Movie Specifications
              </h3>

              <div className="space-y-3 divide-y divide-[#2A2926]/60">
                <div className="flex items-center justify-between pt-2 gap-3">
                  <span className="text-[#AAA49A]">Genre</span>
                  <span className="text-[#F3EEE4] font-medium text-right">{movie.genre || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between pt-3 gap-3">
                  <span className="text-[#AAA49A]">Release Date</span>
                  <span className="text-[#F3EEE4] font-medium text-right">{movie.releaseDate || movie.year || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between pt-3 gap-3">
                  <span className="text-[#AAA49A]">Runtime</span>
                  <span className="text-[#F3EEE4] font-medium">{movie.duration || 'N/A'}</span>
                </div>

                {movie.rating && (
                  <div className="flex items-center justify-between pt-3 gap-3">
                    <span className="text-[#AAA49A]">Rating</span>
                    <span className="text-[#F3EEE4] font-medium">
                      {movie.rating} / 10
                      {movie.voteCount ? ` (${movie.voteCount.toLocaleString()} votes)` : ''}
                    </span>
                  </div>
                )}

                {movie.status && (
                  <div className="flex items-center justify-between pt-3 gap-3">
                    <span className="text-[#AAA49A]">Status</span>
                    <span className="text-[#F3EEE4] font-medium">{movie.status}</span>
                  </div>
                )}

                {directors.length > 0 && (
                  <div className="flex items-center justify-between pt-3 gap-3">
                    <span className="text-[#AAA49A]">Director</span>
                    <span className="text-[#F3EEE4] font-medium text-right">{directors.join(', ')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 gap-3">
                  <span className="text-[#AAA49A]">Audio / Language</span>
                  <span className="text-[#F3EEE4] font-medium flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#F2B84B]" />
                    {movie.language || 'English'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Related Movies Section (Reusing MovieRow) */}
      {relatedMovies.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1D1C1A] pt-4">
          <MovieRow
            title="More Like This"
            badge="Recommended"
            movies={relatedMovies}
          />
        </div>
      )}

    </div>
  );
}
