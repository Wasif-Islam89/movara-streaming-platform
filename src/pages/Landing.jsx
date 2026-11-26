import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Tv, 
  Download, 
  Film, 
  Smile, 
  Play,
  ArrowRight,
  LogIn
} from 'lucide-react';
import movoraLogo from '../assets/logo/MOVORA Logo.png';
import AuthModal from '../components/AuthModal';
import Footer from '../components/Footer';
import POSTERS from '../assets/posters/index.jsx';

// High-resolution visual posters for background collage and trending
const COLLAGE_POSTERS = [
  POSTERS['dune-2'],
  POSTERS['oppenheimer'],
  POSTERS['the-dark-knight'],
  POSTERS['interstellar'],
  POSTERS['deadpool-and-wolverine'],
  POSTERS['gladiator-2'],
  POSTERS['across-the-spider-verse'],
  POSTERS['john-wick-4'],
  POSTERS['top-gun-maverick'],
  POSTERS['the-batman'],
  POSTERS['inception'],
  POSTERS['jawan'],
];

const TRENDING_TOP_10 = [
  {
    id: 1,
    title: 'Dune: Part Two',
    category: 'Epic Sci-Fi',
    image: POSTERS['dune-2'],
  },
  {
    id: 2,
    title: 'Deadpool & Wolverine',
    category: 'Action Comedy',
    image: POSTERS['deadpool-and-wolverine'],
  },
  {
    id: 3,
    title: 'Oppenheimer',
    category: 'Biographical Drama',
    image: POSTERS['oppenheimer'],
  },
  {
    id: 4,
    title: 'Gladiator II',
    category: 'Historical Epic',
    image: POSTERS['gladiator-2'],
  },
  {
    id: 5,
    title: 'Across the Spider-Verse',
    category: 'Animated Multiverse',
    image: POSTERS['across-the-spider-verse'],
  },
  {
    id: 6,
    title: 'The Dark Knight',
    category: 'Crime Masterpiece',
    image: POSTERS['the-dark-knight'],
  },
  {
    id: 7,
    title: 'Interstellar',
    category: 'Deep Space Odyssey',
    image: POSTERS['interstellar'],
  },
  {
    id: 8,
    title: 'John Wick: Chapter 4',
    category: 'Action Thriller',
    image: POSTERS['john-wick-4'],
  },
  {
    id: 9,
    title: 'Jawan',
    category: 'Bollywood Action',
    image: POSTERS['jawan'],
  },
  {
    id: 10,
    title: 'Inside Out 2',
    category: 'Family Adventure',
    image: POSTERS['inside-out-2'],
  },
];

const MOVORA_EXPERIENCE = [
  {
    title: 'Theatre-Grade 4K & Spatial Sound',
    description: 'Immerse yourself in crystal-clear ultra-high definition with Dolby Atmos surround audio engineered for true cinema lovers.',
    icon: Tv,
    gradient: 'from-amber-500/20 to-orange-500/5',
    iconColor: 'text-[#F2B84B]',
  },
  {
    title: 'Instant Offline Screening',
    description: 'Download your favorite epics directly to your device and binge uninterrupted wherever life takes you, no internet required.',
    icon: Download,
    gradient: 'from-orange-500/20 to-amber-500/5',
    iconColor: 'text-[#E58B43]',
  },
  {
    title: 'Handpicked Curated Cinema',
    description: 'Explore exclusive indie triumphs, international festival favorites, and Hollywood masterworks curated by genuine film lovers.',
    icon: Film,
    gradient: 'from-yellow-500/20 to-amber-500/5',
    iconColor: 'text-[#F2B84B]',
  },
  {
    title: 'Safe Family & Kids Universe',
    description: 'Delight young minds with dedicated animated adventures, complete with intelligent PIN-protected parental filters.',
    icon: Smile,
    gradient: 'from-amber-600/20 to-orange-600/5',
    iconColor: 'text-[#E58B43]',
  },
];

