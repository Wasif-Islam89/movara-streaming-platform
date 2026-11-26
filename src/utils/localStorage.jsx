// Centralized LocalStorage Utility & Default Data
import POSTERS from '../assets/posters/index.jsx';

export const STORAGE_KEYS = {
  AUTH_USER: 'movora_auth_user_v1',
  REGISTERED_ACCOUNTS: 'movora_registered_accounts_v1',
  SINGLE_ACCOUNT_MIGRATION_V1: 'movora_single_account_migration_v1',
  WATCHLIST: 'movora_my_list',
  NOTIFICATIONS: 'movora_notifications_v1',
  CONTINUE_WATCHING: 'movora_continue_watching',
  WATCH_HISTORY: 'movora_watch_history',
  PLAYER_SETTINGS: 'movora_player_settings',
};

export const DEFAULT_PLAYER_SETTINGS = {
  autoNextEpisode: true,
  defaultPlaybackSpeed: 1,
  subtitlePreferences: {
    fontSize: 'medium',
    backgroundEnabled: true,
  },
};

export const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Now Streaming in 4K UHD',
    message: 'Dune: Part Two is now streaming with Dolby Vision & immersive Atmos audio.',
    time: '15m ago',
    unread: true,
    type: 'release',
    link: '/movie/dune-part-two',
    image: POSTERS['dune-2'],
  },
  {
    id: 'notif-2',
    title: 'Trending #1 Worldwide',
    message: 'Stranger Things is the most-streamed sci-fi phenomenon on MOVORA this week.',
    time: '1h ago',
    unread: true,
    type: 'trending',
    link: '/tv/stranger-things',
    image: POSTERS['stranger-things'],
  },
  {
    id: 'notif-3',
    title: 'New Blockbuster Arrival',
    message: 'The multiverse collision Deadpool & Wolverine is ready to stream in IMAX 4K.',
    time: '3h ago',
    unread: true,
    type: 'release',
    link: '/movie/deadpool-and-wolverine',
    image: POSTERS['deadpool-and-wolverine'],
  },
  {
    id: 'notif-4',
    title: 'Because You Liked Crime Dramas',
    message: 'All 5 seasons of Walter White’s legendary rise are remastered in HDR.',
    time: '1d ago',
    unread: false,
    type: 'recommendation',
    link: '/tv/breaking-bad',
    image: POSTERS['breaking-bad'],
  },
  {
    id: 'notif-5',
    title: 'Staff Pick & Top Rated',
    message: 'Relive Joel & Ellie’s harrowing post-apocalyptic journey across America.',
    time: '2d ago',
    unread: false,
    type: 'content',
    link: '/tv/the-last-of-us',
    image: POSTERS['the-last-of-us'],
  },
  {
    id: 'notif-6',
    title: 'Special Behind-The-Scenes',
    message: 'Christopher Nolan’s 7-time Academy Award winner with exclusive extras.',
    time: '3d ago',
    unread: false,
    type: 'content',
    link: '/movie/oppenheimer',
    image: POSTERS['oppenheimer'],
  },
];

// Safe core helpers
export function getStorageItem(key, fallback = null) {
  try {
    let raw = localStorage.getItem(key);
    // Backward compatibility for previously saved 'movara_' keys
    if (raw === null && typeof key === 'string' && key.startsWith('movora_')) {
      const legacyKey = key.replace('movora_', 'movara_');
      raw = localStorage.getItem(legacyKey);
    }
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to read "${key}" from localStorage:`, err);
    return fallback;
  }
}

export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Failed to save "${key}" to localStorage:`, err);
    return false;
  }
}

