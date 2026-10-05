'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import SearchBar from './SearchBar';
import { Suspense } from 'react';

export default function MobileMenu({ categories }: { categories: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden flex items-center shrink-0">
      <button 
        onClick={toggleMenu} 
        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors z-50 relative shrink-0"
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={toggleMenu}
      />

      {/* Mobile Menu Content */}
      <div 
        className={`fixed top-16 left-0 w-full bg-white dark:bg-[#0a0a0a] shadow-xl border-b border-gray-100 dark:border-white/10 flex flex-col py-4 px-6 h-[calc(100vh-4rem)] overflow-y-auto z-40 transition-transform duration-300 ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {/* Mobile Search Bar */}
        <div className="mb-6">
          <Suspense fallback={<div className="w-full h-10 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Link href="/" onClick={toggleMenu} className="py-3 text-lg font-bold border-b border-gray-100 dark:border-white/10 hover:text-blue-600 transition-colors">
            STORE
          </Link>
          
          {/* Categories Dropdown Mobile */}
          <div className="border-b border-gray-100 dark:border-white/10">
            <button 
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="flex justify-between items-center w-full py-3 text-lg font-bold hover:text-blue-600 transition-colors"
            >
              CATEGORIES
              {isCategoriesOpen ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            <div 
              className={`flex flex-col space-y-1 overflow-hidden transition-all duration-300 ${isCategoriesOpen ? 'max-h-[1000px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
            >
              <Link href="/" onClick={toggleMenu} className="pl-4 py-2 text-md font-bold text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                ALL GAMES
              </Link>
              {categories.map((c) => (
                <Link 
                  key={c} 
                  href={`/?category=${encodeURIComponent(c)}`} 
                  onClick={toggleMenu}
                  className="pl-4 py-2 text-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <Link href="#" onClick={toggleMenu} className="py-3 text-lg font-bold border-b border-gray-100 dark:border-white/10 hover:text-blue-600 transition-colors">
            NEWS
          </Link>
          <Link href="#" onClick={toggleMenu} className="py-3 text-lg font-bold hover:text-blue-600 transition-colors">
            SUPPORT
          </Link>
        </div>
      </div>
    </div>
  );
}
