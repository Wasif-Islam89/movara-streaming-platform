// Centralized LocalStorage Utility & Default Data
import POSTERS from '../assets/posters/index.jsx';

export const STORAGE_KEYS = {
  AUTH_USER: 'movora_auth_user_v1',
  PROFILES: 'movora_profiles_v1',
  ACTIVE_PROFILE_ID: 'movora_active_profile_id_v1',
  PROFILE_MIGRATION_V1: 'movora_profile_migration_v1',
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

// Default seed data for new users
export const DEFAULT_PROFILES = [
  {
    id: 'prof-1',
    name: 'Wasif',
    avatar: 'av-gold',
    isKids: false,
    language: 'English',
  },
  {
    id: 'prof-3',
    name: 'Kids',
    avatar: 'av-orange',
    isKids: true,
    language: 'English',
  },
];

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

export const DEFAULT_AUTH_USER = {
  email: 'wasif@example.com',
  name: 'Wasif',
  token: 'movora-authenticated-user',
  loggedInAt: new Date().toISOString(),
  plan: 'Premium 4K Ultra HD',
};

// Auth helpers
const AUTH_LOGGED_OUT_KEY = 'movora_auth_logged_out_v1';

export function getStoredAuthUser() {
  try {
    if (localStorage.getItem(AUTH_LOGGED_OUT_KEY) === 'true') {
      return null;
    }
  } catch {
    // ignore storage read error
  }
  const user = getStorageItem(STORAGE_KEYS.AUTH_USER, null);
  if (user) return user;
  setStoredAuthUser(DEFAULT_AUTH_USER);
  return DEFAULT_AUTH_USER;
}

export function setStoredAuthUser(user) {
  try {
    localStorage.removeItem(AUTH_LOGGED_OUT_KEY);
  } catch {
    // ignore
  }
  return setStorageItem(STORAGE_KEYS.AUTH_USER, user);
}

export function removeStoredAuthUser() {
  try {
    localStorage.setItem(AUTH_LOGGED_OUT_KEY, 'true');
  } catch {
    // ignore
  }
  return removeStorageItem(STORAGE_KEYS.AUTH_USER);
}

// Profile helpers
export function getStoredProfiles() {
  const data = getStorageItem(STORAGE_KEYS.PROFILES, null);
  if (Array.isArray(data) && data.length > 0) {
    // Automatically purge removed default profiles ("Movie Buff" and "Sci-Fi Fan") from localStorage
    const filtered = data.filter(
      (p) =>
        p.name !== 'Movie Buff' &&
        p.name !== 'Sci-Fi Fan' &&
        p.id !== 'prof-2' &&
        p.id !== 'prof-4'
    );
    if (filtered.length > 0) {
      if (filtered.length !== data.length) {
        setStoredProfiles(filtered);
      }
      return filtered;
    }
  }
  return DEFAULT_PROFILES;
}

export function setStoredProfiles(profiles) {
  return setStorageItem(STORAGE_KEYS.PROFILES, profiles);
}

export function getStoredActiveProfileId() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
    return stored && stored.trim() ? stored.trim() : null;
  } catch {
    return null;
  }
}

export function setStoredActiveProfileId(id) {
  try {
    if (!id) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
    }
    return true;
  } catch {
    return false;
  }
}

export function getProfileScopedKey(baseKey, profileId) {
  return profileId ? `${baseKey}_${profileId}` : baseKey;
}

/**
 * One-time, non-destructive migration of legacy global LocalStorage keys
 * into the default/target profile's scoped keys.
 */
export function migrateLegacyDataToProfile(targetProfileId) {
  if (!targetProfileId || typeof localStorage === 'undefined') return;
  try {
    if (localStorage.getItem(STORAGE_KEYS.PROFILE_MIGRATION_V1) === 'done') {
      return;
    }

    const keysToMigrate = [
      STORAGE_KEYS.WATCHLIST,
      STORAGE_KEYS.CONTINUE_WATCHING,
      STORAGE_KEYS.WATCH_HISTORY,
      STORAGE_KEYS.PLAYER_SETTINGS,
    ];

    for (const baseKey of keysToMigrate) {
      const scopedKey = getProfileScopedKey(baseKey, targetProfileId);
      if (localStorage.getItem(scopedKey) === null) {
        const legacyData = getStorageItem(baseKey, null);
        if (legacyData !== null) {
          setStorageItem(scopedKey, legacyData);
        }
      }
    }

    localStorage.setItem(STORAGE_KEYS.PROFILE_MIGRATION_V1, 'done');
  } catch {
    // Keep legacy data intact if storage is restricted
  }
}

export function removeProfileScopedData(profileId) {
  if (!profileId) return;
  removeStorageItem(getProfileScopedKey(STORAGE_KEYS.WATCHLIST, profileId));
  removeStorageItem(getProfileScopedKey(STORAGE_KEYS.CONTINUE_WATCHING, profileId));
  removeStorageItem(getProfileScopedKey(STORAGE_KEYS.WATCH_HISTORY, profileId));
  removeStorageItem(getProfileScopedKey(STORAGE_KEYS.PLAYER_SETTINGS, profileId));
}

// Watchlist helpers (profile-scoped)
export function getStoredWatchlist(profileId = null) {
  const key = getProfileScopedKey(STORAGE_KEYS.WATCHLIST, profileId);
  const data = getStorageItem(key, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredWatchlist(items, profileId = null) {
  const key = getProfileScopedKey(STORAGE_KEYS.WATCHLIST, profileId);
  return setStorageItem(key, items);
}

// Continue Watching & Watch History helpers (profile-scoped)
export function getStoredContinueWatching(profileId = null) {
  const key = getProfileScopedKey(STORAGE_KEYS.CONTINUE_WATCHING, profileId);
  const data = getStorageItem(key, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredContinueWatching(items, profileId = null) {
  const key = getProfileScopedKey(STORAGE_KEYS.CONTINUE_WATCHING, profileId);
  return setStorageItem(key, items);
}

export function getStoredWatchHistory(profileId = null) {
  const key = getProfileScopedKey(STORAGE_KEYS.WATCH_HISTORY, profileId);
  const data = getStorageItem(key, []);
  return Array.isArray(data) ? data : [];
}

export function setStoredWatchHistory(items, profileId = null) {
  const key = getProfileScopedKey(STORAGE_KEYS.WATCH_HISTORY, profileId);
  return setStorageItem(key, items);
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

// Player settings helpers (profile-scoped)
export function getStoredPlayerSettings(profileId = null) {
  const key = getProfileScopedKey(STORAGE_KEYS.PLAYER_SETTINGS, profileId);
  const data = getStorageItem(key, null);
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

export function setStoredPlayerSettings(settings, profileId = null) {
  const key = getProfileScopedKey(STORAGE_KEYS.PLAYER_SETTINGS, profileId);
  const current = getStoredPlayerSettings(profileId);
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
  return setStorageItem(key, next);
}
