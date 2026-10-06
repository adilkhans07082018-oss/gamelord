'use client';

import { useState } from 'react';

interface FallbackImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

export default function FallbackImage({ src, fallbackSrc, alt, className }: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        // Fallback to a placeholder or a different provided source if the main image 404s
        setImgSrc(fallbackSrc || '/placeholder.jpg'); // or a generic image
      }}
    />
  );
}
