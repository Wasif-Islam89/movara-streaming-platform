import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import Hero from '../components/Hero';
import MovieRow from '../components/MovieRow';
import heroFallbackBackdrop from '../assets/backgrounds/hero-fantasy.jpg';
import { isApiConfigured } from '../services/api';
import {
  getKidsCartoons,
  getKidsFantasy,
  getKidsSciFi,
  getKidsFamily,
  fetchMovieGenres,
  fetchMovieGenreMap,
  discoverMoviesPage,
  fetchMovieDetails,
} from '../services/movieService';
import {
  fetchTVGenres,
  fetchTVGenreMap,
  discoverTVPage,
} from '../services/tvService';

const INITIAL_ROW_STATE = {
  items: [],
  isLoading: false,
  error: null,
};

// Curated Featured Real Kids Titles for the Hero Section
const KIDS_HERO_MOVIES = [
  {
    id: 'inside-out-2',
    title: 'Inside Out 2',
    year: '2024',
    duration: '1h 36m',
    genre: 'Animation • Family • Comedy',
    description:
      'Teenager Riley\'s mind headquarters undergoes a sudden demolition to make room for unexpected emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up with brand new crew members.',
    detailsLink: '/movie/inside-out-2',
    trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'the-lion-king',
    title: 'The Lion King',
    year: '1994',
    duration: '1h 28m',
    genre: 'Animation • Drama • Family',
    description:
      'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself. Guided by wise mentors, Simba must grow to reclaim his rightful place in the Pride Lands.',
    detailsLink: '/movie/the-lion-king',
    trailerUrl: 'https://www.youtube.com/watch?v=lFzVJEksoDY',
    backdropUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'coco',
    title: 'Coco',
    year: '2017',
    duration: '1h 45m',
    genre: 'Animation • Family • Fantasy',
    description:
      'Aspiring musician Miguel, confronted with his family\'s ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer, and unlock the truth of his heritage.',
    detailsLink: '/movie/coco',
    trailerUrl: 'https://www.youtube.com/watch?v=Rvr68u635R8',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
  },
  {
    id: 'kung-fu-panda-4',
    title: 'Kung Fu Panda 4',
    year: '2024',
    duration: '1h 34m',
    genre: 'Animation • Action • Comedy',
    description:
      'After Po is tapped to become the Spiritual Leader of the Valley of Peace, he needs to find and train a new Dragon Warrior, while a wicked sorceress plans to re-summon all master villains.',
    detailsLink: '/movie/kung-fu-panda-4',
    trailerUrl: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
    backdropUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=1920&q=80',
  },
];

