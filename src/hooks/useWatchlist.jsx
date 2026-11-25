import { useWatchlistContext } from '../context/WatchlistContext';

/**
 * Hook to access the single global Watchlist state.
 * Wraps useWatchlistContext for backwards-compatibility across the app.
 */
export function useWatchlist() {
  return useWatchlistContext();
}

export default useWatchlist;
