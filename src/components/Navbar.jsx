import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Film, 
  Tv, 
  Baby, 
  Bookmark, 
  Menu, 
  X, 
  Search, 
  Bell, 
  ChevronDown, 
  LogOut,
  History,
  Settings
} from 'lucide-react';
import movoraLogo from '../assets/logo/MOVORA Logo.png';
import SearchDropdown from './SearchDropdown';
import Notification, { getStoredUnreadCount } from './Notification';
import { useAuth } from '../context/AuthContext';

// Navigation links ki list
const NAV_ITEMS = [
  { name: 'Home', path: '/home', icon: Home, end: true },
  { name: 'Movies', path: '/movies', icon: Film },
  { name: 'TV Shows', path: '/tv-shows', icon: Tv },
  { name: 'Kids', path: '/kids', icon: Baby },
  { name: 'Watchlist', path: '/my-list', icon: Bookmark },
];

export default function Navbar() {
  // Mobile menu open/close rakhne ke liye state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Search overlay open/close aur search query ke liye states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Scroll threshold (> 20px) track karne ke liye state
  const [isScrolled, setIsScrolled] = useState(false);
  // Notifications dropdown open/close state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(getStoredUnreadCount);
  // Profile dropdown open/close state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const searchInputRef = useRef(null);
  const headerRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'Account';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  // Menu toggle karne ka function
  function toggleMobileMenu() {
    setIsMobileMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
      return next;
    });
  }

  // Menu band karne ka function
  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  // Notifications toggle karne ka function
  function toggleNotifications() {
    setIsNotificationsOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsProfileOpen(false);
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
      return next;
    });
  }

  // Notifications band karne ka function
  function closeNotifications() {
    setIsNotificationsOpen(false);
  }

  // Profile toggle karne ka function
  function toggleProfile() {
    setIsProfileOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsNotificationsOpen(false);
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
      return next;
    });
  }

  // Profile band karne ka function
  function closeProfile() {
    setIsProfileOpen(false);
  }

  // Search open karne ka function
  function openSearch() {
    setIsSearchOpen(true);
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  }

  // Search band karne ka function
  function closeSearch() {
    setIsSearchOpen(false);
    setSearchQuery('');
  }

  // Search form submit: keep live dropdown open without navigating to a separate search page
  function handleSearchSubmit(e) {
    e.preventDefault();
  }

  // 1. Page change hone par mobile menu, search, notifications, aur profile automatically band ho jayein
  useEffect(() => {
    closeMobileMenu();
    closeSearch();
    closeNotifications();
    closeProfile();
  }, [location.pathname]);

  // 2. Mobile menu open hone par background page scroll na ho
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // 3. Mobile menu open hone par: Desktop screen par switch karne ya Escape dabane par band ho jaye
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    function handleResize() {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // 4. Search overlay open hone par input par auto-focus karein
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // 5. Escape key ya outside click se search overlay band karein
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeSearch();
      }
    }

    function handleClickOutside(event) {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        closeSearch();
      }
    }

    if (isSearchOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  // 6. Escape key ya outside click se notifications dropdown band karein
  useEffect(() => {
    if (!isNotificationsOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeNotifications();
      }
    }

    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        closeNotifications();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Sync unread notification count across components and events
  useEffect(() => {
    function handleNotifUpdate() {
      setUnreadNotifCount(getStoredUnreadCount());
    }
    window.addEventListener('movora:notifications-update', handleNotifUpdate);
    window.addEventListener('storage', handleNotifUpdate);
    return () => {
      window.removeEventListener('movora:notifications-update', handleNotifUpdate);
      window.removeEventListener('storage', handleNotifUpdate);
    };
  }, []);

  // 7. Escape key ya outside click se profile dropdown band karein
  useEffect(() => {
    if (!isProfileOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        closeProfile();
      }
    }

    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        closeProfile();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  // 8. Scroll position track karein (> 20px) taake navbar background transition smoothly ho
  useEffect(() => {
    function handleScroll() {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Desktop link styling (Active vs Inactive)
  function getDesktopLinkClass({ isActive }) {
    const commonStyle = "flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3.5 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40";
    
    if (isActive) {
      return commonStyle + " text-[#F2B84B] bg-[#1D1C1A] shadow-sm";
    } else {
      return commonStyle + " text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#1D1C1A]/60";
    }
  }

  // Mobile link styling (Active vs Inactive)
  function getMobileLinkClass({ isActive }) {
    const commonStyle = "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40";
    
    if (isActive) {
      return commonStyle + " text-[#F2B84B] bg-[#1D1C1A] shadow-inner font-semibold";
    } else {
      return commonStyle + " text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#1D1C1A]/70";
    }
  }

  return (
    <header 
      ref={headerRef} 
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? 'bg-[#121212] border-b border-[#2A2926] shadow-lg shadow-black/40'
          : 'bg-[#121212]/95 border-b border-[#1D1C1A]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand Name */}
          <Link
            to="/home"
            className="flex items-center shrink-0 group transition-transform duration-200 active:scale-95"
            aria-label="MOVORA Home"
          >
            <img
              src={movoraLogo}
              alt="MOVORA"
              className="h-[32px] md:h-[40px] w-auto object-contain shrink-0 mix-blend-screen group-hover:opacity-95 transition-all duration-200"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Desktop Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={getDesktopLinkClass}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Actions & Mobile Menu Button */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Button */}
            <button
              type="button"
              onClick={openSearch}
              aria-label="Open search"
              className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg text-[#AAA49A] hover:text-[#F2B84B] hover:bg-[#1D1C1A] focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Button & Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={toggleNotifications}
                aria-label="View notifications"
                aria-expanded={isNotificationsOpen}
                aria-haspopup="true"
                className={`relative flex items-center justify-center p-1.5 sm:p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40 ${
                  isNotificationsOpen
                    ? 'text-[#F2B84B] bg-[#1D1C1A]'
                    : 'text-[#AAA49A] hover:text-[#F2B84B] hover:bg-[#1D1C1A]'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-[#121212] bg-[#F2B84B] rounded-full ring-2 ring-[#121212] shadow-sm">
                    {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                  </span>
                )}
              </button>

              <Notification
                isOpen={isNotificationsOpen}
                onClose={closeNotifications}
                onUnreadChange={setUnreadNotifCount}
              />
            </div>

            {/* Account Button & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={toggleProfile}
                aria-label={`Account menu: ${displayName}`}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[#1D1C1A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40 group cursor-pointer"
              >
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F2B84B] to-[#E58B43] text-[#121212] font-extrabold text-sm flex items-center justify-center ring-1 ring-[#2A2926] group-hover:ring-[#F2B84B] transition-all">
                  {avatarInitial}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#AAA49A] group-hover:text-[#F3EEE4] transition-transform duration-200 hidden sm:block ${
                  isProfileOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {isProfileOpen && (
                <div
                  role="menu"
                  aria-label="Account options"
                  className="fixed right-4 top-16 mt-2 w-64 max-w-[calc(100vw-2rem)] sm:absolute sm:right-0 sm:top-auto rounded-2xl bg-[#1D1C1A] border border-[#2A2926] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
                >
                  {/* Authenticated Account Card */}
                  <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[#2A2926]/70 mb-1.5 bg-[#121212]/50 rounded-xl">
                    <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F2B84B] to-[#E58B43] text-[#121212] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {avatarInitial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#F3EEE4] truncate">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-[#AAA49A] truncate">
                        {user?.email || 'MOVORA Member'}
                      </p>
                    </div>
                  </div>

                  {/* Account & Navigation Actions */}
                  <div className="py-0.5 space-y-0.5">
                    <Link
                      to="/account"
                      onClick={closeProfile}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#121212] transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#F2B84B]" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      to="/watch-history"
                      onClick={closeProfile}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#121212] transition-colors cursor-pointer"
                    >
                      <History className="w-4 h-4 text-[#F2B84B]" />
                      <span>Watch History</span>
                    </Link>

                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => {
                          closeProfile();
                          logout();
                          navigate('/', { replace: true });
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-[#AAA49A] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          closeProfile();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-[#F2B84B] hover:bg-[#121212] transition-colors cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4 rotate-180" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-navigation-panel"
                className="p-1.5 sm:p-2 rounded-lg text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#1D1C1A] focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div 
          role="search"
          aria-label="Site Search"
          className="absolute inset-0 bg-[#121212] z-50 flex items-center px-3 sm:px-6 lg:px-8 border-b border-[#1D1C1A]"
        >
          <div className="max-w-7xl mx-auto w-full relative flex items-center gap-2 sm:gap-3">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2B84B] shrink-0" aria-hidden="true" />
            
            <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0 flex items-center gap-2">
              <label htmlFor="navbar-search-input" className="sr-only">
                Search movies, TV shows, and people
              </label>
              <input
                id="navbar-search-input"
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, TV shows, and people..."
                autoFocus
                className="w-full bg-transparent text-[#F3EEE4] placeholder-[#AAA49A] text-xs sm:text-base focus:outline-none truncate"
              />
            </form>

            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
              className="p-1.5 sm:p-2 rounded-lg text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#1D1C1A] focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Live Search Suggestions Dropdown */}
            <SearchDropdown 
              query={searchQuery}
              isOpen={isSearchOpen && !!searchQuery.trim()}
              onClose={closeSearch}
            />
          </div>
        </div>
      )}

      {/* Mobile Drawer Panel */}
      {isMobileMenuOpen && (
        <div id="mobile-navigation-panel" className="md:hidden border-t border-[#1D1C1A] bg-[#121212]/98 px-4 pt-3 pb-6">
          <nav className="flex flex-col space-y-1.5" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={closeMobileMenu}
                  className={getMobileLinkClass}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
