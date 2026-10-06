const { MongoClient } = require('mongodb');
const https = require('https');
const cheerio = require('cheerio');

const uri = "mongodb+srv://adilkhans07082018_db_user:aK6LHKX8ecKJTpvZ@cluster0.ntxxr0c.mongodb.net/";

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

async function runBulkFix() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('GameLord');
        const col = db.collection('games');
        
        const brokenGames = await col.find({
            $or: [
                { poster_image: null },
                { poster_image: "" },
                { poster_image: { $regex: /Logo\.png/i } },
                { poster_image: { $regex: /svg\+xml/i } },
                { screenshots: null },
                { screenshots: { $exists: false } },
                { screenshots: { $size: 0 } }
            ]
        }).toArray();
        
        console.log(`Found ${brokenGames.length} games to fix. Running...`);
        let count = 0;
        
        for (const game of brokenGames) {
            if (!game.game_link) continue;
            
            const html = await fetchHtml(game.game_link);
            if (!html) continue;
            
            const $ = cheerio.load(html);
            
            // Poster
            let poster_image = "";
            $('.media-single-content img').each((i, el) => {
                const src = $(el).attr('data-src') || $(el).attr('src');
                if (src && !src.includes('svg+xml') && !src.includes('Logo.png')) {
                    poster_image = src;
                    return false;
                }
            });
            if (!poster_image) {
                $('.entry-content > p > img, article > div > img').first().each((i, el) => {
                     poster_image = $(el).attr('data-src') || $(el).attr('src');
                });
            }
            if (poster_image && poster_image.match(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/)) {
                poster_image = poster_image.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');
            }

            // Screenshots
            const screenshots = [];
            $('.gallery-icon img, .tiled-gallery-item img').each((i, el) => {
                const src = $(el).attr('data-src') || $(el).attr('src');
                if (src && !src.includes('svg+xml') && !src.includes('Logo.png')) {
                    screenshots.push(src);
                }
            });
            if (screenshots.length === 0) {
                $('.entry-content img, .post-content img').each((i, el) => {
                    if ($(el).closest('.rg-rel__card').length === 0 && $(el).closest('.crp_related').length === 0) {
                        const src = $(el).attr('data-src') || $(el).attr('src');
                        if (src && src !== poster_image && !src.includes('svg+xml') && !src.includes('Logo.png')) {
                            screenshots.push(src);
                        }
                    }
                });
            }
            
            // Trailer
            let trailer = game.trailer || null;
            $('iframe').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && src.includes('youtube.com/embed/')) {
                    trailer = src;
                    return false;
                }
            });

            // Update
            const updateDoc = {};
            if (poster_image && poster_image !== game.poster_image) updateDoc.poster_image = poster_image;
            if (screenshots.length > 0) updateDoc.screenshots = [...new Set(screenshots)];
            if (trailer && trailer !== game.trailer) updateDoc.trailer = trailer;
            
            if (Object.keys(updateDoc).length > 0) {
                await col.updateOne({ _id: game._id }, { $set: updateDoc });
                console.log(`[FIXED] ${game.game_title}`);
                count++;
            }
            
            await new Promise(r => setTimeout(r, 500));
        }
        
        console.log(`Bulk fix complete! Updated ${count} games.`);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

runBulkFix();
