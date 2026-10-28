'use client';

import { useState } from 'react';

interface FallbackImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function FallbackImage({ 
  src, 
  fallbackSrc, 
  alt, 
  className = '', 
  priority = false 
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        // Fallback to screenshot or placeholder if the main poster fails
        if (fallbackSrc && imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        } else {
          setImgSrc('/placeholder.jpg');
        }
      }}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-70'}`}
    />
  );
}
