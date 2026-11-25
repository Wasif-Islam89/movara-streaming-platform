import MovieRow from './MovieRow';
import POSTERS from '../assets/posters/index.jsx';

// Dedicated unique cinematic posters for Top Rated Discoveries (Real Masterpieces)
const DEFAULT_TOP_RATED_MOVIES = [
  {
    id: 'the-shawshank-redemption',
    title: 'The Shawshank Redemption',
    year: '1994',
    rating: 9.3,
    posterUrl: POSTERS['shawshank-redemption'],
    mediaType: 'movie',
  },
  {
    id: 'the-godfather',
    title: 'The Godfather',
    year: '1972',
    rating: 9.2,
    posterUrl: POSTERS['the-godfather'],
    mediaType: 'movie',
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: '2014',
    rating: 8.7,
    posterUrl: POSTERS['interstellar'],
    mediaType: 'movie',
  },
  {
    id: 'inception',
    title: 'Inception',
    year: '2010',
    rating: 8.8,
    posterUrl: POSTERS['inception'],
    mediaType: 'movie',
  },
  {
    id: 'fight-club',
    title: 'Fight Club',
    year: '1999',
    rating: 8.8,
    posterUrl: POSTERS['fight-club'],
    mediaType: 'movie',
  },
  {
    id: 'pulp-fiction',
    title: 'Pulp Fiction',
    year: '1994',
    rating: 8.9,
    posterUrl: POSTERS['pulp-fiction'],
    mediaType: 'movie',
  },
  {
    id: 'the-lord-of-the-rings',
    title: 'The Lord of the Rings: ROTK',
    year: '2003',
    rating: 9.0,
    posterUrl: POSTERS['lord-of-the-rings'],
    mediaType: 'movie',
  },
];

/**
 * TopRatedDiscoveries Component for MOVORA.
 * 
 * Features:
 * - Dedicated component managing the Top Rated Discoveries row on the Home page
 * - Preserves existing heading, badge, subtitle, and local data
 * - Reuses the shared MovieRow and MovieCard components
 * 
 * @param {Object} props
 * @param {Array<Object>} [props.movies] - Optional movie list override.
 * @param {string} [props.className] - Additional wrapper CSS classes.
 */
export default function TopRatedDiscoveries({
  movies = DEFAULT_TOP_RATED_MOVIES,
  className = '',
}) {
  return (
    <MovieRow
      title="Top Rated Discoveries"
      badge="Top Rated"
      movies={movies}
      className={className}
    />
  );
}
