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

async function scrapeGameDetails(url) {
    const html = await fetchHtml(url);
    if (!html) return null;
    const $ = cheerio.load(html);

    // 1. Title
    let title = $('h1').first().text().trim();
    if (!title) return null; // Not a valid game page

    // 2. Poster Image
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
            return false; // break loop
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
    const categories = [];
    $('.category a, .tags a, [rel="category tag"]').each((i, el) => {
        categories.push($(el).text().trim());
    });

    // 8. Screenshots
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
        
        console.log("Fetching homepage of repack-games.com...");
        const homepageHtml = await fetchHtml("https://repack-games.com/");
        const $ = cheerio.load(homepageHtml);
        
        const gameLinks = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('https://repack-games.com/') && !href.includes('/page/') && !href.includes('/category/')) {
                // simple heuristic for game links
                if (href.split('/').length > 4) {
                    gameLinks.push(href);
                }
            }
        });

        const uniqueLinks = [...new Set(gameLinks)];
        console.log(`Found ${uniqueLinks.length} potential game links on homepage.`);

        let newGamesAdded = 0;

        for (const link of uniqueLinks) {
            // Check if game already exists in DB
            const existing = await gamesCollection.findOne({ game_link: link });
            if (existing) {
                console.log(`[SKIP] Already in DB: ${link}`);
                continue;
            }

            console.log(`[SCRAPING NEW GAME] ${link}`);
            const gameData = await scrapeGameDetails(link);
            
            if (gameData && gameData.game_title && gameData.download_links.length > 0) {
                await gamesCollection.insertOne(gameData);
                console.log(`[ADDED] ${gameData.game_title}`);
                newGamesAdded++;
            } else {
                console.log(`[FAILED/INVALID] Skipped ${link}`);
            }
            
            // Sleep 1 second to avoid getting blocked
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`\nAuto-Scraper finished! Added ${newGamesAdded} new games.`);

    } catch (error) {
        console.error("Scraper Error:", error);
    } finally {
        await client.close();
    }
}

runAutoScraper();