export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Failed to remove "${key}" from localStorage:`, err);
    return false;
  }
}

// Auth & Single-Account helpers
export function getStoredAuthUser() {
  return getStorageItem(STORAGE_KEYS.AUTH_USER, null);
}

export function setStoredAuthUser(user) {
  return setStorageItem(STORAGE_KEYS.AUTH_USER, user);
}

export function removeStoredAuthUser() {
  return removeStorageItem(STORAGE_KEYS.AUTH_USER);
}

export function getStoredRegisteredAccounts() {
  const accounts = getStorageItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, []);
  return Array.isArray(accounts) ? accounts : [];
}

export function saveRegisteredAccount(account) {
  if (!account?.email) return false;
  const emailLower = account.email.trim().toLowerCase();
  const accounts = getStoredRegisteredAccounts();
  const filtered = accounts.filter((a) => a?.email?.trim().toLowerCase() !== emailLower);
  return setStorageItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, [
    { ...account, email: account.email.trim() },
    ...filtered,
  ]);
}

/**
 * One-time, non-destructive migration from legacy profile-scoped keys
 * back to canonical single-account LocalStorage keys.
 */
export function migrateProfileDataToSingleAccount() {
  if (typeof localStorage === 'undefined') return;
  try {
    if (localStorage.getItem(STORAGE_KEYS.SINGLE_ACCOUNT_MIGRATION_V1) === 'done') {
      return;
    }

    const lastProfileId = localStorage.getItem('movora_active_profile_id_v1') || 'prof-1';
    const baseKeys = [
      STORAGE_KEYS.WATCHLIST,
      STORAGE_KEYS.CONTINUE_WATCHING,
      STORAGE_KEYS.WATCH_HISTORY,
      STORAGE_KEYS.PLAYER_SETTINGS,
    ];

    for (const baseKey of baseKeys) {
      if (localStorage.getItem(baseKey) === null) {
        const scopedKey = `${baseKey}_${lastProfileId}`;
        const scopedData = getStorageItem(scopedKey, null);
        if (scopedData !== null) {
          setStorageItem(baseKey, scopedData);
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.SINGLE_ACCOUNT_MIGRATION_V1, 'done');
  } catch {
    // Preserve existing data if storage access is restricted
  }
}

// Watchlist helpers
export function getStoredWatchlist() {
  const data = getStorageItem(STORAGE_KEYS.WATCHLIST, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredWatchlist(items) {
  return setStorageItem(STORAGE_KEYS.WATCHLIST, items);
}

// Continue Watching & Watch History helpers
export function getStoredContinueWatching() {
  const data = getStorageItem(STORAGE_KEYS.CONTINUE_WATCHING, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredContinueWatching(items) {
  return setStorageItem(STORAGE_KEYS.CONTINUE_WATCHING, items);
}

export function getStoredWatchHistory() {
  const data = getStorageItem(STORAGE_KEYS.WATCH_HISTORY, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredWatchHistory(items) {
  return setStorageItem(STORAGE_KEYS.WATCH_HISTORY, items);
}

// Notification helpers
export function getStoredNotifications() {
  const data = getStorageItem(STORAGE_KEYS.NOTIFICATIONS, null);
  if (Array.isArray(data) && data.length > 0 && !data.some((n) => n.image === null)) {
    return data;
  }
  setStorageItem(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATIONS);
  return DEFAULT_NOTIFICATIONS;
}

export function setStoredNotifications(notifications) {
  const result = setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('movora:notifications-update', { detail: notifications }));
  }
  return result;
}

export function addStoredNotification(notif) {
  if (!notif || !notif.title) return;
  const current = getStoredNotifications();
  const newNotif = {
    id: `notif-${Date.now()}`,
    time: 'Just now',
    unread: true,
    type: notif.type || 'content',
    ...notif,
  };
  const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id)].slice(0, 20);
  setStoredNotifications(updated);
  return updated;
}

export function getStoredUnreadNotificationCount() {
  const notifications = getStoredNotifications();
  return notifications.filter((n) => n.unread).length;
}

// Player settings helpers
export function getStoredPlayerSettings() {
  const data = getStorageItem(STORAGE_KEYS.PLAYER_SETTINGS, null);
  if (!data || typeof data !== 'object') {
    return {
      ...DEFAULT_PLAYER_SETTINGS,
      subtitlePreferences: { ...DEFAULT_PLAYER_SETTINGS.subtitlePreferences },
    };
  }
  const speed = Number(data.defaultPlaybackSpeed);
  const subPrefs =
    data.subtitlePreferences && typeof data.subtitlePreferences === 'object'
      ? data.subtitlePreferences
      : {};
  const validSizes = ['small', 'medium', 'large'];

  return {
    autoNextEpisode:
      typeof data.autoNextEpisode === 'boolean'
        ? data.autoNextEpisode
        : DEFAULT_PLAYER_SETTINGS.autoNextEpisode,
    defaultPlaybackSpeed:
      Number.isFinite(speed) && [0.5, 0.75, 1, 1.25, 1.5, 2].includes(speed)
        ? speed
        : DEFAULT_PLAYER_SETTINGS.defaultPlaybackSpeed,
    subtitlePreferences: {
      fontSize: validSizes.includes(subPrefs.fontSize)
        ? subPrefs.fontSize
        : DEFAULT_PLAYER_SETTINGS.subtitlePreferences.fontSize,
      backgroundEnabled:
        typeof subPrefs.backgroundEnabled === 'boolean'
          ? subPrefs.backgroundEnabled
          : DEFAULT_PLAYER_SETTINGS.subtitlePreferences.backgroundEnabled,
    },
  };
}

export function setStoredPlayerSettings(settings) {
  const current = getStoredPlayerSettings();
  const next = {
    ...current,
    ...(settings && typeof settings === 'object' ? settings : {}),
    subtitlePreferences: {
      ...current.subtitlePreferences,
      ...(settings?.subtitlePreferences && typeof settings.subtitlePreferences === 'object'
        ? settings.subtitlePreferences
        : {}),
    },
  };
  return setStorageItem(STORAGE_KEYS.PLAYER_SETTINGS, next);
}
