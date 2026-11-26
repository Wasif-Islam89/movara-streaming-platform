import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Tv,
  AlertCircle,
  RotateCcw,
  VideoOff,
} from 'lucide-react';
import movoraLogo from '../assets/logo/MOVORA Logo.png';
import VideoPlayer from '../components/VideoPlayer';
import Loader from '../components/Loader';
import { getTmdbImageUrl, isApiConfigured } from '../services/api';
import {
  getTVShowById,
  fetchTVShowDetails,
  fetchTVSeasonDetails,
} from '../services/tvService';
import { getTVEpisodePlaybackSource } from '../services/playbackSourceService';
import { getProgressId, useWatchProgress } from '../context/WatchProgressContext';
import { getHistoryId, useWatchHistory } from '../context/WatchHistoryContext';
import {
  getStoredPlayerSettings,
  setStoredPlayerSettings,
} from '../utils/localStorage';
import { useProfile } from '../context/ProfileContext';

function episodeStillOrBackdrop(episode, show) {
  if (episode?.still_path) {
    return getTmdbImageUrl(episode.still_path, 'w1280');
  }
  return show?.backdropUrl || show?.posterUrl || null;
}

export default function WatchTVEpisode() {
  const { id, seasonNumber, episodeNumber } = useParams();
  const navigate = useNavigate();
  const { getProgress, saveProgress, markCompleted } = useWatchProgress();
  const { addToHistory } = useWatchHistory();
  const { activeProfileId } = useProfile();

  const parsedSeason = Number(seasonNumber);
  const parsedEpisode = Number(episodeNumber);
  const isValidParams =
    Number.isInteger(parsedSeason) &&
    parsedSeason >= 0 &&
    Number.isInteger(parsedEpisode) &&
    parsedEpisode >= 1;

  const [show, setShow] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [prevTarget, setPrevTarget] = useState(null);
  const [nextTarget, setNextTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumeTime, setResumeTime] = useState(0);
  const [autoNextEnabled, setAutoNextEnabled] = useState(
    () => getStoredPlayerSettings(activeProfileId).autoNextEpisode
  );
  const hasAutoNavigatedRef = useRef(false);

  useEffect(() => {
    setAutoNextEnabled(getStoredPlayerSettings(activeProfileId).autoNextEpisode);
  }, [activeProfileId]);

  const loadEpisodeData = useCallback(
    async (signal) => {
      setIsLoading(true);
      setError(null);
      setPrevTarget(null);
      setNextTarget(null);

      if (!isValidParams) {
        setShow(null);
        setEpisode(null);
        setIsLoading(false);
        return;
      }

      const localMatch = getTVShowById(id);
      const isNumericId = !isNaN(Number(id));

      if (!isApiConfigured() || !isNumericId) {
        setShow(localMatch || null);
        setEpisode(null);
        setIsLoading(false);
        return;
      }

      try {
        const [showData, seasonData] = await Promise.all([
          fetchTVShowDetails(id, { signal }),
          fetchTVSeasonDetails(id, parsedSeason, { signal }),
        ]);

        if (signal?.aborted) return;

        if (!showData || !seasonData) {
          setShow(showData || null);
          setEpisode(null);
          setIsLoading(false);
          return;
        }

        const episodes = Array.isArray(seasonData.episodes)
          ? [...seasonData.episodes].sort((a, b) => a.episode_number - b.episode_number)
          : [];

        const currentIndex = episodes.findIndex(
          (ep) => ep.episode_number === parsedEpisode
        );

        if (currentIndex === -1) {
          setShow(showData);
          setEpisode(null);
          setIsLoading(false);
          return;
        }

        const currentEp = episodes[currentIndex];
        setShow(showData);
        setEpisode(currentEp);

        // Determine Previous & Next episode targets (including valid adjacent regular seasons)
        let resolvedPrev =
          currentIndex > 0
            ? {
                seasonNumber: parsedSeason,
                episodeNumber: episodes[currentIndex - 1].episode_number,
                label: `S${parsedSeason} E${episodes[currentIndex - 1].episode_number}`,
              }
            : null;

        let resolvedNext =
          currentIndex < episodes.length - 1
            ? {
                seasonNumber: parsedSeason,
                episodeNumber: episodes[currentIndex + 1].episode_number,
                label: `S${parsedSeason} E${episodes[currentIndex + 1].episode_number}`,
                title:
                  episodes[currentIndex + 1].name ||
                  `Episode ${episodes[currentIndex + 1].episode_number}`,
              }
            : null;

        const regularSeasons = Array.isArray(showData.seasonsList)
          ? showData.seasonsList
              .filter((s) => s.season_number >= 1)
              .sort((a, b) => a.season_number - b.season_number)
          : [];
        const seasonIdx = regularSeasons.findIndex(
          (s) => s.season_number === parsedSeason
        );

        // Cross-season boundary checks only when needed
        if (!resolvedPrev && seasonIdx > 0) {
          try {
            const prevSeasonNum = regularSeasons[seasonIdx - 1].season_number;
            const prevSeasonData = await fetchTVSeasonDetails(id, prevSeasonNum, { signal });
            if (!signal?.aborted && Array.isArray(prevSeasonData?.episodes) && prevSeasonData.episodes.length > 0) {
              const prevEps = [...prevSeasonData.episodes].sort(
                (a, b) => a.episode_number - b.episode_number
              );
              const lastEp = prevEps[prevEps.length - 1];
              resolvedPrev = {
                seasonNumber: prevSeasonNum,
                episodeNumber: lastEp.episode_number,
                label: `S${prevSeasonNum} E${lastEp.episode_number}`,
              };
            }
          } catch {
            // Keep null if previous season cannot be fetched
          }
        }

        if (!resolvedNext && seasonIdx !== -1 && seasonIdx < regularSeasons.length - 1) {
          try {
            const nextSeasonNum = regularSeasons[seasonIdx + 1].season_number;
            const nextSeasonData = await fetchTVSeasonDetails(id, nextSeasonNum, { signal });
            if (!signal?.aborted && Array.isArray(nextSeasonData?.episodes) && nextSeasonData.episodes.length > 0) {
              const nextEps = [...nextSeasonData.episodes].sort(
                (a, b) => a.episode_number - b.episode_number
              );
              const firstEp = nextEps[0];
              resolvedNext = {
                seasonNumber: nextSeasonNum,
                episodeNumber: firstEp.episode_number,
                label: `S${nextSeasonNum} E${firstEp.episode_number}`,
                title: firstEp.name || `Episode ${firstEp.episode_number}`,
              };
            }
          } catch {
            // Keep null if next season cannot be fetched
          }
        }

        if (!signal?.aborted) {
          setPrevTarget(resolvedPrev);
          setNextTarget(resolvedNext);
          setIsLoading(false);
        }
      } catch (err) {
        if (err?.name === 'AbortError' || signal?.aborted) return;

        if (err?.status === 404) {
          setShow(null);
          setEpisode(null);
          setIsLoading(false);
          return;
        }

        setError('Unable to load episode details right now. Please try again.');
        setIsLoading(false);
      }
    },
    [id, isValidParams, parsedSeason, parsedEpisode]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const controller = new AbortController();
    loadEpisodeData(controller.signal);
    return () => controller.abort();
  }, [loadEpisodeData]);

  useEffect(() => {
    if (show?.title && episode) {
      document.title = `${show.title} S${parsedSeason}E${parsedEpisode} | MOVORA`;
    } else {
      document.title = 'Watch Episode | MOVORA';
    }
  }, [show?.title, episode, parsedSeason, parsedEpisode]);

  const progressId =
    show && episode
      ? getProgressId('tv', show.id, parsedSeason, parsedEpisode)
      : '';
  const historyId =
    show && episode
      ? getHistoryId('tv', show.id, parsedSeason, parsedEpisode)
      : '';
  const sourceResolution = useMemo(
    () =>
      show && episode
        ? getTVEpisodePlaybackSource(show.id, parsedSeason, parsedEpisode)
        : null,
    [show, episode, parsedSeason, parsedEpisode]
  );

  useEffect(() => {
    hasAutoNavigatedRef.current = false;
    if (!progressId) {
      setResumeTime(0);
      return;
    }
    const saved = getProgress(progressId);
    setResumeTime(saved?.currentTime || 0);
    // Capture initial saved timestamp only when episode route identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressId]);

  const handleAutoNextChange = useCallback(
    (nextValue) => {
      setAutoNextEnabled(nextValue);
      setStoredPlayerSettings({ autoNextEpisode: nextValue }, activeProfileId);
    },
    [activeProfileId]
  );

  const recordEpisodeHistory = useCallback(
    (currentTime, duration, isCompleted = false) => {
      if (!show || !episode || !historyId) return;
      addToHistory({
        historyId,
        mediaType: 'tv',
        tmdbId: show.id,
        title: show.title,
        poster: show.posterUrl || show.poster_path || null,
        backdrop: episodeStillOrBackdrop(episode, show),
        seasonNumber: parsedSeason,
        episodeNumber: parsedEpisode,
        episodeName: episode.name || `Episode ${parsedEpisode}`,
        currentTime,
        duration,
        isCompleted,
        resumeRoute: `/watch/tv/${show.id}/season/${parsedSeason}/episode/${parsedEpisode}`,
      });
    },
    [show, episode, historyId, parsedSeason, parsedEpisode, addToHistory]
  );

  const handlePlayStart = useCallback(
    ({ currentTime, duration }) => {
      recordEpisodeHistory(currentTime, duration, false);
    },
    [recordEpisodeHistory]
  );

  const handleProgress = useCallback(
    ({ currentTime, duration }) => {
      if (!show || !episode || !progressId) return;
      saveProgress({
        id: progressId,
        mediaType: 'tv',
        tmdbId: show.id,
        title: show.title,
        posterPath: show.posterUrl || show.poster_path || null,
        backdropPath: episodeStillOrBackdrop(episode, show),
        seasonNumber: parsedSeason,
        episodeNumber: parsedEpisode,
        episodeTitle: episode.name || `Episode ${parsedEpisode}`,
        currentTime,
        duration,
        resumeRoute: `/watch/tv/${show.id}/season/${parsedSeason}/episode/${parsedEpisode}`,
      });
      recordEpisodeHistory(currentTime, duration, false);
    },
    [show, episode, progressId, parsedSeason, parsedEpisode, saveProgress, recordEpisodeHistory]
  );

  const handlePlayNextEpisode = useCallback(() => {
    if (!nextTarget || !show?.id || hasAutoNavigatedRef.current) return;
    hasAutoNavigatedRef.current = true;
    navigate(
      `/watch/tv/${show.id}/season/${nextTarget.seasonNumber}/episode/${nextTarget.episodeNumber}`
    );
  }, [nextTarget, show?.id, navigate]);

  const handleComplete = useCallback(
    ({ currentTime, duration }) => {
      if (!progressId) return;
      markCompleted(progressId);
      recordEpisodeHistory(currentTime, duration, true);
    },
    [progressId, markCompleted, recordEpisodeHistory]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F3EEE4] flex items-center justify-center">
        <Loader fullScreen message="Preparing MOVORA Episode Player..." />
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
              onClick={() => loadEpisodeData()}
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

  if (!show || !episode) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F3EEE4] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#F2B84B]/10 border border-[#F2B84B]/30 flex items-center justify-center mx-auto text-[#F2B84B]">
            <Tv className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#F3EEE4]">Episode Not Found</h1>
          <p className="text-sm text-[#AAA49A]">
            We could not find Season {seasonNumber} Episode {episodeNumber} for this series.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {show ? (
              <Link
                to={`/tv/${show.id}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F2B84B] text-[#121212] font-semibold text-sm hover:bg-[#E58B43] transition-colors"
              >
                Back to Show
              </Link>
            ) : (
              <Link
                to="/tv-shows"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F2B84B] text-[#121212] font-semibold text-sm hover:bg-[#E58B43] transition-colors"
              >
                Browse TV Shows
              </Link>
            )}
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

  const episodePoster = episodeStillOrBackdrop(episode, show);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] flex flex-col">
      {/* Top Cinema Player Bar */}
      <header className="border-b border-[#1D1C1A] bg-[#121212]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/tv/${show.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2926] bg-[#1D1C1A] text-xs sm:text-sm text-[#AAA49A] hover:text-[#F2B84B] hover:border-[#F2B84B]/40 transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Show</span>
            </Link>

            <span className="hidden sm:inline text-[#2A2926]">|</span>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/30 shrink-0">
                S{parsedSeason} E{parsedEpisode}
              </span>
              <h1 className="text-sm sm:text-base font-bold text-[#F3EEE4] truncate">
                {show.title}
              </h1>
            </div>
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

      {/* Main Episode Player Stage or Unavailable State */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
        {sourceResolution?.available && sourceResolution.primarySource ? (
          <VideoPlayer
            key={progressId || `${show.id}-${parsedSeason}-${parsedEpisode}`}
            src={sourceResolution.primarySource.url}
            sources={sourceResolution.sources}
            subtitles={sourceResolution.primarySource.subtitles || []}
            introWindow={sourceResolution.primarySource.introWindow || null}
            recapWindow={sourceResolution.primarySource.recapWindow || null}
            creditsStart={sourceResolution.primarySource.creditsStart ?? null}
            poster={episodePoster}
            title={`${show.title} - S${parsedSeason}E${parsedEpisode} ${episode.name || ''}`}
            initialTime={resumeTime}
            onPlayStart={handlePlayStart}
            onProgress={handleProgress}
            onComplete={handleComplete}
            showAutoNextOption
            autoNextEnabled={autoNextEnabled}
            onAutoNextChange={handleAutoNextChange}
            nextEpisode={nextTarget}
            onPlayNext={handlePlayNextEpisode}
            backTo={`/tv/${show.id}`}
            backLabel="Back to Show"
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
                  'A playable stream is not currently available for this episode.'}
              </p>
            </div>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={`/tv/${show.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Show</span>
              </Link>
              <Link
                to="/tv-shows"
                className="px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm bg-[#121212] border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/40 transition-colors"
              >
                Browse TV Shows
              </Link>
            </div>
          </div>
        )}

        {/* Previous / Next Episode Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {prevTarget ? (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/watch/tv/${show.id}/season/${prevTarget.seasonNumber}/episode/${prevTarget.episodeNumber}`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#1D1C1A] border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/50 hover:text-[#F2B84B] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Episode ({prevTarget.label})</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#1D1C1A]/50 border border-[#2A2926]/50 text-[#AAA49A]/40 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Episode</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => handleAutoNextChange(!autoNextEnabled)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                autoNextEnabled
                  ? 'bg-[#F2B84B]/15 border-[#F2B84B]/40 text-[#F2B84B]'
                  : 'bg-[#1D1C1A] border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4]'
              }`}
              title="Toggle Auto Next Episode"
            >
              Auto Next: {autoNextEnabled ? 'On' : 'Off'}
            </button>

            {nextTarget ? (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/watch/tv/${show.id}/season/${nextTarget.seasonNumber}/episode/${nextTarget.episodeNumber}`
                  )
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-md shadow-[#F2B84B]/15 transition-all cursor-pointer"
              >
                <span>Next Episode ({nextTarget.label})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <span
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-[#1D1C1A]/50 border border-[#2A2926]/50 text-[#AAA49A]/60"
                aria-disabled="true"
              >
                <span>End of Series</span>
              </span>
            )}
          </div>
        </div>

        {/* Episode Details & Demo Notice */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#F2B84B]">
                {show.title} &bull; Season {parsedSeason}, Episode {parsedEpisode}
              </p>
              <h2 className="text-lg sm:text-2xl font-bold text-[#F3EEE4] mt-0.5">
                {episode.name || `Episode ${parsedEpisode}`}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#AAA49A]">
              {episode.air_date && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#121212] border border-[#2A2926]">
                  <Calendar className="w-3 h-3" />
                  {episode.air_date}
                </span>
              )}
              {episode.runtime && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#121212] border border-[#2A2926]">
                  <Clock className="w-3 h-3" />
                  {episode.runtime}m
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#AAA49A] leading-relaxed">
            {episode.overview || 'No episode description available.'}
          </p>

          <p className="pt-2 border-t border-[#2A2926]/70 text-[11px] text-[#AAA49A]/80">
            {sourceResolution?.available
              ? `Active Source: ${sourceResolution.primarySource.label}.`
              : 'TMDB provides episode metadata only. Full episode playback requires a registered licensed stream in playbackSourceService.'}
          </p>
        </div>
      </main>
    </div>
  );
}
