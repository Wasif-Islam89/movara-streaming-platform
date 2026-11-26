import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Star, AlertCircle, RotateCcw, Film, VideoOff } from 'lucide-react';
import movoraLogo from '../assets/logo/MOVORA Logo.png';
import VideoPlayer from '../components/VideoPlayer';
import Loader from '../components/Loader';
import { isApiConfigured } from '../services/api';
import { getMovieById, fetchMovieDetails } from '../services/movieService';
import { getMoviePlaybackSource } from '../services/playbackSourceService';
import { getProgressId, useWatchProgress } from '../context/WatchProgressContext';
import { getHistoryId, useWatchHistory } from '../context/WatchHistoryContext';

export default function WatchMovie() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProgress, saveProgress, markCompleted } = useWatchProgress();
  const { addToHistory } = useWatchHistory();

  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);

  const loadMovie = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError(null);

      const localMatch = getMovieById(id);
      const isNumericId = !isNaN(Number(id));

      if (!isApiConfigured() || (localMatch && !isNumericId)) {
        setMovie(localMatch);
        setIsLoading(false);
        return;
      }

      if (!isNumericId && !localMatch) {
        setMovie(null);
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchMovieDetails(id, { signal });
        if (signal?.aborted) return;
        setMovie(data || null);
        setIsLoading(false);
      } catch (err) {
        if (err?.name === 'AbortError' || signal?.aborted) return;

        if (err?.status === 404) {
          setMovie(null);
          setIsLoading(false);
          return;
        }

        if (localMatch) {
          setMovie(localMatch);
          setIsLoading(false);
          return;
        }

        setError('Unable to load movie stream details right now. Please try again.');
        setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadMovie(controller.signal);
    return () => controller.abort();
  }, [loadMovie]);

  useEffect(() => {
    document.title = movie?.title ? `Watch ${movie.title} | MOVORA` : 'Watch Movie | MOVORA';
  }, [movie?.title]);

  const progressId = movie ? getProgressId('movie', movie.id) : '';
  const historyId = movie ? getHistoryId('movie', movie.id) : '';
  const sourceResolution = useMemo(
    () => (movie ? getMoviePlaybackSource(movie.id) : null),
    [movie]
  );

  useEffect(() => {
    if (!progressId) return;
    const saved = getProgress(progressId);
    setResumeTime(saved?.currentTime || 0);
    // Capture initial saved timestamp only when movie ID loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressId]);

  const recordMovieHistory = useCallback(
    (currentTime, duration, isCompleted = false) => {
      if (!movie || !historyId) return;
      addToHistory({
        historyId,
        mediaType: 'movie',
        tmdbId: movie.id,
        title: movie.title,
        poster: movie.posterUrl || movie.poster_path || null,
        backdrop: movie.backdropUrl || movie.backdrop_path || null,
        currentTime,
        duration,
        isCompleted,
        resumeRoute: `/watch/movie/${movie.id}`,
      });
    },
    [movie, historyId, addToHistory]
  );

  const handlePlayStart = useCallback(
    ({ currentTime, duration }) => {
      recordMovieHistory(currentTime, duration, false);
    },
    [recordMovieHistory]
  );

  const handleProgress = useCallback(
    ({ currentTime, duration }) => {
      if (!movie || !progressId) return;
      saveProgress({
        id: progressId,
        mediaType: 'movie',
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.posterUrl || movie.poster_path || null,
        backdropPath: movie.backdropUrl || movie.backdrop_path || null,
        currentTime,
        duration,
        resumeRoute: `/watch/movie/${movie.id}`,
      });
      recordMovieHistory(currentTime, duration, false);
    },
    [movie, progressId, saveProgress, recordMovieHistory]
  );

  const handleComplete = useCallback(
    ({ currentTime, duration }) => {
      if (!progressId) return;
      markCompleted(progressId);
      recordMovieHistory(currentTime, duration, true);
    },
    [progressId, markCompleted, recordMovieHistory]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F3EEE4] flex items-center justify-center">
        <Loader fullScreen message="Preparing MOVORA Player..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F3EEE4] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#E58B43]/10 border border-[#E58B43]/30 flex items-center justify-center mx-auto text-[#E58B43]">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#F3EEE4]">Playback Unavailable</h1>
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
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#121212] border border-[#2A2926] text-[#F3EEE4] font-medium text-sm hover:border-[#F2B84B]/40 transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F3EEE4] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#F2B84B]/10 border border-[#F2B84B]/30 flex items-center justify-center mx-auto text-[#F2B84B]">
            <Film className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#F3EEE4]">Movie Not Found</h1>
          <p className="text-sm text-[#AAA49A]">
            We could not find any movie matching &quot;<span className="text-[#F2B84B] font-mono">{id}</span>&quot;.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
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

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] flex flex-col">
      {/* Top Cinema Player Bar */}
      <header className="border-b border-[#1D1C1A] bg-[#121212]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/movie/${movie.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2926] bg-[#1D1C1A] text-xs sm:text-sm text-[#AAA49A] hover:text-[#F2B84B] hover:border-[#F2B84B]/40 transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Details</span>
            </Link>

            <span className="hidden sm:inline text-[#2A2926]">|</span>

            <h1 className="text-sm sm:text-base font-bold text-[#F3EEE4] truncate">
              {movie.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {sourceResolution?.available && sourceResolution.primarySource && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/30">
                {sourceResolution.primarySource.label}
              </span>
            )}
            <Link to="/" aria-label="MOVORA Home" className="hidden md:flex items-center">
              <img
                src={movoraLogo}
                alt="MOVORA"
                className="h-7 w-auto object-contain mix-blend-screen"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Video Player Stage or Unavailable State */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {sourceResolution?.available && sourceResolution.primarySource ? (
          <VideoPlayer
            key={progressId}
            src={sourceResolution.primarySource.url}
            sources={sourceResolution.sources}
            subtitles={sourceResolution.primarySource.subtitles || []}
            introWindow={sourceResolution.primarySource.introWindow || null}
            recapWindow={sourceResolution.primarySource.recapWindow || null}
            creditsStart={sourceResolution.primarySource.creditsStart ?? null}
            poster={movie.backdropUrl || movie.posterUrl}
            title={movie.title}
            initialTime={resumeTime}
            onPlayStart={handlePlayStart}
            onProgress={handleProgress}
            onComplete={handleComplete}
            backTo={`/movie/${movie.id}`}
            backLabel="Back to Details"
          />
        ) : (
          <div className="w-full aspect-video rounded-2xl bg-[#1D1C1A] border border-[#2A2926] flex flex-col items-center justify-center p-6 sm:p-10 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#121212] border border-[#2A2926] flex items-center justify-center text-[#F2B84B]">
              <VideoOff className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-lg sm:text-xl font-bold text-[#F3EEE4]">
                Playback Source Not Available
              </h2>
              <p className="text-xs sm:text-sm text-[#AAA49A] leading-relaxed">
                {sourceResolution?.reason ||
                  'A playable stream is not currently available for this movie.'}
              </p>
            </div>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/movie/${movie.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Details</span>
              </Link>
              <Link
                to="/movies"
                className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-[#121212] border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/40 transition-colors"
              >
                Browse Movies
              </Link>
            </div>
          </div>
        )}

        {/* Movie Info */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg sm:text-2xl font-bold text-[#F3EEE4]">
              {movie.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#AAA49A]">
              {movie.rating && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2B84B]/15 text-[#F2B84B] font-semibold">
                  <Star className="w-3 h-3 fill-current" />
                  {movie.rating}
                </span>
              )}
              {movie.year && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#121212] border border-[#2A2926]">
                  <Calendar className="w-3 h-3" />
                  {movie.year}
                </span>
              )}
              {movie.duration && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#121212] border border-[#2A2926]">
                  <Clock className="w-3 h-3" />
                  {movie.duration}
                </span>
              )}
            </div>
          </div>

          {movie.genre && (
            <p className="text-xs sm:text-sm text-[#F2B84B]/90 font-medium">
              {movie.genre}
            </p>
          )}

          {movie.description && (
            <p className="text-xs sm:text-sm text-[#AAA49A] leading-relaxed">
              {movie.description}
            </p>
          )}

          <div className="pt-2 border-t border-[#2A2926]/70 text-[11px] text-[#AAA49A]/80 space-y-1">
            <p>
              {sourceResolution?.available
                ? `Active Source: ${sourceResolution.primarySource.label}.`
                : 'TMDB provides movie metadata only. Full playback requires a registered licensed stream in playbackSourceService.'}
            </p>
            {sourceResolution?.available && sourceResolution.primarySource?.attribution && (
              <p>
                &ldquo;{sourceResolution.primarySource.attribution.title}&rdquo; by{' '}
                {sourceResolution.primarySource.attribution.creator} &bull; Licensed under{' '}
                <a
                  href={sourceResolution.primarySource.attribution.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F2B84B] hover:underline"
                >
                  {sourceResolution.primarySource.attribution.license}
                </a>{' '}
                &bull;{' '}
                <a
                  href={sourceResolution.primarySource.attribution.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F2B84B] hover:underline"
                >
                  {sourceResolution.primarySource.attribution.sourceName}
                </a>
                . Independent open-licensed film; no endorsement implied.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
