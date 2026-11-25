import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getStoredWatchlist as fetchStoredWatchlist, 
  setStoredWatchlist as saveStoredWatchlist,
  addStoredNotification
} from '../utils/localStorage';

const EVENT_NAME = 'movora:watchlist-update';

const WatchlistContext = createContext(null);

export function getWatchlistKey(id, mediaType = 'movie') {
  if (id === undefined || id === null) return '';
  const cleanType = String(mediaType || 'movie').toLowerCase();
  return `${cleanType}-${String(id)}`;
}

function getStoredWatchlist() {
  const items = fetchStoredWatchlist();
  return items.filter((item) => item && item.id !== undefined && item.id !== null);
}

function persistWatchlist(items) {
  saveStoredWatchlist(items);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
  }
}

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(getStoredWatchlist);

  useEffect(() => {
    function handleUpdate() {
      setWatchlist(getStoredWatchlist());
    }

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

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
      persistWatchlist(nextList);

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
  }, []);

  const removeFromWatchlist = useCallback((id, mediaType = 'movie') => {
    if (id === undefined || id === null) return;
    const targetKey = getWatchlistKey(id, mediaType);

    setWatchlist((prev) => {
      const nextList = prev.filter(
        (item) => getWatchlistKey(item.id, item.mediaType) !== targetKey
      );
      persistWatchlist(nextList);
      return nextList;
    });
  }, []);

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
    persistWatchlist([]);
  }, []);

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
