import { getAllMovies, normalizeTmdbMovie } from './movieService';
import { getAllTVShows, normalizeTmdbTVShow } from './tvService';
import { tmdbApi, isApiConfigured } from './api';

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

const SEARCH_CACHE = new Map();

/**
 * Async TMDB-ready Search Helpers (with AbortSignal, session cache & local catalog fallback)
 * @param {string} query
 * @param {Object} [options]
 * @param {'all' | 'movies' | 'tv'} [options.filter='all']
 * @param {number} [options.page=1]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ results: Array<Object>, page: number, totalPages: number, totalResults: number }>}
 */
export async function searchTMDB(query, { filter = 'all', page = 1, signal } = {}) {
  const cleanQuery = typeof query === 'string' ? query.trim() : '';
  if (!cleanQuery) {
    return { results: [], page: 1, totalPages: 1, totalResults: 0 };
  }

  if (!isApiConfigured()) {
    const localResults = searchCatalog(cleanQuery, { filter });
    return { results: localResults, page: 1, totalPages: 1, totalResults: localResults.length };
  }

  const cacheKey = `${filter}:${page}:${cleanQuery.toLowerCase()}`;
  if (SEARCH_CACHE.has(cacheKey)) {
    return SEARCH_CACHE.get(cacheKey);
  }

  const fetchOptions = signal ? { signal } : undefined;
  let data;

  if (filter === 'movies') {
    data = await tmdbApi.searchMovies(cleanQuery, page, fetchOptions);
  } else if (filter === 'tv') {
    data = await tmdbApi.searchTV(cleanQuery, page, fetchOptions);
  } else {
    data = await tmdbApi.searchMulti(cleanQuery, page, fetchOptions);
  }

  const normalized = (data.results || [])
    .filter((item) => {
      if (filter === 'movies') return true;
      if (filter === 'tv') return true;
      return item.media_type === 'movie' || item.media_type === 'tv';
    })
    .map((item) => {
      const type = filter === 'movies' ? 'movie' : filter === 'tv' ? 'tv' : item.media_type;
      return type === 'tv' ? normalizeTmdbTVShow(item) : normalizeTmdbMovie(item);
    })
    .filter(Boolean);

  const payload = {
    results: normalized,
    page: data.page || 1,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || normalized.length,
  };

  SEARCH_CACHE.set(cacheKey, payload);
  return payload;
}

export async function searchMoviesTMDB(query, page = 1, signal) {
  return searchTMDB(query, { filter: 'movies', page, signal });
}

export async function searchTVTMDB(query, page = 1, signal) {
  return searchTMDB(query, { filter: 'tv', page, signal });
}
