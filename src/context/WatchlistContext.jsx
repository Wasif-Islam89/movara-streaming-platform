import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredWatchlist as fetchStoredWatchlist,
  setStoredWatchlist as saveStoredWatchlist,
  addStoredNotification,
} from '../utils/localStorage';
import { useProfile } from './ProfileContext';

const EVENT_NAME = 'movora:watchlist-update';

const WatchlistContext = createContext(null);

export function getWatchlistKey(id, mediaType = 'movie') {
  if (id === undefined || id === null) return '';
  const cleanType = String(mediaType || 'movie').toLowerCase();
  return `${cleanType}-${String(id)}`;
}

function getStoredWatchlist(profileId) {
  const items = fetchStoredWatchlist(profileId);
  return items.filter((item) => item && item.id !== undefined && item.id !== null);
}

function persistWatchlist(items, profileId) {
  saveStoredWatchlist(items, profileId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { items, profileId } }));
  }
}

export function WatchlistProvider({ children }) {
  const { activeProfileId } = useProfile();
  const [watchlist, setWatchlist] = useState(() => getStoredWatchlist(activeProfileId));

  useEffect(() => {
    setWatchlist(getStoredWatchlist(activeProfileId));

    function handleUpdate() {
      setWatchlist(getStoredWatchlist(activeProfileId));
    }

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [activeProfileId]);

  const isInWatchlist = useCallback(
    (id, mediaType = 'movie') => {
      if (id === undefined || id === null) return false;
      const targetKey = getWatchlistKey(id, mediaType);
      return watchlist.some((item) => getWatchlistKey(item.id, item.mediaType) === targetKey);
    },
    [watchlist]
  );

  const addToWatchlist = useCallback((item) => {
    if (!item || item.id === undefined || item.id === null) return;
    const mediaType = item.mediaType || 'movie';
    const targetKey = getWatchlistKey(item.id, mediaType);

    setWatchlist((prev) => {
      if (prev.some((existing) => getWatchlistKey(existing.id, existing.mediaType) === targetKey)) {
        return prev;
      }

      const sanitizedItem = {
        id: item.id,
        title: item.title || item.name || 'Untitled',
        posterUrl: item.posterUrl || item.poster || null,
        year: item.year ? String(item.year).slice(0, 4) : null,
        rating: item.rating ? String(item.rating) : null,
        mediaType: mediaType,
      };

      const nextList = [sanitizedItem, ...prev];
      persistWatchlist(nextList, activeProfileId);

      // Trigger automatic streaming notification
      addStoredNotification({
        title: 'Added to My List',
        message: `"${sanitizedItem.title}" has been saved to your personal Watchlist.`,
        type: 'watchlist',
        link: mediaType === 'tv' ? `/tv/${sanitizedItem.id}` : `/movie/${sanitizedItem.id}`,
        image: sanitizedItem.posterUrl,
      });

      return nextList;
    });
  }, [activeProfileId]);

  const removeFromWatchlist = useCallback((id, mediaType = 'movie') => {
    if (id === undefined || id === null) return;
    const targetKey = getWatchlistKey(id, mediaType);

    setWatchlist((prev) => {
      const nextList = prev.filter(
        (item) => getWatchlistKey(item.id, item.mediaType) !== targetKey
      );
      persistWatchlist(nextList, activeProfileId);
      return nextList;
    });
  }, [activeProfileId]);

  const toggleWatchlist = useCallback(
    (item) => {
      if (!item || item.id === undefined || item.id === null) return;
      const mediaType = item.mediaType || 'movie';

      if (isInWatchlist(item.id, mediaType)) {
        removeFromWatchlist(item.id, mediaType);
      } else {
        addToWatchlist(item);
      }
    },
    [isInWatchlist, removeFromWatchlist, addToWatchlist]
  );

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    persistWatchlist([], activeProfileId);
  }, [activeProfileId]);

  const value = {
    watchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    clearWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlistContext() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlistContext must be used within a WatchlistProvider');
  }
  return context;
}
