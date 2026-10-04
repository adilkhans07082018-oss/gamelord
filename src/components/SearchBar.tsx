'use client';

import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';

  return (
    <form action="/" method="GET" className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
      <input
        type="text"
        name="q"
        defaultValue={q}
        placeholder="Search"
        className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#111] rounded-full text-sm outline-none transition-all duration-300 placeholder:text-gray-400 font-medium"
      />
    </form>
  );
}
