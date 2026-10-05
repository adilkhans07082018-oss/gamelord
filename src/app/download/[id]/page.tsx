import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';
import CountdownRedirect from '@/components/CountdownRedirect';

export default async function DownloadRedirectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { id } = await params;
  const sp = await searchParams;
  const linkIndex = parseInt(sp.link as string) || 0;

  try {
    const client = await clientPromise;
    const db = client.db('GameLord');
    const game = await db.collection('games').findOne({ _id: new ObjectId(id) });

    if (!game || !game.download_links || !game.download_links[linkIndex]) {
      notFound();
    }

    const targetUrl = game.download_links[linkIndex];
    const cleanTitle = game.game_title ? game.game_title.replace(/ free download/i, '').trim() : 'Game';

    // Using the Adsterra ID provided by the user
    const ADSTERRA_ID = '6097726';

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-24 px-4 sm:px-8 pb-12 transition-colors duration-300">
        <CountdownRedirect targetUrl={targetUrl} gameTitle={cleanTitle} adId={ADSTERRA_ID} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
