import POSTERS from '../assets/posters/index.jsx';
import duneBackdrop from '../assets/backgrounds/hero-backdrop.jpg';
import cyberpunkBackdrop from '../assets/backgrounds/hero-cyberpunk.jpg';
import fantasyBackdrop from '../assets/backgrounds/hero-fantasy.jpg';

/**
 * Consolidated MOVORA Real Movies Catalog
 * Curated authentic, high-rated global blockbusters, Bollywood hits, and family animations.
 * Every title is backed by local poster assets stored in src/assets/posters/.
 */
export const LOCAL_MOVIES = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    tagline: 'Long live the fighters.',
    year: '2024',
    rating: 8.5,
    duration: '2h 46m',
    releaseDate: 'March 1, 2024',
    genre: 'Sci-Fi • Epic Adventure',
    language: 'English',
    posterUrl: POSTERS['dune-2'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    mediaType: 'movie',
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    tagline: 'The world forever changes.',
    year: '2023',
    rating: 8.9,
    duration: '3h 00m',
    releaseDate: 'July 21, 2023',
    genre: 'Biography • Drama • History',
    language: 'English',
    posterUrl: POSTERS['oppenheimer'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, examining the moral dilemmas and political fallout that followed.',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    mediaType: 'movie',
  },
  {
    id: 'the-dark-knight',
    title: 'The Dark Knight',
    tagline: 'Welcome to a world without rules.',
    year: '2008',
    rating: 9.0,
    duration: '2h 32m',
    releaseDate: 'July 18, 2008',
    genre: 'Action • Crime • Drama',
    language: 'English',
    posterUrl: POSTERS['the-dark-knight'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
    description:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    mediaType: 'movie',
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    year: '2014',
    rating: 8.7,
    duration: '2h 49m',
    releaseDate: 'November 7, 2014',
    genre: 'Sci-Fi • Adventure • Drama',
    language: 'English',
    posterUrl: POSTERS['interstellar'],
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    description:
      'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    mediaType: 'movie',
  },
  {
    id: 'inception',
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime.',
    year: '2010',
    rating: 8.8,
    duration: '2h 28m',
    releaseDate: 'July 16, 2010',
    genre: 'Action • Sci-Fi • Thriller',
    language: 'English',
    posterUrl: POSTERS['inception'],
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    description:
      'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    mediaType: 'movie',
  },
  {
    id: 'deadpool-and-wolverine',
    title: 'Deadpool & Wolverine',
    tagline: 'Come together.',
    year: '2024',
    rating: 7.8,
    duration: '2h 08m',
    releaseDate: 'July 26, 2024',
    genre: 'Action • Comedy • Sci-Fi',
    language: 'English',
    posterUrl: POSTERS['deadpool-and-wolverine'],
    backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    description:
      'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit up with an even more reluctant Wolverine.',
    trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    mediaType: 'movie',
  },
  {
    id: 'gladiator-2',
    title: 'Gladiator II',
    tagline: 'What we do in life echoes in eternity.',
    year: '2024',
    rating: 6.8,
    duration: '2h 28m',
    releaseDate: 'November 22, 2024',
    genre: 'Action • Adventure • Drama',
    language: 'English',
    posterUrl: POSTERS['gladiator-2'],
    backdropUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1920&q=80',
    description:
      'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
    trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
    mediaType: 'movie',
  },
  {
    id: 'alien-romulus',
    title: 'Alien: Romulus',
    tagline: 'In space no one can hear you scream.',
    year: '2024',
    rating: 7.3,
    duration: '1h 59m',
    releaseDate: 'August 16, 2024',
    genre: 'Sci-Fi • Horror • Thriller',
    language: 'English',
    posterUrl: POSTERS['alien-romulus'],
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    description:
      'While scavenging the deep ends of a derelict space station, a group of young space colonizers come face to face with the most terrifying life form in the universe.',
    trailerUrl: 'https://www.youtube.com/watch?v=x0XDEhP4MQs',
    mediaType: 'movie',
  },
  {
    id: 'spider-man-across-the-spider-verse',
    title: 'Spider-Man: Across the Spider-Verse',
    tagline: 'It is how you wear the mask that matters.',
    year: '2023',
    rating: 8.6,
    duration: '2h 20m',
    releaseDate: 'June 2, 2023',
    genre: 'Animation • Action • Sci-Fi',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['across-the-spider-verse'],
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    description:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    mediaType: 'movie',
  },
  {
    id: 'john-wick-4',
    title: 'John Wick: Chapter 4',
    tagline: 'No way back. One way out.',
    year: '2023',
    rating: 7.7,
    duration: '2h 49m',
    releaseDate: 'March 24, 2023',
    genre: 'Action • Crime • Thriller',
    language: 'English',
    posterUrl: POSTERS['john-wick-4'],
    backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80',
    description:
      'John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe and forces that turn old friends into foes.',
    trailerUrl: 'https://www.youtube.com/watch?v=qEVUtrk8_B4',
    mediaType: 'movie',
  },
  {
    id: 'top-gun-maverick',
    title: 'Top Gun: Maverick',
    tagline: 'Feel the need.',
    year: '2022',
    rating: 8.2,
    duration: '2h 10m',
    releaseDate: 'May 27, 2022',
    genre: 'Action • Drama',
    language: 'English',
    posterUrl: POSTERS['top-gun-maverick'],
    backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    description:
      'After thirty years, Maverick is still pushing the envelope as a top naval aviator, but must confront ghosts of his past when he leads TOP GUN elite graduates on a mission that demands the ultimate sacrifice.',
    trailerUrl: 'https://www.youtube.com/watch?v=giXco2jaZ_4',
    mediaType: 'movie',
  },
  {
    id: 'the-batman',
    title: 'The Batman',
    tagline: 'Unmask the truth.',
    year: '2022',
    rating: 7.7,
    duration: '2h 56m',
    releaseDate: 'March 4, 2022',
    genre: 'Action • Crime • Drama',
    language: 'English',
    posterUrl: POSTERS['the-batman'],
    backdropUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1920&q=80',
    description:
      'When a sadistic serial killer begins murdering key political figures in Gotham, the Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
    trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    mediaType: 'movie',
  },
  {
    id: 'the-shawshank-redemption',
    title: 'The Shawshank Redemption',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    year: '1994',
    rating: 9.3,
    duration: '2h 22m',
    releaseDate: 'September 23, 1994',
    genre: 'Drama • Crime',
    language: 'English',
    posterUrl: POSTERS['shawshank-redemption'],
    backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80',
    description:
      'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion in the harsh Shawshank State Penitentiary.',
    trailerUrl: 'https://www.youtube.com/watch?v=PLl99DlL6b4',
    mediaType: 'movie',
  },
  {
    id: 'the-godfather',
    title: 'The Godfather',
    tagline: 'An offer you cannot refuse.',
    year: '1972',
    rating: 9.2,
    duration: '2h 55m',
    releaseDate: 'March 24, 1972',
    genre: 'Crime • Drama',
    language: 'English',
    posterUrl: POSTERS['the-godfather'],
    backdropUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1920&q=80',
    description:
      'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son in this timeless saga of family, power, and loyalty.',
    trailerUrl: 'https://www.youtube.com/watch?v=sY1S349gOnI',
    mediaType: 'movie',
  },
  {
    id: 'fight-club',
    title: 'Fight Club',
    tagline: 'Mischief. Mayhem. Soap.',
    year: '1999',
    rating: 8.8,
    duration: '2h 19m',
    releaseDate: 'October 15, 1999',
    genre: 'Drama • Thriller',
    language: 'English',
    posterUrl: POSTERS['fight-club'],
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    description:
      'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more than either anticipated.',
    trailerUrl: 'https://www.youtube.com/watch?v=qtRKdVHc-cE',
    mediaType: 'movie',
  },
  {
    id: 'pulp-fiction',
    title: 'Pulp Fiction',
    tagline: 'Just because you are a character doesn\'t mean that you have character.',
    year: '1994',
    rating: 8.9,
    duration: '2h 34m',
    releaseDate: 'October 14, 1994',
    genre: 'Crime • Drama',
    language: 'English',
    posterUrl: POSTERS['pulp-fiction'],
    backdropUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1920&q=80',
    description:
      'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption in Los Angeles.',
    trailerUrl: 'https://www.youtube.com/watch?v=tGpTpVyI_OQ',
    mediaType: 'movie',
  },
  {
    id: 'the-lord-of-the-rings',
    title: 'The Lord of the Rings: The Return of the King',
    tagline: 'The eye of the enemy is moving.',
    year: '2003',
    rating: 9.0,
    duration: '3h 21m',
    releaseDate: 'December 17, 2003',
    genre: 'Fantasy • Adventure • Drama',
    language: 'English',
    posterUrl: POSTERS['lord-of-the-rings'],
    backdropUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    description:
      'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.',
    trailerUrl: 'https://www.youtube.com/watch?v=r5X-hFf6Bwo',
    mediaType: 'movie',
  },
  {
    id: 'avatar-the-way-of-water',
    title: 'Avatar: The Way of Water',
    tagline: 'Return to Pandora.',
    year: '2022',
    rating: 7.7,
    duration: '3h 12m',
    releaseDate: 'December 16, 2022',
    genre: 'Sci-Fi • Adventure • Action',
    language: 'English',
    posterUrl: POSTERS['avatar-way-of-water'],
    backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    description:
      'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    mediaType: 'movie',
  },
  {
    id: 'avengers-endgame',
    title: 'Avengers: Endgame',
    tagline: 'Part of the journey is the end.',
    year: '2019',
    rating: 8.4,
    duration: '3h 01m',
    releaseDate: 'April 26, 2019',
    genre: 'Action • Sci-Fi • Adventure',
    language: 'English',
    posterUrl: POSTERS['avengers-endgame'],
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80',
    description:
      'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.',
    trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    mediaType: 'movie',
  },
  {
    id: 'spider-man-no-way-home',
    title: 'Spider-Man: No Way Home',
    tagline: 'The Multiverse unleashed.',
    year: '2021',
    rating: 8.2,
    duration: '2h 28m',
    releaseDate: 'December 17, 2021',
    genre: 'Action • Adventure • Sci-Fi',
    language: 'English',
    posterUrl: POSTERS['spider-man-no-way-home'],
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    description:
      'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
    trailerUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    mediaType: 'movie',
  },
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    tagline: 'There is still a page left.',
    year: '2017',
    rating: 8.0,
    duration: '2h 44m',
    releaseDate: 'October 6, 2017',
    genre: 'Sci-Fi • Mystery • Drama',
    language: 'English',
    posterUrl: POSTERS['blade-runner-2049'],
    backdropUrl: cyberpunkBackdrop,
    description:
      'Young Blade Runner K\'s discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who\'s been missing for thirty years in the neon-drenched dystopia of Los Angeles.',
    trailerUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
    mediaType: 'movie',
  },
  {
    id: 'the-matrix',
    title: 'The Matrix',
    tagline: 'Welcome to the Real World.',
    year: '1999',
    rating: 8.7,
    duration: '2h 16m',
    releaseDate: 'March 31, 1999',
    genre: 'Sci-Fi • Action',
    language: 'English',
    posterUrl: POSTERS['the-matrix'],
    backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    description:
      'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.',
    trailerUrl: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
    mediaType: 'movie',
  },
  {
    id: 'parasite',
    title: 'Parasite',
    tagline: 'Act like you own the place.',
    year: '2019',
    rating: 8.5,
    duration: '2h 12m',
    releaseDate: 'October 11, 2019',
    genre: 'Drama • Thriller • Comedy',
    language: 'Korean',
    posterUrl: POSTERS['parasite'],
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    description:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan in Bong Joon-ho\'s Academy Award-winning masterpiece.',
    trailerUrl: 'https://www.youtube.com/watch?v=5xH0RzeSojI',
    mediaType: 'movie',
  },
  {
    id: 'avengers-infinity-war',
    title: 'Avengers: Infinity War',
    tagline: 'An entire universe. Once and for all.',
    year: '2018',
    rating: 8.4,
    duration: '2h 29m',
    releaseDate: 'April 27, 2018',
    genre: 'Action • Sci-Fi • Adventure',
    language: 'English',
    posterUrl: POSTERS['avengers-infinity-war'],
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80',
    description:
      'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.',
    trailerUrl: 'https://www.youtube.com/watch?v=6ZfuNTqbHE8',
    mediaType: 'movie',
  },
  {
    id: 'captain-america-brave-new-world',
    title: 'Captain America: Brave New World',
    tagline: 'A new world order arrives.',
    year: '2025',
    rating: 8.4,
    duration: '2h 15m',
    releaseDate: 'February 14, 2025',
    genre: 'Action • Sci-Fi • Adventure',
    language: 'English',
    posterUrl: POSTERS['captain-america-brave-new-world'],
    backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80',
    description:
      'Sam Wilson officially takes up the mantle of Captain America, finding himself in the middle of an international incident and having to discover the reason behind a nefarious global plot.',
    trailerUrl: 'https://www.youtube.com/watch?v=1pHDWnXmKMY',
    mediaType: 'movie',
  },
  {
    id: 'sonic-the-hedgehog-3',
    title: 'Sonic the Hedgehog 3',
    tagline: 'Try to keep up.',
    year: '2024',
    rating: 7.8,
    duration: '1h 50m',
    releaseDate: 'December 20, 2024',
    genre: 'Animation • Adventure • Comedy',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['sonic-3'],
    backdropUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1920&q=80',
    description:
      'Sonic, Knuckles, and Tails reunite against a powerful new adversary, Shadow, a mysterious villain with powers unlike anything they have faced before. With their abilities outmatched, Team Sonic must seek an unlikely alliance.',
    trailerUrl: 'https://www.youtube.com/watch?v=qSu6i2iFMO0',
    mediaType: 'movie',
  },
  {
    id: 'wicked',
    title: 'Wicked',
    tagline: 'Defy gravity.',
    year: '2024',
    rating: 7.5,
    duration: '2h 40m',
    releaseDate: 'November 22, 2024',
    genre: 'Fantasy • Musical • Drama',
    language: 'English',
    posterUrl: POSTERS['wicked'],
    backdropUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80',
    description:
      'Elphaba, an ostracized but gifted young woman, and Glinda, a bubbly popular student, forge an unlikely friendship in the magical Land of Oz that changes their destinies forever.',
    trailerUrl: 'https://www.youtube.com/watch?v=6COmYeLsz4c',
    mediaType: 'movie',
  },
  {
    id: 'dune-part-one',
    title: 'Dune: Part One',
    tagline: 'It begins.',
    year: '2021',
    rating: 8.0,
    duration: '2h 35m',
    releaseDate: 'October 22, 2021',
    genre: 'Sci-Fi • Adventure • Drama',
    language: 'English',
    posterUrl: POSTERS['dune-1'],
    backdropUrl: duneBackdrop,
    description:
      'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.',
    trailerUrl: 'https://www.youtube.com/watch?v=8g18jFHCLXk',
    mediaType: 'movie',
  },
  {
    id: 'inside-out-2',
    title: 'Inside Out 2',
    tagline: 'Make room for new emotions.',
    year: '2024',
    rating: 7.7,
    duration: '1h 36m',
    releaseDate: 'June 14, 2024',
    genre: 'Animation • Family • Comedy',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['inside-out-2'],
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1920&q=80',
    description:
      'Teenager Riley\'s mind headquarters undergoes a sudden demolition to make room for unexpected emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up with brand new crew members.',
    trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    mediaType: 'movie',
  },
  {
    id: 'the-lion-king',
    title: 'The Lion King',
    tagline: 'The Circle of Life.',
    year: '1994',
    rating: 8.5,
    duration: '1h 28m',
    releaseDate: 'June 24, 1994',
    genre: 'Animation • Drama • Family',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['the-lion-king'],
    backdropUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=1920&q=80',
    description:
      'Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself. Guided by wise mentors, Simba must grow to reclaim his rightful place in the Pride Lands.',
    trailerUrl: 'https://www.youtube.com/watch?v=lFzVJEksoDY',
    mediaType: 'movie',
  },
  {
    id: 'coco',
    title: 'Coco',
    tagline: 'Celebrate the wonder of life and family.',
    year: '2017',
    rating: 8.4,
    duration: '1h 45m',
    releaseDate: 'November 22, 2017',
    genre: 'Animation • Family • Fantasy',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['coco'],
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    description:
      'Aspiring musician Miguel, confronted with his family\'s ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer, and unlock the truth of his heritage.',
    trailerUrl: 'https://www.youtube.com/watch?v=Rvr68u635R8',
    mediaType: 'movie',
  },
  {
    id: 'kung-fu-panda-4',
    title: 'Kung Fu Panda 4',
    tagline: 'Hold on to your dumplings.',
    year: '2024',
    rating: 7.1,
    duration: '1h 34m',
    releaseDate: 'March 8, 2024',
    genre: 'Animation • Action • Comedy',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['kung-fu-panda-4'],
    backdropUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=1920&q=80',
    description:
      'After Po is tapped to become the Spiritual Leader of the Valley of Peace, he needs to find and train a new Dragon Warrior, while a wicked sorceress plans to re-summon all the master villains whom Po has vanquished.',
    trailerUrl: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
    mediaType: 'movie',
  },
  {
    id: 'spirited-away',
    title: 'Spirited Away',
    tagline: 'The tunnel led to a mysterious realm.',
    year: '2001',
    rating: 8.6,
    duration: '2h 05m',
    releaseDate: 'July 20, 2001',
    genre: 'Animation • Fantasy • Adventure',
    language: 'Japanese',
    isKids: true,
    posterUrl: POSTERS['spirited-away'],
    backdropUrl: fantasyBackdrop,
    description:
      'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts. Studio Ghibli\'s Academy Award winner.',
    trailerUrl: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    mediaType: 'movie',
  },
  {
    id: 'despicable-me-4',
    title: 'Despicable Me 4',
    tagline: 'Things just got a little more despicable.',
    year: '2024',
    rating: 7.1,
    duration: '1h 35m',
    releaseDate: 'July 3, 2024',
    genre: 'Animation • Comedy • Family',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['despicable-me-4'],
    backdropUrl: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=1920&q=80',
    description:
      'Gru, Lucy and their girls welcome a new member to the family, Gru Jr., who is intent on tormenting his dad. A new nemesis emerges, forcing the family into witness protection and testing super-powered Mega Minions.',
    trailerUrl: 'https://www.youtube.com/watch?v=qQlr9-rF32t',
    mediaType: 'movie',
  },
  {
    id: 'ratatouille',
    title: 'Ratatouille',
    tagline: 'Anyone can cook.',
    year: '2007',
    rating: 8.1,
    duration: '1h 51m',
    releaseDate: 'June 29, 2007',
    genre: 'Animation • Comedy • Family',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['ratatouille'],
    backdropUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1920&q=80',
    description:
      'A rat who can cook makes an unusual alliance with a young kitchen worker at a famous Paris restaurant, turning the culinary world upside down with heart, passion, and extraordinary French cuisine.',
    trailerUrl: 'https://www.youtube.com/watch?v=NgsQ8mVkN8w',
    mediaType: 'movie',
  },
  {
    id: 'shrek-2',
    title: 'Shrek 2',
    tagline: 'Once upon another time...',
    year: '2004',
    rating: 7.3,
    duration: '1h 33m',
    releaseDate: 'May 19, 2004',
    genre: 'Animation • Comedy • Fantasy',
    language: 'English',
    isKids: true,
    posterUrl: POSTERS['shrek-2'],
    backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    description:
      'Shrek and Fiona travel to the Kingdom of Far Far Away, where Fiona\'s parents are King and Queen, to celebrate their marriage. When they arrive, they find they are not quite as welcome as they thought.',
    trailerUrl: 'https://www.youtube.com/watch?v=V6X5ti4YlG8',
    mediaType: 'movie',
  },
  {
    id: 'your-name',
    title: 'Your Name',
    tagline: 'Treasure the experience. Dreams fade away after you wake up.',
    year: '2016',
    rating: 8.4,
    duration: '1h 46m',
    releaseDate: 'August 26, 2016',
    genre: 'Animation • Romance • Fantasy',
    language: 'Japanese',
    isKids: true,
    posterUrl: POSTERS['your-name'],
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
    description:
      'Two teenagers share a profound, magical connection upon discovering they are swapping bodies. Things become even more complicated when the boy and girl decide to meet in person across space and time.',
    trailerUrl: 'https://www.youtube.com/watch?v=xU47nhruN-Q',
    mediaType: 'movie',
  },
  {
    id: 'jawan',
    title: 'Jawan',
    tagline: 'Ready or not, here he comes.',
    year: '2023',
    rating: 8.4,
    duration: '2h 49m',
    releaseDate: 'September 7, 2023',
    genre: 'Bollywood • Action • Thriller',
    language: 'Hindi',
    isBollywood: true,
    posterUrl: POSTERS['jawan'],
    backdropUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80',
    description:
      'A high-stakes emotional journey of a prison warden who, driven by a personal vendetta and a sense of justice, recruits an army of women inmates to fight systemic corruption and protect the common man.',
    trailerUrl: 'https://www.youtube.com/watch?v=COv52Qyctws',
    mediaType: 'movie',
  },
  {
    id: 'rrr',
    title: 'RRR: Rise Roar Revolt',
    tagline: 'Water and fire ignite revolution.',
    year: '2022',
    rating: 8.9,
    duration: '3h 07m',
    releaseDate: 'March 25, 2022',
    genre: 'Bollywood • Action • Epic Period',
    language: 'Telugu / Hindi',
    isBollywood: true,
    posterUrl: POSTERS['rrr'],
    backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1920&q=80',
    description:
      'A fearless revolutionary and an upright British-Indian officer forge an unbreakable friendship unaware of each other\'s true identities, sparking an explosive historic uprising against colonial rule.',
    trailerUrl: 'https://www.youtube.com/watch?v=NgBoAMXJ6iE',
    mediaType: 'movie',
  },
  {
    id: '12th-fail',
    title: '12th Fail',
    tagline: 'Restart. Defy the odds.',
    year: '2023',
    rating: 9.0,
    duration: '2h 27m',
    releaseDate: 'October 27, 2023',
    genre: 'Bollywood • Drama • Inspiring Biography',
    language: 'Hindi',
    isBollywood: true,
    posterUrl: POSTERS['12th-fail'],
    backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80',
    description:
      'Based on the true story of Manoj Kumar Sharma, who overcomes extreme poverty and systemic corruption to restart his life and crack the prestigious civil services examination in India.',
    trailerUrl: 'https://www.youtube.com/watch?v=WeM3v5G_26w',
    mediaType: 'movie',
  },
  {
    id: 'dangal',
    title: 'Dangal',
    tagline: 'Mhari chhoriyan chhoron se kam hain ke?',
    year: '2016',
    rating: 8.8,
    duration: '2h 41m',
    releaseDate: 'December 23, 2016',
    genre: 'Bollywood • Biography • Sports Drama',
    language: 'Hindi',
    isBollywood: true,
    posterUrl: POSTERS['dangal'],
    backdropUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1920&q=80',
    description:
      'Former wrestler Mahavir Singh Phogat overcomes societal prejudices to train his daughters Geeta and Babita for Commonwealth Gold, defying every obstacle to forge global sports legends.',
    trailerUrl: 'https://www.youtube.com/watch?v=x_7YlGv9u1g',
    mediaType: 'movie',
  },
  {
    id: 'animal',
    title: 'Animal',
    tagline: 'Fatherhood taken to the absolute extreme.',
    year: '2023',
    rating: 8.1,
    duration: '3h 24m',
    releaseDate: 'December 1, 2023',
    genre: 'Bollywood • Action • Crime Drama',
    language: 'Hindi',
    isBollywood: true,
    posterUrl: POSTERS['animal'],
    backdropUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=1920&q=80',
    description:
      'The turbulent relationship between a powerful industrialist and his fiercely devoted son leads to an unstoppable war of blood and vengeance across continents when an assassination attempt threatens the family empire.',
    trailerUrl: 'https://www.youtube.com/watch?v=DydmpkhEVWQ',
    mediaType: 'movie',
  },
  {
    id: 'pathaan',
    title: 'Pathaan',
    tagline: 'A soldier does not ask what his country can do for him.',
    year: '2023',
    rating: 8.2,
    duration: '2h 26m',
    releaseDate: 'January 25, 2023',
    genre: 'Bollywood • Action • Spy Thriller',
    language: 'Hindi',
    isBollywood: true,
    posterUrl: POSTERS['pathaan'],
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
    description:
      'An exiled RAW agent teams up with an elusive operative to stop an impending deadly bioweapon attack orchestrated by a rogue private terrorist syndicate across global borders.',
    trailerUrl: 'https://www.youtube.com/watch?v=vqu4z34wENw',
    mediaType: 'movie',
  },
];

