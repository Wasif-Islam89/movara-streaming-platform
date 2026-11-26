import MovieRow from './MovieRow';
import POSTERS from '../assets/posters/index.jsx';

// Dedicated unique cinematic posters for Real Popular Movies
const DEFAULT_POPULAR_MOVIES = [
  {
    id: 'avatar-the-way-of-water',
    title: 'Avatar: The Way of Water',
    year: '2022',
    rating: 7.7,
    posterUrl: POSTERS['avatar-way-of-water'],
    mediaType: 'movie',
  },
  {
    id: 'avengers-endgame',
    title: 'Avengers: Endgame',
    year: '2019',
    rating: 8.4,
    posterUrl: POSTERS['avengers-endgame'],
    mediaType: 'movie',
  },
  {
    id: 'spider-man-no-way-home',
    title: 'Spider-Man: No Way Home',
    year: '2021',
    rating: 8.2,
    posterUrl: POSTERS['spider-man-no-way-home'],
    mediaType: 'movie',
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    year: '2017',
    rating: 8.0,
    posterUrl: POSTERS['blade-runner-2049'],
    mediaType: 'movie',
  },
  {
    id: 'the-matrix',
    title: 'The Matrix',
    year: '1999',
    rating: 8.7,
    posterUrl: POSTERS['the-matrix'],
    mediaType: 'movie',
  },
  {
    id: 'parasite',
    title: 'Parasite',
    year: '2019',
    rating: 8.5,
    posterUrl: POSTERS['parasite'],
    mediaType: 'movie',
  },
  {
    id: 'avengers-infinity-war',
    title: 'Avengers: Infinity War',
    year: '2018',
    rating: 8.4,
    posterUrl: POSTERS['avengers-infinity-war'],
    mediaType: 'movie',
  },
];

/**
 * PopularMovies Component for MOVORA.
 * 
 * Features:
 * - Dedicated component managing the Popular Movies row on the Home page
 * - Reuses the shared MovieRow and MovieCard components
 * - Horizontal scrolling and standard movie card navigation
 * 
 * @param {Object} props
 * @param {Array<Object>} [props.movies] - Optional movie list override.
 * @param {string} [props.className] - Additional wrapper CSS classes.
 */
export default function PopularMovies({
  movies = DEFAULT_POPULAR_MOVIES,
  isLoading = false,
  error = null,
  onRetry = null,
  className = '',
}) {
  return (
    <MovieRow
      title="Popular Movies"
      badge="Popular"
      movies={movies}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      className={className}
    />
  );
}
