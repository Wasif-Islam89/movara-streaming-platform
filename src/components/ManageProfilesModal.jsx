import { useState } from 'react';
import { 
  X, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  ShieldAlert, 
  Sparkles,
  Baby
} from 'lucide-react';
import { useProfile, AVATAR_PRESETS } from '../context/ProfileContext';
import ProfileAvatar from './ProfileAvatar';
import movoraLogo from '../assets/logo/MOVORA Logo.png';

export default function ManageProfilesModal() {
  const {
    profiles,
    activeProfileId,
    switchProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    isManageModalOpen,
    isEditingMode,
    setIsEditingMode,
    closeManageProfiles,
  } = useProfile();

  // Sub-modal state for editing or adding a profile
  const [editingTarget, setEditingTarget] = useState(null); // null | 'new' | profile object
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('av-gold');
  const [formIsKids, setFormIsKids] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  if (!isManageModalOpen) return null;

  function handleProfileClick(profile) {
    if (isEditingMode) {
      openEditForm(profile);
    } else {
      switchProfile(profile.id);
    }
  }

  function openAddForm() {
    setEditingTarget('new');
    setFormName('');
    setFormAvatar('av-blue');
    setFormIsKids(false);
    setDeleteConfirmId(null);
  }

  function openEditForm(profile) {
    setEditingTarget(profile);
    setFormName(profile.name);
    setFormAvatar(profile.avatar || 'av-gold');
    setFormIsKids(Boolean(profile.isKids));
    setDeleteConfirmId(null);
  }

  function closeSubForm() {
    setEditingTarget(null);
    setDeleteConfirmId(null);
  }

  function handleSaveForm(e) {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingTarget === 'new') {
      addProfile({
        name: formName.trim(),
        avatar: formAvatar,
        isKids: formIsKids,
      });
    } else if (editingTarget && editingTarget.id) {
      updateProfile(editingTarget.id, {
        name: formName.trim(),
        avatar: formAvatar,
        isKids: formIsKids,
      });
    }

    closeSubForm();
  }

  function handleDeleteProfile(id) {
    if (profiles.length <= 1) {
      alert('You cannot delete the only remaining profile.');
      return;
    }
    deleteProfile(id);
    closeSubForm();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profile Selector"
      className="fixed inset-0 z-50 bg-[#121212]/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Top Bar with Brand & Close Button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <img
          src={movoraLogo}
          alt="MOVORA"
          className="h-8 sm:h-9 w-auto max-w-[140px] sm:max-w-[160px] object-contain mix-blend-screen"
        />
        <button
          type="button"
          onClick={closeManageProfiles}
          aria-label="Close profile switcher"
          className="p-2 rounded-full text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#1D1C1A] transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Who's Watching / Manage Profiles View */}
      {!editingTarget ? (
        <div className="max-w-4xl w-full my-auto flex flex-col items-center text-center space-y-8 sm:space-y-12">
          
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F3EEE4]">
              {isEditingMode ? 'Manage Profiles' : "Who's watching?"}
            </h1>
            <p className="text-sm sm:text-base text-[#AAA49A]">
              {isEditingMode
                ? 'Select a profile to edit avatar, name, or settings.'
                : 'Choose your profile to resume personalized recommendations & watchlists.'}
            </p>
          </div>

          {/* Profiles Row / Grid */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 max-w-3xl">
            {profiles.map((profile) => {
              const isActive = profile.id === activeProfileId;

              return (
                <div
                  key={profile.id}
                  className="group flex flex-col items-center cursor-pointer select-none"
                  onClick={() => handleProfileClick(profile)}
                >
                  {/* Avatar wrapper */}
                  <div className="relative">
                    <ProfileAvatar
                      avatarId={profile.avatar}
                      name={profile.name}
                      isKids={profile.isKids}
                      size="lg"
                      className={`ring-2 transition-all duration-200 group-hover:scale-105 ${
                        isActive && !isEditingMode
                          ? 'ring-[#F2B84B] shadow-lg shadow-[#F2B84B]/20'
                          : 'ring-transparent group-hover:ring-[#F3EEE4]/60'
                      }`}
                    />

                    {/* Edit mode overlay with Pencil icon */}
                    {isEditingMode && (
                      <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center backdrop-blur-xs group-hover:bg-black/40 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-[#1D1C1A] border border-[#2A2926] flex items-center justify-center text-[#F2B84B] shadow-md group-hover:scale-110 transition-transform">
                          <Pencil className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Name */}
                  <span className={`mt-3 text-sm sm:text-base font-medium transition-colors ${
                    isActive && !isEditingMode
                      ? 'text-[#F2B84B] font-semibold'
                      : 'text-[#AAA49A] group-hover:text-[#F3EEE4]'
                  }`}>
                    {profile.name}
                  </span>

                  {/* Active Indicator Badge */}
                  {isActive && !isEditingMode && (
                    <span className="text-[10px] text-[#F2B84B]/90 font-medium mt-0.5">
                      Current
                    </span>
                  )}
                </div>
              );
            })}

            {/* Add Profile Tile (up to 5 profiles allowed) */}
            {profiles.length < 5 && (
              <div
                className="group flex flex-col items-center cursor-pointer select-none"
                onClick={openAddForm}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-[#2A2926] bg-[#1D1C1A]/40 flex items-center justify-center text-[#AAA49A] group-hover:border-[#F2B84B] group-hover:text-[#F2B84B] group-hover:scale-105 transition-all duration-200">
                  <Plus className="w-10 h-10" />
                </div>
                <span className="mt-3 text-sm sm:text-base font-medium text-[#AAA49A] group-hover:text-[#F3EEE4] transition-colors">
                  Add Profile
                </span>
              </div>
            )}
          </div>

          {/* Bottom Action Toggle Button */}
          <div className="pt-4">
            {isEditingMode ? (
              <button
                type="button"
                onClick={() => setIsEditingMode(false)}
                className="px-8 py-2.5 rounded-lg text-sm font-bold text-[#121212] bg-[#F2B84B] hover:bg-[#E58B43] shadow-lg shadow-[#F2B84B]/10 transition-all cursor-pointer"
              >
                Done
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingMode(true)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium tracking-wide uppercase text-[#AAA49A] border border-[#2A2926] bg-[#1D1C1A]/60 hover:text-[#F3EEE4] hover:border-[#AAA49A] transition-all cursor-pointer"
              >
                Manage Profiles
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Edit or Add Profile Form Modal */
        <div className="max-w-xl w-full my-auto bg-[#1D1C1A] border border-[#2A2926] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between border-b border-[#2A2926] pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#F3EEE4]">
              {editingTarget === 'new' ? 'Add Profile' : 'Edit Profile'}
            </h2>
            <button
              type="button"
              onClick={closeSubForm}
              className="text-[#AAA49A] hover:text-[#F3EEE4] p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-6">
            
            {/* Avatar & Name Input */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <ProfileAvatar
                avatarId={formAvatar}
                name={formName}
                isKids={formIsKids}
                size="lg"
                className="ring-2 ring-[#2A2926] shrink-0"
              />

              <div className="w-full space-y-2">
                <label htmlFor="profile-name-input" className="block text-xs font-semibold uppercase tracking-wider text-[#AAA49A]">
                  Profile Name
                </label>
                <input
                  id="profile-name-input"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter profile name..."
                  maxLength={24}
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-[#121212] border border-[#2A2926] text-[#F3EEE4] placeholder-[#AAA49A]/60 focus:outline-none focus:border-[#F2B84B] focus:ring-1 focus:ring-[#F2B84B] text-base"
                />
              </div>
            </div>

            {/* Choose Avatar Preset */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#AAA49A]">
                Choose Avatar Theme
              </label>
              <div className="grid grid-cols-6 gap-2.5">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFormAvatar(preset.id)}
                    className={`relative p-1 rounded-xl transition-all cursor-pointer ${
                      formAvatar === preset.id
                        ? 'ring-2 ring-[#F2B84B] scale-105 shadow-md shadow-[#F2B84B]/20'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ProfileAvatar
                      avatarId={preset.id}
                      name={preset.label}
                      size="sm"
                      className="w-full h-11"
                    />
                    {formAvatar === preset.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#F2B84B] text-[#121212] flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Kids Profile Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#121212] border border-[#2A2926]">
              <div className="space-y-0.5 pr-4">
                <span className="text-sm font-semibold text-[#F3EEE4] flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-[#F2B84B]" />
                  Kids Profile?
                </span>
                <p className="text-xs text-[#AAA49A]">
                  Only show movies and TV shows rated for kids and family.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsKids}
                  onChange={(e) => setFormIsKids(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#2A2926] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F2B84B]"></div>
              </label>
            </div>

            {/* Actions: Save / Cancel / Delete */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              {editingTarget !== 'new' && profiles.length > 1 && (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(editingTarget.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Profile</span>
                </button>
              )}

              <div className="w-full sm:w-auto flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={closeSubForm}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#121212] border border-[#2A2926] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formName.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-[#121212] bg-[#F2B84B] hover:bg-[#E58B43] disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-[#F2B84B]/10"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Delete Confirmation prompt */}
            {deleteConfirmId && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-center space-y-3 animate-in fade-in duration-150">
                <p className="text-xs text-red-200">
                  Are you sure you want to delete profile &ldquo;{editingTarget.name}&rdquo;? Watchlist and history for this profile will be permanently removed.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#AAA49A] hover:text-[#F3EEE4] bg-[#121212]"
                  >
                    Keep Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProfile(deleteConfirmId)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>
      )}
    </div>
  );
}
