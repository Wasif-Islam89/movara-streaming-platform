/**
 * MOVORA API Client & TMDB Integration Layer
 * 
 * This module is configured and ready for external API integration (e.g. The Movie Database - TMDB).
 * When you obtain your TMDB API key, add it to your `.env` file:
 *   VITE_TMDB_API_KEY=your_actual_key_here
 *   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
 */

const TMDB_BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/';

/**
 * Check if the external API is configured
 */
export function isApiConfigured() {
  return Boolean(TMDB_API_KEY && TMDB_API_KEY.trim() !== '');
}

/**
 * Construct full TMDB image URL
 * @param {string} path - Poster or backdrop image path
 * @param {'w500' | 'w1280' | 'original'} [size='w500'] - Image resolution size
 * @returns {string} Full image URL or fallback placeholder
 */
export function getTmdbImageUrl(path, size = 'w500') {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${TMDB_IMAGE_BASE}${size}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Standard HTTP Fetch helper with error handling
 * @param {string} endpoint - API path (e.g., '/movie/popular')
 * @param {Record<string, any>} [params] - Optional query parameters
 */
export async function apiFetch(endpoint, params = {}) {
  if (!isApiConfigured()) {
    throw new Error('TMDB API Key is not configured. Please add VITE_TMDB_API_KEY to your .env file.');
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params,
  });

  const url = `${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}?${queryParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Request failed with status ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Ready-to-use API Service Endpoints
 * Use these functions once your API key is added:
 */
export const tmdbApi = {
  // Movies Endpoints
  getTrendingMovies: (timeWindow = 'week') => apiFetch(`/trending/movie/${timeWindow}`),
  getPopularMovies: (page = 1) => apiFetch('/movie/popular', { page }),
  getTopRatedMovies: (page = 1) => apiFetch('/movie/top_rated', { page }),
  getUpcomingMovies: (page = 1) => apiFetch('/movie/upcoming', { page }),
  getMovieDetails: (movieId) => apiFetch(`/movie/${movieId}`, { append_to_response: 'videos,credits,similar' }),

  // TV Shows Endpoints
  getTrendingTV: (timeWindow = 'week') => apiFetch(`/trending/tv/${timeWindow}`),
  getPopularTV: (page = 1) => apiFetch('/tv/popular', { page }),
  getTopRatedTV: (page = 1) => apiFetch('/tv/top_rated', { page }),
  getTVDetails: (tvId) => apiFetch(`/tv/${tvId}`, { append_to_response: 'videos,credits,similar' }),

  // Multi-Search Endpoint
  searchMulti: (query, page = 1) => apiFetch('/search/multi', { query, page }),
  searchMovies: (query, page = 1) => apiFetch('/search/movie', { query, page }),
  searchTV: (query, page = 1) => apiFetch('/search/tv', { query, page }),

  // Genres
  getMovieGenres: () => apiFetch('/genre/movie/list'),
  getTVGenres: () => apiFetch('/genre/tv/list'),
};

export default tmdbApi;
