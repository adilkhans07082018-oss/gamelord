const { MongoClient } = require('mongodb');
const https = require('https');
const cheerio = require('cheerio');

// Use environment variable for security in GitHub Actions
const uri = process.env.MONGODB_URI || "mongodb+srv://adilkhans07082018_db_user:aK6LHKX8ecKJTpvZ@cluster0.ntxxr0c.mongodb.net/";

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 10000 
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHtml(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function cleanHtml(str) {
    if (!str) return "";
    return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function scrapeGameDetails(url, listingPoster = null, listingCategory = null) {
    const html = await fetchHtml(url);
    if (!html) return null;
    const $ = cheerio.load(html);

    // 1. Title
    let title = $('h1').first().text().trim();
    if (!title) return null;

    // 2. Poster Image (Prioritize listing featured box art)
    let poster_image = listingPoster || "";
    if (!poster_image || poster_image.includes('svg+xml')) {
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
    }
    
    if (poster_image && poster_image.match(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/)) {
        poster_image = poster_image.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');
    }

    // 3. Game Size
    let game_size = "Unknown";
    const sizeMatch = html.match(/Size[^\w]?\s*([0-9.]+\s*[MGT]B)/i);
    if (sizeMatch) {
        game_size = sizeMatch[1];
    } else {
        const storageMatch = html.match(/(?:Storage|Hard Drive|Space).*?(\d+(?:\.\d+)?\s*(?:MB|GB|TB|KB))/i);
        if (storageMatch) game_size = `~${storageMatch[1]}`;
    }

    // 4. Description
    let description = "";
    $('p').each((i, el) => {
        const text = $(el).text();
        if (text.length > 100 && !text.includes('SYSTEM REQUIREMENTS') && !text.includes('HOW TO DOWNLOAD')) {
            description = text.trim();
            return false;
        }
    });

    // 5. System Requirements
    let sysReqHtml = html.substring(html.indexOf('SYSTEM REQUIREMENTS'), html.indexOf('HOW TO DOWNLOAD'));
    let system_requirements = cleanHtml(sysReqHtml) || "System requirements not specified.";

    // 6. Download Links
    const download_links = [];
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && (href.includes('mega.nz') || href.includes('drive.google') || href.includes('1fichier') || href.includes('qiwi') || href.includes('gofile') || href.includes('pixeldrain') || href.includes('mediafire') || href.includes('buzzheavier') || href.includes('datanodes'))) {
            if (!download_links.includes(href)) {
                download_links.push(href);
            }
        }
    });

    // 7. Categories
    const categories = listingCategory ? [listingCategory] : [];
    $('.category a, .tags a, [rel="category tag"]').each((i, el) => {
        const c = $(el).text().trim();
        if (c && !categories.includes(c)) categories.push(c);
    });

    // 8. Screenshots
    const screenshots = [];
    $('.gallery-icon img, .tiled-gallery-item img, .gallery-item img').each((i, el) => {
        const src = $(el).attr('data-src') || $(el).attr('src');
        if (src && !src.includes('svg+xml') && !src.includes('Logo.png') && !src.includes('avatar') && !src.includes('avatar.jpg')) {
            const highRes = src.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');
            if (!screenshots.includes(highRes)) {
                screenshots.push(highRes);
            }
        }
    });

    // 9. Trailer (YouTube)
    let trailer = null;
    $('iframe').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && src.includes('youtube.com/embed/')) {
            trailer = src;
            return false;
        }
    });

    return {
        game_title: title,
        game_link: url,
        website_name: "Repack Games",
        game_size,
        system_requirements,
        description,
        poster_image,
        download_links,
        categories: [...new Set(categories)],
        screenshots,
        trailer,
        created_at: new Date()
    };
}

async function runAutoScraper() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('GameLord');
        const gamesCollection = db.collection('games');
        
        console.log("Fetching homepage and recent pages of repack-games.com...");
        const pagesToScrape = [
            'https://repack-games.com/',
            'https://repack-games.com/page/2/'
        ];

        let newGamesAdded = 0;
        let postersUpdated = 0;

        for (const pageUrl of pagesToScrape) {
            const html = await fetchHtml(pageUrl);
            if (!html) continue;
            const $ = cheerio.load(html);

            const posts = [];
            $('.post').each((i, el) => {
                const link = $(el).find('a').first().attr('href');
                const img = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
                const title = $(el).find('h2').text().trim();
                const cat = $(el).find('.artbtn-category a').text().trim();
                if (link && img && !img.includes('svg+xml')) {
                    posts.push({ link, img, title, cat });
                }
            });

            console.log(`Checking ${posts.length} games on ${pageUrl}...`);

            for (const item of posts) {
                const cleanTitle = item.title.replace(/\s+/g, ' ').trim();
                const existing = await gamesCollection.findOne({
                    $or: [
                        { game_link: item.link },
                        { game_title: { $regex: '^' + cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', $options: 'i' } }
                    ]
                });

                if (existing) {
                    if (existing.poster_image !== item.img) {
                        await gamesCollection.updateOne(
                            { _id: existing._id },
                            { $set: { poster_image: item.img } }
                        );
                        postersUpdated++;
                    }
                    continue;
                }

                console.log(`[SCRAPING NEW GAME] ${item.title}`);
                const gameData = await scrapeGameDetails(item.link, item.img, item.cat);
                if (gameData) {
                    await gamesCollection.insertOne(gameData);
                    newGamesAdded++;
                    console.log(`[SAVED] ${gameData.game_title}`);
                }
            }
        }

        console.log(`Auto scraper finished. Added ${newGamesAdded} new games, updated ${postersUpdated} posters.`);
    } catch (e) {
        console.error("Auto scraper failed:", e);
    } finally {
        await client.close();
    }
}

runAutoScraper();
