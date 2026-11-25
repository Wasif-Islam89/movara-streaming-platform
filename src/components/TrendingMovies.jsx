import MovieRow from './MovieRow';
import POSTERS from '../assets/posters/index.jsx';

// Dedicated unique cinematic posters for Real Trending Movies
const DEFAULT_TRENDING_MOVIES = [
  {
    id: 'deadpool-and-wolverine',
    title: 'Deadpool & Wolverine',
    year: '2024',
    rating: 7.8,
    posterUrl: POSTERS['deadpool-and-wolverine'],
    mediaType: 'movie',
  },
  {
    id: 'gladiator-2',
    title: 'Gladiator II',
    year: '2024',
    rating: 6.8,
    posterUrl: POSTERS['gladiator-2'],
    mediaType: 'movie',
  },
  {
    id: 'alien-romulus',
    title: 'Alien: Romulus',
    year: '2024',
    rating: 7.3,
    posterUrl: POSTERS['alien-romulus'],
    mediaType: 'movie',
  },
  {
    id: 'spider-man-across-the-spider-verse',
    title: 'Across the Spider-Verse',
    year: '2023',
    rating: 8.6,
    posterUrl: POSTERS['across-the-spider-verse'],
    mediaType: 'movie',
  },
  {
    id: 'john-wick-4',
    title: 'John Wick: Chapter 4',
    year: '2023',
    rating: 7.7,
    posterUrl: POSTERS['john-wick-4'],
    mediaType: 'movie',
  },
  {
    id: 'top-gun-maverick',
    title: 'Top Gun: Maverick',
    year: '2022',
    rating: 8.2,
    posterUrl: POSTERS['top-gun-maverick'],
    mediaType: 'movie',
  },
  {
    id: 'the-batman',
    title: 'The Batman',
    year: '2022',
    rating: 7.7,
    posterUrl: POSTERS['the-batman'],
    mediaType: 'movie',
  },
];

/**
 * TrendingMovies Component for MOVORA.
 * 
 * Features:
 * - Dedicated component managing the Trending Movies row on the Home page
 * - Preserves existing heading, badge, subtitle, and local data
 * - Reuses the shared MovieRow and MovieCard components
 * 
 * @param {Object} props
 * @param {Array<Object>} [props.movies] - Optional movie list override.
 * @param {string} [props.className] - Additional wrapper CSS classes.
 */
export default function TrendingMovies({
  movies = DEFAULT_TRENDING_MOVIES,
  className = '',
}) {
  return (
    <MovieRow
      title="Trending Movies"
      badge="Trending"
      movies={movies}
      className={className}
    />
  );
}