/**
 * Retrieve movie by ID, with seamless backward-compatibility aliases
 * @param {string|number} id 
 * @returns {Object|null}
 */
export function getMovieById(id) {
  if (!id) return null;
  const normalizedId = String(id).toLowerCase().trim();
  
  // Backward compatibility alias mappings
  if (normalizedId === '1' || normalizedId === 'chronicles-of-arrakis' || normalizedId === 'dune-odyssey') {
    return LOCAL_MOVIES.find((m) => m.id === 'dune-part-two') || LOCAL_MOVIES[0];
  }
  if (normalizedId === 'neon-syndicate-2099' || normalizedId === 'cyber-metropolis' || normalizedId === 'shadows-of-neo-kyoto') {
    return LOCAL_MOVIES.find((m) => m.id === 'blade-runner-2049') || LOCAL_MOVIES[1];
  }
  if (normalizedId === 'realm-of-embers' || normalizedId === 'obsidian-throne' || normalizedId === 'fortress-of-embers') {
    return LOCAL_MOVIES.find((m) => m.id === 'gladiator-2') || LOCAL_MOVIES[2];
  }
  if (normalizedId === 'quantum-enigma' || normalizedId === 'silent-horizon' || normalizedId === 'celestial-horizon') {
    return LOCAL_MOVIES.find((m) => m.id === 'interstellar') || LOCAL_MOVIES[3];
  }

  return LOCAL_MOVIES.find((m) => String(m.id).toLowerCase() === normalizedId) || null;
}

