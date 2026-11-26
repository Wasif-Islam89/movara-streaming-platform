import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  AlertCircle,
  RotateCcw,
  Loader2,
  Check,
  FastForward,
  ChevronRight,
  X,
  ArrowLeft,
} from 'lucide-react';
import {
  getStoredPlayerSettings,
  setStoredPlayerSettings,
} from '../utils/localStorage';
import { useProfile } from '../context/ProfileContext';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const NEXT_EPISODE_COUNTDOWN_SECONDS = 10;
const MAX_RETRY_ATTEMPTS = 3;
const BUFFERING_DEBOUNCE_MS = 180;
const STALLED_NOTICE_MS = 3500;

function isWithinTimeWindow(win, time) {
  return Boolean(
    win &&
      Number.isFinite(win.start) &&
      Number.isFinite(win.end) &&
      win.start >= 0 &&
      win.end > win.start &&
      time >= win.start &&
      time < win.end
  );
}

function getMediaErrorInfo(mediaError) {
  const code = mediaError?.code;
  if (code === 1) {
    return {
      message: 'Playback was interrupted.',
      detail: 'The video stream stopped before finishing. You can retry loading it.',
      recoverable: true,
    };
  }
  if (code === 2) {
    return {
      message: 'Network error during playback.',
      detail: 'Please check your internet connection and retry the stream.',
      recoverable: true,
    };
  }
  if (code === 3) {
    return {
      message: 'Video decoding failed.',
      detail: 'The stream data could not be decoded cleanly. Try reloading the player.',
      recoverable: true,
    };
  }
  if (code === 4) {
    return {
      message: 'Video format or source is not supported.',
      detail: 'This stream could not be loaded by your browser or the media URL is unavailable.',
      recoverable: false,
    };
  }
  return {
    message: 'Unable to play video stream right now.',
    detail: 'Please check your internet connection and try reloading the player.',
    recoverable: true,
  };
}

/**
 * Format seconds into MM:SS or H:MM:SS
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * MOVORA In-App Cinematic HTML5 Video Player
 */
