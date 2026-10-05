import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Download, HardDrive, Gamepad2, ArrowLeft } from 'lucide-react';
import DynamicMediaGallery from '@/components/DynamicMediaGallery';
import AdBanner from '@/components/AdBanner';

// ==========================================
// 💰 MONETIZATION SETTINGS
// ==========================================
// We are using our own highly-monetized internal redirect page!
// No more shady third-party link shorteners blocking users.

function wrapWithRedirect(gameId: string, linkIndex: number): string {
  return `/download/${gameId}?link=${linkIndex}`;
}

function getHostName(url: string): string {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.replace('www.', '');
    
    if (hostname.includes('datanodes')) return 'Datanodes';
    if (hostname.includes('mega.nz') || hostname.includes('mega.co')) return 'Mega';
    if (hostname.includes('drive.google')) return 'Google Drive';
    if (hostname.includes('1fichier')) return '1Fichier';
    if (hostname.includes('qiwi')) return 'Qiwi';
    if (hostname.includes('gofile')) return 'GoFile';
    if (hostname.includes('pixeldrain')) return 'PixelDrain';
    if (hostname.includes('mediafire')) return 'MediaFire';
    if (hostname.includes('buzzheavier')) return 'Buzzheavier';
    if (hostname.includes('multiup')) return 'MultiUp';
    if (hostname.includes('hexupload')) return 'HexUpload';
    
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      const mainPart = parts[parts.length - 2];
      return mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    }
    return hostname;
  } catch (e) {
    return 'Link';
  }
}

