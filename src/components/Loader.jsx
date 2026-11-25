import React from 'react';

/**
 * MOVORA Cinematic Loader Component
 * 
 * Reusable, accessible loading indicator aligned with MOVORA's
 * cinematic dark aesthetic (#121212 / #1D1C1A) and signature
 * warm gold (#F2B84B) and amber (#E58B43) accents.
 *
 * @param {Object} props
 * @param {string} [props.message="Loading..."] - Optional message displayed beneath loader
 * @param {string} [props.className=""] - Optional additional wrapper classes
 * @param {boolean} [props.fullScreen=false] - When true, expands min-height to 70vh
 */
export default function Loader({ message = "Loading...", className = "", fullScreen = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={`flex flex-col items-center justify-center py-12 px-4 w-full text-center select-none ${
        fullScreen ? 'min-h-[70vh]' : 'min-h-[240px]'
      } ${className}`}
    >
      {/* Circular Loading Animation with M Mark */}
      <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
        {/* Subtle background track ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#1D1C1A]" />

        {/* Outer elegant spinning gold & amber ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: '#F2B84B',
            borderRightColor: '#E58B43',
            animationDuration: '1.2s',
          }}
        />

        {/* Inner subtle reverse-spinning dashed ring */}
        <div
          className="absolute inset-2 sm:inset-2.5 rounded-full border border-dashed border-[#F2B84B]/35 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '3.6s' }}
        />

        {/* Center M Logo Mark */}
        <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1D1C1A] border border-[#F2B84B]/20 shadow-inner shadow-black/40">
          <span className="font-serif font-black text-sm sm:text-base tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-[#F2B84B] to-[#E58B43]">
            M
          </span>
        </div>
      </div>

      {/* Animated progress-style accent line */}
      <div className="mt-5 w-28 sm:w-36 h-1 bg-[#1D1C1A] rounded-full overflow-hidden border border-white/5">
        <div className="h-full bg-gradient-to-r from-[#F2B84B]/20 via-[#F2B84B] to-[#E58B43] rounded-full animate-pulse" />
      </div>

      {/* Loading message */}
      <p className="mt-3.5 text-sm sm:text-base font-medium text-[#F3EEE4] tracking-wide max-w-xs sm:max-w-md">
        {message}
      </p>

      {/* Screen-reader accessible label fallback */}
      <span className="sr-only">{message}</span>
    </div>
  );
}
