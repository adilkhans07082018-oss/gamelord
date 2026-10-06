import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import AdBanner from '@/components/AdBanner';
import clientPromise from '@/lib/mongodb';
import FallbackImage from '@/components/FallbackImage';
import { Download, Gamepad2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const revalidate = 60; // Revalidate every minute

async function getGamesData(page: number, limit: number = 24, category?: string, searchQuery?: string) {
  const client = await clientPromise;
  const db = client.db('GameLord');
  
  const skip = (page - 1) * limit;
  const collection = db.collection('games');
  
  const query: any = {};
  if (category) {
    query.categories = category;
  }
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  // Exact featured titles for the slider
  const featuredTitles = [
    'Grand Theft Auto V / GTA 5 Free',
    'Red Dead Redemption 2 Free',
    'God Of War Free Download (2022)',
    'Death Stranding 2 On The Beach',
    'Far Cry 6 Ultimate Edition'
  ];
  
  const heroQuery = {
    $or: featuredTitles.map(t => ({ game_title: { $regex: t.replace(/[()]/g, '\\$&'), $options: 'i' } }))
  };

  const [games, totalGames, rawHeroGames] = await Promise.all([
    collection.find(query).sort({ _id: -1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
    collection.find(heroQuery).limit(10).toArray()
  ]);
    
  const adultKeywords = ['adult', 'nud', 'nak', 'nsfw', '18+', 'hentai', 'sexual', 'erot', 'porn'];
  const isCategoryAdult = category ? adultKeywords.some(k => category.toLowerCase().includes(k)) : false;
  
  const formatGame = (game: any) => {
    let title = game.game_title.replace(/ free download/i, '').trim();
    title = title.replace(/&#038;/g, '&').replace(/&amp;/g, '&').replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"');
    
    const categories = game.categories || [];
    const tLower = title.toLowerCase();
    const cLower = categories.join(' ').toLowerCase();
    
    const isAdult = isCategoryAdult ? false : adultKeywords.some(k => tLower.includes(k) || cLower.includes(k));
    
    let displaySize = game.game_size;
    if (!displaySize || displaySize.toLowerCase() === 'not found' || displaySize === 'Unknown Size') {
      const sysReq = game.system_requirements || '';
      const storageMatch = sysReq.match(/(?:Storage|Hard Drive|Space).*?(\d+(?:\.\d+)?\s*(?:MB|GB|TB|KB))/i);
      if (storageMatch && storageMatch[1]) {
        displaySize = `~${storageMatch[1]}`;
      } else {
        displaySize = 'Unknown';
      }
    }

    let highResPoster = game.poster_image || null;
    if (highResPoster) {
      highResPoster = highResPoster.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');
    }

    return {
      id: game._id.toString(),
      title,
      size: displaySize,
      website: game.website_name,
      poster_image: highResPoster,
      categories,
      isAdult
    };
  };

  const mappedGames = games.map(formatGame);
  
  // Format and Sort the hero games so they follow our exact requested order
  const heroGames = rawHeroGames.map(formatGame).sort((a, b) => {
    const aIdx = featuredTitles.findIndex(t => new RegExp(t.split(' ')[0], 'i').test(a.title));
    const bIdx = featuredTitles.findIndex(t => new RegExp(t.split(' ')[0], 'i').test(b.title));
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  }).slice(0, 5); // ensure we only have 5

  return {
    games: mappedGames,
    totalPages: Math.ceil(totalGames / limit),
    totalGames,
    heroGames
  };
}

// Helper for mock images since DB doesn't have them yet
const getMockImage = (index: number, type: 'landscape' | 'portrait') => {
  const landscapes = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800',
    'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=800',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=800',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=800',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800'
  ];
  const portraits = [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=400&h=600&fit=crop'
  ];
  return type === 'landscape' ? landscapes[index % landscapes.length] : portraits[index % portraits.length];
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const page = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  
  const category = typeof params.category === 'string' ? params.category : undefined;
  const q = typeof params.q === 'string' ? params.q : undefined;
  
  const { games, totalPages, heroGames } = await getGamesData(page, 24, category, q);
  
  if (!games || games.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-[#0a0a0a] bg-gray-50 text-center p-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {q ? `No results found for "${q}"` : 'No games found.'}
        </h1>
        <p className="text-gray-500 max-w-md">
          {q 
            ? "We couldn't find any games matching your search. Try different keywords or browse the categories." 
            : "Please make sure the scraper has populated the GameLord database."}
        </p>
        {q && (
          <Link href="/" className="mt-8 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors">
            Clear Search
          </Link>
        )}
      </div>
    );
  }

  

  // Generate pagination array (e.g., 1, 2, 3, 4, 5)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans pb-20 transition-colors duration-300">
      <div className="w-full px-4 sm:px-8 lg:px-12 pt-8">
        
        {/* Show Hero slider on all pagination pages */}
        {!q && !category && heroGames && heroGames.length > 0 && (
          <HeroSlider games={heroGames} />
        )}

        {/* Top Advertisement Banner */}
        {/* Example AdSense usage: <AdBanner dataAdClient="ca-pub-XXXXXXXXXX" dataAdSlot="XXXXXXXX" /> */}
        {/* Example Adsterra usage: */}
        <AdBanner adsterraId="31555590" />

        {/* All Games Grid */}
        <section id="games-grid" className="mb-16 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white uppercase">
              {category 
                ? (category.toLowerCase().endsWith('games') ? category : `${category} Games`) 
                : (page === 1 ? 'All Games' : `All Games - Page ${page}`)}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-6">
            {games.map((game, i) => (
              <Link href={`/games/${game.id}`} key={game.id} className="group flex flex-col relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 shadow-sm hover:shadow-2xl border border-transparent hover:border-blue-500/50 dark:hover:border-blue-400/50">
                <div className="aspect-[3/4] w-full bg-gray-200 dark:bg-zinc-800 relative overflow-hidden">
                  <FallbackImage 
                    src={game.poster_image || getMockImage(i, 'portrait')} 
                    fallbackSrc={game.screenshots?.[0] || getMockImage(i, 'portrait')}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${game.isAdult ? 'adult-content-image' : ''}`} 
                    alt={game.title} 
                  />
                  {game.isAdult && (
                    <div className="adult-content-overlay absolute inset-0 flex items-center justify-center opacity-0 z-10 transition-opacity bg-black/40">
                      <span className="bg-red-600/90 text-white font-extrabold px-3 py-1 rounded-lg border border-red-400 backdrop-blur-sm text-sm tracking-widest shadow-lg">
                        18+
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"></div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-3 flex flex-col z-20">
                  <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1.5 drop-shadow-md">{game.title}</h3>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-blue-400 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                      {game.size}
                    </span>
                    {game.categories && game.categories.length > 0 && (
                      <>
                        <span className="text-gray-400 text-[10px]">•</span>
                        <span className="text-purple-400 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider truncate max-w-[80px] sm:max-w-[100px]">
                          {game.categories[0]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 my-16">
          <Link 
            href={page > 1 ? `/?page=1${category ? `&category=${encodeURIComponent(category)}` : ''}#games-grid` : '#games-grid'}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 font-bold rounded-xl transition-all text-sm ${
              page > 1 
                ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm hover:shadow-md border border-gray-200 dark:border-white/10 hover:border-blue-500' 
                : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed pointer-events-none'
            }`}
          >
            <ChevronsLeft className="w-5 h-5" /> First Page
          </Link>
          
          <Link 
            href={page > 1 ? `/?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}#games-grid` : '#games-grid'}
            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold rounded-xl transition-all ${
              page > 1 
                ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm hover:shadow-md border border-gray-200 dark:border-white/10 hover:border-blue-500' 
                : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2">
            {getPageNumbers().map(pageNum => (
              <Link
                key={pageNum}
                href={`/?page=${pageNum}${category ? `&category=${encodeURIComponent(category)}` : ''}#games-grid`}
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
                  page === pageNum 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {pageNum}
              </Link>
            ))}
          </div>

          <Link 
            href={page < totalPages ? `/?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}#games-grid` : '#games-grid'}
            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold rounded-xl transition-all ${
              page < totalPages 
                ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm hover:shadow-md border border-gray-200 dark:border-white/10 hover:border-blue-500' 
                : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed pointer-events-none'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
          
          <Link 
            href={page < totalPages ? `/?page=${totalPages}${category ? `&category=${encodeURIComponent(category)}` : ''}#games-grid` : '#games-grid'}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 font-bold rounded-xl transition-all text-sm ${
              page < totalPages 
                ? 'bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm hover:shadow-md border border-gray-200 dark:border-white/10 hover:border-blue-500' 
                : 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600 border border-transparent cursor-not-allowed pointer-events-none'
            }`}
          >
            Last Page <ChevronsRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
      
    </div>
  );
}
