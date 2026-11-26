import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  AlertCircle,
  Star,
  User,
  Clock,
  RotateCcw,
  CheckCircle2,
  VideoOff,
} from 'lucide-react';
import { getTmdbImageUrl, isApiConfigured } from '../services/api';
import {
  getTVShowById,
  getRelatedTVShows,
  fetchTVShowDetails,
  fetchSimilarTVShows,
  fetchTVSeasonDetails,
} from '../services/tvService';
import { hasPlaybackSource } from '../services/playbackSourceService';
import { useWatchlist } from '../hooks/useWatchlist';
import { useWatchHistory } from '../context/WatchHistoryContext';
import { useWatchProgress } from '../context/WatchProgressContext';
import MovieRow from '../components/MovieRow';
import Loader from '../components/Loader';

/**
 * Premium Cinematic TV Show Details Page for MOVORA.
 */
export default function TVDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { history } = useWatchHistory();
  const { continueWatching } = useWatchProgress();
  const [imageError, setImageError] = useState(false);

  const [show, setShow] = useState(null);
  const [relatedShows, setRelatedShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Seasons & Episodes state
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(null);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [isSeasonLoading, setIsSeasonLoading] = useState(false);
  const [seasonError, setSeasonError] = useState(null);
  const seasonAbortRef = useRef(null);

  const sortedSeasons = useMemo(() => {
    const list = Array.isArray(show?.seasonsList) ? show.seasonsList : [];
    const regular = list
      .filter((s) => s.season_number >= 1)
      .sort((a, b) => a.season_number - b.season_number);
    const specials = list.filter((s) => s.season_number === 0);
    return [...regular, ...specials];
  }, [show?.seasonsList]);

  // Derive episode-level watch status & progress maps for this show from contexts
  const { episodeHistoryMap, episodeProgressMap, completedBySeasonMap, resumeEpisodeTarget } =
    useMemo(() => {
      const hMap = new Map();
      const pMap = new Map();
      const sCompleted = new Map();

      if (!show?.id) {
        return {
          episodeHistoryMap: hMap,
          episodeProgressMap: pMap,
          completedBySeasonMap: sCompleted,
          resumeEpisodeTarget: null,
        };
      }

      const showIdStr = String(show.id);

      for (const item of history || []) {
        if (item.mediaType === 'tv' && String(item.tmdbId) === showIdStr) {
          const epKey = `${item.seasonNumber}-${item.episodeNumber}`;
          hMap.set(epKey, item);
          if (item.isCompleted) {
            sCompleted.set(
              item.seasonNumber,
              (sCompleted.get(item.seasonNumber) || 0) + 1
            );
          }
        }
      }

      let latestResume = null;
      for (const prog of continueWatching || []) {
        if (prog.mediaType === 'tv' && String(prog.tmdbId) === showIdStr) {
          const epKey = `${prog.seasonNumber}-${prog.episodeNumber}`;
          pMap.set(epKey, prog);
          if (!latestResume || (prog.lastWatchedAt || 0) > (latestResume.lastWatchedAt || 0)) {
            latestResume = prog;
          }
        }
      }

      // Fallback to most recent incomplete Watch History record if not in Continue Watching
      if (!latestResume) {
        for (const item of history || []) {
          if (
            item.mediaType === 'tv' &&
            String(item.tmdbId) === showIdStr &&
            !item.isCompleted &&
            item.resumeRoute
          ) {
            latestResume = item;
            break;
          }
        }
      }

      return {
        episodeHistoryMap: hMap,
        episodeProgressMap: pMap,
        completedBySeasonMap: sCompleted,
        resumeEpisodeTarget: latestResume,
      };
    }, [show?.id, history, continueWatching]);

  // Season-level progress metrics for the currently selected season
  const seasonProgress = useMemo(() => {
    const episodes = Array.isArray(seasonDetails?.episodes)
      ? seasonDetails.episodes.filter((ep) => ep && Number.isInteger(ep.episode_number))
      : [];
    const totalEpisodes = episodes.length;
    if (totalEpisodes === 0) {
      return {
        totalEpisodes: 0,
        completedEpisodes: 0,
        inProgressEpisodes: 0,
        remainingEpisodes: 0,
        completionPercentage: 0,
      };
    }

    let completedEpisodes = 0;
    let inProgressEpisodes = 0;

    for (const ep of episodes) {
      const epKey = `${selectedSeasonNumber}-${ep.episode_number}`;
      const hist = episodeHistoryMap.get(epKey);
      const prog = episodeProgressMap.get(epKey);
      if (hist?.isCompleted) {
        completedEpisodes += 1;
      } else if (prog || (hist && hist.watchedPercent > 0)) {
        inProgressEpisodes += 1;
      }
    }

    const remainingEpisodes = Math.max(0, totalEpisodes - completedEpisodes);
    const completionPercentage = Math.round((completedEpisodes / totalEpisodes) * 100);

    return {
      totalEpisodes,
      completedEpisodes,
      inProgressEpisodes,
      remainingEpisodes,
      completionPercentage,
    };
  }, [seasonDetails?.episodes, selectedSeasonNumber, episodeHistoryMap, episodeProgressMap]);

  const loadShow = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError(null);
      setImageError(false);
      setSelectedSeasonNumber(null);
      setSeasonDetails(null);
      setSeasonError(null);

      const localMatch = getTVShowById(id);
      const isNumericId = !isNaN(Number(id));

      // Use local catalog immediately for slug/alias routes or when API is not configured
      if (!isApiConfigured() || (localMatch && !isNumericId)) {
        setShow(localMatch);
        setRelatedShows(localMatch ? getRelatedTVShows(localMatch.id, 6) : []);
        setIsLoading(false);
        return;
      }

      if (!isNumericId && !localMatch) {
        setShow(null);
        setRelatedShows([]);
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchTVShowDetails(id, { signal });
        if (signal?.aborted) return;

        if (!data) {
          setShow(null);
          setRelatedShows([]);
          setIsLoading(false);
          return;
        }

        setShow(data);

        // Default to first regular season (or first available season such as Specials)
        const list = Array.isArray(data.seasonsList) ? data.seasonsList : [];
        const firstRegular = list.find((s) => s.season_number >= 1);
        const defaultSeason = firstRegular ?? list[0];
        if (defaultSeason !== undefined) {
          setSelectedSeasonNumber(defaultSeason.season_number);
        }

        if (Array.isArray(data.similar) && data.similar.length > 0) {
          setRelatedShows(data.similar.slice(0, 10));
        } else {
          try {
            const sim = await fetchSimilarTVShows(data.id, 1, { signal });
            if (!signal?.aborted) {
              setRelatedShows(sim.filter((s) => String(s.id) !== String(data.id)).slice(0, 10));
            }
          } catch {
            if (!signal?.aborted) setRelatedShows([]);
          }
        }

        setIsLoading(false);
      } catch (err) {
        if (err?.name === 'AbortError' || signal?.aborted) return;

        if (err?.status === 404) {
          setShow(null);
          setRelatedShows([]);
          setIsLoading(false);
          return;
        }

        if (localMatch) {
          setShow(localMatch);
          setRelatedShows(getRelatedTVShows(localMatch.id, 6));
          setIsLoading(false);
          return;
        }

        setError('Unable to load TV show details right now. Please try again.');
        setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const controller = new AbortController();
    loadShow(controller.signal);

    return () => {
      controller.abort();
    };
  }, [id, loadShow]);

  useEffect(() => {
    if (show?.title) {
      document.title = `${show.title} | MOVORA`;
    } else {
      document.title = 'TV Show Details | MOVORA';
    }
  }, [show?.title]);

  const loadSeason = useCallback(async (tvId, seasonNum) => {
    if (!isApiConfigured() || tvId === undefined || seasonNum === null || isNaN(Number(tvId))) {
      return;
    }

    if (seasonAbortRef.current) {
      seasonAbortRef.current.abort();
    }
    const controller = new AbortController();
    seasonAbortRef.current = controller;
    const { signal } = controller;

    setIsSeasonLoading(true);
    setSeasonError(null);

    try {
      const data = await fetchTVSeasonDetails(tvId, seasonNum, { signal });
      if (signal.aborted) return;
      setSeasonDetails(data);
      setIsSeasonLoading(false);
    } catch (err) {
      if (err?.name === 'AbortError' || signal.aborted) return;
      setSeasonDetails(null);
      setSeasonError('Unable to load episodes for this season. Please try again.');
      setIsSeasonLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!show?.id || selectedSeasonNumber === null || isNaN(Number(show.id))) {
      return;
    }
    loadSeason(show.id, selectedSeasonNumber);

    return () => {
      if (seasonAbortRef.current) {
        seasonAbortRef.current.abort();
      }
    };
  }, [show?.id, selectedSeasonNumber, loadSeason]);

  if (isLoading) {
    return <Loader fullScreen message="Loading TV show details..." />;
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
              onClick={() => loadShow()}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F2B84B] text-[#121212] font-semibold text-sm hover:bg-[#E58B43] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <Link
              to="/tv-shows"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#121212] border border-[#2A2926] text-[#F3EEE4] font-medium text-sm hover:border-[#F2B84B]/40 transition-colors"
            >
              Browse TV Shows
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

  const castList = Array.isArray(show.credits?.cast)
    ? show.credits.cast.slice(0, 12)
    : [];

  const creators = Array.isArray(show.createdBy)
    ? show.createdBy.map((c) => c.name).filter(Boolean)
    : [];

  const activeSeasonMeta = sortedSeasons.find(
    (s) => s.season_number === selectedSeasonNumber
  );

  const firstPlayableEpisode =
    Array.isArray(seasonDetails?.episodes) && seasonDetails.episodes.length > 0
      ? [...seasonDetails.episodes].sort((a, b) => a.episode_number - b.episode_number)[0]
      : null;

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
          {(show.backdropUrl || show.posterUrl) && (
            <img
              src={show.backdropUrl || show.posterUrl}
              alt={show.title}
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
                {show.rating && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F2B84B]/15 border border-[#F2B84B]/40 text-[#F2B84B] font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{show.rating}</span>
                  </span>
                )}

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

              {/* Action Buttons: Resume Episode, Watch Trailer & Watchlist */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
                {(() => {
                  const hasPlayableResume = Boolean(
                    resumeEpisodeTarget &&
                      hasPlaybackSource({
                        mediaType: 'tv',
                        id: show.id,
                        seasonNumber: resumeEpisodeTarget.seasonNumber,
                        episodeNumber: resumeEpisodeTarget.episodeNumber,
                      })
                  );
                  const hasPlayableFirstEpisode = Boolean(
                    firstPlayableEpisode &&
                      seasonProgress.completedEpisodes < seasonProgress.totalEpisodes &&
                      hasPlaybackSource({
                        mediaType: 'tv',
                        id: show.id,
                        seasonNumber: selectedSeasonNumber,
                        episodeNumber: firstPlayableEpisode.episode_number,
                      })
                  );
                  const hasAnyHeroPlayable = hasPlayableResume || hasPlayableFirstEpisode;

                  return (
                    <>
                      {/* Resume Last Watched Incomplete Episode (when playable source exists) */}
                      {hasPlayableResume ? (
                        <Link
                          to={resumeEpisodeTarget.resumeRoute}
                          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-lg shadow-[#F2B84B]/20 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/60 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>
                            Resume S{resumeEpisodeTarget.seasonNumber} E
                            {resumeEpisodeTarget.episodeNumber} ({resumeEpisodeTarget.watchedPercent}
                            %)
                          </span>
                        </Link>
                      ) : hasPlayableFirstEpisode ? (
                        <Link
                          to={`/watch/tv/${show.id}/season/${selectedSeasonNumber}/episode/${firstPlayableEpisode.episode_number}`}
                          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-lg shadow-[#F2B84B]/20 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/60 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Start Watching</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          title="No authorized full-episode video sources are currently registered for this series."
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm sm:text-base text-[#AAA49A] bg-[#1D1C1A]/70 border border-[#2A2926] cursor-not-allowed opacity-75"
                        >
                          <VideoOff className="w-4 h-4" />
                          <span>Stream Unavailable</span>
                        </button>
                      )}

                      {/* Watch Trailer Primary/Secondary Action */}
                      {show.trailerUrl ? (
                        <a
                          href={show.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/60 cursor-pointer ${
                            hasAnyHeroPlayable
                              ? 'bg-[#1D1C1A]/90 border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/40 hover:text-[#F2B84B]'
                              : 'text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-lg shadow-[#F2B84B]/20'
                          }`}
                          aria-label={`Watch trailer for ${show.title} (opens in new tab)`}
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

      {/* Main Details & TV Specifications Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Storyline / Synopsis & Cast (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] tracking-tight">
                Series Synopsis
              </h2>
              <p className="text-sm sm:text-base text-[#AAA49A] leading-relaxed">
                {show.description || 'No synopsis is currently available for this series.'}
              </p>
            </div>

            {castList.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] tracking-tight">
                  Series Cast
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

          {/* TV Specifications (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-4 text-xs sm:text-sm">
              <h3 className="font-semibold uppercase tracking-wider text-[#F2B84B] text-xs">
                Series Specifications
              </h3>

              <div className="space-y-3 divide-y divide-[#2A2926]/60">
                <div className="flex items-center justify-between pt-2 gap-3">
                  <span className="text-[#AAA49A]">Genre</span>
                  <span className="text-[#F3EEE4] font-medium text-right">{show.genre || 'Drama'}</span>
                </div>

                <div className="flex items-center justify-between pt-3 gap-3">
                  <span className="text-[#AAA49A]">Seasons / Episodes</span>
                  <span className="text-[#F3EEE4] font-medium text-right">
                    {[show.seasons, show.episodes].filter(Boolean).join(' • ') || 'N/A'}
                  </span>
                </div>

                {(show.firstAirDate || show.year) && (
                  <div className="flex items-center justify-between pt-3 gap-3">
                    <span className="text-[#AAA49A]">First Air Date</span>
                    <span className="text-[#F3EEE4] font-medium">{show.firstAirDate || show.year}</span>
                  </div>
                )}

                {show.lastAirDate && (
                  <div className="flex items-center justify-between pt-3 gap-3">
                    <span className="text-[#AAA49A]">Last Air Date</span>
                    <span className="text-[#F3EEE4] font-medium">{show.lastAirDate}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 gap-3">
                  <span className="text-[#AAA49A]">Production Status</span>
                  <span className="text-[#F3EEE4] font-medium">{show.status || 'Ongoing'}</span>
                </div>

                {show.rating && (
                  <div className="flex items-center justify-between pt-3 gap-3">
                    <span className="text-[#AAA49A]">Rating</span>
                    <span className="text-[#F3EEE4] font-medium">
                      {show.rating} / 10
                      {show.voteCount ? ` (${show.voteCount.toLocaleString()} votes)` : ''}
                    </span>
                  </div>
                )}

                {show.contentRating && (
                  <div className="flex items-center justify-between pt-3 gap-3">
                    <span className="text-[#AAA49A]">Content Rating</span>
                    <span className="text-[#F3EEE4] font-medium flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#F2B84B]" />
                      {show.contentRating}
                    </span>
                  </div>
                )}

                {creators.length > 0 && (
                  <div className="flex items-center justify-between pt-3 gap-3">
                    <span className="text-[#AAA49A]">Created By</span>
                    <span className="text-[#F3EEE4] font-medium text-right">{creators.join(', ')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 gap-3">
                  <span className="text-[#AAA49A]">Original Language</span>
                  <span className="text-[#F3EEE4] font-medium flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#F2B84B]" />
                    {show.language || 'English'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Seasons & Episodes Section (Live TMDB Data) */}
        {sortedSeasons.length > 0 && (
          <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] tracking-tight">
                  Seasons &amp; Episodes
                </h2>
                <p className="text-xs sm:text-sm text-[#AAA49A] mt-0.5">
                  Select a season to browse episode details
                </p>
              </div>

              {/* Season Selector Tabs */}
              <div className="flex items-center flex-wrap gap-2">
                {sortedSeasons.map((season) => {
                  const isActive = season.season_number === selectedSeasonNumber;
                  const label =
                    season.season_number === 0
                      ? season.name || 'Specials'
                      : season.name || `Season ${season.season_number}`;
                  const completedInSeason = completedBySeasonMap.get(season.season_number) || 0;
                  const seasonPct =
                    season.episode_count > 0 && completedInSeason > 0
                      ? Math.min(100, Math.round((completedInSeason / season.episode_count) * 100))
                      : null;

                  return (
                    <button
                      key={season.id || season.season_number}
                      type="button"
                      onClick={() => setSelectedSeasonNumber(season.season_number)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#F2B84B] text-[#121212] border-[#F2B84B] shadow-sm'
                          : 'bg-[#121212] text-[#AAA49A] border-[#2A2926] hover:text-[#F3EEE4] hover:border-[#F2B84B]/40'
                      }`}
                    >
                      <span>{label}</span>
                      {typeof season.episode_count === 'number' && (
                        <span className={`text-[10px] ${isActive ? 'text-[#121212]/80' : 'text-[#AAA49A]/70'}`}>
                          ({season.episode_count})
                        </span>
                      )}
                      {seasonPct !== null && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded ${
                            isActive
                              ? 'bg-[#121212]/15 text-[#121212]'
                              : 'bg-[#F2B84B]/15 text-[#F2B84B]'
                          }`}
                        >
                          {seasonPct}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Season Summary + Season Progress Bar */}
            {activeSeasonMeta && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-[#121212]/70 border border-[#2A2926]">
                {activeSeasonMeta.poster_path ? (
                  <img
                    src={getTmdbImageUrl(activeSeasonMeta.poster_path, 'w185')}
                    alt={activeSeasonMeta.name}
                    className="w-16 h-24 object-cover rounded-lg border border-[#2A2926] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 rounded-lg bg-[#1D1C1A] border border-[#2A2926] flex items-center justify-center shrink-0 text-[#AAA49A]/50">
                    <Tv className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 space-y-1.5 min-w-0 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#F3EEE4]">
                      {activeSeasonMeta.name || `Season ${activeSeasonMeta.season_number}`}
                    </h3>
                    {seasonProgress.totalEpisodes > 0 && (
                      <span className="text-xs font-semibold text-[#F2B84B]">
                        {seasonProgress.completedEpisodes} / {seasonProgress.totalEpisodes} Watched ({seasonProgress.completionPercentage}%)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#AAA49A]">
                    {typeof activeSeasonMeta.episode_count === 'number' && (
                      <span>{activeSeasonMeta.episode_count} Episodes</span>
                    )}
                    {activeSeasonMeta.air_date && (
                      <span>Air Date: {activeSeasonMeta.air_date}</span>
                    )}
                    {seasonProgress.totalEpisodes > 0 && (
                      <>
                        <span>&bull; {seasonProgress.inProgressEpisodes} In Progress</span>
                        <span>&bull; {seasonProgress.remainingEpisodes} Remaining</span>
                      </>
                    )}
                  </div>
                  {seasonProgress.totalEpisodes > 0 && (
                    <div className="w-full h-1.5 rounded-full bg-[#2A2926] overflow-hidden pt-0">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F2B84B] to-[#E58B43] transition-all duration-300"
                        style={{ width: `${seasonProgress.completionPercentage}%` }}
                      />
                    </div>
                  )}
                  {activeSeasonMeta.overview && (
                    <p className="text-xs sm:text-sm text-[#AAA49A] line-clamp-2 pt-1">
                      {activeSeasonMeta.overview}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Episodes List */}
            {isSeasonLoading ? (
              <div className="space-y-3" aria-label="Loading episodes">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`ep-skeleton-${idx}`}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[#121212]/60 border border-[#2A2926] animate-pulse"
                  >
                    <div className="w-full sm:w-44 aspect-video rounded-lg bg-[#1D1C1A] shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-1/3 rounded bg-[#1D1C1A]" />
                      <div className="h-3 w-1/4 rounded bg-[#1D1C1A]" />
                      <div className="h-3 w-full rounded bg-[#1D1C1A]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : seasonError ? (
              <div className="py-10 text-center rounded-xl bg-[#121212]/60 border border-[#2A2926] space-y-3">
                <AlertCircle className="w-7 h-7 text-[#E58B43] mx-auto" />
                <p className="text-sm text-[#AAA49A]">{seasonError}</p>
                <button
                  type="button"
                  onClick={() => loadSeason(show.id, selectedSeasonNumber)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#F2B84B] text-[#121212] hover:bg-[#E58B43] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : Array.isArray(seasonDetails?.episodes) && seasonDetails.episodes.length > 0 ? (
              <div className="space-y-3">
                {seasonDetails.episodes.map((ep) => {
                  const stillUrl = ep.still_path
                    ? getTmdbImageUrl(ep.still_path, 'w300')
                    : null;
                  const epKey = `${selectedSeasonNumber}-${ep.episode_number}`;
                  const epHist = episodeHistoryMap.get(epKey);
                  const epProg = episodeProgressMap.get(epKey);
                  const isWatched = Boolean(epHist?.isCompleted);
                  const progressPercent = epProg?.watchedPercent ?? epHist?.watchedPercent ?? 0;
                  const isInProgress = !isWatched && (Boolean(epProg) || progressPercent > 0);
                  const watchRoute = `/watch/tv/${show.id}/season/${selectedSeasonNumber}/episode/${ep.episode_number}`;
                  const isEpisodePlayable = Boolean(
                    show?.id &&
                      hasPlaybackSource({
                        mediaType: 'tv',
                        id: show.id,
                        seasonNumber: selectedSeasonNumber,
                        episodeNumber: ep.episode_number,
                      })
                  );

                  return (
                    <div
                      key={ep.id || ep.episode_number}
                      className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-[#121212]/70 border border-[#2A2926] hover:border-[#F2B84B]/30 transition-colors"
                    >
                      {isEpisodePlayable ? (
                        <Link
                          to={watchRoute}
                          className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-[#1D1C1A] border border-[#2A2926] flex items-center justify-center shrink-0 group/thumb"
                        >
                          {stillUrl ? (
                            <img
                              src={stillUrl}
                              alt={ep.name || `Episode ${ep.episode_number}`}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Tv className="w-7 h-7 text-[#AAA49A]/40" />
                          )}

                          {isInProgress && (
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-[#2A2926]">
                              <div
                                className="h-full bg-gradient-to-r from-[#F2B84B] to-[#E58B43]"
                                style={{ width: `${Math.min(Math.max(progressPercent, 2), 100)}%` }}
                              />
                            </div>
                          )}
                        </Link>
                      ) : (
                        <div className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-[#1D1C1A] border border-[#2A2926] flex items-center justify-center shrink-0">
                          {stillUrl ? (
                            <img
                              src={stillUrl}
                              alt={ep.name || `Episode ${ep.episode_number}`}
                              loading="lazy"
                              className="w-full h-full object-cover opacity-80"
                            />
                          ) : (
                            <Tv className="w-7 h-7 text-[#AAA49A]/40" />
                          )}
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <h4 className="text-sm sm:text-base font-semibold text-[#F3EEE4]">
                              <span className="text-[#F2B84B] mr-2">E{ep.episode_number}</span>
                              {ep.name || `Episode ${ep.episode_number}`}
                            </h4>

                            {isWatched ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Watched</span>
                              </span>
                            ) : isInProgress ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E58B43]/15 text-[#E58B43] border border-[#E58B43]/30">
                                In Progress &bull; {progressPercent}%
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#1D1C1A] text-[#AAA49A]/80 border border-[#2A2926]">
                                Not Watched
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#AAA49A]">
                            {ep.runtime && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {ep.runtime}m
                              </span>
                            )}
                            {ep.air_date && <span>{ep.air_date}</span>}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-[#AAA49A] leading-relaxed line-clamp-3">
                          {ep.overview || 'No episode description available.'}
                        </p>
                        <div className="pt-1">
                          {isEpisodePlayable ? (
                            <Link
                              to={watchRoute}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-sm transition-all active:scale-95"
                              aria-label={`${isInProgress ? 'Resume' : 'Watch'} ${show.title} Season ${selectedSeasonNumber} Episode ${ep.episode_number}`}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>
                                {isInProgress
                                  ? 'Resume Episode'
                                  : isWatched
                                  ? 'Watch Again'
                                  : 'Watch Episode'}
                              </span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled
                              aria-disabled="true"
                              title="No authorized video source is currently registered for this episode."
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#AAA49A] bg-[#1D1C1A] border border-[#2A2926] cursor-not-allowed opacity-75"
                            >
                              <VideoOff className="w-3.5 h-3.5" />
                              <span>Stream Unavailable</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#AAA49A] py-6 text-center">
                No episodes available for this season yet.
              </p>
            )}
          </div>
        )}
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
