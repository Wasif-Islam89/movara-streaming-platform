/**
 * Media Helper Utilities for MOVORA
 */

/**
 * Generate a consistent unique key for an item combining mediaType and ID.
 * Prevents key collision between a movie and a TV show with identical IDs.
 * @param {string|number} id
 * @param {'movie'|'tv'} [mediaType='movie']
 * @returns {string}
 */
export function getMediaKey(id, mediaType = 'movie') {
  if (id === undefined || id === null) return '';
  const cleanType = String(mediaType || 'movie').toLowerCase();
  return `${cleanType}-${String(id)}`;
}

/**
 * Normalize rating to a standard 1-decimal string (e.g., "8.9")
 * @param {string|number} rating
 * @returns {string}
 */
export function formatRating(rating) {
  if (rating === undefined || rating === null) return 'N/A';
  const num = Number(rating);
  return isNaN(num) ? String(rating) : num.toFixed(1);
}

/**
 * Get the appropriate detail URL for a media item
 * @param {string|number} id
 * @param {'movie'|'tv'} [mediaType='movie']
 * @returns {string}
 */
export function getMediaDetailUrl(id, mediaType = 'movie') {
  const type = String(mediaType || 'movie').toLowerCase();
  return type === 'tv' ? `/tv/${id}` : `/movie/${id}`;
}
