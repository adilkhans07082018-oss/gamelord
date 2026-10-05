import { MetadataRoute } from 'next';
import clientPromise from '@/lib/mongodb';

export const revalidate = 86400; // Cache for 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gamelord.site';
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ];

  try {
    const client = await clientPromise;
    const db = client.db('GameLord');
    
    // Get the latest 5000 games for the sitemap to prevent hitting limits
    const games = await db.collection('games')
      .find({}, { projection: { _id: 1, created_at: 1 } })
      .sort({ _id: -1 })
      .limit(5000)
      .toArray();

    const gameEntries = games.map((game) => ({
      url: `${baseUrl}/games/${game._id.toString()}`,
      lastModified: game.created_at ? new Date(game.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...sitemapEntries, ...gameEntries];
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return sitemapEntries;
  }
}
