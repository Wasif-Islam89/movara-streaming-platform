import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Info, 
  Calendar, 
  Clock, 
  Film 
} from 'lucide-react';

// Curated Featured Real Cinematic Movies for the Automated Showcase
const DEFAULT_MOVIES = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    badge: 'MOVORA Spotlight',
    rating: '8.5',
    year: '2024',
    duration: '2h 46m',
    genre: 'Sci-Fi • Epic Adventure',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    detailsLink: '/movie/dune-part-two',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    badge: 'Academy Award Winner',
    rating: '8.9',
    year: '2023',
    duration: '3h 00m',
    genre: 'Biography • Drama • History',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, examining the moral dilemmas that redefined modern humanity.',
    detailsLink: '/movie/oppenheimer',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
  },
  {
    id: 'the-dark-knight',
    title: 'The Dark Knight',
    badge: 'All-Time Classic',
    rating: '9.0',
    year: '2008',
    duration: '2h 32m',
    genre: 'Action • Crime • Drama',
    description:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    detailsLink: '/movie/the-dark-knight',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
  },
];

const AUTO_SLIDE_INTERVAL = 6000; // 6 seconds per slide

/**
 * Premium Cinematic Hero Component for MOVORA.
 * 
 * Automatically transitions between featured titles on a timer
 * without visual clutter (no manual dots, arrows, or pause overlays).
 */
export default function Hero({ 
  movies = DEFAULT_MOVIES,
  interval = AUTO_SLIDE_INTERVAL 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = movies.length;

  // Reset slide index if the movies array shrinks or changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [totalSlides]);

  // Seamless continuous automated transition
  useEffect(() => {
    if (totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, totalSlides]);

  const currentMovie = movies[currentIndex] || movies[0];

  return (
    <section 
      aria-label="Featured Movies Spotlight"
      className="relative w-full overflow-hidden bg-[#121212] min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] xl:min-h-[720px] flex items-end"
    >
      {/* Background Slides with Smooth Cross-Fade Transition */}
      <div className="absolute inset-0 z-0">
        {movies.map((movie, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={movie.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={movie.backdropUrl}
                alt={movie.title}
                className={`w-full h-full object-cover object-center transform transition-transform duration-7000 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}

        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-transparent" />
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#121212]/95 via-[#121212]/75 to-transparent" />
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-[#121212]/70 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-10 z-20 w-96 h-96 bg-[#F2B84B]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-5">
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
            {currentMovie.year && (
              <span className="inline-flex items-center gap-1 text-[#AAA49A]">
                <Calendar className="w-3.5 h-3.5 text-[#AAA49A]" />
                {currentMovie.year}
              </span>
            )}

            {currentMovie.duration && (
              <span className="inline-flex items-center gap-1 text-[#AAA49A]">
                <Clock className="w-3.5 h-3.5 text-[#AAA49A]" />
                {currentMovie.duration}
              </span>
            )}

            {currentMovie.genre && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[#AAA49A] border-l border-[#2A2926] pl-3">
                <Film className="w-3.5 h-3.5 text-[#AAA49A]" />
                {currentMovie.genre}
              </span>
            )}
          </div>

          {/* Title with Smooth Fade-in Reveal */}
          <h1 
            key={`title-${currentIndex}`}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F3EEE4] tracking-tight leading-tight sm:leading-[1.15] drop-shadow-lg animate-fadeIn"
          >
            {currentMovie.title}
          </h1>

          {/* Short Synopsis */}
          <p 
            key={`desc-${currentIndex}`}
            className="text-sm sm:text-base lg:text-lg text-[#AAA49A] leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-2xl drop-shadow-sm animate-fadeIn"
          >
            {currentMovie.description}
          </p>

          {/* Action Buttons: Watch Trailer & View Details */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
            
            {/* Watch Trailer */}
            {currentMovie.trailerUrl ? (
              <a
                href={currentMovie.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#e2ab42] hover:to-[#d67e37] shadow-lg shadow-[#F2B84B]/20 hover:shadow-[#F2B84B]/35 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/60 cursor-pointer"
                aria-label={`Watch trailer for ${currentMovie.title} (opens in a new tab)`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch Trailer</span>
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-[#AAA49A] bg-[#1D1C1A]/70 border border-[#2A2926] cursor-not-allowed opacity-60"
                aria-disabled="true"
                title="Trailer currently unavailable"
              >
                <Play className="w-4 h-4 text-[#AAA49A]" />
                <span>Watch Trailer</span>
                <span className="text-xs text-[#AAA49A]/75">(Unavailable)</span>
              </button>
            )}

            {/* View Details */}
            {currentMovie.detailsLink ? (
              <Link
                to={currentMovie.detailsLink}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-medium text-sm sm:text-base text-[#F3EEE4] bg-[#1D1C1A]/90 hover:bg-[#1D1C1A] hover:text-[#F2B84B] border border-[#2A2926] hover:border-[#F2B84B]/40 shadow-md backdrop-blur-sm transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40"
                aria-label={`View details for ${currentMovie.title}`}
              >
                <Info className="w-4 h-4" />
                <span>View Details</span>
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm text-[#AAA49A] bg-[#1D1C1A]/70 border border-[#2A2926] cursor-not-allowed opacity-60"
                aria-disabled="true"
                title="Details currently unavailable"
              >
                <Info className="w-4 h-4" />
                <span>View Details</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
