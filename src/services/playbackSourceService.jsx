/**
 * MOVORA Centralized Playback Source Management Service
 *
 * Resolves verified, legally usable playback sources for movies and TV episodes.
 * Extensible for future licensed streaming providers (Cloudflare Stream, Mux, authorized CDN).
 */

export const SUPPORTED_SOURCE_TYPES = ['demo', 'hosted'];

/**
 * Movie Playback Source Registry (keyed by stable TMDB ID or local slug ID).
 * Only explicitly registered titles with verified playable streams are listed here.
 */
const MOVIE_PLAYBACK_SOURCES = {
  // Sintel (2010, TMDB ID: 45745) — Full-length film, CC BY 3.0
  '45745': [
    {
      id: 'sintel-full-ia',
      url: 'https://archive.org/download/Sintel/sintel-2048-stereo.mp4',
      type: 'hosted',
      label: 'Full Film (CC BY 3.0)',
      language: 'English',
      available: true,
      attribution: {
        title: 'Sintel',
        creator: 'Blender Foundation',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
        sourceName: 'Blender Studio / Internet Archive',
        sourceUrl: 'https://studio.blender.org/films/sintel/',
      },
    },
  ],
  // Big Buck Bunny (2008, TMDB ID: 10378) — Full-length film, CC BY 3.0
  '10378': [
    {
      id: 'big-buck-bunny-full-ia',
      url: 'https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4',
      type: 'hosted',
      label: 'Full Film (CC BY 3.0)',
      language: 'English',
      available: true,
      attribution: {
        title: 'Big Buck Bunny',
        creator: 'Blender Foundation',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
        sourceName: 'Blender Studio / Internet Archive',
        sourceUrl: 'https://studio.blender.org/films/big-buck-bunny/',
      },
    },
  ],
  // Elephants Dream (2006, TMDB ID: 9761) — Full-length film, CC BY 2.5
  '9761': [
    {
      id: 'elephants-dream-full-ia',
      url: 'https://archive.org/download/ElephantsDream/ed_hd.mp4',
      type: 'hosted',
      label: 'Full Film (CC BY 2.5)',
      language: 'English',
      available: true,
      attribution: {
        title: 'Elephants Dream',
        creator: 'Blender Foundation & Netherlands Media Art Institute',
        license: 'CC BY 2.5',
        licenseUrl: 'https://creativecommons.org/licenses/by/2.5/',
        sourceName: 'Blender Studio / Internet Archive',
        sourceUrl: 'https://studio.blender.org/films/elephants-dream/',
      },
    },
  ],
  // Tears of Steel (2012, TMDB ID: 133701) — Full-length film, CC BY 3.0
  '133701': [
    {
      id: 'tears-of-steel-full-blender',
      url: 'https://download.blender.org/demo/movies/ToS/tears_of_steel_720p.mov',
      type: 'hosted',
      label: 'Full Film 720p (CC BY 3.0)',
      language: 'English',
      available: true,
      attribution: {
        title: 'Tears of Steel',
        creator: 'Blender Foundation / Blender Institute',
        license: 'CC BY 3.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
        sourceName: 'Blender Studio',
        sourceUrl: 'https://studio.blender.org/films/tears-of-steel/',
      },
    },
  ],
};

/**
 * TV Episode Playback Source Registry (keyed by `${showId}-s${seasonNumber}-e${episodeNumber}`).
 * Populated only when legitimate episode streams are registered.
 */
const TV_EPISODE_PLAYBACK_SOURCES = {};

/**
 * Validate a single WebVTT subtitle track definition.
 */
export function isValidSubtitleTrack(track) {
  if (!track || typeof track !== 'object') return false;
  const src = typeof track.src === 'string' ? track.src.trim() : '';
  const language = typeof track.language === 'string' ? track.language.trim() : '';
  const label = typeof track.label === 'string' ? track.label.trim() : '';
  if (!src || !language || !label) return false;

  const hasValidProtocol =
    src.startsWith('https://') || src.startsWith('http://') || src.startsWith('/');
  return hasValidProtocol;
}

/**
 * Validate a single playback source definition.
 * Rejects missing URLs, unsupported formats, or unavailable entries.
 */
export function isValidPlaybackSource(source) {
  if (!source || typeof source !== 'object') return false;
  if (source.available === false) return false;
  if (!SUPPORTED_SOURCE_TYPES.includes(source.type)) return false;

  const url = typeof source.url === 'string' ? source.url.trim() : '';
  if (!url) return false;

  const hasValidProtocol =
    url.startsWith('https://') || url.startsWith('http://') || url.startsWith('/');
  if (!hasValidProtocol) return false;

  return true;
}

function extractTimeWindow(source, startKey, endKey, windowKey) {
  const win = source[windowKey];
  if (
    win &&
    typeof win === 'object' &&
    Number.isFinite(win.start) &&
    Number.isFinite(win.end) &&
    win.start >= 0 &&
    win.end > win.start
  ) {
    return { start: win.start, end: win.end };
  }

  const start = source[startKey];
  const end = source[endKey];
  if (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start >= 0 &&
    end > start
  ) {
    return { start, end };
  }

  return null;
}