const FAQ_ITEMS = [
  {
    q: 'What makes MOVORA unique?',
    a: 'MOVORA is purpose-built for film aficionados and story enthusiasts. We blend theater-grade 4K HDR streaming with an impeccably curated library of global blockbusters, indie festival gems, and exclusive originals—presented in a distraction-free, cinematic environment.',
  },
  {
    q: 'How do I start watching?',
    a: 'Getting started is effortless. Enter your email above or click Sign In to unlock instant access. You can begin streaming immediately on your computer, TV, or mobile device.',
  },
  {
    q: 'Which devices are supported?',
    a: 'MOVORA streams smoothly across Smart TVs (Samsung, LG, Sony), Apple TV, Android TV, Fire TV, PlayStation, Xbox, iOS, Android devices, and all major desktop web browsers.',
  },
  {
    q: 'Are there any contracts or cancellation penalties?',
    a: 'None whatsoever. MOVORA offers complete freedom with zero commitments. You can pause, adjust, or cancel your membership with a single click anytime from your profile settings.',
  },
  {
    q: 'What video and audio standards does MOVORA support?',
    a: 'Every title is delivered in the highest possible quality—supporting native 4K Ultra HD, HDR10+, Dolby Vision, and immersive multi-channel Dolby Atmos audio whenever available.',
  },
  {
    q: 'How do kids profiles and parental locks work?',
    a: 'MOVORA Kids provides a protected family universe with age-filtered cartoons and family films. Parents can easily lock mature profiles behind a 4-digit PIN for complete peace of mind.',
  },
];

