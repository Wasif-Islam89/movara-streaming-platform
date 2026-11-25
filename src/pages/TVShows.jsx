import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import {
  getTrendingTVShows,
  getTopRatedTVShows,
  getBingeWorthyTVShows,
  getCrimeMysteryTVShows,
  getSciFiWorldsTVShows,
} from '../services/tvService';

import heroTvBackdrop from '../assets/backgrounds/hero-tv-shows.jpg';

// Curated TV Show Genres for the Dropdown (7-8 categories)
const TV_GENRES = [
  'All Genres',
  'Action & Adventure',
  'Comedy',
  'Crime & Mystery',
  'Drama',
  'Horror & Supernatural',
  'Romance',
  'Sci-Fi & Fantasy',
  'Animation & Anime',
  'Documentary',
];

// Featured Spotlight Real TV Shows for the Hero Section
const TV_HERO_SHOWS = [
  {
    id: 'breaking-bad',
    title: 'Breaking Bad',
    badge: 'Masterpiece',
    rating: '9.5',
    year: '2008',
    duration: '5 Seasons',
    genre: 'Crime • Drama • Thriller',
    description:
      'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his familys future.',
    detailsLink: '/tv/breaking-bad',
    trailerUrl: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9faGSFi5jam6pDWGNdcu8f8L1gQ.jpg',
  },
  {
    id: 'the-last-of-us',
    title: 'The Last of Us',
    badge: 'Critically Acclaimed',
    rating: '8.8',
    year: '2023',
    duration: '1 Season',
    genre: 'Drama • Post-Apocalyptic • Action',
    description:
      'Twenty years after modern civilization has been destroyed, Joel is hired to smuggle 14-year-old Ellie out of an oppressive quarantine zone.',
    detailsLink: '/tv/the-last-of-us',
    trailerUrl: 'https://www.youtube.com/watch?v=uLtkt8BonwM',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
  },
  {
    id: 'stranger-things',
    title: 'Stranger Things',
    badge: 'Global Phenomenon',
    rating: '8.7',
    year: '2016',
    duration: '4 Seasons',
    genre: 'Sci-Fi • Horror • Supernatural',
    description:
      'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    detailsLink: '/tv/stranger-things',
    trailerUrl: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
  },
  {
    id: 'the-vampire-diaries',
    title: 'The Vampire Diaries',
    badge: 'Binge Worthy Series',
    rating: '8.9',
    year: '2009',
    duration: '8 Seasons',
    genre: 'Drama • Supernatural • Romance',
    description:
      'Ian Somerhalder and Nina Dobrev star in this soapy teen drama where two vampire brothers battle for the soul of Elena Gilbert and the fate of Mystic Falls.',
    detailsLink: '/tv/the-vampire-diaries',
    trailerUrl: 'https://www.youtube.com/watch?v=BmVmhjjkN4E',
    backdropUrl: heroTvBackdrop,
  },
];

export default function TVShows() {
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Update browser tab title
  useEffect(() => {
    document.title = 'TV Shows | MOVORA';
  }, []);

  // Close dropdown on outside click or Escape key
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

  // Filter shows if a specific genre is selected
  const filterByGenre = (list) => {
    if (selectedGenre === 'All Genres') return list;
    const keywords = selectedGenre
      .split('&')
      .map((k) => k.trim().toLowerCase());
    return list.filter((item) => {
      const showGenre = (item.genre || '').toLowerCase();
      return keywords.some((kw) => showGenre.includes(kw));
    });
  };

  const trendingShows = filterByGenre(getTrendingTVShows());
  const topRatedShows = filterByGenre(getTopRatedTVShows());
  const bingeShows = filterByGenre(getBingeWorthyTVShows());
  const crimeShows = filterByGenre(getCrimeMysteryTVShows());
  const scifiShows = filterByGenre(getSciFiWorldsTVShows());

  const hasAnyMatches =
    trendingShows.length > 0 ||
    topRatedShows.length > 0 ||
    bingeShows.length > 0 ||
    crimeShows.length > 0 ||
    scifiShows.length > 0;

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4]">
      
      {/* Top Header Bar: "TV Shows" + "Genres ▾" Dropdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#F3EEE4] tracking-tight">
            TV Shows
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
                aria-label="Filter TV Shows by Genre"
                className="absolute left-0 mt-1.5 w-52 sm:w-56 max-h-72 overflow-y-auto rounded-lg bg-[#1D1C1A] border border-[#2A2926] shadow-xl shadow-black/90 p-1 z-50 backdrop-blur-md animate-fadeIn focus:outline-none [scrollbar-width:thin]"
              >
                {TV_GENRES.map((genre) => {
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

      {/* Featured TV Shows Hero Spotlight */}
      <Hero movies={TV_HERO_SHOWS} />

      {/* TV Shows Movie Rows Content - 5 Rows */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-4 pb-16">
        {hasAnyMatches ? (
          <>
            {/* Row 1: Trending TV Series */}
            {trendingShows.length > 0 && (
              <MovieRow
                title="Trending TV Shows"
                badge="Popular"
                movies={trendingShows}
              />
            )}

            {/* Row 2: Top Rated Series */}
            {topRatedShows.length > 0 && (
              <MovieRow
                title="Top Rated Series"
                badge="Critically Acclaimed"
                movies={topRatedShows}
              />
            )}

            {/* Row 3: Fan-Favorite & Binge-Worthy Series */}
            {bingeShows.length > 0 && (
              <MovieRow
                title="Fan Favorites & Binge Hits"
                badge="Must Watch"
                movies={bingeShows}
              />
            )}

            {/* Row 4: Crime, Mystery & Suspense */}
            {crimeShows.length > 0 && (
              <MovieRow
                title="Crime, Mystery & Suspense"
                badge="Edge of Your Seat"
                movies={crimeShows}
              />
            )}

            {/* Row 5: Sci-Fi, Epic Worlds & Anime */}
            {scifiShows.length > 0 && (
              <MovieRow
                title="Sci-Fi, Epic Worlds & Anime"
                badge="Extraordinary Worlds"
                movies={scifiShows}
              />
            )}
          </>
        ) : (
          <div className="py-16 text-center text-[#AAA49A]">
            <p className="text-base font-medium text-[#F3EEE4]">
              No TV shows found in {selectedGenre}.
            </p>
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

    </div>
  );
}