function sanitizePlaybackSource(source) {
  const validSubtitles = Array.isArray(source.subtitles)
    ? source.subtitles
        .filter(isValidSubtitleTrack)
        .map((sub, idx) => ({
          id: sub.id || `${sub.language}-${idx}`,
          language: sub.language.trim(),
          label: sub.label.trim(),
          src: sub.src.trim(),
          kind: sub.kind || 'subtitles',
          default: Boolean(sub.default),
        }))
    : [];

  const introWindow = extractTimeWindow(source, 'introStart', 'introEnd', 'introWindow');
  const recapWindow = extractTimeWindow(source, 'recapStart', 'recapEnd', 'recapWindow');
  const creditsStart =
    Number.isFinite(source.creditsStart) && source.creditsStart > 0
      ? source.creditsStart
      : null;

  return {
    ...source,
    subtitles: validSubtitles,
    introWindow,
    recapWindow,
    creditsStart,
    attribution: source.attribution || null,
  };
}

function buildUnavailableResult(mediaType, id, reason) {
  return {
    available: false,
    mediaType,
    id: id ?? null,
    primarySource: null,
    sources: [],
    reason,
  };
}

/**
 * Resolve playback source(s) for a movie by its stable ID.
 * Never falls back to an unrelated movie stream.
 * @param {string|number} movieId
 */
export function getMoviePlaybackSource(movieId) {
  if (movieId === undefined || movieId === null || String(movieId).trim() === '') {
    return buildUnavailableResult('movie', null, 'Invalid movie identifier.');
  }

  const key = String(movieId).trim();
  const rawSources = MOVIE_PLAYBACK_SOURCES[key];
  if (!Array.isArray(rawSources) || rawSources.length === 0) {
    return buildUnavailableResult(
      'movie',
      key,
      'No playable video stream is currently available for this movie.'
    );
  }

  const validSources = rawSources.filter(isValidPlaybackSource).map(sanitizePlaybackSource);
  if (validSources.length === 0) {
    return buildUnavailableResult(
      'movie',
      key,
      'No valid playback source is currently available for this movie.'
    );
  }

  return {
    available: true,
    mediaType: 'movie',
    id: key,
    primarySource: validSources[0],
    sources: validSources,
    reason: null,
  };
}

/**
 * Resolve playback source(s) for a specific TV episode.
 * Never falls back to an unrelated episode or movie stream.
 * @param {string|number} showId
 * @param {number|string} seasonNumber
 * @param {number|string} episodeNumber
 */
export function getTVEpisodePlaybackSource(showId, seasonNumber, episodeNumber) {
  if (
    showId === undefined ||
    showId === null ||
    String(showId).trim() === '' ||
    seasonNumber === undefined ||
    seasonNumber === null ||
    episodeNumber === undefined ||
    episodeNumber === null
  ) {
    return buildUnavailableResult('tv', null, 'Invalid TV episode identifier.');
  }

  const cleanShowId = String(showId).trim();
  const sNum = Number(seasonNumber);
  const eNum = Number(episodeNumber);
  if (!Number.isInteger(sNum) || sNum < 0 || !Number.isInteger(eNum) || eNum < 1) {
    return buildUnavailableResult('tv', cleanShowId, 'Invalid season or episode number.');
  }

  const episodeKey = `${cleanShowId}-s${sNum}-e${eNum}`;
  const rawSources = TV_EPISODE_PLAYBACK_SOURCES[episodeKey];
  if (!Array.isArray(rawSources) || rawSources.length === 0) {
    return buildUnavailableResult(
      'tv',
      episodeKey,
      'No playable video stream is currently available for this episode.'
    );
  }

  const validSources = rawSources.filter(isValidPlaybackSource).map(sanitizePlaybackSource);
  if (validSources.length === 0) {
    return buildUnavailableResult(
      'tv',
      episodeKey,
      'No valid playback source is currently available for this episode.'
    );
  }

  return {
    available: true,
    mediaType: 'tv',
    id: episodeKey,
    showId: cleanShowId,
    seasonNumber: sNum,
    episodeNumber: eNum,
    primarySource: validSources[0],
    sources: validSources,
    reason: null,
  };
}

/**
 * Retrieve all valid playback sources for a media descriptor object.
 * @param {{ mediaType: 'movie'|'tv', id: string|number, seasonNumber?: number, episodeNumber?: number }} media
 * @returns {Array<Object>}
 */
export function getAvailablePlaybackSources(media) {
  if (!media || typeof media !== 'object') return [];
  if (String(media.mediaType).toLowerCase() === 'tv') {
    return getTVEpisodePlaybackSource(media.id, media.seasonNumber, media.episodeNumber).sources;
  }
  return getMoviePlaybackSource(media.id).sources;
}

/**
 * Check whether a movie or TV episode has at least one valid playback source.
 * @param {{ mediaType: 'movie'|'tv', id: string|number, seasonNumber?: number, episodeNumber?: number }} media
 * @returns {boolean}
 */
export function hasPlaybackSource(media) {
  return getAvailablePlaybackSources(media).length > 0;
}
