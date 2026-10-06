const { MongoClient } = require('mongodb');
const https = require('https');
const cheerio = require('cheerio');

const uri = "mongodb+srv://adilkhans07082018_db_user:aK6LHKX8ecKJTpvZ@cluster0.ntxxr0c.mongodb.net/";

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHtml(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
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

    let title = $('h1').first().text().trim();
    if (!title) return null; 

    // Poster Image
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

    // Game Size
    let game_size = "Unknown";
    const sizeMatch = html.match(/Size[^\w]?\s*([0-9.]+\s*[MGT]B)/i);
    if (sizeMatch) {
        game_size = sizeMatch[1];
    } else {
        const storageMatch = html.match(/(?:Storage|Hard Drive|Space).*?(\d+(?:\.\d+)?\s*(?:MB|GB|TB|KB))/i);
        if (storageMatch) game_size = `~${storageMatch[1]}`;
    }

    // Description
    let description = "";
    $('p').each((i, el) => {
        const text = $(el).text();
        if (text.length > 100 && !text.includes('SYSTEM REQUIREMENTS') && !text.includes('HOW TO DOWNLOAD')) {
            description = text.trim();
            return false;
        }
    });

    // System Requirements
    let sysReqHtml = html.substring(html.indexOf('SYSTEM REQUIREMENTS'), html.indexOf('HOW TO DOWNLOAD'));
    let system_requirements = cleanHtml(sysReqHtml) || "System requirements not specified.";

    // Download Links
    const download_links = [];
    $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && (href.includes('mega.nz') || href.includes('drive.google') || href.includes('1fichier') || href.includes('qiwi') || href.includes('gofile') || href.includes('pixeldrain') || href.includes('mediafire') || href.includes('buzzheavier') || href.includes('datanodes'))) {
            if (!download_links.includes(href)) {
                download_links.push(href);
            }
        }
    });

    // Categories
    const categories = [];
    $('.category a, .tags a, [rel="category tag"]').each((i, el) => {
        categories.push($(el).text().trim());
    });

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
        screenshots: [...new Set(screenshots)],
        trailer,
        created_at: new Date()
    };
}

async function runFullSync() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('GameLord');
        const col = db.collection('games');
        
        console.log("Starting deep sync of recent pages...");
        let newGamesAdded = 0;
        
        // Scan the first 30 pages (approx 450 games)
        for (let page = 1; page <= 30; page++) {
            const pageUrl = page === 1 ? "https://repack-games.com/" : `https://repack-games.com/page/${page}/`;
            console.log(`\nScanning Page ${page}: ${pageUrl}`);
            
            const html = await fetchHtml(pageUrl);
            if (!html) continue;
            
            const $ = cheerio.load(html);
            const gameLinks = [];
            
            $('a').each((i, el) => {
                const href = $(el).attr('href');
                if (href && href.startsWith('https://repack-games.com/') && !href.includes('/page/') && !href.includes('/category/')) {
                    if (href.split('/').length > 4) {
                        gameLinks.push(href);
                    }
                }
            });

            const uniqueLinks = [...new Set(gameLinks)];
            console.log(`Found ${uniqueLinks.length} game links on this page.`);

            for (const link of uniqueLinks) {
                const existing = await col.findOne({ game_link: link });
                if (existing) {
                    continue; // Already in DB
                }

                console.log(`[MISSING] Found missing game: ${link}`);
                const gameData = await scrapeGameDetails(link);
                
                if (gameData && gameData.game_title && gameData.download_links.length > 0) {
                    await col.insertOne(gameData);
                    console.log(`   -> [ADDED] ${gameData.game_title} (Poster: ${!!gameData.poster_image}, Trailer: ${!!gameData.trailer})`);
                    newGamesAdded++;
                } else {
                    console.log(`   -> [FAILED] Invalid data or no download links.`);
                }
                
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        console.log(`\nDeep Sync complete! Added ${newGamesAdded} missing games.`);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

runFullSync();
