import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Film,
  Tv,
  Trash2,
  Play,
  CheckCircle2,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useWatchHistory } from '../context/WatchHistoryContext';
import { formatDate } from '../utils/formatDate';

function formatWatchedTimestamp(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const datePart = formatDate(date, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
    return `${datePart} • ${timePart}`;
  } catch {
    return '';
  }
}

export default function WatchHistory() {
  const { history, removeFromHistory, clearHistory, getFilteredHistory } = useWatchHistory();
  const [filter, setFilter] = useState('all'); // 'all' | 'movie' | 'tv'
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    document.title = 'Watch History | MOVORA';
  }, []);

  useEffect(() => {
    if (!isClearModalOpen) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsClearModalOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClearModalOpen]);

  const movieItems = getFilteredHistory('movie');
  const tvItems = getFilteredHistory('tv');
  const filteredItems = getFilteredHistory(filter);

  const handleConfirmClear = () => {
    clearHistory();
    setIsClearModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1D1C1A]">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3EEE4] tracking-tight">
                Watch History
              </h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1D1C1A] border border-[#2A2926] text-[#F2B84B]">
                {history.length} {history.length === 1 ? 'Title' : 'Titles'}
              </span>
            </div>
            <p className="mt-2 text-sm sm:text-base text-[#AAA49A]">
              Your recently watched movies and episodes
            </p>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-[#2A2926] bg-[#1D1C1A] text-[#AAA49A] hover:text-[#E58B43] hover:border-[#E58B43]/50 transition-colors cursor-pointer"
                aria-label="Clear all watch history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Tabs */}
        {history.length > 0 && (
          <div className="pt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#F2B84B] text-[#121212] shadow-md shadow-[#F2B84B]/20'
                  : 'bg-[#1D1C1A] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/30'
              }`}
            >
              All ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('movie')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                filter === 'movie'
                  ? 'bg-[#F2B84B] text-[#121212] shadow-md shadow-[#F2B84B]/20'
                  : 'bg-[#1D1C1A] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/30'
              }`}
            >
              Movies ({movieItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('tv')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                filter === 'tv'
                  ? 'bg-[#F2B84B] text-[#121212] shadow-md shadow-[#F2B84B]/20'
                  : 'bg-[#1D1C1A] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/30'
              }`}
            >
              TV Shows ({tvItems.length})
            </button>
          </div>
        )}

        {/* History Cards Grid or Empty States */}
        {filteredItems.length > 0 ? (
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredItems.map((item) => {
              const isTv = item.mediaType === 'tv';
              const detailsRoute = isTv ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`;
              const imageSrc = item.poster || item.backdrop;
              const watchedDateStr = formatWatchedTimestamp(item.lastWatchedAt || item.watchedAt);

              return (
                <article
                  key={item.historyId}
                  className="group relative flex gap-4 p-3.5 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] hover:border-[#F2B84B]/40 transition-all duration-200 shadow-lg"
                >
                  {/* Poster Thumbnail */}
                  <Link
                    to={detailsRoute}
                    className="w-24 sm:w-28 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-[#121212] border border-[#2A2926]"
                    aria-label={`View details for ${item.title}`}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#AAA49A]/50">
                        {isTv ? <Tv className="w-7 h-7" /> : <Film className="w-7 h-7" />}
                      </div>
                    )}
                  </Link>

                  {/* Info & Actions */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#121212] border border-[#2A2926] text-[#F2B84B]">
                          {isTv
                            ? `S${item.seasonNumber} E${item.episodeNumber}`
                            : 'Movie'}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromHistory(item.historyId)}
                          aria-label={`Remove ${item.title} from watch history`}
                          title="Remove from Watch History"
                          className="p-1 rounded-lg text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#121212] transition-colors cursor-pointer shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <Link
                        to={detailsRoute}
                        className="block text-sm sm:text-base font-bold text-[#F3EEE4] hover:text-[#F2B84B] transition-colors line-clamp-1"
                        title={item.title}
                      >
                        {item.title}
                      </Link>

                      {isTv && item.episodeName && (
                        <p className="text-xs text-[#AAA49A] line-clamp-1" title={item.episodeName}>
                          {item.episodeName}
                        </p>
                      )}

                      {watchedDateStr && (
                        <p className="text-[11px] text-[#AAA49A]/80 flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{watchedDateStr}</span>
                        </p>
                      )}
                    </div>

                    {/* Progress / Completion Footer */}
                    <div className="pt-3 space-y-2">
                      {item.isCompleted ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Watched</span>
                          </span>
                          <span className="text-[11px] text-[#AAA49A]">
                            {item.watchedPercent || 100}%
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="w-full h-1.5 rounded-full bg-[#2A2926] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#F2B84B] to-[#E58B43]"
                              style={{
                                width: `${Math.min(Math.max(item.watchedPercent || 2, 2), 100)}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] text-[#AAA49A]">
                              {item.watchedPercent || 0}% watched
                            </span>
                            {item.resumeRoute && (
                              <Link
                                to={item.resumeRoute}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:opacity-95 transition-opacity"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Resume</span>
                              </Link>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty States */
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-3xl bg-[#1D1C1A] border border-[#2A2926] flex items-center justify-center text-[#AAA49A] mb-5 shadow-xl">
              <History className="w-10 h-10 opacity-40 text-[#F2B84B]" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4]">
              {filter === 'all'
                ? 'Your Watch History is Empty'
                : filter === 'movie'
                ? 'No Movies in Watch History'
                : 'No TV Shows in Watch History'}
            </h2>

            <p className="mt-2 text-sm sm:text-base text-[#AAA49A] max-w-md leading-relaxed">
              {filter === 'all'
                ? 'Movies and TV episodes you play in MOVORA will appear here so you can track what you have watched.'
                : filter === 'movie'
                ? 'You have not played any movies yet. Start watching a film to see it here.'
                : 'You have not played any TV episodes yet. Start watching a series to see it here.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/movies"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#f5c366] hover:to-[#eb9955] transition-all duration-200 shadow-md shadow-[#F2B84B]/10 active:scale-95"
              >
                <Film className="w-4 h-4" />
                <span>Explore Movies</span>
              </Link>
              <Link
                to="/tv-shows"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-[#F3EEE4] bg-[#1D1C1A] hover:bg-[#252422] border border-[#2A2926] hover:border-[#F2B84B]/40 transition-all duration-200 active:scale-95"
              >
                <Tv className="w-4 h-4 text-[#F2B84B]" />
                <span>Explore TV Shows</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {isClearModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Clear Watch History Confirmation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsClearModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 max-w-md w-full rounded-2xl bg-[#1D1C1A] border border-[#2A2926] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E58B43]/15 border border-[#E58B43]/30 flex items-center justify-center text-[#E58B43] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#F3EEE4]">
                Clear Watch History?
              </h2>
            </div>

            <p className="text-sm text-[#AAA49A] leading-relaxed">
              All Watch History records will be permanently cleared from this browser. Your Continue Watching queue and My List will not be affected.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#121212] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#E58B43] text-[#121212] hover:bg-[#F2B84B] transition-colors cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
