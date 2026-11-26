import { createContext, useContext, useState, useEffect } from 'react';
import {
  DEFAULT_PROFILES,
  getStoredProfiles,
  setStoredProfiles,
  getStoredActiveProfileId,
  setStoredActiveProfileId,
  migrateLegacyDataToProfile,
  removeProfileScopedData,
} from '../utils/localStorage';

export { DEFAULT_PROFILES };

export const AVATAR_PRESETS = [
  { id: 'av-red', bg: 'from-red-600 to-rose-700', icon: 'smile', label: 'Classic Crimson' },
  { id: 'av-gold', bg: 'from-[#F2B84B] to-[#E58B43]', icon: 'sparkles', label: 'Movora Gold' },
  { id: 'av-blue', bg: 'from-blue-600 to-indigo-700', icon: 'film', label: 'Deep Ocean' },
  { id: 'av-purple', bg: 'from-purple-600 to-violet-700', icon: 'star', label: 'Cosmic Violet' },
  { id: 'av-emerald', bg: 'from-emerald-600 to-teal-700', icon: 'bot', label: 'Emerald Sage' },
  { id: 'av-orange', bg: 'from-amber-500 to-orange-600', icon: 'baby', label: 'Kids Sunshine' },
];

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profiles, setProfiles] = useState(() => {
    const stored = getStoredProfiles();
    const list = Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_PROFILES;
    migrateLegacyDataToProfile(list[0].id);
    return list;
  });

  const [activeProfileId, setActiveProfileId] = useState(() => {
    const storedId = getStoredActiveProfileId();
    const storedProfiles = getStoredProfiles();
    if (storedId && storedProfiles.some((p) => p.id === storedId)) {
      return storedId;
    }
    return null;
  });

  // Modal state for "Who's watching?" / Manage Profiles
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    setStoredProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    setStoredActiveProfileId(activeProfileId);
  }, [activeProfileId]);

  const matchedProfile = profiles.find((p) => p.id === activeProfileId) || null;
  const hasSelectedProfile = Boolean(matchedProfile);
  const activeProfile = matchedProfile || profiles[0] || DEFAULT_PROFILES[0];
  const effectiveProfileId = activeProfile?.id || DEFAULT_PROFILES[0].id;

  function switchProfile(id) {
    if (profiles.some((p) => p.id === id)) {
      setActiveProfileId(id);
      setIsManageModalOpen(false);
      setIsEditingMode(false);
      return true;
    }
    return false;
  }

  function addProfile({ name, avatar = 'av-blue', isKids = false }) {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) {
      return { ok: false, error: 'Profile name cannot be empty.' };
    }
    const isDuplicate = profiles.some(
      (p) => p.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      return { ok: false, error: 'A profile with this name already exists.' };
    }

    const newProfile = {
      id: `prof-${Date.now()}`,
      name: trimmed,
      avatar,
      isKids: Boolean(isKids),
      language: 'English',
    };
    setProfiles((prev) => [...prev, newProfile]);
    return { ok: true, profile: newProfile };
  }

  function updateProfile(id, updates) {
    const trimmed = typeof updates?.name === 'string' ? updates.name.trim() : '';
    if (updates?.name !== undefined) {
      if (!trimmed) {
        return { ok: false, error: 'Profile name cannot be empty.' };
      }
      const isDuplicate = profiles.some(
        (p) => p.id !== id && p.name.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        return { ok: false, error: 'A profile with this name already exists.' };
      }
    }

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              ...(updates?.name !== undefined ? { name: trimmed } : {}),
            }
          : p
      )
    );
    return { ok: true };
  }

  function deleteProfile(id) {
    if (profiles.length <= 1) {
      return false;
    }
    const remaining = profiles.filter((p) => p.id !== id);
    if (remaining.length === profiles.length) return false;

    removeProfileScopedData(id);
    setProfiles(remaining);

    if (activeProfileId === id) {
      setActiveProfileId(remaining[0].id);
    }
    return true;
  }

  function openManageProfiles(startInEditMode = false) {
    setIsEditingMode(startInEditMode);
    setIsManageModalOpen(true);
  }

  function closeManageProfiles() {
    setIsManageModalOpen(false);
    setIsEditingMode(false);
  }

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        activeProfileId: effectiveProfileId,
        hasSelectedProfile,
        switchProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        isManageModalOpen,
        isEditingMode,
        setIsEditingMode,
        openManageProfiles,
        closeManageProfiles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
