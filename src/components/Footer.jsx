import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import movoraLogo from '../assets/logo/MOVORA Logo.png';

// Main working navigation routes defined in the application
const BROWSE_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Movies', path: '/movies' },
  { name: 'TV Shows', path: '/tv-shows' },
  { name: 'Discover', path: '/discover' },
  { name: 'Watchlist', path: '/my-list' },
];

// Featured movie categories linked directly to reliable Home page section IDs
const CATEGORY_LINKS = [
  { name: 'Trending Movies', sectionId: 'trending' },
  { name: 'Top Rated Discoveries', sectionId: 'top-rated' },
  { name: 'Popular Movies', sectionId: 'popular' },
  { name: 'Coming Soon', sectionId: 'coming-soon' },
];

// Quick Access features and utility destinations
const QUICK_LINKS = [
  { name: 'Watch History', path: '/watch-history' },
  { name: 'Saved Watchlist', path: '/my-list' },
  { name: 'Featured Releases', path: '/movies' },
  { name: 'Discovery Filter', path: '/discover' },
];

/**
 * Premium Cinematic Footer Component for MOVORA.
 * 
 * Features:
 * - Brand section on left with existing MOVORA logo and tagline
 * - 3 clean link columns: Browse, Categories, and Quick Access
 * - Direct anchor navigation to Home page movie rows with smooth scroll support
 * - Centered copyright and platform disclaimer
 * - Floating golden Back to Top button in bottom-right corner appearing on scroll
 * - Optimized responsive layout for desktop, tablet, and mobile
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Monitor scroll position to show/hide floating back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smoothly scroll to the top of the viewport
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Handle category link click (smooth scroll if already on Home, otherwise navigate via React Router)
  const handleCategoryClick = (e, sectionId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    }
  };

  return (
    <>
      <footer 
        role="contentinfo" 
        aria-label="Site Footer"
        className="bg-[#121212] border-t border-[#1D1C1A] text-[#AAA49A] mt-auto"
      >
        {/* Subtle top gold accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#F2B84B]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
          
          {/* Main Footer Grid: Brand on Left, 3 Navigation Columns on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 pb-10 border-b border-[#1D1C1A]">
            
            {/* Brand Identity & Description (md:col-span-5) */}
            <div className="md:col-span-5 space-y-3 pr-0 md:pr-4 lg:pr-8">
              <Link
                to="/"
                onClick={scrollToTop}
                className="inline-flex items-center group transition-transform duration-200 active:scale-95"
                aria-label="MOVORA Home"
              >
                <img
                  src={movoraLogo}
                  alt="MOVORA"
                  className="h-9 sm:h-10 w-auto max-w-[150px] sm:max-w-[170px] object-contain mix-blend-screen group-hover:opacity-95 transition-all duration-200"
                />
              </Link>

              <p className="text-xs sm:text-sm font-medium text-[#F3EEE4]">
                Discover stories worth watching.
              </p>

              <p className="text-xs sm:text-sm text-[#AAA49A] max-w-sm leading-relaxed">
                MOVORA is a cinematic discovery platform crafted for movie enthusiasts. Explore trending titles, browse curated collections, and track your next favorite watch.
              </p>
            </div>

            {/* 3 Link Columns: Browse, Categories, Quick Links (md:col-span-7) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 text-xs sm:text-sm">
              
              {/* Column 1: Browse Navigation */}
              <div>
                <h3 className="font-semibold text-xs sm:text-sm text-[#F3EEE4] uppercase tracking-wider mb-3.5">
                  Browse
                </h3>
                <nav aria-label="Footer Browse Navigation">
                  <ul className="space-y-2">
                    {BROWSE_LINKS.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.path}
                          className="text-[#AAA49A] hover:text-[#F2B84B] hover:underline transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F2B84B] rounded"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Column 2: Discover Categories */}
              <div>
                <h3 className="font-semibold text-xs sm:text-sm text-[#F3EEE4] uppercase tracking-wider mb-3.5">
                  Categories
                </h3>
                <nav aria-label="Footer Categories Navigation">
                  <ul className="space-y-2">
                    {CATEGORY_LINKS.map((cat) => (
                      <li key={cat.name}>
                        <Link
                          to={`/#${cat.sectionId}`}
                          onClick={(e) => handleCategoryClick(e, cat.sectionId)}
                          className="text-[#AAA49A] hover:text-[#F2B84B] hover:underline transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F2B84B] rounded"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Column 3: Quick Links */}
              <div className="col-span-2 sm:col-span-1">
                <h3 className="font-semibold text-xs sm:text-sm text-[#F3EEE4] uppercase tracking-wider mb-3.5">
                  Quick Access
                </h3>
                <nav aria-label="Footer Quick Links">
                  <ul className="space-y-2">
                    {QUICK_LINKS.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.path}
                          className="text-[#AAA49A] hover:text-[#F2B84B] hover:underline transition-colors duration-150 inline-block py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#F2B84B] rounded"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

            </div>

          </div>

          {/* Bottom Bar: Copyright & Platform Disclaimer (Centered) */}
          <div className="pt-8 text-center space-y-2.5 text-xs">
            <p className="text-[#AAA49A]/90 font-medium">
              &copy; {currentYear} <span className="text-[#F3EEE4]">MOVORA</span>. All rights reserved.
            </p>
            <p className="text-[11px] text-[#AAA49A]/50 max-w-2xl mx-auto leading-relaxed">
              MOVORA is a movie and television discovery catalog. All posters, media trademarks, and imagery belong to their respective copyright holders. MOVORA does not claim to host, stream, or distribute video media.
            </p>
          </div>

        </div>
      </footer>

      {/* Floating Golden Back to Top Button (Corner Bottom-Right) */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[#F2B84B] hover:bg-[#E58B43] text-[#121212] flex items-center justify-center shadow-lg shadow-[#F2B84B]/25 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F2B84B] focus:ring-offset-2 focus:ring-offset-[#121212] cursor-pointer ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
            : 'opacity-0 translate-y-4 pointer-events-none scale-90'
        }`}
      >
        <ArrowUp className="w-5 h-5 stroke-[2.5]" aria-hidden="true" />
      </button>
    </>
  );
}
