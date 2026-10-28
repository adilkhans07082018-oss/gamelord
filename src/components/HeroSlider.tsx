'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  poster_image: string | null;
}

export default function HeroSlider({ games }: { games: Game[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (games.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(interval);
  }, [games.length]);

  if (!games || games.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % games.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] mb-12 rounded-2xl overflow-hidden shadow-2xl group">
      {games.map((game, index) => (
        <div 
          key={game.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
          <img 
            src={game.poster_image || 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2070'} 
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'auto'}
            className={`w-full h-full object-cover transition-transform duration-[10000ms] ${index === currentIndex ? 'scale-110' : 'scale-100'}`} 
            alt={game.title} 
          />
          <div className="absolute bottom-0 left-0 p-6 md:p-12 z-20 w-full md:w-2/3">
            <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-4 uppercase tracking-wider shadow-lg">
              Featured Game
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg line-clamp-2">
              {game.title}
            </h1>
            <p className="text-gray-200 text-sm md:text-lg mb-6 line-clamp-2 max-w-xl drop-shadow-md">
              Experience the next generation of gaming. Explore breathtaking worlds, overcome challenges, and discover an unforgettable journey.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href={`/games/${game.id}`}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-transform duration-200 hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Download Free</span>
              </Link>
              <Link 
                href={`/games/${game.id}`}
                className="hidden sm:inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl backdrop-blur-md transition-all duration-200"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Slider Controls */}
      {games.length > 1 && (
        <>
          <button 
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 right-6 z-30 flex items-center gap-2">
            {games.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/40 hover:bg-white/80'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
