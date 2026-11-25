import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import Hero from '../components/Hero';
import MovieCard from '../components/MovieCard';
import MovieRow from '../components/MovieRow';
import { 
  getAllMovies, 
  getBollywoodMovies, 
  getActionMovies, 
  getAdventureMovies, 
  getFantasyMovies, 
  getThrillerMovies 
} from '../services/movieService';

// Curated Movie Genres for the Dropdown (including Action, Adventure, Bollywood, Thriller)
const MOVIE_GENRES = [
  'All Genres',
  'Action',
  'Adventure',
  'Bollywood',
  'Dark Fantasy',
  'Crime & Mystery',
  'Drama',
  'Animation',
  'Thriller',
];

// Curated Featured Spotlight Real Movies for the Hero Section
const MOVIE_HERO_MOVIES = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    year: '2024',
    duration: '2h 46m',
    genre: 'Sci-Fi • Epic Adventure',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between love and the fate of the universe, he endeavours to prevent a terrible future.',
    detailsLink: '/movie/dune-part-two',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
  },
  {
    id: 'jawan',
    title: 'Jawan',
    year: '2023',
    duration: '2h 49m',
    genre: 'Bollywood • Action • Thriller',
    description:
      'A high-stakes emotional journey of a prison warden who, driven by a personal vendetta and a sense of justice, recruits an army of women inmates to fight systemic corruption and protect the common man.',
    detailsLink: '/movie/jawan',
    trailerUrl: 'https://www.youtube.com/watch?v=COv52Qyctws',
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    year: '2023',
    duration: '3h 00m',
    genre: 'Biography • Drama • History',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb, examining the moral dilemmas and political fallout that forever changed humanity.',
    detailsLink: '/movie/oppenheimer',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
  },
  {
    id: 'rrr',
    title: 'RRR: Rise Roar Revolt',
    year: '2022',
    duration: '3h 07m',
    genre: 'Bollywood • Action • Epic Period',
    description:
      'A fearless revolutionary and an upright British-Indian officer forge an unbreakable friendship unaware of each other\'s identities, sparking an explosive historic uprising against colonial rule.',
    detailsLink: '/movie/rrr',
    trailerUrl: 'https://www.youtube.com/watch?v=NgBoAMXJ6iE',
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1920&q=80',
  },
];

export default function Movies() {
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Update browser tab title
  useEffect(() => {
    document.title = 'Movies | MOVORA';
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGenresOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsGenresOpen(false);
      }
    }

    if (isGenresOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGenresOpen]);

  const allMovies = getAllMovies ? getAllMovies() : [];
  const bollywoodMovies = getBollywoodMovies ? getBollywoodMovies() : [];
  const actionMovies = getActionMovies ? getActionMovies() : [];
  const adventureMovies = getAdventureMovies ? getAdventureMovies() : [];
  const fantasyMovies = getFantasyMovies ? getFantasyMovies() : [];
  const thrillerMovies = getThrillerMovies ? getThrillerMovies() : [];

  // Filter movies if a specific genre is selected
  const filteredMovies = selectedGenre === 'All Genres'
    ? allMovies
    : allMovies.filter((movie) => {
        if (selectedGenre.toLowerCase() === 'bollywood') {
          return movie.isBollywood || movie.genre?.toLowerCase().includes('bollywood');
        }

        const keywords = selectedGenre
          .split('&')
          .map((k) => k.trim().toLowerCase());
        const movieGenre = (movie.genre || '').toLowerCase();
        return keywords.some((kw) => movieGenre.includes(kw));
      });

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4]">
      
      {/* Top Header Bar: "Movies" + "Genres ▾" Dropdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3EEE4] tracking-tight">
            Movies
          </h1>

          {/* Genres Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsGenresOpen((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md border transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40 ${
                isGenresOpen || selectedGenre !== 'All Genres'
                  ? 'bg-[#1D1C1A] text-[#F2B84B] border-[#F2B84B]/80 shadow-sm'
                  : 'bg-[#1D1C1A]/90 text-[#F3EEE4] border-[#2A2926] hover:border-[#F2B84B]/50 hover:text-[#F2B84B]'
              }`}
              aria-expanded={isGenresOpen}
              aria-haspopup="listbox"
              title="Filter by Genre"
            >
              <span>{selectedGenre === 'All Genres' ? 'Genres' : selectedGenre}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isGenresOpen ? 'rotate-180 text-[#F2B84B]' : 'text-[#AAA49A]'
                }`}
                aria-hidden="true"
              />
            </button>

            {/* Dropdown Menu Overlay */}
            {isGenresOpen && (
              <div 
                role="listbox"
                aria-label="Filter Movies by Genre"
                className="absolute left-0 mt-1.5 w-52 sm:w-56 max-h-72 overflow-y-auto rounded-lg bg-[#1D1C1A] border border-[#2A2926] shadow-xl shadow-black/90 p-1 z-50 backdrop-blur-md animate-fadeIn focus:outline-none [scrollbar-width:thin]"
              >
                {MOVIE_GENRES.map((genre) => {
                  const isSelected = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedGenre(genre);
                        setIsGenresOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2B84B]/15 text-[#F2B84B] font-semibold'
                          : 'text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#2A2926]/60'
                      }`}
                    >
                      <span>{genre}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#F2B84B]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Movies Hero Spotlight */}
      <Hero movies={MOVIE_HERO_MOVIES} />

      {/* Main Content: 5 Curated Topic Rows OR Filtered Grid */}
      {selectedGenre === 'All Genres' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-4 pb-16">
          
          {/* Topic 1: Bollywood Hits & Blockbusters (5 movies) */}
          <MovieRow
            title="Bollywood Blockbusters"
            badge="Trending Cinema"
            movies={bollywoodMovies}
          />

          {/* Topic 2: High-Octane Action (5 movies) */}
          <MovieRow
            title="Action Movies"
            badge="Adrenaline"
            movies={actionMovies}
          />

          {/* Topic 3: Adventure Movies (5 movies) */}
          <MovieRow
            title="Adventure Movies"
            badge="Exploration"
            movies={adventureMovies}
          />

          {/* Topic 4: Dark Fantasy & Epic Sagas (5 movies) */}
          <MovieRow
            title="Dark Fantasy & Sagas"
            badge="Mythical"
            movies={fantasyMovies}
          />

          {/* Topic 5: Thriller Movies (5 movies) */}
          <MovieRow
            title="Thriller Movies"
            badge="Suspense"
            movies={thrillerMovies}
          />

        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-16">
          <p className="text-xs sm:text-sm text-[#AAA49A] mb-5">
            Showing {filteredMovies.length} {filteredMovies.length === 1 ? 'title' : 'titles'} in{' '}
            <span className="text-[#F2B84B] font-semibold">{selectedGenre}</span>
          </p>

          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-[#AAA49A]">
              <p className="text-base font-medium text-[#F3EEE4]">No movies found in this genre.</p>
              <button
                type="button"
                onClick={() => setSelectedGenre('All Genres')}
                className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-[#F2B84B] text-[#121212] hover:bg-[#E58B43] transition-colors cursor-pointer"
              >
                Reset to All Genres
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}


