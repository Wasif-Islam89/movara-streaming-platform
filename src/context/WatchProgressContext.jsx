import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredContinueWatching, setStoredContinueWatching } from '../utils/localStorage';

const EVENT_NAME = 'movora:continue-watching-update';
const COMPLETION_THRESHOLD = 90;

const WatchProgressContext = createContext(null);

/**
 * Generate a stable unique ID for a movie or TV episode progress record.
 */
export function getProgressId(mediaType, id, seasonNumber = null, episodeNumber = null) {
  if (id === undefined || id === null) return '';
  if (String(mediaType).toLowerCase() === 'tv') {
    return `tv-${String(id)}-s${Number(seasonNumber)}-e${Number(episodeNumber)}`;
  }
  return `movie-${String(id)}`;
}

function readStoredProgress() {
  const raw = getStoredContinueWatching();
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.id === 'string' &&
        item.id.trim() !== '' &&
        typeof item.resumeRoute === 'string' &&
        Number.isFinite(item.currentTime) &&
        item.currentTime > 0 &&
        Number.isFinite(item.duration) &&
        item.duration > 0 &&
        Number.isFinite(item.watchedPercent) &&
        item.watchedPercent < COMPLETION_THRESHOLD
    )
    .sort((a, b) => (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0));
}

function persistProgressList(items) {
  setStoredContinueWatching(items);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
  }
}

export function WatchProgressProvider({ children }) {
  const [continueWatching, setContinueWatching] = useState(readStoredProgress);

  useEffect(() => {
    function handleSync() {
      setContinueWatching(readStoredProgress());
    }
    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const getProgress = useCallback(
    (progressId) => {
      if (!progressId) return null;
      return continueWatching.find((item) => item.id === progressId) || null;
    },
    [continueWatching]
  );

  const removeProgress = useCallback((progressId) => {
    if (!progressId) return;
    setContinueWatching((prev) => {
      const next = prev.filter((item) => item.id !== progressId);
      persistProgressList(next);
      return next;
    });
  }, []);

  const saveProgress = useCallback((payload) => {
    if (!payload || !payload.id || !payload.resumeRoute) return;

    const rawDuration = Number(payload.duration);
    const rawCurrentTime = Number(payload.currentTime);
    if (!Number.isFinite(rawDuration) || rawDuration <= 0) return;

    const clampedTime = Math.min(Math.max(0, Number.isFinite(rawCurrentTime) ? rawCurrentTime : 0), rawDuration);
    const watchedPercent = Math.min(100, Math.round((clampedTime / rawDuration) * 100));
    const isCompleted = Boolean(payload.ended) || watchedPercent >= COMPLETION_THRESHOLD;

    setContinueWatching((prev) => {
      const filtered = prev.filter((item) => item.id !== payload.id);

      if (isCompleted) {
        if (filtered.length !== prev.length) {
          persistProgressList(filtered);
        }
        return filtered;
      }

      if (clampedTime <= 0) {
        return prev;
      }

      const record = {
        id: payload.id,
        mediaType: payload.mediaType === 'tv' ? 'tv' : 'movie',
        tmdbId: payload.tmdbId ?? payload.id,
        title: payload.title || 'Untitled',
        posterPath: payload.posterPath || null,
        backdropPath: payload.backdropPath || null,
        seasonNumber: payload.mediaType === 'tv' ? Number(payload.seasonNumber) : null,
        episodeNumber: payload.mediaType === 'tv' ? Number(payload.episodeNumber) : null,
        episodeTitle: payload.mediaType === 'tv' ? payload.episodeTitle || '' : '',
        currentTime: clampedTime,
        duration: rawDuration,
        watchedPercent,
        lastWatchedAt: Date.now(),
        resumeRoute: payload.resumeRoute,
      };

      const next = [record, ...filtered].sort(
        (a, b) => (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0)
      );
      persistProgressList(next);
      return next;
    });
  }, []);

  const markCompleted = useCallback(
    (progressId) => {
      removeProgress(progressId);
    },
    [removeProgress]
  );

  return (
    <WatchProgressContext.Provider
      value={{
        continueWatching,
        getProgress,
        saveProgress,
        removeProgress,
        markCompleted,
      }}
    >
      {children}
    </WatchProgressContext.Provider>
  );
}

export function useWatchProgress() {
  const context = useContext(WatchProgressContext);
  if (!context) {
    throw new Error('useWatchProgress must be used within a WatchProgressProvider');
  }
  return context;
}
