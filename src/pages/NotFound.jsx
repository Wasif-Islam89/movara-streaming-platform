import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

/**
 * MOVORA 404 (Not Found) Page
 *
 * Cinematic error page adhering to MOVORA's dark theme:
 * - Background: #121212
 * - Surface: #1D1C1A
 * - Accents: #F2B84B / #E58B43
 * - Text: #F3EEE4 / #AAA49A
 */
export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] py-16 px-4 sm:px-6 lg:px-8 text-center max-w-2xl mx-auto animate-fadeIn select-none">
      {/* Prominent 404 Heading */}
      <div className="relative">
        <span className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#F3EEE4] via-[#F2B84B] to-[#E58B43] select-none leading-none drop-shadow-md">
          404
        </span>
      </div>

      {/* Title */}
      <h1 className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold text-[#F3EEE4] tracking-tight">
        Lost in the Movies?
      </h1>

      {/* Description */}
      <p className="mt-3 text-sm sm:text-base md:text-lg text-[#AAA49A] max-w-md mx-auto leading-relaxed">
        The scene you're looking for doesn't exist or has been cut from the final reel. Let's get you back to the main feature.
      </p>

      {/* Return Action */}
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm sm:text-base text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#f5c366] hover:to-[#eb9955] transition-all duration-200 shadow-lg shadow-[#F2B84B]/15 active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
