'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface MediaGalleryProps {
  poster: string | null;
  screenshots: string[];
  trailer: string | null;
}

export default function MediaGallery({ poster, screenshots, trailer }: MediaGalleryProps) {
  // Build the list of media items
  const mediaList: { type: 'image' | 'video', url: string, thumb?: string }[] = [];
  
  // Add trailer first if exists
  if (trailer) {
    let videoId = '';
    const match = trailer.match(/(?:embed\/|v=|v\/|youtu\.be\/|\/v\/|^https?:\/\/(?:www\.)?youtube\.com\/(?:(?:watch)?\?.*v=|(?:embed|v|vi|user)\/))([^#\&\?]*).*/);
    if (match && match[1]) {
      videoId = match[1];
      mediaList.push({
        type: 'video',
        url: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`,
        thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      });
    } else {
      mediaList.push({ type: 'video', url: trailer });
    }
  }

  // Add poster
  if (poster) {
    mediaList.push({ type: 'image', url: poster });
  }

  // Add screenshots
  screenshots.forEach(src => {
    mediaList.push({ type: 'image', url: src });
  });

  if (mediaList.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);

  const activeMedia = mediaList[currentIndex];

  return (
    <div className="w-full bg-black rounded-2xl overflow-hidden shadow-xl mb-12 border border-gray-200 dark:border-white/10">
      
      {/* Main Viewport */}
      <div className="relative w-full aspect-video bg-zinc-900 flex items-center justify-center group">
        {activeMedia.type === 'image' ? (
          <img 
            src={activeMedia.url} 
            alt="Game Media" 
            className="w-full h-full object-contain"
          />
        ) : (
          <iframe 
            src={activeMedia.url} 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-full border-0"
          />
        )}
        
        {/* Navigation Arrows */}
        {mediaList.length > 1 && (
          <>
            <button 
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {mediaList.length > 1 && (
        <div className="flex overflow-x-auto gap-2 p-4 bg-zinc-950 scrollbar-hide">
          {mediaList.map((media, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-32 md:w-40 aspect-video rounded-lg overflow-hidden transition-all duration-300 border-2 ${currentIndex === idx ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <img 
                src={media.thumb || media.url} 
                alt={`Thumbnail ${idx + 1}`} 
                className="w-full h-full object-cover"
              />
              {media.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-8 h-8 text-white opacity-80" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
