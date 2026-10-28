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
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryStage, setRetryStage] = useState(0); // 0 = cdn, 1 = raw, 2 = fallback, 3 = placeholder
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (retryStage === 0 && currentSrc.includes('wsrv.nl')) {
      try {
        const parsed = new URL(currentSrc);
        const rawUrl = parsed.searchParams.get('url');
        if (rawUrl) {
          setRetryStage(1);
          setCurrentSrc(rawUrl);
          return;
        }
      } catch (e) {}
    }

    if (retryStage <= 1 && fallbackSrc && fallbackSrc !== currentSrc) {
      setRetryStage(2);
      setCurrentSrc(fallbackSrc);
      return;
    }

    setRetryStage(3);
    setCurrentSrc('/placeholder.jpg');
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-900">
      <img
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`${className} transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
