import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import * as cheerio from 'cheerio';
import MediaGallery from './MediaGallery';

interface DynamicMediaGalleryProps {
  gameId: string;
  gameLink: string;
  poster: string | null;
  initialScreenshots?: string[];
  initialTrailer?: string | null;
}

export default async function DynamicMediaGallery({ gameId, gameLink, poster, initialScreenshots, initialTrailer }: DynamicMediaGalleryProps) {
  let screenshots = initialScreenshots || [];
  let trailer = initialTrailer || null;

  // Only scrape if screenshots are missing
  if ((!screenshots || screenshots.length === 0) && gameLink) {
    try {
      const fetchRes = await fetch(gameLink, { next: { revalidate: 86400 } });
      const html = await fetchRes.text();
      const $ = cheerio.load(html);
      
      const imgs: string[] = [];
      $('.entry-content img, .entry img, .page-content img').each((i: number, el: any) => {
          const src = $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('src');
          if (src && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon') && !src.includes('Repack-Games.jpg')) {
              imgs.push(src);
          }
      });
      const uniqImgs = [...new Set(imgs)]
        .filter(s => s && s.startsWith('http'))
        .map(s => s.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1'));
      
      if (uniqImgs.length > 0) screenshots = uniqImgs.slice(0, 8);

      $('iframe').each((i: number, el: any) => {
          const src = $(el).attr('data-src') || $(el).attr('src');
          if (src && src.includes('youtube.com')) {
              trailer = src;
          }
      });

      if (screenshots.length > 0 || trailer) {
          const client = await clientPromise;
          const db = client.db('GameLord');
          db.collection('games').updateOne(
            { _id: new ObjectId(gameId) },
            { $set: { screenshots, trailer } }
          ).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to fetch media on demand:", err);
    }
  }

  return (
    <MediaGallery poster={poster} screenshots={screenshots} trailer={trailer} />
  );
}
