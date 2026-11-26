import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredWatchHistory, setStoredWatchHistory } from '../utils/localStorage';

const EVENT_NAME = 'movora:watch-history-update';
const COMPLETION_THRESHOLD = 90;

const WatchHistoryContext = createContext(null);

/**
 * Generate a stable unique ID for a movie or TV episode history record.
 */
export function getHistoryId(mediaType, id, seasonNumber = null, episodeNumber = null) {
  if (id === undefined || id === null) return '';
  if (String(mediaType).toLowerCase() === 'tv') {
    return `tv-${String(id)}-s${Number(seasonNumber)}-e${Number(episodeNumber)}`;
  }
  return `movie-${String(id)}`;
}

function readStoredHistory() {
  const raw = getStoredWatchHistory();
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        typeof item.historyId === 'string' &&
        item.historyId.trim() !== '' &&
        (item.mediaType === 'movie' || item.mediaType === 'tv')
    )
    .sort((a, b) => (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0));
}

function persistHistoryList(items) {
  setStoredWatchHistory(items);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
  }
}

export function WatchHistoryProvider({ children }) {
  const [history, setHistory] = useState(readStoredHistory);

  useEffect(() => {
    function handleSync() {
      setHistory(readStoredHistory());
    }
    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const addToHistory = useCallback((item) => {
    if (!item || !item.historyId) return;

    const rawDuration = Number(item.duration);
    const hasDuration = Number.isFinite(rawDuration) && rawDuration > 0;
    const rawCurrentTime = Number(item.currentTime);
    const safeCurrentTime = hasDuration
      ? Math.min(Math.max(0, Number.isFinite(rawCurrentTime) ? rawCurrentTime : 0), rawDuration)
      : Math.max(0, Number.isFinite(rawCurrentTime) ? rawCurrentTime : 0);

    const watchedPercent = hasDuration
      ? Math.min(100, Math.round((safeCurrentTime / rawDuration) * 100))
      : Number.isFinite(Number(item.watchedPercent))
      ? Math.min(100, Math.max(0, Number(item.watchedPercent)))
      : 0;

    const now = Date.now();

    setHistory((prev) => {
      const existing = prev.find((entry) => entry.historyId === item.historyId);

      const record = {
        historyId: item.historyId,
        mediaType: item.mediaType === 'tv' ? 'tv' : 'movie',
        tmdbId: item.tmdbId ?? existing?.tmdbId ?? item.historyId,
        title: item.title || existing?.title || 'Untitled',
        poster: item.poster || existing?.poster || null,
        backdrop: item.backdrop || existing?.backdrop || null,
        watchedAt: existing?.watchedAt || now,
        lastWatchedAt: now,
        currentTime: safeCurrentTime,
        duration: hasDuration ? rawDuration : existing?.duration || 0,
        watchedPercent,
        isCompleted: Boolean(item.isCompleted) || watchedPercent >= COMPLETION_THRESHOLD,
        resumeRoute: item.resumeRoute || existing?.resumeRoute || '',
        seasonNumber:
          item.mediaType === 'tv'
            ? Number(item.seasonNumber ?? existing?.seasonNumber ?? 1)
            : null,
        episodeNumber:
          item.mediaType === 'tv'
            ? Number(item.episodeNumber ?? existing?.episodeNumber ?? 1)
            : null,
        episodeName:
          item.mediaType === 'tv'
            ? item.episodeName || existing?.episodeName || ''
            : '',
      };

      const others = prev.filter((entry) => entry.historyId !== item.historyId);
      const next = [record, ...others].sort(
        (a, b) => (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0)
      );
      persistHistoryList(next);
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((historyId) => {
    if (!historyId) return;
    setHistory((prev) => {
      const next = prev.filter((item) => item.historyId !== historyId);
      persistHistoryList(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    persistHistoryList([]);
  }, []);

  const getHistory = useCallback(() => {
    return readStoredHistory();
  }, []);

  const getFilteredHistory = useCallback(
    (filter = 'all') => {
      if (filter === 'movie') {
        return history.filter((item) => item.mediaType === 'movie');
      }
      if (filter === 'tv') {
        return history.filter((item) => item.mediaType === 'tv');
      }
      return history;
    },
    [history]
  );

  return (
    <WatchHistoryContext.Provider
      value={{
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        getHistory,
        getFilteredHistory,
      }}
    >
      {children}
    </WatchHistoryContext.Provider>
  );
}

export function useWatchHistory() {
  const context = useContext(WatchHistoryContext);
  if (!context) {
    throw new Error('useWatchHistory must be used within a WatchHistoryProvider');
  }
  return context;
}