export default function Landing({ initialAuthOpen = false, initialAuthMode = 'signin' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(initialAuthOpen);
  const [authMode, setAuthMode] = useState(initialAuthMode);
  const [emailInput, setEmailInput] = useState('');
  const [bottomEmailInput, setBottomEmailInput] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setIsAuthModalOpen(initialAuthOpen);
    setAuthMode(initialAuthMode || 'signin');
  }, [initialAuthOpen, initialAuthMode]);

  function handleCloseAuthModal() {
    setIsAuthModalOpen(false);
    if (location.pathname === '/login' || location.pathname === '/signup') {
      navigate('/', { replace: true });
    }
  }

  function handleGetStarted(e, emailVal) {
    e.preventDefault();
    setEmailInput(emailVal);
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  }

  function toggleFaq(index) {
    setActiveFaq(activeFaq === index ? null : index);
  }

  function handleScroll(direction) {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3EEE4] overflow-x-hidden selection:bg-[#F2B84B] selection:text-[#121212]">
      {/* 1. HERO SECTION WITH VIBRANT CINEMATIC POSTER WALL */}
      <div className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Background Poster Collage Grid */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -inset-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5 opacity-55 md:opacity-60 pointer-events-none transform -rotate-1 scale-105 origin-center">
            {COLLAGE_POSTERS.concat(COLLAGE_POSTERS).map((imgUrl, idx) => (
              <div 
                key={idx} 
                className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1D1C1A] shadow-2xl border border-white/5"
              >
                <img 
                  src={imgUrl} 
                  alt="" 
                  className="w-full h-full object-cover filter brightness-90 contrast-125 saturate-110" 
                />
              </div>
            ))}
          </div>

          {/* Balanced Radial & Linear Vignettes */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 48%, rgba(18,18,18,0.72) 0%, rgba(18,18,18,0.60) 45%, rgba(18,18,18,0.95) 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]/85 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/90 via-transparent to-[#121212]/90 pointer-events-none" />
        </div>

        {/* Top Header Bar — Clean and sharp */}
        <header className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={movoraLogo} 
              alt="MOVORA" 
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_2px_10px_rgba(242,184,75,0.25)]" 
            />
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setIsAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#f5c363] hover:to-[#ea9854] shadow-[0_2px_14px_rgba(242,184,75,0.35)] hover:shadow-[0_4px_22px_rgba(242,184,75,0.55)] transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 group"
            >
              <LogIn className="w-4 h-4 text-[#121212] group-hover:scale-110 transition-transform" />
              <span>Sign In</span>
            </button>
          </div>
        </header>

        {/* Hero Main Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center flex flex-col items-center justify-center my-auto">
          {/* Distinct Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#F3EEE4] tracking-tight leading-tight sm:leading-tight max-w-3xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Cinema Reimagined.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2B84B] via-[#f5c363] to-[#E58B43]">
              Stream Without Limits.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg font-medium text-[#F3EEE4]/90 mt-4 mb-2 max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Stream 4K Ultra HD blockbusters, award-winning originals, and timeless cinema anywhere.
          </p>

          <p className="text-xs sm:text-sm text-[#AAA49A] max-w-xl mx-auto mb-8 drop-shadow">
            Ready to explore? Enter your email to begin your MOVORA journey.
          </p>

          {/* Email Input + CTA Form */}
          <form 
            onSubmit={(e) => handleGetStarted(e, emailInput)}
            className="w-full max-w-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-2 px-2"
          >
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-5 py-3.5 rounded-xl sm:rounded-l-xl sm:rounded-r-none bg-[#121212]/95 border border-[#3E3C38] text-[#F3EEE4] placeholder-[#AAA49A] text-sm sm:text-base backdrop-blur-md focus:outline-none focus:border-[#F2B84B] focus:ring-1 focus:ring-[#F2B84B] transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl sm:rounded-r-xl sm:rounded-l-none font-bold text-sm sm:text-base text-[#121212] bg-[#F2B84B] hover:bg-[#E58B43] shadow-lg shadow-[#F2B84B]/20 transition-colors cursor-pointer whitespace-nowrap group shrink-0"
            >
              <span>Start Watching</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Cinematic Golden Glow Curve Divider */}
        <div className="relative z-10 w-full overflow-hidden leading-none pointer-events-none">
          <div className="h-10 sm:h-14 w-full bg-gradient-to-b from-transparent to-[#121212]" />
          <div className="w-[140%] -ml-[20%] h-12 sm:h-16 rounded-[100%] border-t-2 border-[#F2B84B]/35 bg-gradient-to-b from-[#F2B84B]/15 via-[#121212] to-[#121212] shadow-[0_-12px_40px_rgba(242,184,75,0.18)]" />
        </div>
      </div>

      {/* 2. SECTION: TRENDING ON MOVORA (TOP 10 NUMBERED CARDS) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-[#F3EEE4] tracking-tight">
              Trending on MOVORA
            </h2>
            <p className="text-xs sm:text-sm text-[#AAA49A] mt-0.5">
              Top 10 highest-rated movies and series streaming this week
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2">
            {['All', 'Movies', 'TV Shows'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#F2B84B] text-[#121212] font-bold shadow-md shadow-[#F2B84B]/20'
                    : 'bg-[#1D1C1A] text-[#AAA49A] hover:text-[#F3EEE4] border border-[#2E2D2A]'
                }`}
              >
                {cat}
              </button>
            ))}

            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="p-2 rounded-full bg-[#1D1C1A] border border-[#2E2D2A] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/50 transition-colors cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full bg-[#1D1C1A] border border-[#2E2D2A] text-[#AAA49A] hover:text-[#F3EEE4] hover:border-[#F2B84B]/50 transition-colors cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Numbered Top 10 Row */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none scroll-smooth snap-x"
        >
          {TRENDING_TOP_10.map((movie) => (
            <div
              key={movie.id}
              onClick={() => setIsAuthModalOpen(true)}
              className="relative flex-none w-[170px] sm:w-[210px] md:w-[230px] aspect-[2/3] group cursor-pointer snap-start transition-transform duration-300 hover:scale-105"
            >
              {/* Giant Hollow Rank Number */}
              <div 
                className="absolute -bottom-3 -left-4 sm:-bottom-4 sm:-left-6 z-20 select-none pointer-events-none font-black text-7xl sm:text-8xl md:text-9xl leading-none text-black tracking-tighter"
                style={{
                  WebkitTextStroke: '3px #6E685F',
                  textShadow: '0 4px 18px rgba(0,0,0,0.95)',
                }}
              >
                {movie.id}
              </div>

              {/* Movie Poster Card */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#1D1C1A] border border-[#2E2D2A] group-hover:border-[#F2B84B]/70 shadow-xl transition-all duration-300">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Gradient Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Bottom Card Info & Play Action */}
                <div className="absolute bottom-3 right-3 left-12 sm:left-14 z-20 text-right">
                  <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#F2B84B] text-[#121212] opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md mb-1">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#F3EEE4] truncate drop-shadow">
                    {movie.title}
                  </h3>
                  <p className="text-[10px] text-[#AAA49A] truncate">
                    {movie.category}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SECTION: THE MOVORA EXPERIENCE */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F3EEE4] tracking-tight">
            The MOVORA Experience
          </h2>
          <p className="text-xs sm:text-sm text-[#AAA49A] mt-2">
            Every feature is designed to bring you closer to extraordinary storytelling.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {MOVORA_EXPERIENCE.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl p-6 sm:p-7 bg-[#1D1C1A] border border-[#2A2926] hover:border-[#F2B84B]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-lg"
              >
                {/* Background Gradient Corner Accent */}
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${item.gradient} rounded-full blur-2xl pointer-events-none`} />

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#F3EEE4] group-hover:text-[#F2B84B] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#AAA49A] mt-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Right Floating Icon Badge */}
                <div className="mt-8 flex justify-end">
                  <div className="p-3.5 rounded-2xl bg-[#121212] border border-[#2E2D2A] group-hover:border-[#F2B84B]/40 group-hover:scale-110 transition-all duration-300 shadow-inner">
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SECTION: FREQUENTLY ASKED QUESTIONS */}
      <section className="relative z-20 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F3EEE4] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl overflow-hidden bg-[#1D1C1A] border border-[#2A2926] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between text-left text-base sm:text-lg font-semibold text-[#F3EEE4] hover:bg-[#252421] transition-colors cursor-pointer"
                >
                  <span className="pr-4">{item.q}</span>
                  <Plus 
                    className={`w-6 h-6 text-[#F2B84B] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-45 text-[#E58B43]' : ''
                    }`} 
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-7 pb-6 pt-2 text-xs sm:text-base text-[#AAA49A] leading-relaxed border-t border-[#252421] bg-[#161514]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Secondary Bottom Email CTA */}
        <div className="mt-14 sm:mt-18 text-center p-8 sm:p-10 rounded-3xl bg-[#1D1C1A]/80 border border-[#2E2D2A] backdrop-blur-md">
          <h3 className="text-xl sm:text-2xl font-bold text-[#F3EEE4] mb-2">
            Ready to experience extraordinary cinema?
          </h3>
          <p className="text-xs sm:text-sm text-[#AAA49A] max-w-lg mx-auto mb-6">
            Enter your email to unlock instant streaming and discover hand-curated cinematic marvels.
          </p>

          <form 
            onSubmit={(e) => handleGetStarted(e, bottomEmailInput)}
            className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-2"
          >
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={bottomEmailInput}
                onChange={(e) => setBottomEmailInput(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-5 py-3.5 rounded-xl sm:rounded-l-xl sm:rounded-r-none bg-[#121212] border border-[#3E3C38] text-[#F3EEE4] placeholder-[#AAA49A] text-sm sm:text-base focus:outline-none focus:border-[#F2B84B] focus:ring-1 focus:ring-[#F2B84B] transition-all"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl sm:rounded-r-xl sm:rounded-l-none font-bold text-sm sm:text-base text-[#121212] bg-[#F2B84B] hover:bg-[#E58B43] shadow-lg shadow-[#F2B84B]/20 transition-colors cursor-pointer whitespace-nowrap group shrink-0"
            >
              <span>Start Watching</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </section>

      {/* 5. ORIGINAL MOVORA FOOTER (Same as main pages) */}
      <Footer />

      {/* Sign In & Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        initialMode={authMode}
        initialEmail={emailInput || bottomEmailInput}
      />
    </div>
  );
}
