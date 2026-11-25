import { useMemo, useEffect } from 'react';
import Hero from '../components/Hero';
import { 
  getKidsCartoons, 
  getKidsFantasy, 
  getKidsSciFi, 
  getKidsFamily 
} from '../services/movieService';
import MovieRow from '../components/MovieRow';

// Curated Featured Real Kids Titles for the Hero Section
const KIDS_HERO_MOVIES = [
  {
    id: 'inside-out-2',
    title: 'Inside Out 2',
    year: '2024',
    duration: '1h 36m',
    genre: 'Animation • Family • Comedy',
    description:
      'Teenager Riley\'s mind headquarters undergoes a sudden demolition to make room for unexpected emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up with brand new crew members.',
    detailsLink: '/movie/inside-out-2',
    trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'the-lion-king',
    title: 'The Lion King',
    year: '1994',
    duration: '1h 28m',
    genre: 'Animation • Drama • Family',
    description:
      'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself. Guided by wise mentors, Simba must grow to reclaim his rightful place in the Pride Lands.',
    detailsLink: '/movie/the-lion-king',
    trailerUrl: 'https://www.youtube.com/watch?v=lFzVJEksoDY',
    backdropUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'coco',
    title: 'Coco',
    year: '2017',
    duration: '1h 45m',
    genre: 'Animation • Family • Fantasy',
    description:
      'Aspiring musician Miguel, confronted with his family\'s ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer, and unlock the truth of his heritage.',
    detailsLink: '/movie/coco',
    trailerUrl: 'https://www.youtube.com/watch?v=Rvr68u635R8',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'kung-fu-panda-4',
    title: 'Kung Fu Panda 4',
    year: '2024',
    duration: '1h 34m',
    genre: 'Animation • Action • Comedy',
    description:
      'After Po is tapped to become the Spiritual Leader of the Valley of Peace, he needs to find and train a new Dragon Warrior, while a wicked sorceress plans to re-summon all master villains.',
    detailsLink: '/movie/kung-fu-panda-4',
    trailerUrl: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
    backdropUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=1920&q=80',
  },
];

export default function Kids() {
  const cartoons = useMemo(() => getKidsCartoons(), []);
  const fantasy = useMemo(() => getKidsFantasy(), []);
  const scifi = useMemo(() => getKidsSciFi(), []);
  const family = useMemo(() => getKidsFamily(), []);

  // Update browser tab title
  useEffect(() => {
    document.title = 'Kids & Family | MOVORA';
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] pb-24">
      
      {/* Kids Spotlight Hero Banner matching Home & TV Shows Hero format */}
      <Hero movies={KIDS_HERO_MOVIES} />

      {/* 4 Curated Kids Topic Rows (Netflix-style, aligned with Movies & TV Shows) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-6 pb-16">
        
        {/* Row 1: Animated Adventures */}
        <MovieRow
          title="Animated Adventures"
          badge="Popular"
          movies={cartoons}
        />

        {/* Row 2: Magical Worlds */}
        <MovieRow
          title="Magical Worlds"
          badge="Fantasy"
          movies={fantasy}
        />

        {/* Row 3: Space Quests */}
        <MovieRow
          title="Space Quests"
          badge="Sci-Fi"
          movies={scifi}
        />

        {/* Row 4: Family Fun */}
        <MovieRow
          title="Family Fun"
          badge="Comedy"
          movies={family}
        />
      </main>
    </div>
  );
}

