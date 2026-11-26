import POSTERS from '../assets/posters/index.jsx';
import heroTvBackdrop from '../assets/backgrounds/hero-tv-shows.jpg';
import cyberpunkBackdrop from '../assets/backgrounds/hero-cyberpunk.jpg';
import fantasyBackdrop from '../assets/backgrounds/hero-fantasy.jpg';
import duneBackdrop from '../assets/backgrounds/hero-backdrop.jpg';
import { tmdbApi, getTmdbImageUrl, isApiConfigured } from './api';
import { extractYouTubeTrailerUrl } from './movieService';

/**
 * Consolidated MOVORA Real TV Shows Catalog
 * Curated authentic, world-renowned critically acclaimed television series.
 * Every title is backed by local poster assets stored in src/assets/posters/.
 */
export const LOCAL_TV_SHOWS = [
  {
    id: 'breaking-bad',
    title: 'Breaking Bad',
    tagline: 'Remember my name.',
    year: '2008',
    rating: 9.5,
    seasons: '5 Seasons',
    episodes: '62 Episodes',
    status: 'Completed',
    genre: 'Crime • Drama • Thriller',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['breaking-bad'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9faGSFi5jam6pDWGNdcu8f8L1gQ.jpg',
    description:
      'A chemistry teacher diagnosed with terminal lung cancer teams up with a former student to manufacture and sell crystal meth, spiraling into a ruthless kingpin known as Heisenberg.',
    trailerUrl: 'https://www.youtube.com/watch?v=HhesaQXLuRY',
    mediaType: 'tv',
  },
  {
    id: 'stranger-things',
    title: 'Stranger Things',
    tagline: 'Every ending has a beginning.',
    year: '2016',
    rating: 8.7,
    seasons: '4 Seasons',
    episodes: '34 Episodes',
    status: 'Ongoing',
    genre: 'Sci-Fi • Horror • Supernatural',
    contentRating: '16+',
    language: 'English',
    posterUrl: POSTERS['stranger-things'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    description:
      'When a young boy vanishes in a small Indiana town, his friends, family, and a quirky police chief uncover a web of secret government experiments, terrifying supernatural forces, and one very strange little girl.',
    trailerUrl: 'https://www.youtube.com/watch?v=b9EkMc79ZSU',
    mediaType: 'tv',
  },
  {
    id: 'the-last-of-us',
    title: 'The Last of Us',
    tagline: 'When you are lost in the darkness, look for the light.',
    year: '2023',
    rating: 8.8,
    seasons: '1 Season',
    episodes: '9 Episodes',
    status: 'Ongoing',
    genre: 'Drama • Post-Apocalyptic • Action',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['the-last-of-us'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    description:
      'Twenty years after a fungal outbreak devastates civilization, hardened survivor Joel is hired to smuggle 14-year-old Ellie across a treacherous, quarantine-shattered United States.',
    trailerUrl: 'https://www.youtube.com/watch?v=uLtkt8BonwM',
    mediaType: 'tv',
  },
  {
    id: 'game-of-thrones',
    title: 'Game of Thrones',
    tagline: 'Winter is coming.',
    year: '2011',
    rating: 9.2,
    seasons: '8 Seasons',
    episodes: '73 Episodes',
    status: 'Completed',
    genre: 'Fantasy • Drama • Action',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['game-of-thrones'],
    backdropUrl: fantasyBackdrop,
    description:
      'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for thousands of years.',
    trailerUrl: 'https://www.youtube.com/watch?v=KPLWWIOCOOQ',
    mediaType: 'tv',
  },
  {
    id: 'the-vampire-diaries',
    title: 'The Vampire Diaries',
    tagline: 'Love sucks.',
    year: '2009',
    rating: 8.9,
    seasons: '8 Seasons',
    episodes: '171 Episodes',
    status: 'Completed',
    genre: 'Drama • Supernatural • Romance',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['the-vampire-diaries'],
    backdropUrl: heroTvBackdrop,
    description:
      'Ian Somerhalder, Nina Dobrev, and Paul Wesley star in this iconic supernatural saga where two vampire brothers battle for the soul of Elena Gilbert and the fate of Mystic Falls.',
    trailerUrl: 'https://www.youtube.com/watch?v=BmVmhjjkN4E',
    mediaType: 'tv',
  },
  {
    id: 'house-of-the-dragon',
    title: 'House of the Dragon',
    tagline: 'Fire will reign.',
    year: '2022',
    rating: 8.5,
    seasons: '2 Seasons',
    episodes: '18 Episodes',
    status: 'Ongoing',
    genre: 'Fantasy • Action • Drama',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['house-of-the-dragon'],
    backdropUrl: fantasyBackdrop,
    description:
      'The story of the House Targaryen set 200 years before the events of Game of Thrones, chronicling the catastrophic civil war known as the Dance of the Dragons.',
    trailerUrl: 'https://www.youtube.com/watch?v=DotnJ7tTA34',
    mediaType: 'tv',
  },
  {
    id: 'the-boys',
    title: 'The Boys',
    tagline: 'Never meet your heroes.',
    year: '2019',
    rating: 8.7,
    seasons: '4 Seasons',
    episodes: '32 Episodes',
    status: 'Ongoing',
    genre: 'Action • Sci-Fi • Satire',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['the-boys'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers and corporate sponsor Vought International.',
    trailerUrl: 'https://www.youtube.com/watch?v=06rueu_fh30',
    mediaType: 'tv',
  },
  {
    id: 'shogun',
    title: 'Shōgun',
    tagline: 'War is coming to Japan.',
    year: '2024',
    rating: 8.8,
    seasons: '1 Season',
    episodes: '10 Episodes',
    status: 'Ongoing',
    genre: 'Drama • History • Adventure',
    contentRating: '18+',
    language: 'Japanese / English',
    posterUrl: POSTERS['shogun'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
    description:
      'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power and devastate his formidable enemies.',
    trailerUrl: 'https://www.youtube.com/watch?v=yPf4qFhF_Yk',
    mediaType: 'tv',
  },
  {
    id: 'fallout',
    title: 'Fallout',
    tagline: 'The end was only the beginning.',
    year: '2024',
    rating: 8.5,
    seasons: '1 Season',
    episodes: '8 Episodes',
    status: 'Ongoing',
    genre: 'Sci-Fi • Action • Adventure',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['fallout'],
    backdropUrl: duneBackdrop,
    description:
      'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.',
    trailerUrl: 'https://www.youtube.com/watch?v=V-mugKDQDlg',
    mediaType: 'tv',
  },
  {
    id: 'arcane',
    title: 'Arcane',
    tagline: 'Every legend has a beginning.',
    year: '2021',
    rating: 9.0,
    seasons: '2 Seasons',
    episodes: '18 Episodes',
    status: 'Completed',
    genre: 'Animation • Action • Sci-Fi',
    contentRating: '16+',
    language: 'English',
    posterUrl: POSTERS['arcane'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions and the power that will tear them apart.',
    trailerUrl: 'https://www.youtube.com/watch?v=fXmAurh012s',
    mediaType: 'tv',
  },
  {
    id: 'chernobyl',
    title: 'Chernobyl',
    tagline: 'What is the cost of lies?',
    year: '2019',
    rating: 9.4,
    seasons: '1 Season',
    episodes: '5 Episodes',
    status: 'Completed',
    genre: 'Drama • History • Thriller',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['chernobyl'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg',
    description:
      'A dramatization of the true story of one of the worst man-made catastrophes in history, the catastrophic nuclear plant explosion in Soviet Ukraine in 1986.',
    trailerUrl: 'https://www.youtube.com/watch?v=s9APLXM9Ei8',
    mediaType: 'tv',
  },
  {
    id: 'peaky-blinders',
    title: 'Peaky Blinders',
    tagline: 'By order of the Peaky Blinders.',
    year: '2013',
    rating: 8.8,
    seasons: '6 Seasons',
    episodes: '36 Episodes',
    status: 'Completed',
    genre: 'Crime • Drama • Period',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['peaky-blinders'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg',
    description:
      'A notorious gang in 1919 Birmingham, England, is led by the fierce Tommy Shelby, a crime boss set on moving up in the world no matter the cost.',
    trailerUrl: 'https://www.youtube.com/watch?v=oVzVdvGIC7U',
    mediaType: 'tv',
  },
  {
    id: 'the-witcher',
    title: 'The Witcher',
    tagline: 'The worst monsters are the ones we create.',
    year: '2019',
    rating: 8.1,
    seasons: '3 Seasons',
    episodes: '24 Episodes',
    status: 'Ongoing',
    genre: 'Fantasy • Action • Adventure',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['the-witcher'],
    backdropUrl: fantasyBackdrop,
    description:
      'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
    trailerUrl: 'https://www.youtube.com/watch?v=ndl1W4ltcmg',
    mediaType: 'tv',
  },
  {
    id: 'wednesday',
    title: 'Wednesday',
    tagline: 'Smart, sarcastic and a little dead inside.',
    year: '2022',
    rating: 8.1,
    seasons: '1 Season',
    episodes: '8 Episodes',
    status: 'Ongoing',
    genre: 'Comedy • Fantasy • Mystery',
    contentRating: '14+',
    language: 'English',
    posterUrl: POSTERS['wednesday'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9PFonBhy4cQy7Jz20NpMygczOkv.jpg',
    description:
      'Follows Wednesday Addams years as a student at Nevermore Academy, attempting to master her emerging psychic ability and solve a monster mystery.',
    trailerUrl: 'https://www.youtube.com/watch?v=Di310BC8urj',
    mediaType: 'tv',
  },
  {
    id: 'dark',
    title: 'Dark',
    tagline: 'The question is not where, but when.',
    year: '2017',
    rating: 8.7,
    seasons: '3 Seasons',
    episodes: '26 Episodes',
    status: 'Completed',
    genre: 'Sci-Fi • Mystery • Drama',
    contentRating: '16+',
    language: 'German / English',
    posterUrl: POSTERS['dark'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families across generations.',
    trailerUrl: 'https://www.youtube.com/watch?v=rrwycJ08PSA',
    mediaType: 'tv',
  },
  {
    id: 'loki',
    title: 'Loki',
    tagline: 'Glorious purpose awaits.',
    year: '2021',
    rating: 8.2,
    seasons: '2 Seasons',
    episodes: '12 Episodes',
    status: 'Completed',
    genre: 'Sci-Fi • Action • Fantasy',
    contentRating: '14+',
    language: 'English',
    posterUrl: POSTERS['loki'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'The mercurial villain Loki resumes his role as the God of Mischief following the events of "Avengers: Endgame," navigating the mysterious Time Variance Authority.',
    trailerUrl: 'https://www.youtube.com/watch?v=nW948Va-l10',
    mediaType: 'tv',
  },
  {
    id: 'squid-game',
    title: 'Squid Game',
    tagline: '45.6 billion won is childs play.',
    year: '2021',
    rating: 8.0,
    seasons: '2 Seasons',
    episodes: '16 Episodes',
    status: 'Ongoing',
    genre: 'Thriller • Drama • Mystery',
    contentRating: '18+',
    language: 'Korean / English',
    posterUrl: POSTERS['squid-game'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg',
    description:
      'Hundreds of cash-strapped players accept a strange invitation to compete in children games for a tempting prize, but the stakes are deadly.',
    trailerUrl: 'https://www.youtube.com/watch?v=oqxAJKy0ii4',
    mediaType: 'tv',
  },
  {
    id: 'succession',
    title: 'Succession',
    tagline: 'Fight for the empire.',
    year: '2018',
    rating: 8.9,
    seasons: '4 Seasons',
    episodes: '39 Episodes',
    status: 'Completed',
    genre: 'Drama • Satire',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['succession'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/1E5baAaEse26fej7uHcjOgEE2t2.jpg',
    description:
      'The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their aging father steps down from the company.',
    trailerUrl: 'https://www.youtube.com/watch?v=OzY2r87Fpgk',
    mediaType: 'tv',
  },
  {
    id: 'better-call-saul',
    title: 'Better Call Saul',
    tagline: 'Slippin Jimmy becomes Saul Goodman.',
    year: '2015',
    rating: 9.0,
    seasons: '6 Seasons',
    episodes: '63 Episodes',
    status: 'Completed',
    genre: 'Crime • Drama • Legal',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['better-call-saul'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9faGSFi5jam6pDWGNdcu8f8L1gQ.jpg',
    description:
      'The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.',
    trailerUrl: 'https://www.youtube.com/watch?v=HN4oydykJFc',
    mediaType: 'tv',
  },
  {
    id: 'true-detective',
    title: 'True Detective',
    tagline: 'Touch darkness and darkness touches you back.',
    year: '2014',
    rating: 8.9,
    seasons: '4 Seasons',
    episodes: '30 Episodes',
    status: 'Ongoing',
    genre: 'Crime • Mystery • Drama',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['true-detective'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'Anthology series in which police investigations unearth the personal and professional secrets of those involved, both within and outside the law.',
    trailerUrl: 'https://www.youtube.com/watch?v=fVQUcaO4AvE',
    mediaType: 'tv',
  },
  {
    id: 'sherlock',
    title: 'Sherlock',
    tagline: 'A modern update finds the famous sleuth in 21st-century London.',
    year: '2010',
    rating: 9.1,
    seasons: '4 Seasons',
    episodes: '13 Episodes',
    status: 'Completed',
    genre: 'Crime • Mystery • Drama',
    contentRating: '16+',
    language: 'English',
    posterUrl: POSTERS['sherlock'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg',
    description:
      'A modern update finds the famous sleuth and his doctor partner solving crime in 21st-century London with razor-sharp deduction.',
    trailerUrl: 'https://www.youtube.com/watch?v=9ucSfq9k3uE',
    mediaType: 'tv',
  },
  {
    id: 'mindhunter',
    title: 'Mindhunter',
    tagline: 'How do we get ahead of crazy if we dont know how crazy thinks?',
    year: '2017',
    rating: 8.6,
    seasons: '2 Seasons',
    episodes: '19 Episodes',
    status: 'Completed',
    genre: 'Crime • Drama • Psychological',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['mindhunter'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'Set in the late 1970s, two FBI agents expand criminal science by delving into the psychology of murder and getting uneasily close to all-too-real monsters.',
    trailerUrl: 'https://www.youtube.com/watch?v=LR3G1lWbuUU',
    mediaType: 'tv',
  },
  {
    id: 'money-heist',
    title: 'Money Heist',
    tagline: 'The greatest robbery in history.',
    year: '2017',
    rating: 8.2,
    seasons: '5 Seasons',
    episodes: '41 Episodes',
    status: 'Completed',
    genre: 'Action • Crime • Thriller',
    contentRating: '18+',
    language: 'Spanish / English',
    posterUrl: POSTERS['money-heist'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
    description:
      'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.',
    trailerUrl: 'https://www.youtube.com/watch?v=_InqQJRqGW4',
    mediaType: 'tv',
  },
  {
    id: 'the-bear',
    title: 'The Bear',
    tagline: 'Every second counts.',
    year: '2022',
    rating: 8.6,
    seasons: '3 Seasons',
    episodes: '28 Episodes',
    status: 'Ongoing',
    genre: 'Drama • Comedy • Culinary',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['the-bear'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/5TZnk9ryzfcNlsCOghURfZsBong.jpg',
    description:
      'A young fine-dining chef comes home to Chicago to run his family Italian beef sandwich shop after a tragic death in the family.',
    trailerUrl: 'https://www.youtube.com/watch?v=y-cqqAJIXhk',
    mediaType: 'tv',
  },
  {
    id: 'the-mandalorian',
    title: 'The Mandalorian',
    tagline: 'Bounty hunting is a complicated profession.',
    year: '2019',
    rating: 8.7,
    seasons: '3 Seasons',
    episodes: '24 Episodes',
    status: 'Ongoing',
    genre: 'Sci-Fi • Action • Space Western',
    contentRating: '14+',
    language: 'English',
    posterUrl: POSTERS['the-mandalorian'],
    backdropUrl: duneBackdrop,
    description:
      'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
    trailerUrl: 'https://www.youtube.com/watch?v=aOC8E8z_ifw',
    mediaType: 'tv',
  },
  {
    id: 'severance',
    title: 'Severance',
    tagline: 'Please do not adjust your screen.',
    year: '2022',
    rating: 8.7,
    seasons: '1 Season',
    episodes: '9 Episodes',
    status: 'Ongoing',
    genre: 'Sci-Fi • Thriller • Mystery',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['severance'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives.',
    trailerUrl: 'https://www.youtube.com/watch?v=xEQP4VVuyrY',
    mediaType: 'tv',
  },
  {
    id: 'vikings',
    title: 'Vikings',
    tagline: 'Storm is coming.',
    year: '2013',
    rating: 8.5,
    seasons: '6 Seasons',
    episodes: '89 Episodes',
    status: 'Completed',
    genre: 'Action • Drama • History',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['vikings'],
    backdropUrl: fantasyBackdrop,
    description:
      'Ragnar Lothbrok, a legendary Norse hero, rises from a simple farmer to become the commander of the Viking tribes and conqueror of England.',
    trailerUrl: 'https://www.youtube.com/watch?v=mAl60LSZwbA',
    mediaType: 'tv',
  },
  {
    id: 'attack-on-titan',
    title: 'Attack on Titan',
    tagline: 'If we kill all our enemies over there, will we finally be free?',
    year: '2013',
    rating: 9.0,
    seasons: '4 Seasons',
    episodes: '89 Episodes',
    status: 'Completed',
    genre: 'Animation • Action • Dark Fantasy',
    contentRating: '16+',
    language: 'Japanese / English',
    posterUrl: POSTERS['attack-on-titan'],
    backdropUrl: fantasyBackdrop,
    description:
      'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
    trailerUrl: 'https://www.youtube.com/watch?v=MGRm4IzK1SQ',
    mediaType: 'tv',
  },
  {
    id: 'death-note',
    title: 'Death Note',
    tagline: 'Whose name will be written next?',
    year: '2006',
    rating: 9.0,
    seasons: '1 Season',
    episodes: '37 Episodes',
    status: 'Completed',
    genre: 'Animation • Mystery • Psychological',
    contentRating: '16+',
    language: 'Japanese / English',
    posterUrl: POSTERS['death-note'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written into it.',
    trailerUrl: 'https://www.youtube.com/watch?v=NlJZ-YgAt-c',
    mediaType: 'tv',
  },
  {
    id: 'rick-and-morty',
    title: 'Rick and Morty',
    tagline: 'Science makes sense, family doesnt.',
    year: '2013',
    rating: 9.1,
    seasons: '7 Seasons',
    episodes: '71 Episodes',
    status: 'Ongoing',
    genre: 'Animation • Comedy • Sci-Fi',
    contentRating: '18+',
    language: 'English',
    posterUrl: POSTERS['rick-and-morty'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'An animated series on adult swim about the infinite adventures of a sociopathic scientist genius and his timid grandson across dimensions and alternate timelines.',
    trailerUrl: 'https://www.youtube.com/watch?v=WNhH00OIPP0',
    mediaType: 'tv',
  },
];

// Alias map for legacy IDs and sample link /tv/1
const TV_ID_ALIASES = {
  '1': 'the-vampire-diaries',
  'the-vampire-diaries': 'the-vampire-diaries',
  'starlight-protocol': 'stranger-things',
  'realm-of-embers-tv': 'game-of-thrones',
  'cyber-chronicles': 'the-boys',
  'chronicles-of-arrakis-series': 'fallout',
  'shadow-detectives': 'shogun',
  'celestial-odyssey': 'arcane',
  'quantum-anomalies': 'dark',
  'forgotten-tales': 'the-witcher',
};

/**
 * Retrieve TV show by ID, with robust support for sample alias '1' and legacy IDs
 * @param {string|number} id 
 * @returns {Object|null}
 */
export function getTVShowById(id) {
  if (!id) return null;
  const normalizedId = String(id).toLowerCase().trim();

  // Check alias lookup first
  const targetId = TV_ID_ALIASES[normalizedId] || normalizedId;

  return (
    LOCAL_TV_SHOWS.find((show) => String(show.id).toLowerCase() === targetId) ||
    LOCAL_TV_SHOWS.find((show) => String(show.id).toLowerCase() === normalizedId) ||
    null
  );
}

/**
 * Retrieve related TV shows for a given show
 * @param {string|number} currentShowId 
 * @param {number} limit 
 * @returns {Array<Object>}
 */
export function getRelatedTVShows(currentShowId, limit = 6) {
  const current = getTVShowById(currentShowId);
  if (!current) return LOCAL_TV_SHOWS.slice(0, limit);

  return LOCAL_TV_SHOWS
    .filter((show) => String(show.id) !== String(current.id))
    .slice(0, limit);
}

/**
 * Retrieve all local TV shows
 * @returns {Array<Object>}
 */
export function getAllTVShows() {
  return [...LOCAL_TV_SHOWS];
}

/**
 * Retrieve 6 Trending TV Shows
 * @returns {Array<Object>}
 */
export function getTrendingTVShows() {
  const ids = ['stranger-things', 'the-last-of-us', 'house-of-the-dragon', 'the-boys', 'fallout', 'shogun'];
  return ids.map((id) => getTVShowById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Top Rated TV Series
 * @returns {Array<Object>}
 */
export function getTopRatedTVShows() {
  const ids = ['breaking-bad', 'chernobyl', 'game-of-thrones', 'arcane', 'succession', 'dark'];
  return ids.map((id) => getTVShowById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Fan-Favorite & Binge-Worthy TV Series
 * @returns {Array<Object>}
 */
export function getBingeWorthyTVShows() {
  const ids = ['the-vampire-diaries', 'peaky-blinders', 'loki', 'squid-game', 'the-witcher', 'wednesday'];
  return ids.map((id) => getTVShowById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Crime, Mystery & Suspense TV Series
 * @returns {Array<Object>}
 */
export function getCrimeMysteryTVShows() {
  const ids = ['better-call-saul', 'true-detective', 'sherlock', 'mindhunter', 'money-heist', 'the-bear'];
  return ids.map((id) => getTVShowById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Sci-Fi, Epic Worlds & Anime TV Series
 * @returns {Array<Object>}
 */
export function getSciFiWorldsTVShows() {
  const ids = ['the-mandalorian', 'severance', 'vikings', 'attack-on-titan', 'death-note', 'rick-and-morty'];
  return ids.map((id) => getTVShowById(id)).filter(Boolean);
}

/**
 * Normalize a raw TMDB TV show object into MOVORA's standard TV show shape
 * @param {Object} tmdbShow
 * @param {Record<number, string>} [genreMap]
 * @returns {Object|null}
 */
export function normalizeTmdbTVShow(tmdbShow, genreMap = {}) {
  if (!tmdbShow || tmdbShow.id === undefined || tmdbShow.id === null) return null;

  const genreNames = Array.isArray(tmdbShow.genres)
    ? tmdbShow.genres.map((g) => g.name).filter(Boolean)
    : Array.isArray(tmdbShow.genre_ids)
    ? tmdbShow.genre_ids.map((gid) => genreMap[gid]).filter(Boolean)
    : [];

  const numSeasons = tmdbShow.number_of_seasons;
  const numEpisodes = tmdbShow.number_of_episodes;

  return {
    id: tmdbShow.id,
    title: tmdbShow.name || tmdbShow.original_name || 'Untitled',
    originalTitle: tmdbShow.original_name || '',
    tagline: tmdbShow.tagline || '',
    year: tmdbShow.first_air_date ? String(tmdbShow.first_air_date).slice(0, 4) : '',
    firstAirDate: tmdbShow.first_air_date || '',
    lastAirDate: tmdbShow.last_air_date || '',
    rating: typeof tmdbShow.vote_average === 'number' && tmdbShow.vote_average > 0
      ? Number(tmdbShow.vote_average.toFixed(1))
      : null,
    voteCount: typeof tmdbShow.vote_count === 'number' ? tmdbShow.vote_count : null,
    seasons: typeof numSeasons === 'number' ? `${numSeasons} ${numSeasons === 1 ? 'Season' : 'Seasons'}` : '',
    episodes: typeof numEpisodes === 'number' ? `${numEpisodes} ${numEpisodes === 1 ? 'Episode' : 'Episodes'}` : '',
    episodeRuntime: Array.isArray(tmdbShow.episode_run_time) && tmdbShow.episode_run_time.length > 0
      ? `${tmdbShow.episode_run_time[0]}m`
      : '',
    status: tmdbShow.status || '',
    genre: genreNames.join(' • '),
    language: tmdbShow.spoken_languages?.[0]?.english_name || tmdbShow.original_language || 'English',
    createdBy: Array.isArray(tmdbShow.created_by) ? tmdbShow.created_by : [],
    posterUrl: getTmdbImageUrl(tmdbShow.poster_path, 'w500'),
    backdropUrl: getTmdbImageUrl(tmdbShow.backdrop_path, 'w1280'),
    description: tmdbShow.overview || '',
    trailerUrl: extractYouTubeTrailerUrl(tmdbShow.videos),
    mediaType: 'tv',
    poster_path: tmdbShow.poster_path || null,
    backdrop_path: tmdbShow.backdrop_path || null,
    first_air_date: tmdbShow.first_air_date || '',
    vote_average: tmdbShow.vote_average ?? null,
    seasonsList: Array.isArray(tmdbShow.seasons) ? tmdbShow.seasons : [],
    credits: tmdbShow.credits || null,
    similar: Array.isArray(tmdbShow.similar?.results)
      ? tmdbShow.similar.results
          .filter((item) => String(item.id) !== String(tmdbShow.id))
          .map((item) => normalizeTmdbTVShow(item, genreMap))
          .filter(Boolean)
      : [],
  };
}

let cachedTVGenreMap = null;
let cachedTVGenresList = null;

/**
 * Fetch and cache TMDB TV genres list for the current session
 * @param {RequestInit} [options]
 * @returns {Promise<Array<{ id: number, name: string }>>}
 */
export async function fetchTVGenres(options) {
  if (cachedTVGenresList) return cachedTVGenresList;
  if (!isApiConfigured()) return [];
  try {
    const data = await tmdbApi.getTVGenres(options);
    const list = Array.isArray(data.genres) ? data.genres : [];
    const map = {};
    for (const g of list) {
      if (g?.id && g?.name) map[g.id] = g.name;
    }
    cachedTVGenresList = list;
    cachedTVGenreMap = map;
    return list;
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    return [];
  }
}

/**
 * Fetch and cache TMDB TV genre ID-to-name map for the current session
 * @param {RequestInit} [options]
 * @returns {Promise<Record<number, string>>}
 */
export async function fetchTVGenreMap(options) {
  if (cachedTVGenreMap) return cachedTVGenreMap;
  await fetchTVGenres(options);
  return cachedTVGenreMap || {};
}

/**
 * Discover TV shows with TMDB pagination support
 * @param {Record<string, any>} [params]
 * @param {RequestInit} [options]
 * @param {Record<number, string>} [genreMap]
 * @returns {Promise<{ results: Array<Object>, page: number, totalPages: number, totalResults: number }>}
 */
export async function discoverTVPage(params = {}, options, genreMap = {}) {
  if (!isApiConfigured()) {
    const local = getAllTVShows();
    return {
      results: local,
      page: 1,
      totalPages: 1,
      totalResults: local.length,
    };
  }
  const data = await tmdbApi.discoverTV(params, options);
  const results = (data.results || [])
    .map((s) => normalizeTmdbTVShow(s, genreMap))
    .filter(Boolean);
  return {
    results,
    page: data.page || 1,
    totalPages: data.total_pages || 1,
    totalResults: data.total_results || results.length,
  };
}

/**
 * Async TMDB-ready TV Service Helpers (with safe local catalog fallback)
 */
export async function fetchTrendingTVShows(timeWindow = 'week', page = 1, options, genreMap = {}) {
  if (!isApiConfigured()) return getTrendingTVShows();
  const data = await tmdbApi.getTrendingTV(timeWindow, page, options);
  return (data.results || []).map((s) => normalizeTmdbTVShow(s, genreMap)).filter(Boolean);
}

export async function fetchPopularTVShows(page = 1, options, genreMap = {}) {
  if (!isApiConfigured()) return getBingeWorthyTVShows();
  const data = await tmdbApi.getPopularTV(page, options);
  return (data.results || []).map((s) => normalizeTmdbTVShow(s, genreMap)).filter(Boolean);
}

export async function fetchTopRatedTVShows(page = 1, options, genreMap = {}) {
  if (!isApiConfigured()) return getTopRatedTVShows();
  const data = await tmdbApi.getTopRatedTV(page, options);
  return (data.results || []).map((s) => normalizeTmdbTVShow(s, genreMap)).filter(Boolean);
}

export async function fetchTVShowDetails(tvId, options) {
  const localMatch = getTVShowById(tvId);
  if (!isApiConfigured() || (localMatch && isNaN(Number(tvId)))) {
    return localMatch;
  }
  const data = await tmdbApi.getTVDetails(tvId, options);
  return normalizeTmdbTVShow(data);
}

export async function fetchTVShowCredits(tvId, options) {
  if (!isApiConfigured() || isNaN(Number(tvId))) return { cast: [], crew: [] };
  return tmdbApi.getTVCredits(tvId, options);
}

export async function fetchSimilarTVShows(tvId, page = 1, options) {
  if (!isApiConfigured() || isNaN(Number(tvId))) {
    return getRelatedTVShows(tvId, 6);
  }
  const data = await tmdbApi.getSimilarTV(tvId, page, options);
  return (data.results || []).map((s) => normalizeTmdbTVShow(s)).filter(Boolean);
}

const SEASON_CACHE = new Map();

export async function fetchTVSeasonDetails(tvId, seasonNumber, options) {
  if (!isApiConfigured() || isNaN(Number(tvId))) return null;
  const cacheKey = `${tvId}:${seasonNumber}`;
  if (SEASON_CACHE.has(cacheKey)) {
    return SEASON_CACHE.get(cacheKey);
  }
  const data = await tmdbApi.getTVSeasonDetails(tvId, seasonNumber, options);
  if (data) {
    SEASON_CACHE.set(cacheKey, data);
  }
  return data;
}

export async function fetchTVEpisodeDetails(tvId, seasonNumber, episodeNumber, options) {
  if (!isApiConfigured() || isNaN(Number(tvId))) return null;
  return tmdbApi.getTVEpisodeDetails(tvId, seasonNumber, episodeNumber, options);
}
