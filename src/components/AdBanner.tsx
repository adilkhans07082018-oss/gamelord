'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  dataAdClient?: string;
  dataAdSlot?: string;
  adsterraId?: string;
  className?: string;
}

export default function AdBanner({ dataAdClient, dataAdSlot, adsterraId, className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If using Google AdSense
    if (dataAdClient && dataAdSlot && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
    
    // If using Adsterra or Alternative iframe/script
    if (adsterraId && adRef.current && !adRef.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/${adsterraId}/invoke.js`;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      adRef.current.appendChild(script);
    }
  }, [dataAdClient, dataAdSlot, adsterraId]);

  return (
    <div className={`w-full flex justify-center items-center my-6 overflow-hidden bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 min-h-[90px] ${className}`}>
      <span className="text-xs text-gray-400 absolute pointer-events-none">Advertisement</span>
      
      {/* Container for Adsterra or custom scripts */}
      {adsterraId && <div ref={adRef} className="z-10 relative"></div>}

      {/* Container for Google AdSense */}
      {dataAdClient && dataAdSlot && (
        <ins
          className="adsbygoogle z-10 relative"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client={dataAdClient}
          data-ad-slot={dataAdSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}
