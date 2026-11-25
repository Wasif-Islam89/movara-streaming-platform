import { createContext, useContext, useState, useEffect } from 'react';
import { 
  DEFAULT_PROFILES, 
  getStoredProfiles, 
  setStoredProfiles, 
  getStoredActiveProfileId, 
  setStoredActiveProfileId 
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
  // Initialize profiles and active ID from centralized localStorage
  const [profiles, setProfiles] = useState(() => getStoredProfiles());
  const [activeProfileId, setActiveProfileId] = useState(() => getStoredActiveProfileId());

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

  // Active profile object
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

  function switchProfile(id) {
    if (profiles.some((p) => p.id === id)) {
      setActiveProfileId(id);
      setIsManageModalOpen(false);
      setIsEditingMode(false);
    }
  }

  function addProfile({ name, avatar = 'av-blue', isKids = false }) {
    if (!name?.trim()) return null;
    const newProfile = {
      id: `prof-${Date.now()}`,
      name: name.trim(),
      avatar,
      isKids: Boolean(isKids),
      language: 'English',
    };
    setProfiles((prev) => [...prev, newProfile]);
    return newProfile;
  }

  function updateProfile(id, updates) {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }

  function deleteProfile(id) {
    if (profiles.length <= 1) {
      alert('You must have at least one profile.');
      return false;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActiveProfileId(remaining[0].id);
      }
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
        activeProfileId,
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