/**
 * Retrieve related movies for a given movie (same genre or nearby catalog)
 * @param {string|number} currentMovieId
 * @param {number} limit 
 * @returns {Array<Object>}
 */
export function getRelatedMovies(currentMovieId, limit = 6) {
  const current = getMovieById(currentMovieId);
  if (!current) return [];

  return LOCAL_MOVIES
    .filter((m) => String(m.id) !== String(current.id))
    .slice(0, limit);
}

/**
 * Retrieve all local movies
 * @returns {Array<Object>}
 */
export function getAllMovies() {
  return [...LOCAL_MOVIES];
}

/**
 * Retrieve all curated kids & animated movies
 * @returns {Array<Object>}
 */
export function getKidsMovies() {
  return LOCAL_MOVIES.filter((m) => m.isKids);
}

/**
 * Retrieve 6 curated Bollywood blockbuster movies
 * @returns {Array<Object>}
 */
export function getBollywoodMovies() {
  const bollywoodIds = ['jawan', 'rrr', '12th-fail', 'dangal', 'animal', 'pathaan'];
  return bollywoodIds.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 high-octane Action movies
 * @returns {Array<Object>}
 */
export function getActionMovies() {
  const actionIds = ['deadpool-and-wolverine', 'the-dark-knight', 'john-wick-4', 'gladiator-2', 'top-gun-maverick', 'the-batman'];
  return actionIds.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Sci-Fi & Cyberpunk movies
 * @returns {Array<Object>}
 */
export function getSciFiMovies() {
  const scifiIds = ['dune-part-two', 'interstellar', 'inception', 'blade-runner-2049', 'the-matrix', 'avatar-the-way-of-water'];
  return scifiIds.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Dark Fantasy & Epic movies
 * @returns {Array<Object>}
 */
export function getFantasyMovies() {
  const fantasyIds = ['the-lord-of-the-rings', 'wicked', 'spirited-away', 'coco', 'dune-part-one', 'gladiator-2'];
  return fantasyIds.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Adventure movies
 * @returns {Array<Object>}
 */
export function getAdventureMovies() {
  const adventureIds = ['dune-part-two', 'interstellar', 'avatar-the-way-of-water', 'the-lord-of-the-rings', 'spider-man-no-way-home', 'top-gun-maverick'];
  return adventureIds.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Thriller movies
 * @returns {Array<Object>}
 */
export function getThrillerMovies() {
  const thrillerIds = ['oppenheimer', 'inception', 'fight-club', 'parasite', 'alien-romulus', 'the-dark-knight'];
  return thrillerIds.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Top Rated Masterpiece movies
 * @returns {Array<Object>}
 */
export function getTopRatedMovies() {
  const topIds = ['the-shawshank-redemption', 'the-godfather', 'the-dark-knight', 'pulp-fiction', '12th-fail', 'rrr'];
  return topIds.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Kids Cartoons & Animation movies
 * @returns {Array<Object>}
 */
export function getKidsCartoons() {
  const ids = ['inside-out-2', 'despicable-me-4', 'ratatouille', 'kung-fu-panda-4', 'shrek-2', 'the-lion-king'];
  return ids.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Kids Fantasy & Magic movies
 * @returns {Array<Object>}
 */
export function getKidsFantasy() {
  const ids = ['spirited-away', 'coco', 'your-name', 'spider-man-across-the-spider-verse', 'the-lion-king', 'shrek-2'];
  return ids.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Kids Space & Sci-Fi movies
 * @returns {Array<Object>}
 */
export function getKidsSciFi() {
  const ids = ['spider-man-across-the-spider-verse', 'sonic-the-hedgehog-3', 'inside-out-2', 'ratatouille', 'despicable-me-4', 'kung-fu-panda-4'];
  return ids.map((id) => getMovieById(id)).filter(Boolean);
}

/**
 * Retrieve 6 Kids Family & Comedy movies
 * @returns {Array<Object>}
 */
export function getKidsFamily() {
  const ids = ['the-lion-king', 'coco', 'inside-out-2', 'ratatouille', 'shrek-2', 'despicable-me-4'];
  return ids.map((id) => getMovieById(id)).filter(Boolean);
}