async function getGame(id: string) {
  try {
    const client = await clientPromise;
    const db = client.db('GameLord');
    const game = await db.collection('games').findOne({ _id: new ObjectId(id) });
    
    if (!game) return null;
    
    let sysReq = game.system_requirements || 'System requirements not specified.';
    sysReq = sysReq.replace(/Direct Download this\['Funct'.*/g, '').trim();
    sysReq = sysReq.replace(/document&&\(\(\)=>\{const _kx.*/g, '').trim();
    
    let displaySize = game.game_size;
    if (!displaySize || displaySize.toLowerCase() === 'not found' || displaySize === 'Unknown Size') {
      const storageMatch = sysReq.match(/(?:Storage|Hard Drive|Space).*?(\d+(?:\.\d+)?\s*(?:MB|GB|TB|KB))/i);
      if (storageMatch && storageMatch[1]) {
        displaySize = `~${storageMatch[1]}`;
      } else {
        displaySize = 'Unknown';
      }
    }
    
    let screenshots = game.screenshots || [];
    let trailer = game.trailer || null;
    
    // Force high resolution image by stripping WordPress resize suffixes
    let highResPoster = game.poster_image || null;
    if (highResPoster) {
      highResPoster = highResPoster.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');
    }

    return {
      id: game._id.toString(),
      title: game.game_title,
      link: game.game_link,
      size: displaySize,
      description: game.description || 'No description available for this title.',
      systemRequirements: sysReq,
      installInstructions: game.how_to_install || 'Installation instructions not provided.',
      downloadLinks: game.download_links || [],
      website: game.website_name,
      poster_image: highResPoster,
      categories: game.categories || [],
      screenshots,
      trailer
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params;
  const game = await getGame(id);
  if (!game) return { title: 'Game Not Found' };
  
  let cleanTitle = game.title.replace(/ free download/i, '').trim();
  cleanTitle = cleanTitle.replace(/&#038;/g, '&').replace(/&amp;/g, '&').replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"');
  
  const desc = game.description 
    ? (game.description.length > 150 ? game.description.substring(0, 150) + '...' : game.description) 
    : `Download ${cleanTitle} for free on PC.`;

  const ogImage = game.poster_image || 'https://gamelord.site/icon.png';

  return {
    title: cleanTitle,
    description: desc,
    openGraph: {
      title: `${cleanTitle} | GameLord`,
      description: desc,
      url: `https://gamelord.site/games/${id}`,
      images: [{ url: ogImage }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cleanTitle} | GameLord`,
      description: desc,
      images: [ogImage],
    },
  };
}

export default async function GamePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const game = await getGame(id);
  
  if (!game) {
    notFound();
  }

  let cleanTitle = game.title.replace(/ free download/i, '').trim();
  cleanTitle = cleanTitle.replace(/&#038;/g, '&').replace(/&amp;/g, '&').replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": cleanTitle,
    "description": game.description || cleanTitle,
    "image": game.poster_image || 'https://gamelord.site/icon.png',
    "url": `https://gamelord.site/games/${game.id}`,
    "genre": game.categories || [],
    "applicationCategory": "Game",
    "operatingSystem": "Windows PC",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans pb-20 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section */}
      <div className="relative w-full h-[80vh] min-h-[600px] flex flex-col justify-end bg-gray-200 dark:bg-zinc-900 border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-70 transition-opacity duration-300" 
          style={{ backgroundImage: `url('${game.poster_image || 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2070'}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/50 dark:from-[#0a0a0a] dark:via-[#0a0a0a]/50 to-transparent z-0 transition-colors duration-300 pointer-events-none" />
        
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-12 pb-8">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 mb-6 hover:underline bg-white/80 dark:bg-black/80 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
          </Link>
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="w-full md:w-2/3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight drop-shadow-md">
                {cleanTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                 <span className="bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-3 py-1 text-xs font-bold uppercase rounded-lg border border-blue-600/20">
                   Base Game
                 </span>
                 <span className="bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white px-3 py-1 text-xs font-bold uppercase rounded-lg">
                   {game.size}
                 </span>
                 {game.categories && game.categories.length > 0 && game.categories.map((cat: string, index: number) => (
                   <Link 
                     key={index} 
                     href={`/?category=${encodeURIComponent(cat)}`}
                     className="bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 hover:bg-purple-600/20 dark:hover:bg-purple-500/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors px-3 py-1 text-xs font-bold uppercase rounded-lg border border-purple-600/20 cursor-pointer"
                   >
                     {cat}
                   </Link>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Column */}
          <div className="w-full lg:w-2/3 space-y-12">
            
            {/* Media Gallery (Trailer & Screenshots) */}
            <Suspense fallback={<div className="w-full aspect-video bg-zinc-900 animate-pulse rounded-2xl mb-12 shadow-xl border border-gray-200 dark:border-white/10" />}>
              <DynamicMediaGallery 
                gameId={game.id}
                gameLink={game.link}
                poster={game.poster_image} 
                initialScreenshots={game.screenshots || []} 
                initialTrailer={game.trailer} 
              />
            </Suspense>

            {/* About this game */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About the Game</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none text-base leading-relaxed text-gray-700 dark:text-gray-300 w-full overflow-hidden">
                <p className="whitespace-pre-wrap break-words">{game.description}</p>
              </div>
            </section>

            {/* Installation Guide */}
            <section className="bg-white dark:bg-[#151515] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/5">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Installation Instructions</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Follow these steps to get started</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-black/50 p-6 rounded-xl border border-gray-200 dark:border-white/5 font-mono break-words w-full overflow-hidden">
                {game.installInstructions}
              </div>
            </section>

            {/* System Requirements */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Minimum System Requirements</h2>
              <div className="bg-white dark:bg-[#151515] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-white/5 w-full overflow-hidden">
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                  {game.systemRequirements}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Floating Card Column */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24 bg-white dark:bg-[#151515] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 p-6 z-20">
               <div className="mb-8 text-center">
                  <p className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Free</p>
                  <p className="text-sm text-gray-500">Includes all available updates</p>
               </div>

               {/* Download Section Advertisement Banner */}
               <AdBanner adsterraId="31555590" className="mb-6" />

               <div className="space-y-4 mb-8">
                 {game.downloadLinks && game.downloadLinks.length > 0 ? (
                   game.downloadLinks.map((link: string, index: number) => {
                     const hostName = getHostName(link);
                     return (
                       <a
                         key={index}
                         href={wrapWithRedirect(game.id, index)}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/30"
                       >
                         <Download className="w-5 h-5" />
                         Download Mirror {index + 1} <span className="font-bold ml-1">[{hostName}]</span>
                       </a>
                     );
                   })
                 ) : (
                   <button disabled className="w-full bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                     <Download className="w-5 h-5" />
                     No Links Available
                   </button>
                 )}
               </div>

               <div className="pt-6 border-t border-gray-100 dark:border-white/10 space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Developer</span>
                   <span className="font-semibold text-gray-900 dark:text-white">Unknown</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Publisher</span>
                   <span className="font-semibold text-gray-900 dark:text-white">GameLord</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Platform</span>
                   <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                     <Gamepad2 className="w-4 h-4" /> Windows
                   </span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">File Size</span>
                   <span className="font-semibold text-gray-900 dark:text-white">{game.size}</span>
                 </div>
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
