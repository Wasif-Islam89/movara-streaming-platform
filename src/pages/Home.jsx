import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import TrendingMovies from '../components/TrendingMovies';
import TopRatedDiscoveries from '../components/TopRatedDiscoveries';
import PopularMovies from '../components/PopularMovies';
import ComingSoon from '../components/ComingSoon';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'MOVORA — Discover Movies & TV Shows';
  }, []);

  // Scroll to targeted section if hash is present
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  return (
    <div>
      {/* 1. Featured Cinematic Hero Section */}
      <Hero />

      {/* Main Movie Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 pt-6 pb-12">
        <div id="trending" className="scroll-mt-20">
          <TrendingMovies />
        </div>

        <div id="top-rated" className="scroll-mt-20">
          <TopRatedDiscoveries />
        </div>

        <div id="popular" className="scroll-mt-20">
          <PopularMovies />
        </div>

        <div id="coming-soon" className="scroll-mt-20">
          <ComingSoon />
        </div>
      </div>
    </div>
  );
}