export default function VideoPlayer({
  src,
  sources = [],
  poster,
  title = 'MOVORA Stream',
  initialTime = 0,
  onPlayStart = null,
  onProgress = null,
  onComplete = null,
  showAutoNextOption = false,
  autoNextEnabled = true,
  onAutoNextChange = null,
  subtitles = [],
  qualitySources = [],
  introWindow = null,
  recapWindow = null,
  creditsStart = null,
  nextEpisode = null,
  onPlayNext = null,
  backTo = null,
  backLabel = 'Back',
}) {
  const { activeProfileId } = useProfile();

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const settingsRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const bufferingTimerRef = useRef(null);
  const stalledTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const hasRestoredRef = useRef(false);
  const hasStartedPlayRef = useRef(false);
  const isCompletedRef = useRef(false);
  const hasTriggeredNextRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastSavedAtRef = useRef(0);
  const latestTimeRef = useRef({ currentTime: 0, duration: 0 });
  const onPlayStartRef = useRef(onPlayStart);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);
  const onPlayNextRef = useRef(onPlayNext);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isStalled, setIsStalled] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(
    () => getStoredPlayerSettings(activeProfileId).defaultPlaybackSpeed
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(NEXT_EPISODE_COUNTDOWN_SECONDS);

  // Extensible track/quality state (only active when real tracks/sources are supplied)
  const [activeSrc, setActiveSrc] = useState(src);
  const activeSourceObj = Array.isArray(sources)
    ? sources.find((s) => s.url === activeSrc)
    : null;
  const activeSubtitles = Array.isArray(activeSourceObj?.subtitles)
    ? activeSourceObj.subtitles
    : Array.isArray(subtitles)
    ? subtitles
    : [];
  const effectiveIntroWindow = activeSourceObj?.introWindow || introWindow;
  const effectiveRecapWindow = activeSourceObj?.recapWindow || recapWindow;
  const effectiveCreditsStart =
    activeSourceObj?.creditsStart !== undefined && activeSourceObj?.creditsStart !== null
      ? activeSourceObj.creditsStart
      : creditsStart;

  const [activeSubtitleLang, setActiveSubtitleLang] = useState(() => {
    const def = activeSubtitles.find((s) => s.default);
    return def ? def.language : 'off';
  });
  const [activeCueText, setActiveCueText] = useState('');
  const [subtitlePrefs, setSubtitlePrefs] = useState(
    () => getStoredPlayerSettings(activeProfileId).subtitlePreferences
  );
  const [audioTracks, setAudioTracks] = useState([]);
  const [activeAudioTrackIdx, setActiveAudioTrackIdx] = useState(0);
  const pendingSeekAfterSwitchRef = useRef(null);

  // Sync player settings when active profile changes
  useEffect(() => {
    const settings = getStoredPlayerSettings(activeProfileId);
    setPlaybackRate(settings.defaultPlaybackSpeed);
    setSubtitlePrefs(settings.subtitlePreferences);
    if (videoRef.current) {
      videoRef.current.playbackRate = settings.defaultPlaybackSpeed;
    }
  }, [activeProfileId]);

  const clearBufferingTimers = useCallback(() => {
    if (bufferingTimerRef.current) {
      clearTimeout(bufferingTimerRef.current);
      bufferingTimerRef.current = null;
    }
    if (stalledTimerRef.current) {
      clearTimeout(stalledTimerRef.current);
      stalledTimerRef.current = null;
    }
  }, []);

  const startBufferingWithDebounce = useCallback(() => {
    clearBufferingTimers();
    bufferingTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsBuffering(true);
      }
    }, BUFFERING_DEBOUNCE_MS);
    stalledTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsStalled(true);
      }
    }, STALLED_NOTICE_MS);
  }, [clearBufferingTimers]);

  const stopBufferingImmediately = useCallback(() => {
    clearBufferingTimers();
    if (isMountedRef.current) {
      setIsBuffering(false);
      setIsStalled(false);
    }
  }, [clearBufferingTimers]);

  const triggerPlayNext = useCallback(() => {
    if (hasTriggeredNextRef.current || !onPlayNextRef.current) return;
    hasTriggeredNextRef.current = true;
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setShowNextOverlay(false);
    onPlayNextRef.current();
  }, []);

  const handleCancelNextOverlay = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setShowNextOverlay(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearBufferingTimers();
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [clearBufferingTimers]);

  useEffect(() => {
    setActiveSrc(src);
    setVideoError(null);
    setRetryCount(0);
    setIsPlaying(false);
    setIsBuffering(false);
    setIsStalled(false);
    setShowNextOverlay(false);
    setNextCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);
    setActiveCueText('');
    setAudioTracks([]);
    setActiveAudioTrackIdx(0);
    clearBufferingTimers();
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    hasRestoredRef.current = false;
    hasStartedPlayRef.current = false;
    isCompletedRef.current = false;
    hasTriggeredNextRef.current = false;
    lastSavedAtRef.current = 0;
    latestTimeRef.current = { currentTime: 0, duration: 0 };
  }, [src, clearBufferingTimers]);

  // Sync default subtitle selection when active source changes
  useEffect(() => {
    const def = activeSubtitles.find((s) => s.default);
    setActiveSubtitleLang(def ? def.language : 'off');
    setActiveCueText('');
  }, [activeSrc]);

  // Sync HTML5 textTracks API & cuechange listener with cleanup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !video.textTracks) return;

    const tracks = video.textTracks;
    const listeners = [];

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const isSelected =
        activeSubtitleLang !== 'off' && track.language === activeSubtitleLang;
      track.mode = isSelected ? 'hidden' : 'disabled';

      if (isSelected) {
        const updateCues = () => {
          const cues = track.activeCues;
          if (cues && cues.length > 0) {
            const texts = Array.from(cues)
              .map((c) => c.text)
              .filter(Boolean);
            setActiveCueText(texts.join('\n'));
          } else {
            setActiveCueText('');
          }
        };
        updateCues();
        track.addEventListener('cuechange', updateCues);
        listeners.push({ track, fn: updateCues });
      }
    }

    if (activeSubtitleLang === 'off') {
      setActiveCueText('');
    }

    return () => {
      for (const { track, fn } of listeners) {
        track.removeEventListener('cuechange', fn);
      }
    };
  }, [activeSubtitleLang, activeSrc, activeSubtitles.length]);

  useEffect(() => {
    onPlayStartRef.current = onPlayStart;
  }, [onPlayStart]);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onPlayNextRef.current = onPlayNext;
  }, [onPlayNext]);

  // Next Episode 10s auto-countdown when overlay is active & Auto Next is enabled
  useEffect(() => {
    if (!showNextOverlay || !autoNextEnabled || !nextEpisode) {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      return;
    }

    countdownTimerRef.current = setInterval(() => {
      setNextCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [showNextOverlay, autoNextEnabled, nextEpisode]);

  useEffect(() => {
    if (showNextOverlay && autoNextEnabled && nextEpisode && nextCountdown <= 0) {
      triggerPlayNext();
    }
  }, [showNextOverlay, autoNextEnabled, nextEpisode, nextCountdown, triggerPlayNext]);

  // Save latest progress when leaving/unmounting the player
  useEffect(() => {
    return () => {
      if (
        !isCompletedRef.current &&
        latestTimeRef.current.duration > 0 &&
        latestTimeRef.current.currentTime > 0
      ) {
        onProgressRef.current?.(latestTimeRef.current);
      }
    };
  }, []);

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setShowControls(true);
    if (isPlaying && !isSettingsOpen && !showNextOverlay) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isSettingsOpen, showNextOverlay]);

  useEffect(() => {
    scheduleHideControls();
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [isPlaying, isSettingsOpen, showNextOverlay, scheduleHideControls]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    }
    function handleOrientationChange() {
      scheduleHideControls();
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [scheduleHideControls]);

  // Close settings menu when clicking outside
  useEffect(() => {
    if (!isSettingsOpen) return;
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSettingsOpen]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || videoError) return;
    if (showNextOverlay) {
      handleCancelNextOverlay();
    }
    if (video.paused || video.ended) {
      video.play().catch((err) => {
        if (err?.name !== 'AbortError') {
          setVideoError(getMediaErrorInfo(video.error));
        }
      });
    } else {
      video.pause();
    }
  }, [videoError, showNextOverlay, handleCancelNextOverlay]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }, []);

  const updateVolume = useCallback((nextVol) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.min(1, Math.max(0, Number(nextVol)));
    video.volume = clamped;
    video.muted = clamped === 0;
    setVolume(clamped);
    setIsMuted(clamped === 0);
  }, []);

  const handleVolumeChange = (e) => {
    updateVolume(parseFloat(e.target.value));
  };

  const seekBy = useCallback(
    (deltaSeconds) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;
      if (showNextOverlay) {
        handleCancelNextOverlay();
      }
      const next = Math.min(video.duration, Math.max(0, (video.currentTime || 0) + deltaSeconds));
      video.currentTime = next;
      setCurrentTime(next);
    },
    [showNextOverlay, handleCancelNextOverlay]
  );

  const handleSeek = (e) => {
    const nextTime = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video || !Number.isFinite(nextTime)) return;
    if (showNextOverlay) {
      handleCancelNextOverlay();
    }
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
    setPlaybackRate(speed);
    setStoredPlayerSettings({ defaultPlaybackSpeed: speed }, activeProfileId);
  };

  const handleSubtitleChange = (lang) => {
    setActiveSubtitleLang(lang);
  };

  const handleSubtitlePrefsChange = (updates) => {
    setSubtitlePrefs((prev) => {
      const next = { ...prev, ...updates };
      setStoredPlayerSettings({ subtitlePreferences: next }, activeProfileId);
      return next;
    });
  };

  const handleAudioTrackChange = (index) => {
    const video = videoRef.current;
    if (!video || !video.audioTracks || video.audioTracks.length <= 1) return;
    try {
      for (let i = 0; i < video.audioTracks.length; i++) {
        video.audioTracks[i].enabled = i === index;
      }
      setActiveAudioTrackIdx(index);
    } catch {
      // Browser does not allow switching audioTracks
    }
  };

  const handleQualityChange = (newSrc) => {
    if (!newSrc || newSrc === activeSrc) return;
    const video = videoRef.current;
    pendingSeekAfterSwitchRef.current = video ? video.currentTime || 0 : 0;
    const wasPlaying = video ? !video.paused : false;
    setActiveSrc(newSrc);
    setIsSettingsOpen(false);
    if (wasPlaying) {
      setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, 50);
    }
  };

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;
    try {
      const activeEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (!activeEl) {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      }
    } catch {
      // Fullscreen may be blocked by browser policy
    }
  }, []);

  const handleRetryVideo = () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) return;
    const video = videoRef.current;
    const savedTime = latestTimeRef.current.currentTime;
    if (Number.isFinite(savedTime) && savedTime > 0) {
      pendingSeekAfterSwitchRef.current = savedTime;
    }
    setRetryCount((prev) => prev + 1);
    setVideoError(null);
    setIsBuffering(true);
    setIsStalled(false);
    if (video) {
      video.load();
      video.play().catch((err) => {
        if (err?.name !== 'AbortError') {
          setIsBuffering(false);
        }
      });
    }
  };

  // Single global keyboard shortcut listener while player is mounted
  useEffect(() => {
    function handleKeyDown(e) {
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key;
      const isInteractiveControl =
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.getAttribute?.('role') === 'switch');

      if (key === ' ' && isInteractiveControl) {
        return;
      }

      if (key === ' ' || key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePlay();
        scheduleHideControls();
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        seekBy(-10);
        scheduleHideControls();
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        seekBy(10);
        scheduleHideControls();
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        updateVolume(volume + 0.1);
        scheduleHideControls();
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        updateVolume(volume - 0.1);
        scheduleHideControls();
      } else if (key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
        scheduleHideControls();
      } else if (key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          settingsButtonRef.current?.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    seekBy,
    updateVolume,
    volume,
    toggleMute,
    toggleFullscreen,
    isSettingsOpen,
    scheduleHideControls,
  ]);

  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const bufferedPercent = duration > 0 ? Math.min((bufferedEnd / duration) * 100, 100) : 0;

  // Skip Intro, Skip Recap, and End Credits only when valid metadata timestamps exist
  const showSkipIntro = isWithinTimeWindow(effectiveIntroWindow, currentTime);
  const showSkipRecap =
    !showSkipIntro && isWithinTimeWindow(effectiveRecapWindow, currentTime);

  const inEndCredits =
    Number.isFinite(effectiveCreditsStart) &&
    effectiveCreditsStart > 0 &&
    duration > 0 &&
    effectiveCreditsStart < duration &&
    currentTime >= effectiveCreditsStart &&
    currentTime < duration - 0.5 &&
    !showNextOverlay;

  const hasSubtitles = activeSubtitles.length > 0;
  const hasMultipleQualities = Array.isArray(qualitySources) && qualitySources.length > 1;
  const hasMultipleSources = Array.isArray(sources) && sources.length > 1;
  const hasMultipleAudioTracks = audioTracks.length > 1;

  const subtitleSizeClass =
    subtitlePrefs.fontSize === 'small'
      ? 'text-xs sm:text-sm'
      : subtitlePrefs.fontSize === 'large'
      ? 'text-base sm:text-xl'
      : 'text-sm sm:text-base';

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseMove={scheduleHideControls}
      onMouseLeave={() => isPlaying && !isSettingsOpen && !showNextOverlay && setShowControls(false)}
      onTouchStart={scheduleHideControls}
      aria-label={`${title} video player`}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#2A2926] shadow-2xl shadow-black/90 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]/60 group"
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster || undefined}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onLoadStart={() => {
          setIsBuffering(true);
          setIsStalled(false);
          clearBufferingTimers();
          stalledTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setIsStalled(true);
          }, STALLED_NOTICE_MS);
        }}
        onPlay={(e) => {
          setIsPlaying(true);
          stopBufferingImmediately();
          setShowNextOverlay(false);
          isCompletedRef.current = false;
          if (!hasStartedPlayRef.current) {
            hasStartedPlayRef.current = true;
            const v = e.currentTarget;
            onPlayStartRef.current?.({
              currentTime: v.currentTime || 0,
              duration: v.duration || 0,
            });
          }
        }}
        onPlaying={() => stopBufferingImmediately()}
        onPause={() => {
          setIsPlaying(false);
          if (
            !videoRef.current?.ended &&
            latestTimeRef.current.duration > 0 &&
            latestTimeRef.current.currentTime > 0
          ) {
            lastSavedAtRef.current = Date.now();
            onProgressRef.current?.(latestTimeRef.current);
          }
        }}
        onEnded={() => {
          stopBufferingImmediately();
          setIsPlaying(false);
          setShowControls(true);
          isCompletedRef.current = true;
          const dur = videoRef.current?.duration || latestTimeRef.current.duration || 0;
          onCompleteRef.current?.({ currentTime: dur, duration: dur });

          if (nextEpisode && onPlayNextRef.current) {
            hasTriggeredNextRef.current = false;
            setNextCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
            setShowNextOverlay(true);
          }
        }}
        onWaiting={() => startBufferingWithDebounce()}
        onStalled={() => startBufferingWithDebounce()}
        onCanPlay={() => stopBufferingImmediately()}
        onLoadedMetadata={(e) => {
          const vid = e.currentTarget;
          const vidDuration = vid.duration || 0;
          setDuration(vidDuration);
          stopBufferingImmediately();
          vid.playbackRate = playbackRate;

          // Detect native browser audioTracks if exposed and > 1 track exists
          if (vid.audioTracks && vid.audioTracks.length > 1) {
            const detected = Array.from(vid.audioTracks).map((t, idx) => ({
              index: idx,
              label: t.label || t.language || `Track ${idx + 1}`,
              language: t.language || '',
              enabled: Boolean(t.enabled),
            }));
            setAudioTracks(detected);
            const activeIdx = detected.findIndex((t) => t.enabled);
            setActiveAudioTrackIdx(activeIdx >= 0 ? activeIdx : 0);
          } else {
            setAudioTracks([]);
          }

          if (pendingSeekAfterSwitchRef.current !== null && vidDuration > 0) {
            vid.currentTime = Math.min(pendingSeekAfterSwitchRef.current, vidDuration);
            setCurrentTime(vid.currentTime);
            pendingSeekAfterSwitchRef.current = null;
          } else if (
            !hasRestoredRef.current &&
            Number.isFinite(initialTime) &&
            initialTime > 0 &&
            vidDuration > 0 &&
            initialTime < vidDuration
          ) {
            vid.currentTime = initialTime;
            setCurrentTime(initialTime);
            latestTimeRef.current = { currentTime: initialTime, duration: vidDuration };
          }
          hasRestoredRef.current = true;
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          const ct = v.currentTime || 0;
          const dur = v.duration || 0;
          setCurrentTime(ct);
          latestTimeRef.current = { currentTime: ct, duration: dur };

          if (v.buffered && v.buffered.length > 0) {
            setBufferedEnd(v.buffered.end(v.buffered.length - 1));
          }

          if (!v.paused && dur > 0 && ct > 0) {
            const now = Date.now();
            if (now - lastSavedAtRef.current >= 5000) {
              lastSavedAtRef.current = now;
              onProgressRef.current?.({ currentTime: ct, duration: dur });
            }
          }
        }}
        onError={(e) => {
          stopBufferingImmediately();
          setIsPlaying(false);
          setVideoError(getMediaErrorInfo(e.currentTarget?.error));
        }}
        className="w-full h-full object-contain bg-black cursor-pointer"
      >
        {hasSubtitles &&
          activeSubtitles.map((sub) => (
            <track
              key={`${activeSrc}-${sub.id || sub.language}`}
              kind={sub.kind || 'subtitles'}
              src={sub.src}
              srcLang={sub.language}
              label={sub.label}
              default={Boolean(sub.default)}
            />
          ))}
      </video>

      {/* Rendered WebVTT Subtitle Overlay (styled via user preferences) */}
      {hasSubtitles && activeSubtitleLang !== 'off' && activeCueText && !videoError && (
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-4 bottom-20 sm:bottom-24 z-20 flex justify-center text-center"
        >
          <span
            className={`inline-block max-w-3xl whitespace-pre-line font-medium text-[#F3EEE4] leading-snug px-3 py-1 rounded-lg ${subtitleSizeClass} ${
              subtitlePrefs.backgroundEnabled
                ? 'bg-black/80 shadow-lg'
                : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]'
            }`}
          >
            {activeCueText}
          </span>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && !videoError && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 pointer-events-none z-20"
        >
          <Loader2 className="w-10 h-10 text-[#F2B84B] animate-spin motion-reduce:animate-none" />
          {isStalled && (
            <span className="px-3 py-1 rounded-full bg-[#1D1C1A]/90 border border-[#2A2926] text-[11px] font-medium text-[#AAA49A]">
              Slow connection — buffering...
            </span>
          )}
        </div>
      )}

      {/* Video Playback Error Overlay */}
      {videoError && (
        <div
          role="alert"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#121212]/95 p-5 sm:p-6 text-center space-y-3"
        >
          <AlertCircle className="w-10 h-10 text-[#E58B43]" />
          <p className="text-sm sm:text-base font-semibold text-[#F3EEE4]">
            {videoError.message}
          </p>
          <p className="text-xs text-[#AAA49A] max-w-sm leading-relaxed">
            {retryCount >= MAX_RETRY_ATTEMPTS
              ? 'Maximum retry attempts reached. Please verify your connection or return to details.'
              : videoError.detail}
          </p>
          <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
            {videoError.recoverable !== false && retryCount < MAX_RETRY_ATTEMPTS && (
              <button
                type="button"
                onClick={handleRetryVideo}
                aria-label="Retry playback"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#F2B84B] text-[#121212] hover:bg-[#E58B43] transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Playback</span>
              </button>
            )}
            {backTo && (
              <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#1D1C1A] border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/50 hover:text-[#F2B84B] transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{backLabel}</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Center Play Overlay when Paused */}
      {!isPlaying && !isBuffering && !videoError && !showNextOverlay && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play video"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
        >
          <span className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-[#F2B84B] to-[#E58B43] text-[#121212] flex items-center justify-center shadow-2xl shadow-[#F2B84B]/30 hover:scale-105 transition-transform motion-reduce:transition-none">
            <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />
          </span>
        </button>
      )}

      {/* Next Episode Countdown Overlay (TV Episodes only when nextEpisode exists) */}
      {showNextOverlay && nextEpisode && !videoError && (
        <div
          role="region"
          aria-label="Next episode countdown"
          aria-live="polite"
          className="absolute inset-0 z-30 flex items-end sm:items-center justify-center sm:justify-end bg-black/75 p-4 sm:p-8"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#1D1C1A]/95 border border-[#2A2926] shadow-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#F2B84B]">
                  {autoNextEnabled
                    ? `Next Episode in ${nextCountdown}s`
                    : 'Up Next (Auto Next Off)'}
                </p>
                <p className="text-xs font-medium text-[#AAA49A] mt-0.5">
                  {nextEpisode.label}
                </p>
                <h3 className="text-sm sm:text-base font-bold text-[#F3EEE4] truncate mt-0.5">
                  {nextEpisode.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCancelNextOverlay}
                aria-label="Cancel next episode"
                className="p-1.5 rounded-lg text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={triggerPlayNext}
                aria-label={`Play next episode ${nextEpisode.label}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#F2B84B] to-[#E58B43] text-[#121212] hover:from-[#e2ab42] hover:to-[#d67e37] transition-all motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Next Episode</span>
              </button>
              <button
                type="button"
                onClick={handleCancelNextOverlay}
                aria-label="Cancel autoplay"
                className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#121212] border border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/50 transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Intro / Skip Recap / End Credits (only when valid metadata timestamps exist) */}
      {(showSkipIntro || showSkipRecap || inEndCredits) && !videoError && !showNextOverlay && (
        <div className="absolute right-3 sm:right-4 bottom-20 sm:bottom-24 z-25 flex items-center gap-2">
          {showSkipIntro && (
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  const target =
                    duration > 0
                      ? Math.min(effectiveIntroWindow.end, duration)
                      : effectiveIntroWindow.end;
                  videoRef.current.currentTime = target;
                  setCurrentTime(target);
                }
              }}
              aria-label="Skip intro"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#1D1C1A]/95 border border-[#F2B84B]/60 text-[#F3EEE4] hover:bg-[#F2B84B] hover:text-[#121212] shadow-lg transition-all motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
            >
              <FastForward className="w-4 h-4" />
              <span>Skip Intro</span>
            </button>
          )}
          {showSkipRecap && (
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  const target =
                    duration > 0
                      ? Math.min(effectiveRecapWindow.end, duration)
                      : effectiveRecapWindow.end;
                  videoRef.current.currentTime = target;
                  setCurrentTime(target);
                }
              }}
              aria-label="Skip recap"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#1D1C1A]/95 border border-[#F2B84B]/60 text-[#F3EEE4] hover:bg-[#F2B84B] hover:text-[#121212] shadow-lg transition-all motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
            >
              <FastForward className="w-4 h-4" />
              <span>Skip Recap</span>
            </button>
          )}
          {inEndCredits && !showSkipIntro && !showSkipRecap && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#1D1C1A]/90 border border-[#2A2926] text-[#AAA49A]">
                End Credits
              </span>
              {nextEpisode && onPlayNext && (
                <button
                  type="button"
                  onClick={triggerPlayNext}
                  aria-label={`Play next episode ${nextEpisode.label}`}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#F2B84B] text-[#121212] hover:bg-[#E58B43] shadow-lg transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
                >
                  <span>Next Episode</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Controls Bar */}
      {!videoError && !showNextOverlay && (
        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-3 sm:px-5 pt-8 sm:pt-10 pb-2.5 sm:pb-4 transition-opacity duration-300 motion-reduce:transition-none ${
            showControls || !isPlaying || isSettingsOpen
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Seek Bar */}
          <div className="relative w-full h-6 sm:h-4 flex items-center mb-1.5 sm:mb-2 group/seek">
            <div className="w-full h-1.5 rounded-full bg-[#2A2926] overflow-hidden relative">
              <div
                className="absolute inset-y-0 left-0 bg-white/25 rounded-full"
                style={{ width: `${bufferedPercent}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#F2B84B] to-[#E58B43] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek video"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration || 0)}
              aria-valuenow={Math.round(currentTime)}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-none"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 text-[#F3EEE4]">
            {/* Left Controls: Play/Pause, Volume, Time */}
            <div className="flex items-center gap-1.5 sm:gap-3.5 min-w-0">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-[#F2B84B] transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted || volume === 0 ? 'Unmute' : 'Mute'}
                  className="p-2 rounded-lg hover:bg-white/10 hover:text-[#F2B84B] transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-[#E58B43]" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((isMuted ? 0 : volume) * 100)}
                  aria-valuetext={`${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  className="hidden sm:block w-16 md:w-20 accent-[#F2B84B] cursor-pointer h-1"
                />
              </div>

              <div className="text-[11px] sm:text-xs font-mono text-[#AAA49A] whitespace-nowrap">
                <span className="text-[#F3EEE4] font-medium">{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Settings Menu & Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <div className="relative" ref={settingsRef}>
                <button
                  ref={settingsButtonRef}
                  type="button"
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                  aria-label="Player settings"
                  aria-expanded={isSettingsOpen}
                  aria-haspopup="dialog"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B] ${
                    isSettingsOpen
                      ? 'bg-[#1D1C1A] border-[#F2B84B]/70 text-[#F2B84B]'
                      : 'bg-[#1D1C1A]/80 border-[#2A2926] text-[#F3EEE4] hover:border-[#F2B84B]/50 hover:text-[#F2B84B]'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-[#F2B84B]" />
                  <span className="hidden sm:inline">{playbackRate}x</span>
                </button>

                {isSettingsOpen && (
                  <div
                    role="dialog"
                    aria-label="Playback settings"
                    className="absolute right-0 bottom-full mb-2 w-64 max-w-[calc(100vw-2rem)] max-h-[65vh] overflow-y-auto rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl p-3 z-30 space-y-3"
                  >
                    {/* Playback Speed */}
                    <div className="space-y-1.5">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#AAA49A]">
                        Playback Speed
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PLAYBACK_SPEEDS.map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => handleSpeedChange(speed)}
                            className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              playbackRate === speed
                                ? 'bg-[#F2B84B] text-[#121212]'
                                : 'bg-[#121212] text-[#AAA49A] hover:text-[#F3EEE4] border border-[#2A2926]'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto Next Episode Toggle (TV Playback only) */}
                    {showAutoNextOption && (
                      <div className="pt-2.5 border-t border-[#2A2926] flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-xs font-semibold text-[#F3EEE4]">
                            Auto Next Episode
                          </span>
                          <span className="block text-[10px] text-[#AAA49A]">
                            Play next episode automatically
                          </span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={autoNextEnabled}
                          onClick={() => onAutoNextChange?.(!autoNextEnabled)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                            autoNextEnabled ? 'bg-[#F2B84B]' : 'bg-[#2A2926]'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#121212] shadow transition ${
                              autoNextEnabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {/* Subtitles & Appearance (only when source provides real tracks) */}
                    {hasSubtitles && (
                      <div className="pt-2.5 border-t border-[#2A2926] space-y-2.5">
                        <div className="space-y-1.5">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#AAA49A]">
                            Subtitles
                          </span>
                          <div className="space-y-1">
                            <button
                              type="button"
                              onClick={() => handleSubtitleChange('off')}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                                activeSubtitleLang === 'off'
                                  ? 'bg-[#F2B84B]/15 text-[#F2B84B] font-semibold'
                                  : 'text-[#AAA49A] hover:text-[#F3EEE4]'
                              }`}
                            >
                              <span>Off</span>
                              {activeSubtitleLang === 'off' && <Check className="w-3.5 h-3.5" />}
                            </button>
                            {activeSubtitles.map((sub) => (
                              <button
                                key={sub.id || sub.language}
                                type="button"
                                onClick={() => handleSubtitleChange(sub.language)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                                  activeSubtitleLang === sub.language
                                    ? 'bg-[#F2B84B]/15 text-[#F2B84B] font-semibold'
                                    : 'text-[#AAA49A] hover:text-[#F3EEE4]'
                                }`}
                              >
                                <span>{sub.label}</span>
                                {activeSubtitleLang === sub.language && (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Subtitle Appearance */}
                        <div className="pt-2 border-t border-[#2A2926]/70 space-y-2">
                          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#AAA49A]">
                            Subtitle Style
                          </span>
                          <div className="grid grid-cols-3 gap-1">
                            {['small', 'medium', 'large'].map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => handleSubtitlePrefsChange({ fontSize: size })}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold capitalize cursor-pointer ${
                                  subtitlePrefs.fontSize === size
                                    ? 'bg-[#F2B84B] text-[#121212]'
                                    : 'bg-[#121212] text-[#AAA49A] hover:text-[#F3EEE4] border border-[#2A2926]'
                                }`}
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#AAA49A]">Text Background</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={subtitlePrefs.backgroundEnabled}
                              onClick={() =>
                                handleSubtitlePrefsChange({
                                  backgroundEnabled: !subtitlePrefs.backgroundEnabled,
                                })
                              }
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                                subtitlePrefs.backgroundEnabled ? 'bg-[#F2B84B]' : 'bg-[#2A2926]'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-[#121212] shadow transition ${
                                  subtitlePrefs.backgroundEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Audio Track Selection (only when browser/source exposes > 1 real audio track) */}
                    {hasMultipleAudioTracks && (
                      <div className="pt-2.5 border-t border-[#2A2926] space-y-1.5">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#AAA49A]">
                          Audio Track
                        </span>
                        <div className="space-y-1">
                          {audioTracks.map((track) => (
                            <button
                              key={track.index}
                              type="button"
                              onClick={() => handleAudioTrackChange(track.index)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                                activeAudioTrackIdx === track.index
                                  ? 'bg-[#F2B84B]/15 text-[#F2B84B] font-semibold'
                                  : 'text-[#AAA49A] hover:text-[#F3EEE4]'
                              }`}
                            >
                              <span className="truncate">{track.label}</span>
                              {activeAudioTrackIdx === track.index && (
                                <Check className="w-3.5 h-3.5 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quality Sources (only when multiple quality variants exist) */}
                    {hasMultipleQualities && (
                      <div className="pt-2.5 border-t border-[#2A2926] space-y-1.5">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#AAA49A]">
                          Quality
                        </span>
                        <div className="space-y-1">
                          {qualitySources.map((q) => (
                            <button
                              key={q.label}
                              type="button"
                              onClick={() => handleQualityChange(q.src)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                                activeSrc === q.src
                                  ? 'bg-[#F2B84B]/15 text-[#F2B84B] font-semibold'
                                  : 'text-[#AAA49A] hover:text-[#F3EEE4]'
                              }`}
                            >
                              <span>{q.label}</span>
                              {activeSrc === q.src && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Playback Source Selector (only when multiple legitimate sources exist) */}
                    {hasMultipleSources && (
                      <div className="pt-2.5 border-t border-[#2A2926] space-y-1.5">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#AAA49A]">
                          Playback Source
                        </span>
                        <div className="space-y-1">
                          {sources.map((source) => (
                            <button
                              key={source.id || source.url}
                              type="button"
                              onClick={() => handleQualityChange(source.url)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer ${
                                activeSrc === source.url
                                  ? 'bg-[#F2B84B]/15 text-[#F2B84B] font-semibold'
                                  : 'text-[#AAA49A] hover:text-[#F3EEE4]'
                              }`}
                            >
                              <span className="truncate">{source.label || source.type}</span>
                              {activeSrc === source.url && <Check className="w-3.5 h-3.5 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="p-2 rounded-lg hover:bg-white/10 hover:text-[#F2B84B] transition-colors motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2B84B]"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
