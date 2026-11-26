import MovieRow from './MovieRow';
import POSTERS from '../assets/posters/index.jsx';

// Curated real upcoming and anticipated movies
const DEFAULT_COMING_SOON_MOVIES = [
  {
    id: 'captain-america-brave-new-world',
    title: 'Captain America: Brave New World',
    year: '2025',
    rating: 8.4,
    posterUrl: POSTERS['captain-america-brave-new-world'],
    mediaType: 'movie',
  },
  {
    id: 'sonic-the-hedgehog-3',
    title: 'Sonic the Hedgehog 3',
    year: '2024',
    rating: 7.8,
    posterUrl: POSTERS['sonic-3'],
    mediaType: 'movie',
  },
  {
    id: 'wicked',
    title: 'Wicked',
    year: '2024',
    rating: 7.5,
    posterUrl: POSTERS['wicked'],
    mediaType: 'movie',
  },
  {
    id: 'dune-part-one',
    title: 'Dune: Part One',
    year: '2021',
    rating: 8.0,
    posterUrl: POSTERS['dune-1'],
    mediaType: 'movie',
  },
  {
    id: 'inside-out-2',
    title: 'Inside Out 2',
    year: '2024',
    rating: 7.7,
    posterUrl: POSTERS['inside-out-2'],
    mediaType: 'movie',
  },
  {
    id: 'despicable-me-4',
    title: 'Despicable Me 4',
    year: '2024',
    rating: 7.1,
    posterUrl: POSTERS['despicable-me-4'],
    mediaType: 'movie',
  },
];

/**
 * ComingSoon Component for MOVORA.
 * 
 * Features:
 * - Dedicated component managing the Coming Soon row on the Home page
 * - Strictly displays upcoming movies (no TV shows) from existing local data
 * - Reuses the shared MovieRow and MovieCard components
 * - Horizontal scrolling and standard movie card navigation
 * 
 * @param {Object} props
 * @param {Array<Object>} [props.movies] - Optional movie list override.
 * @param {string} [props.className] - Additional wrapper CSS classes.
 */
export default function ComingSoon({
  movies = DEFAULT_COMING_SOON_MOVIES,
  isLoading = false,
  error = null,
  onRetry = null,
  className = '',
}) {
  return (
    <MovieRow
      title="Coming Soon"
      badge="Upcoming"
      movies={movies}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      className={className}
    />
  );
}
