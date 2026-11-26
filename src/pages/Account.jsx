import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Sliders,
  LogOut,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getStoredPlayerSettings,
  setStoredPlayerSettings,
} from '../utils/localStorage';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SUBTITLE_SIZES = ['small', 'medium', 'large'];

export default function Account() {
  const { user, updateAccount, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [nameStatus, setNameStatus] = useState({ type: '', message: '' });
  const [playerSettings, setPlayerSettings] = useState(() => getStoredPlayerSettings());

  useEffect(() => {
    document.title = 'Account Settings | MOVORA';
  }, []);

  useEffect(() => {
    setDisplayName(user?.name || '');
  }, [user?.name]);

  function handleSaveName(e) {
    e.preventDefault();
    const res = updateAccount({ name: displayName });
    if (!res?.ok) {
      setNameStatus({ type: 'error', message: res?.error || 'Could not update name.' });
      return;
    }
    setNameStatus({ type: 'success', message: 'Display name updated.' });
  }

  function handleSettingUpdate(updates) {
    setStoredPlayerSettings(updates);
    setPlayerSettings(getStoredPlayerSettings());
  }

  function handleSignOut() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] pb-20">
      {/* Top Breadcrumbs & Back Navigation (consistent with Details pages) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-[#AAA49A]">
          <Link
            to="/home"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2926] bg-[#1D1C1A] text-[#AAA49A] hover:text-[#F2B84B] hover:border-[#F2B84B]/40 transition-all"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <span className="text-[#2A2926]">/</span>
          <Link to="/home" className="hover:text-[#F3EEE4] transition-colors">
            Home
          </Link>
          <span className="text-[#2A2926]">/</span>
          <span className="text-[#F2B84B]">Account Settings</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 space-y-6">
        {/* Header */}
        <div className="pb-6 border-b border-[#1D1C1A]">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F3EEE4] tracking-tight">
            Account Settings
          </h1>
          <p className="mt-1.5 text-sm text-[#AAA49A]">
            Manage your MOVORA account details and playback preferences.
          </p>
        </div>

        {/* Account Identity Card */}
        <section className="p-6 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F2B84B] to-[#E58B43] text-[#121212] flex items-center justify-center text-lg font-extrabold shrink-0">
              {(user?.name || user?.email || 'M').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#F3EEE4] truncate">
                {user?.name || 'MOVORA Member'}
              </h2>
              <p className="text-xs text-[#AAA49A] truncate">
                {user?.email || 'Registered Account'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="space-y-4 pt-2 border-t border-[#2A2926]">
            <div className="space-y-1.5">
              <label
                htmlFor="account-display-name"
                className="block text-xs font-semibold uppercase tracking-wider text-[#AAA49A]"
              >
                Display Name
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <User className="w-4 h-4 text-[#AAA49A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="account-display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (nameStatus.message) setNameStatus({ type: '', message: '' });
                    }}
                    maxLength={40}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] border border-[#2A2926] text-sm text-[#F3EEE4] focus:outline-none focus:border-[#F2B84B]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#121212] bg-[#F2B84B] hover:bg-[#E58B43] transition-colors cursor-pointer"
                >
                  Save Name
                </button>
              </div>
              {nameStatus.message && (
                <p
                  className={`text-xs font-medium flex items-center gap-1 ${
                    nameStatus.type === 'error' ? 'text-[#E58B43]' : 'text-emerald-400'
                  }`}
                >
                  {nameStatus.type === 'success' && <Check className="w-3.5 h-3.5" />}
                  <span>{nameStatus.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#AAA49A]">
                Registered Email
              </span>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#121212]/70 border border-[#2A2926] text-sm text-[#AAA49A]">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{user?.email || 'Not available'}</span>
              </div>
            </div>
          </form>
        </section>

        {/* Playback Preferences Card */}
        <section className="p-6 rounded-2xl bg-[#1D1C1A] border border-[#2A2926] space-y-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F2B84B]" />
            <h2 className="text-base sm:text-lg font-bold text-[#F3EEE4]">
              Playback Preferences
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#AAA49A]">
                Default Playback Speed
              </span>
              <div className="flex flex-wrap gap-2">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleSettingUpdate({ defaultPlaybackSpeed: speed })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      playerSettings.defaultPlaybackSpeed === speed
                        ? 'bg-[#F2B84B] text-[#121212]'
                        : 'bg-[#121212] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4]'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#2A2926]">
              <div>
                <span className="block text-sm font-semibold text-[#F3EEE4]">
                  Auto Next Episode
                </span>
                <span className="block text-xs text-[#AAA49A]">
                  Automatically start the next episode after countdown
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={playerSettings.autoNextEpisode}
                onClick={() =>
                  handleSettingUpdate({ autoNextEpisode: !playerSettings.autoNextEpisode })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  playerSettings.autoNextEpisode ? 'bg-[#F2B84B]' : 'bg-[#2A2926]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#121212] shadow transition ${
                    playerSettings.autoNextEpisode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#2A2926]">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#AAA49A]">
                Subtitle Text Size
              </span>
              <div className="flex flex-wrap gap-2">
                {SUBTITLE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      handleSettingUpdate({ subtitlePreferences: { fontSize: size } })
                    }
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      playerSettings.subtitlePreferences?.fontSize === size
                        ? 'bg-[#F2B84B] text-[#121212]'
                        : 'bg-[#121212] border border-[#2A2926] text-[#AAA49A] hover:text-[#F3EEE4]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sign Out */}
        <section className="p-5 rounded-2xl bg-[#1D1C1A]/70 border border-[#2A2926] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#F3EEE4]">Sign Out</h2>
            <p className="text-xs text-[#AAA49A]">
              Return to the public MOVORA landing page.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-300 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </section>
      </div>
    </div>
  );
}
