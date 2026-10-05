'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, ShieldCheck } from 'lucide-react';

export default function CountdownRedirect({ targetUrl, gameTitle, adId }: { targetUrl: string, gameTitle: string, adId: string }) {
  const [timeLeft, setTimeLeft] = useState(15);
  const adRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Inject Adsterra Script safely into React
  useEffect(() => {
    if (!adRef.current) return;
    if (adRef.current.innerHTML !== '') return; // Prevent duplicate ad injection

    // Standard Adsterra invocation
    const confScript = document.createElement('script');
    confScript.type = 'text/javascript';
    confScript.innerHTML = `
      atOptions = {
        'key' : '${adId}',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = `//www.highperformanceformat.com/${adId}/invoke.js`;

    adRef.current.appendChild(confScript);
    adRef.current.appendChild(invokeScript);
  }, [adId]);

  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-[#151515] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 max-w-3xl w-full mx-auto text-center overflow-hidden">
      
      {/* Header */}
      <div className="w-full bg-blue-600 p-6 text-white">
        <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-90" />
        <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide">
          Secure Download Link
        </h1>
        <p className="text-blue-100 mt-2 font-medium">
          {gameTitle}
        </p>
      </div>

      <div className="p-8 w-full flex flex-col items-center">
        
        {/* Top Ad Space */}
        <div className="w-full min-h-[90px] bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-white/5 rounded-xl mb-8 flex flex-col items-center justify-center p-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Advertisement</span>
          {/* Adsterra script will mount here */}
          <div ref={adRef} className="w-[300px] h-[250px] flex items-center justify-center bg-gray-200 dark:bg-zinc-800 rounded animate-pulse">
            <span className="text-gray-400 text-sm font-semibold">Loading Ad...</span>
          </div>
        </div>

        {/* Countdown / Download Button */}
        <div className="my-4 min-h-[120px] flex items-center justify-center">
          {timeLeft > 0 ? (
            <div className="flex flex-col items-center transform transition-all">
              <div className="text-7xl font-black text-blue-600 dark:text-blue-500 mb-2 drop-shadow-sm">
                {timeLeft}
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm">
                Seconds Remaining
              </p>
              <p className="text-xs text-gray-400 mt-4 max-w-xs">
                Please wait while we verify your download link and connect to the secure server.
              </p>
            </div>
          ) : (
            <a
              href={targetUrl}
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-black text-xl transition-all transform hover:scale-105 shadow-xl shadow-green-600/20 animate-bounce"
            >
              <Download className="w-7 h-7" />
              Download Now
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
