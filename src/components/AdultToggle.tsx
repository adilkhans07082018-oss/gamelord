"use client";

import { useEffect, useState } from 'react';

export function AdultToggle() {
  const [blurEnabled, setBlurEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    // Default to true (safe mode) if not set
    const stored = localStorage.getItem('adult-blur');
    if (stored === 'false') {
      setBlurEnabled(false);
      document.documentElement.classList.remove('adult-blur-enabled');
    } else {
      setBlurEnabled(true);
      document.documentElement.classList.add('adult-blur-enabled');
    }
  }, []);

  const toggleBlur = () => {
    const newState = !blurEnabled;
    setBlurEnabled(newState);
    localStorage.setItem('adult-blur', newState.toString());
    if (newState) {
      document.documentElement.classList.add('adult-blur-enabled');
    } else {
      document.documentElement.classList.remove('adult-blur-enabled');
    }
  };

  // Prevent hydration mismatch by showing a neutral state during SSR
  if (blurEnabled === null) {
    return (
      <button className="w-10 h-10 flex items-center justify-center rounded-full transition-colors font-black text-sm text-gray-400 opacity-50 shrink-0">
        <span>18+</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleBlur}
      className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors font-black text-sm shrink-0 ${
        blurEnabled 
          ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
          : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
      }`}
      title={blurEnabled ? "Adult Filter is ON (Click to Disable)" : "Adult Filter is OFF (Click to Enable)"}
    >
      {blurEnabled ? (
        <span className="line-through decoration-2 opacity-80">18+</span>
      ) : (
        <span>18+</span>
      )}
    </button>
  );
}
