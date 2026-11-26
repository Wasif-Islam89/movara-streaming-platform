/**
 * MOVORA API Client & TMDB Integration Layer
 * 
 * This module is configured and ready for external API integration (e.g. The Movie Database - TMDB).
 * When you obtain your TMDB API key, add it to your `.env` file:
 *   VITE_TMDB_API_KEY=your_actual_key_here
 *   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
 */

const TMDB_BASE_URL = (import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3')
  .trim()
  .replace(/\/+$/, '');
const TMDB_API_KEY = (import.meta.env.VITE_TMDB_API_KEY || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');
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
 * Standard HTTP Fetch helper with consistent error handling and AbortSignal support
 * @param {string} endpoint - API path (e.g., '/movie/popular')
 * @param {Record<string, any>} [params] - Optional query parameters
 * @param {RequestInit} [options] - Optional fetch options (e.g., { signal })
 */
export async function apiFetch(endpoint, params = {}, options = {}) {
  if (!isApiConfigured()) {
    throw new Error('TMDB API Key is not configured. Please add VITE_TMDB_API_KEY to your .env file.');
  }

  const cleanParams = Object.entries({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params,
  }).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = String(value);
    }
    return acc;
  }, {});

  const queryParams = new URLSearchParams(cleanParams);
  const url = `${TMDB_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}?${queryParams.toString()}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw err;
    }
    throw new Error(`Network error while contacting TMDB: ${err?.message || 'Unable to reach server'}`);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const tmdbMessage = data?.status_message;
    let message = tmdbMessage || `API Request failed with status ${response.status}: ${response.statusText}`;

    if (response.status === 401) {
      message = tmdbMessage || 'TMDB authentication failed (401 Unauthorized). Check VITE_TMDB_API_KEY.';
    } else if (response.status === 404) {
      message = tmdbMessage || 'Requested TMDB resource was not found (404).';
    } else if (response.status === 429) {
      message = tmdbMessage || 'TMDB rate limit exceeded (429). Please retry shortly.';
    }

    const error = new Error(message);
    error.status = response.status;
    if (data?.status_code) {
      error.tmdbCode = data.status_code;
    }
    throw error;
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Unexpected empty or invalid JSON response from TMDB.');
  }

  return data;
}

/**
 * Ready-to-use API Service Endpoints
 * Use these functions once your API key is added:
 */
export const tmdbApi = {
  // Movies Endpoints
  getTrendingMovies: (timeWindow = 'week', page = 1, options) =>
    apiFetch(`/trending/movie/${timeWindow}`, { page }, options),
  getPopularMovies: (page = 1, options) =>
    apiFetch('/movie/popular', { page }, options),
  getTopRatedMovies: (page = 1, options) =>
    apiFetch('/movie/top_rated', { page }, options),
  getUpcomingMovies: (page = 1, options) =>
    apiFetch('/movie/upcoming', { page }, options),
  getMovieDetails: (movieId, options) =>
    apiFetch(`/movie/${movieId}`, { append_to_response: 'videos,credits,similar' }, options),
  getMovieCredits: (movieId, options) =>
    apiFetch(`/movie/${movieId}/credits`, {}, options),
  getMovieVideos: (movieId, options) =>
    apiFetch(`/movie/${movieId}/videos`, {}, options),
  getSimilarMovies: (movieId, page = 1, options) =>
    apiFetch(`/movie/${movieId}/similar`, { page }, options),
  discoverMovies: (params = {}, options) =>
    apiFetch('/discover/movie', params, options),

  // TV Shows Endpoints
  getTrendingTV: (timeWindow = 'week', page = 1, options) =>
    apiFetch(`/trending/tv/${timeWindow}`, { page }, options),
  getPopularTV: (page = 1, options) =>
    apiFetch('/tv/popular', { page }, options),
  getTopRatedTV: (page = 1, options) =>
    apiFetch('/tv/top_rated', { page }, options),
  getTVDetails: (tvId, options) =>
    apiFetch(`/tv/${tvId}`, { append_to_response: 'videos,credits,similar' }, options),
  getTVCredits: (tvId, options) =>
    apiFetch(`/tv/${tvId}/credits`, {}, options),
  getTVVideos: (tvId, options) =>
    apiFetch(`/tv/${tvId}/videos`, {}, options),
  getSimilarTV: (tvId, page = 1, options) =>
    apiFetch(`/tv/${tvId}/similar`, { page }, options),
  getTVSeasonDetails: (tvId, seasonNumber, options) =>
    apiFetch(`/tv/${tvId}/season/${seasonNumber}`, {}, options),
  getTVEpisodeDetails: (tvId, seasonNumber, episodeNumber, options) =>
    apiFetch(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {}, options),
  discoverTV: (params = {}, options) =>
    apiFetch('/discover/tv', params, options),

  // Multi-Search Endpoint
  searchMulti: (query, page = 1, options) =>
    apiFetch('/search/multi', { query, page }, options),
  searchMovies: (query, page = 1, options) =>
    apiFetch('/search/movie', { query, page }, options),
  searchTV: (query, page = 1, options) =>
    apiFetch('/search/tv', { query, page }, options),

  // Genres & Watch Providers & Configuration
  getMovieGenres: (options) => apiFetch('/genre/movie/list', {}, options),
  getTVGenres: (options) => apiFetch('/genre/tv/list', {}, options),
  getMovieWatchProviders: (movieId, options) =>
    apiFetch(`/movie/${movieId}/watch/providers`, {}, options),
  getTVWatchProviders: (tvId, options) =>
    apiFetch(`/tv/${tvId}/watch/providers`, {}, options),
  getConfiguration: (options) => apiFetch('/configuration', {}, options),
};

export default tmdbApi;
