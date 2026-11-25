import { getAllMovies } from './movieService';
import { getAllTVShows } from './tvService';

/**
 * Curated suggestions for discovery & instant search
 */
export const POPULAR_SEARCH_TERMS = [
  'Dune: Part Two',
  'Oppenheimer',
  'Interstellar',
  'The Dark Knight',
  'Deadpool & Wolverine',
  'Spider-Man',
  'Jawan',
  'RRR',
  'Sci-Fi',
  'Action'
];

/**
 * Multi-factor search across Movies and TV Shows catalog
 * @param {string} query - Raw user search input
 * @param {Object} [options]
 * @param {'all' | 'movies' | 'tv'} [options.filter='all'] - Filter by media type
 * @param {number|null} [options.limit=null] - Max results to return
 * @returns {Array<Object>} Sorted matching movies and tv shows
 */
export function searchCatalog(query, { filter = 'all', limit = null } = {}) {
  if (!query || typeof query !== 'string') return [];
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const movies = getAllMovies().map((m) => ({ ...m, mediaType: 'movie' }));
  const tvShows = getAllTVShows().map((t) => ({ ...t, mediaType: 'tv' }));

  let pool = [];
  if (filter === 'movies') {
    pool = movies;
  } else if (filter === 'tv') {
    pool = tvShows;
  } else {
    pool = [...movies, ...tvShows];
  }

  const scored = [];

  for (const item of pool) {
    const title = (item.title || '').toLowerCase();
    const genre = (item.genre || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const tagline = (item.tagline || '').toLowerCase();

    let score = 0;

    // Exact full title match
    if (title === cleanQuery) {
      score += 120;
    } else if (title.startsWith(cleanQuery)) {
      score += 80;
    } else if (title.includes(cleanQuery)) {
      score += 55;
    }

    // Word boundary matches in title (e.g. "Quantum" inside "The Quantum Enigma")
    const words = title.split(/[\s:•-]+/).filter(Boolean);
    if (words.some((w) => w === cleanQuery)) {
      score += 40;
    } else if (words.some((w) => w.startsWith(cleanQuery))) {
      score += 25;
    }

    // Match in genre, tagline, or synopsis
    if (genre.includes(cleanQuery)) {
      score += 20;
    }
    if (tagline.includes(cleanQuery)) {
      score += 15;
    }
    if (description.includes(cleanQuery)) {
      score += 10;
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  // Sort by relevance score first, then by rating
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.item.rating || 0) - (a.item.rating || 0);
  });

  const results = scored.map((s) => s.item);
  return limit ? results.slice(0, limit) : results;
}
