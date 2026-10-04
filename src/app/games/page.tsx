import Link from 'next/link';
import clientPromise from '@/lib/mongodb';
import { Search } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

async function getGames() {
  const client = await clientPromise;
  const db = client.db('GameLord');
  
  const games = await db
    .collection('games')
    .find({})
    .sort({ _id: -1 })
    .toArray();
    
  return games.map((game) => ({
    id: game._id.toString(),
    title: game.game_title,
    size: game.game_size || 'Unknown Size',
  }));
}

export default async function GamesPage() {
  const games = await getGames();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-12 transition-colors duration-300">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight uppercase transition-colors">All Games</h1>
          
          {/* Mock Search Bar */}
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Search games..." 
              className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white px-4 py-3 pl-11 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm dark:shadow-none"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 dark:text-zinc-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`} className="group block h-full">
              <div className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-800 transition-all duration-300 group-hover:border-blue-500/50 group-hover:-translate-y-1 shadow-md h-full flex flex-col">
                <div className="aspect-[16/9] bg-gray-200 dark:bg-zinc-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-200 dark:from-zinc-700 dark:to-zinc-900 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10">
                    <span className="font-bold text-xl text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white drop-shadow-md line-clamp-3 transition-colors">
                      {game.title.replace(/ free download/i, '')}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between bg-white dark:bg-zinc-900 transition-colors">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 transition-colors">
                      {game.title.replace(/ free download/i, '')}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-2.5 py-1 rounded transition-colors">
                      {game.size}
                    </span>
                    <span className="text-blue-500 dark:text-blue-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
