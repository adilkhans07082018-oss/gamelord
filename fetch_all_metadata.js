const { MongoClient } = require('mongodb');
const https = require('https');
const cheerio = require('cheerio');

const uri = "mongodb+srv://adilkhans07082018_db_user:aK6LHKX8ecKJTpvZ@cluster0.ntxxr0c.mongodb.net/";

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 8000 
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
    return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function updateGamesBackground() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('GameLord');
    const gamesCollection = db.collection('games');
    
    console.log("Starting unified metadata fetcher (Thumbnails + System Req + Description)...");

    while (true) {
      // Find games missing any of the fields
      const games = await gamesCollection.find({
        $or: [
          { poster_image: { $exists: false } },
          { system_requirements: "" },
          { system_requirements: null },
          { description: "" },
          { description: null },
          { categories: { $exists: false } },
          { how_to_install: "" },
          { how_to_install: null }
        ]
      }).sort({ _id: -1 }).limit(50).toArray();

      if (games.length === 0) break;

      console.log(`Processing batch of ${games.length}...`);
      
      const promises = games.map(async (game) => {
        if (!game.game_link) return;
        try {
          const html = await fetchHtml(game.game_link);
          const $ = cheerio.load(html);
          let updateDoc = {};

          // 1. Poster Image
          if (game.poster_image === undefined || game.poster_image === null) {
              const posterMatch = html.match(/<img[^>]*class="[^"]*wp-post-image[^"]*"[^>]*src="([^"]+)"/i) || 
                                  html.match(/<div class="media-single-content">\s*<img[^>]*src="([^"]+)"/i);
              if (posterMatch && posterMatch[1]) {
                  updateDoc.poster_image = posterMatch[1].replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');
              } else {
                  updateDoc.poster_image = null;
              }
          }

          // 2. System Requirements
          if (!game.system_requirements) {
              let reqs = "";
              const match = html.match(/(?:MINIMUM|SYSTEM REQUIREMENTS).*?<\/h[23]>\s*<ul[^>]*>(.*?)<\/ul>/i) || 
                            html.match(/(?:MINIMUM|SYSTEM REQUIREMENTS).*?(?:<\/strong>|<\/b>|<br>)\s*(.*?)(?:RECOMMENDED|HOW TO DOWNLOAD|<div)/i);
              
              if (match && match[1]) {
                  reqs = cleanHtml(match[1]);
                  reqs = reqs.replace(/(OS:|Processor:|Memory:|Graphics:|Storage:|DirectX:|Sound Card:)/gi, '\n$1').trim();
              }
              updateDoc.system_requirements = reqs || "Not specified.";
          }

          // 3. Description
          if (!game.description) {
              let desc = '';
              $('.entry p').each((i, el) => {
                 const text = $(el).text().trim();
                 if (text.length > 30 && !text.includes('Repack-Games') && !text.includes('HOW TO DOWNLOAD') && !text.includes('Click the download')) {
                     desc += text + '\n\n';
                 }
              });
              
              // Remove the first generic sentence if it starts with game title and "pc game in a pre-installed"
              desc = desc.replace(/.*?Free Download pc game in a pre-installed.*?steam\n\n/i, '');
              
              updateDoc.description = desc.trim() || "Description not available.";
          }

          // 4. Categories
          if (!game.categories || game.categories.length === 0) {
              let cats = [];
              $('a[rel="category tag"]').each((i, el) => cats.push($(el).text().trim()));
              
              // Sometimes they have messy categories like "Free Download", filter those out if you want, but for now we'll take them
              cats = cats.filter(c => c && c.toLowerCase() !== 'games' && c.toLowerCase() !== 'free download');
              
              if (cats.length > 0) {
                  updateDoc.categories = cats;
              }
          }

          // 5. Installation Instructions
          if (!game.how_to_install || game.how_to_install.length < 10) {
              let installList = [];
              $('h2, h3, strong').each((i, el) => {
                 if ($(el).text().toUpperCase().includes('HOW TO DOWNLOAD AND INSTALL') || $(el).text().toUpperCase().includes('HOW TO INSTALL')) {
                     let next = $(el).next();
                     while (next.length > 0) {
                        if (next.is('ol') || next.is('ul')) {
                            next.find('li').each((j, li) => {
                                installList.push($(li).text().trim());
                            });
                            break;
                        } else if (next.is('p')) {
                            if (next.text().trim() && !next.text().includes('Repack-Games')) {
                               installList.push(next.text().trim());
                            }
                        } else if (next.is('h2') || next.is('h3')) {
                            break;
                        }
                        next = next.next();
                     }
                 }
              });
              
              if (installList.length > 0) {
                  updateDoc.how_to_install = installList.map((l, i) => `${i+1}. ${l}`).join('\n');
              } else {
                  // Fallback match
                  const contentText = $('body').text();
                  const match = contentText.match(/HOW TO (?:DOWNLOAD AND )?INSTALL([\s\S]*?)(?:SYSTEM REQUIREMENTS|MINIMUM|RECOMMENDED|Click the download button|Have an issue|Screenshots)/i);
                  if (match && match[1] && match[1].trim().length > 10) {
                      updateDoc.how_to_install = match[1].trim().replace(/(Download The Game|Extract|Install|Run)/gi, '\n$1').trim();
                  }
              }
          }

          // 6. Screenshots
          if (!game.screenshots || game.screenshots.length === 0) {
              const imgs = [];
              $('.entry-content img, .entry img, .page-content img').each((i, el) => {
                  const src = $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('src');
                  if (src && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon') && !src.includes('Repack-Games.jpg')) {
                      imgs.push(src);
                  }
              });
              const uniqImgs = [...new Set(imgs)]
                  .filter(s => s && s.startsWith('http'))
                  .map(s => s.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1'));
              if (uniqImgs.length > 0) {
                  updateDoc.screenshots = uniqImgs.slice(0, 8);
              }
          }

          // 7. Trailer
          if (!game.trailer) {
              let trailerSrc = null;
              $('iframe').each((i, el) => {
                  const src = $(el).attr('data-src') || $(el).attr('src');
                  if (src && src.includes('youtube.com')) {
                      trailerSrc = src;
                  }
              });
              if (trailerSrc) updateDoc.trailer = trailerSrc;
          }

          if (Object.keys(updateDoc).length > 0) {
              await gamesCollection.updateOne(
                { _id: game._id },
                { $set: updateDoc }
              );
          }
        } catch (err) {
          // Prevent infinite loops on broken URLs
          await gamesCollection.updateOne(
            { _id: game._id },
            { $set: { 
                poster_image: game.poster_image !== undefined ? game.poster_image : null,
                system_requirements: game.system_requirements || "Not specified.",
                description: game.description || "Description not available.",
                categories: game.categories || [],
                how_to_install: game.how_to_install || ""
              } 
            }
          );
        }
      });

      await Promise.allSettled(promises);
      await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log("All games updated with full metadata!");
  } finally {
    await client.close();
  }
}

updateGamesBackground().catch(console.error);
