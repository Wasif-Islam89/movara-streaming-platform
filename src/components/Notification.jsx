import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  Sparkles, 
  Film, 
  Tv, 
  Flame, 
  Bookmark,
  Compass,
  ExternalLink 
} from 'lucide-react';

import { 
  DEFAULT_NOTIFICATIONS, 
  getStoredNotifications, 
  setStoredNotifications, 
  getStoredUnreadNotificationCount 
} from '../utils/localStorage';

export const INITIAL_NOTIFICATIONS = DEFAULT_NOTIFICATIONS;

export function getStoredUnreadCount() {
  return getStoredUnreadNotificationCount();
}

export default function Notification({ isOpen, onClose, onUnreadChange }) {
  const [notifications, setNotifications] = useState(() => getStoredNotifications());
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  // Listen for real-time notification events (e.g. when an item is added to Watchlist)
  useEffect(() => {
    function handleSync() {
      const updated = getStoredNotifications();
      setNotifications(updated);
      if (onUnreadChange) {
        onUnreadChange(updated.filter((n) => n.unread).length);
      }
    }
    window.addEventListener('movora:notifications-update', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('movora:notifications-update', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [onUnreadChange]);

  // Helper to update both state and localStorage cleanly without infinite loop
  function updateNotifications(updater) {
    setNotifications((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setStoredNotifications(next);
      if (onUnreadChange) {
        onUnreadChange(next.filter((n) => n.unread).length);
      }
      return next;
    });
  }

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const displayedNotifications = activeTab === 'unread'
    ? notifications.filter((n) => n.unread)
    : notifications;

  function markAsRead(id, e) {
    if (e) e.stopPropagation();
    updateNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  }

  function markAllAsRead() {
    updateNotifications((prev) => prev.map((item) => ({ ...item, unread: false })));
  }

  function removeNotification(id, e) {
    if (e) e.stopPropagation();
    updateNotifications((prev) => prev.filter((item) => item.id !== id));
  }

  function clearAll() {
    updateNotifications([]);
  }

  function handleItemClick(notif) {
    markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      onClose();
    }
  }

  function getBadgeIcon(type) {
    switch (type) {
      case 'trending':
        return <Flame className="w-4 h-4 text-[#E58B43]" />;
      case 'release':
        return <Sparkles className="w-4 h-4 text-[#F2B84B]" />;
      case 'watchlist':
        return <Bookmark className="w-4 h-4 text-emerald-400" />;
      case 'recommendation':
        return <Compass className="w-4 h-4 text-sky-400" />;
      default:
        return <Film className="w-4 h-4 text-[#AAA49A]" />;
    }
  }

  function getBadgeLabel(type) {
    switch (type) {
      case 'trending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#E58B43] uppercase tracking-wider">
            <Flame className="w-3 h-3" /> Trending
          </span>
        );
      case 'release':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#F2B84B] uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> New Release
          </span>
        );
      case 'watchlist':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            <Bookmark className="w-3 h-3" /> My List
          </span>
        );
      case 'recommendation':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
            <Compass className="w-3 h-3" /> For You
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#AAA49A] uppercase tracking-wider">
            <Film className="w-3 h-3" /> Spotlight
          </span>
        );
    }
  }

  return (
    <div
      role="region"
      aria-label="Notifications Panel"
      className="fixed inset-x-3 top-16 mt-2 max-w-sm sm:max-w-none sm:w-96 sm:absolute sm:inset-auto sm:right-0 sm:top-auto rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl shadow-black/80 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-[#2A2926] bg-[#121212]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F3EEE4]">Notifications</h3>
            {unreadCount > 0 ? (
              <span className="text-[11px] font-semibold text-[#121212] bg-[#F2B84B] px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            ) : (
              <span className="text-[11px] text-[#AAA49A] px-2 py-0.5 rounded-full bg-[#121212] border border-[#2A2926]">
                0 New
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs text-[#AAA49A] hover:text-[#F2B84B] flex items-center gap-1 transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#121212] text-[#F2B84B] font-medium border border-[#2A2926]'
                : 'text-[#AAA49A] hover:text-[#F3EEE4]'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-[#121212] text-[#F2B84B] font-medium border border-[#2A2926]'
                : 'text-[#AAA49A] hover:text-[#F3EEE4]'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {displayedNotifications.length > 0 ? (
        <div className="divide-y divide-[#2A2926]/60 max-h-[60vh] overflow-y-auto">
          {displayedNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                item.unread ? 'bg-[#121212]/60 hover:bg-[#121212]' : 'hover:bg-[#121212]/40'
              }`}
            >
              {/* Thumbnail or Icon */}
              <div className="relative shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-11 h-16 object-cover rounded-md border border-[#2A2926] shadow-md"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#121212] border border-[#2A2926] flex items-center justify-center">
                    {getBadgeIcon(item.type)}
                  </div>
                )}
                {item.unread && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F2B84B] ring-2 ring-[#1D1C1A]" />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  {getBadgeLabel(item.type)}
                  <span className="text-[10px] text-[#AAA49A]/70 shrink-0">
                    {item.time}
                  </span>
                </div>
                <h4 className={`text-xs sm:text-sm font-semibold truncate ${
                  item.unread ? 'text-[#F3EEE4]' : 'text-[#AAA49A]'
                } group-hover:text-[#F2B84B] transition-colors`}>
                  {item.title}
                </h4>
                <p className="text-xs text-[#AAA49A] mt-1 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>
              </div>

              {/* Dismiss / Delete button */}
              <button
                type="button"
                onClick={(e) => removeNotification(item.id, e)}
                title="Dismiss"
                className="opacity-0 group-hover:opacity-100 text-[#AAA49A] hover:text-[#F3EEE4] transition-all p-1 rounded-md hover:bg-[#121212] shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#121212] border border-[#2A2926] flex items-center justify-center mb-3 text-[#AAA49A] shadow-inner">
            <Bell className="w-6 h-6 text-[#AAA49A]/60" />
          </div>
          <p className="text-sm font-semibold text-[#F3EEE4]">
            {activeTab === 'unread' ? 'No unread notifications' : 'You’re all caught up!'}
          </p>
          <p className="text-xs text-[#AAA49A] mt-1 max-w-[220px]">
            {activeTab === 'unread'
              ? 'Great! You have checked all recent alerts and releases.'
              : 'New movie releases, episodes, and updates will appear here.'}
          </p>
        </div>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2.5 border-t border-[#2A2926] bg-[#121212]/60 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] text-[#AAA49A] hover:text-[#F3EEE4] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear all</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-[#AAA49A] hover:text-[#F2B84B] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
