import Link from 'next/link';
import { Suspense } from 'react';
import { Search, Menu, Gamepad2, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AdultToggle } from './AdultToggle';
import SearchBar from './SearchBar';
import MobileMenu from './MobileMenu';
import clientPromise from '@/lib/mongodb';

export const revalidate = 3600; // Revalidate categories every hour

async function getCategories() {
  try {
    const client = await clientPromise;
    const db = client.db('GameLord');
    // distinct gets unique array
    const cats = await db.collection('games').distinct('categories');
    const validCats = cats.filter(c => c && c.trim().length > 0).sort();
    // Ensure PS3, PS4, PS5 are always available in the UI even if db is currently empty for them.
    const customCats = ['PS3', 'PS4', 'PS5'];
    customCats.forEach(c => { if (!validCats.includes(c)) validCats.unshift(c); });
    return validCats;
  } catch {
    return [];
  }
}

export default async function Navbar() {
  const categories = await getCategories();

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 font-sans transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 w-full">
          
          {/* Left Side: Logo & Main Links */}
          <div className="flex items-center gap-4 sm:gap-8 h-full shrink-0 relative z-50">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors shrink-0">
                <Gamepad2 className="w-6 h-6 text-white shrink-0" />
              </div>
              <span className="font-extrabold text-xl tracking-tight hidden sm:block">GAMELORD</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide h-full">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">STORE</Link>
              
              {/* Categories Dropdown */}
              <div className="relative group h-full flex items-center">
                <button className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors uppercase">
                  CATEGORIES <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute top-16 left-0 w-56 bg-white dark:bg-[#1a1a1a] shadow-2xl rounded-b-xl border border-t-0 border-gray-100 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  <Link href="/" className="block px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/10 mb-1">
                    ALL GAMES
                  </Link>
                  {categories.map((c) => (
                    <Link key={c} href={`/?category=${encodeURIComponent(c)}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white transition-colors">
                      {c}
                    </Link>
                  ))}
                  {categories.length === 0 && (
                     <div className="px-4 py-2 text-sm text-gray-500">Loading categories...</div>
                  )}
                </div>
              </div>

              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">NEWS</Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">SUPPORT</Link>
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center h-full">
            <div className="flex items-center gap-2 sm:gap-4 h-full py-4">
              <Suspense fallback={<div className="w-48 lg:w-64 h-9 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />}>
                <SearchBar />
              </Suspense>
              <AdultToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1 sm:gap-3">
            <AdultToggle />
            <ThemeToggle />
            <MobileMenu categories={categories} />
          </div>
        </div>
      </div>
    </nav>
  );
}