export default function Kids() {
  const apiReady = isApiConfigured();
  const cartoonsFallback = useMemo(() => getKidsCartoons(), []);
  const fantasyFallback = useMemo(() => getKidsFantasy(), []);
  const scifiFallback = useMemo(() => getKidsSciFi(), []);
  const familyFallback = useMemo(() => getKidsFamily(), []);

  const [heroMovies, setHeroMovies] = useState(KIDS_HERO_MOVIES);
  const [cartoonsRow, setCartoonsRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [fantasyRow, setFantasyRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [scifiTvRow, setScifiTvRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));
  const [familyMixRow, setFamilyMixRow] = useState(() => ({
    ...INITIAL_ROW_STATE,
    isLoading: apiReady,
  }));

  const movieGenresRef = useRef([]);
  const tvGenresRef = useRef([]);
  const movieGenreMapRef = useRef({});
  const tvGenreMapRef = useRef({});

  // Update browser tab title
  useEffect(() => {
    document.title = 'Kids & Family | MOVORA';
  }, []);

  const findGenreIdByName = useCallback((genresList, ...candidates) => {
    for (const name of candidates) {
      const match = genresList.find(
        (g) => g.name.toLowerCase() === name.toLowerCase()
      );
      if (match?.id) return match.id;
    }
    return undefined;
  }, []);

  const deduplicateByMediaKey = useCallback((items) => {
    const seen = new Set();
    return items.filter((item) => {
      if (!item || item.id === undefined || item.id === null) return false;
      const key = `${item.mediaType || 'movie'}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const populateHeroFromKids = useCallback(async (kidsMovies, signal) => {
    if (!Array.isArray(kidsMovies) || kidsMovies.length === 0) return;

    const base = kidsMovies.slice(0, 4).map((m) => ({
      ...m,
      backdropUrl: m.backdropUrl || heroFallbackBackdrop,
      detailsLink: `/movie/${m.id}`,
    }));
    setHeroMovies(base);

    const enriched = await Promise.all(
      base.map(async (item) => {
        try {
          const details = await fetchMovieDetails(item.id, { signal });
          if (!details) return item;
          return {
            ...item,
            ...details,
            backdropUrl: details.backdropUrl || item.backdropUrl || heroFallbackBackdrop,
            detailsLink: `/movie/${item.id}`,
          };
        } catch {
          return item;
        }
      })
    );

    if (!signal?.aborted) {
      setHeroMovies(enriched);
    }
  }, []);

  const loadRow = useCallback(async (fetcher, setRowState, signal, onLoaded) => {
    setRowState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await fetcher(signal);
      if (signal?.aborted) return;
      const unique = deduplicateByMediaKey(data);
      setRowState({ items: unique, isLoading: false, error: null });
      if (onLoaded) onLoaded(unique);
    } catch (err) {
      if (err?.name === 'AbortError' || signal?.aborted) return;
      setRowState({
        items: [],
        isLoading: false,
        error: 'Unable to load kids titles right now. Please try again.',
      });
    }
  }, [deduplicateByMediaKey]);

  const buildAnimationMoviesFetcher = useCallback(
    () => async (sig) => {
      const animId = findGenreIdByName(movieGenresRef.current, 'Animation');
      const familyId = findGenreIdByName(movieGenresRef.current, 'Family');
      const withGenres = [animId, familyId].filter(Boolean).join(',');
      const res = await discoverMoviesPage(
        {
          ...(withGenres ? { with_genres: withGenres } : {}),
          include_adult: false,
          sort_by: 'popularity.desc',
          page: 1,
        },
        { signal: sig },
        movieGenreMapRef.current
      );
      return res.results;
    },
    [findGenreIdByName]
  );

  const buildFamilyFantasyFetcher = useCallback(
    () => async (sig) => {
      const familyId = findGenreIdByName(movieGenresRef.current, 'Family');
      const fantasyId = findGenreIdByName(movieGenresRef.current, 'Fantasy');
      const withGenres = [familyId, fantasyId].filter(Boolean).join(',');
      const res = await discoverMoviesPage(
        {
          ...(withGenres ? { with_genres: withGenres } : {}),
          include_adult: false,
          sort_by: 'popularity.desc',
          page: 1,
        },
        { signal: sig },
        movieGenreMapRef.current
      );
      return res.results;
    },
    [findGenreIdByName]
  );

  const buildKidsAnimationTVFetcher = useCallback(
    () => async (sig) => {
      const kidsId = findGenreIdByName(tvGenresRef.current, 'Kids');
      const animId = findGenreIdByName(tvGenresRef.current, 'Animation');
      const familyId = findGenreIdByName(tvGenresRef.current, 'Family');
      const withGenres = [animId, kidsId || familyId].filter(Boolean).join(',');
      const res = await discoverTVPage(
        {
          ...(withGenres ? { with_genres: withGenres } : {}),
          include_adult: false,
          sort_by: 'popularity.desc',
          page: 1,
        },
        { signal: sig },
        tvGenreMapRef.current
      );
      return res.results;
    },
    [findGenreIdByName]
  );

  const buildFamilyMixFetcher = useCallback(
    () => async (sig) => {
      const familyMovieId = findGenreIdByName(movieGenresRef.current, 'Family');
      const familyTvId = findGenreIdByName(tvGenresRef.current, 'Family', 'Kids');

      const [moviesRes, tvRes] = await Promise.all([
        discoverMoviesPage(
          {
            ...(familyMovieId ? { with_genres: familyMovieId } : {}),
            include_adult: false,
            sort_by: 'popularity.desc',
            page: 1,
          },
          { signal: sig },
          movieGenreMapRef.current
        ),
        discoverTVPage(
          {
            ...(familyTvId ? { with_genres: familyTvId } : {}),
            include_adult: false,
            sort_by: 'popularity.desc',
            page: 1,
          },
          { signal: sig },
          tvGenreMapRef.current
        ),
      ]);

      const combined = [];
      const maxLen = Math.max(moviesRes.results.length, tvRes.results.length);
      for (let i = 0; i < maxLen; i++) {
        if (moviesRes.results[i]) combined.push(moviesRes.results[i]);
        if (tvRes.results[i]) combined.push(tvRes.results[i]);
      }
      return combined;
    },
    [findGenreIdByName]
  );

  useEffect(() => {
    if (!apiReady) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function initKidsPage() {
      try {
        const [mGenres, tGenres, mMap, tMap] = await Promise.all([
          fetchMovieGenres({ signal }),
          fetchTVGenres({ signal }),
          fetchMovieGenreMap({ signal }),
          fetchTVGenreMap({ signal }),
        ]);
        if (signal.aborted) return;
        movieGenresRef.current = mGenres;
        tvGenresRef.current = tGenres;
        movieGenreMapRef.current = mMap;
        tvGenreMapRef.current = tMap;
      } catch (err) {
        if (err?.name === 'AbortError' || signal.aborted) return;
      }

      if (signal.aborted) return;

      await Promise.all([
        loadRow(
          buildAnimationMoviesFetcher(),
          setCartoonsRow,
          signal,
          (data) => populateHeroFromKids(data, signal)
        ),
        loadRow(buildFamilyFantasyFetcher(), setFantasyRow, signal),
        loadRow(buildKidsAnimationTVFetcher(), setScifiTvRow, signal),
        loadRow(buildFamilyMixFetcher(), setFamilyMixRow, signal),
      ]);
    }

    initKidsPage();

    return () => {
      controller.abort();
    };
  }, [
    apiReady,
    loadRow,
    populateHeroFromKids,
    buildAnimationMoviesFetcher,
    buildFamilyFantasyFetcher,
    buildKidsAnimationTVFetcher,
    buildFamilyMixFetcher,
  ]);

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] pb-24">
      
      {/* Kids Spotlight Hero Banner matching Home & TV Shows Hero format */}
      <Hero movies={heroMovies} />

      {/* 4 Curated Kids Topic Rows */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-6 pb-16">
        
        {/* Row 1: Animated Adventures (Animation & Family Movies) */}
        <MovieRow
          title="Animated Adventures"
          badge="Popular"
          movies={apiReady ? cartoonsRow.items : cartoonsFallback}
          isLoading={cartoonsRow.isLoading}
          error={cartoonsRow.error}
          onRetry={() =>
            loadRow(buildAnimationMoviesFetcher(), setCartoonsRow, undefined, (data) =>
              populateHeroFromKids(data)
            )
          }
        />

        {/* Row 2: Magical Worlds (Family & Fantasy Movies) */}
        <MovieRow
          title="Magical Worlds"
          badge="Fantasy"
          movies={apiReady ? fantasyRow.items : fantasyFallback}
          isLoading={fantasyRow.isLoading}
          error={fantasyRow.error}
          onRetry={() => loadRow(buildFamilyFantasyFetcher(), setFantasyRow)}
        />

        {/* Row 3: Space Quests (Kids & Animation TV Shows) */}
        <MovieRow
          title="Space Quests"
          badge="Sci-Fi"
          movies={apiReady ? scifiTvRow.items : scifiFallback}
          isLoading={scifiTvRow.isLoading}
          error={scifiTvRow.error}
          onRetry={() => loadRow(buildKidsAnimationTVFetcher(), setScifiTvRow)}
        />

        {/* Row 4: Family Fun (Family Movies & Family TV Shows) */}
        <MovieRow
          title="Family Fun"
          badge="Comedy"
          movies={apiReady ? familyMixRow.items : familyFallback}
          isLoading={familyMixRow.isLoading}
          error={familyMixRow.error}
          onRetry={() => loadRow(buildFamilyMixFetcher(), setFamilyMixRow)}
        />
      </main>
    </div>
  );
}

