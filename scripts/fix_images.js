const { MongoClient } = require('mongodb');
const https = require('https');
const cheerio = require('cheerio');

const uri = "mongodb+srv://adilkhans07082018_db_user:aK6LHKX8ecKJTpvZ@cluster0.ntxxr0c.mongodb.net/";

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function fixBrokenImages() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('GameLord');
        const col = db.collection('games');
        
        // Find games that might have bad images (from the sidebar)
        const brokenGames = await col.find({
            $or: [
                { game_title: { $regex: /Nivalis Nights/i } },
                { game_title: { $regex: /Blurring the Walls/i } },
                { game_title: { $regex: /ACE COMBAT/i } },
                { game_title: { $regex: /Gears of War: E-Day/i } },
                { poster_image: { $regex: /Logo\.png/i } },
                { poster_image: { $regex: /svg\+xml/i } }
            ]
        }).toArray();
        
        console.log(`Found ${brokenGames.length} games to fix. Fixing...`);
        
        for (const game of brokenGames) {
            if (!game.game_link) continue;
            console.log(`Fixing: ${game.game_title}`);
            const html = await fetchHtml(game.game_link);
            const $ = cheerio.load(html);
            
            // EXACT selector for the main poster to avoid "You May Also Like"
            let poster_image = "";
            $('.media-single-content img').each((i, el) => {
                const src = $(el).attr('data-src') || $(el).attr('src');
                if (src && !src.includes('svg+xml') && !src.includes('Logo.png')) {
                    poster_image = src;
                    return false;
                }
            });
            // Fallback if .media-single-content doesn't exist
            if (!poster_image) {
                $('.entry-content > p > img, article > div > img').first().each((i, el) => {
                     poster_image = $(el).attr('data-src') || $(el).attr('src');
                });
            }
            
            if (poster_image && poster_image.match(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/)) {
                poster_image = poster_image.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');
            }

            // EXACT selector for actual screenshots
            const screenshots = [];
            $('.gallery-icon img, .tiled-gallery-item img').each((i, el) => {
                const src = $(el).attr('data-src') || $(el).attr('src');
                if (src && !src.includes('svg+xml') && !src.includes('Logo.png')) {
                    screenshots.push(src);
                }
            });
            // If empty, try finding inside the content, avoiding .rg-rel__shot
            if (screenshots.length === 0) {
                $('.entry-content img, .post-content img').each((i, el) => {
                    // Make sure it's not inside a related widget
                    if ($(el).closest('.rg-rel__card').length === 0 && $(el).closest('.crp_related').length === 0) {
                        const src = $(el).attr('data-src') || $(el).attr('src');
                        if (src && src !== poster_image && !src.includes('svg+xml') && !src.includes('Logo.png')) {
                            screenshots.push(src);
                        }
                    }
                });
            }
            
            // Fetch Trailer
            let trailer = game.trailer || null;
            $('iframe').each((i, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src');
                if (src && src.includes('youtube.com/embed/')) {
                    trailer = src;
                    return false;
                }
            });

            await col.updateOne({ _id: game._id }, {
                $set: {
                    poster_image: poster_image,
                    screenshots: [...new Set(screenshots)],
                    trailer: trailer
                }
            });
            console.log(` -> Poster: ${poster_image}`);
            console.log(` -> Found ${screenshots.length} screenshots.`);
            if (trailer) console.log(` -> Trailer: ${trailer}`);
        }
        
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }
}
fixBrokenImages();
