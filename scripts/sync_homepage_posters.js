const { MongoClient } = require('mongodb');
const https = require('https');
const cheerio = require('cheerio');

const uri = "mongodb+srv://adilkhans07082018_db_user:aK6LHKX8ecKJTpvZ@cluster0.ntxxr0c.mongodb.net/";

function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 10000 
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHtml(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function cleanHtml(str) {
  if (!str) return "";
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function scrapeGameDetails(url, realPoster, realCategory) {
  const html = await fetchHtml(url);
  if (!html) return null;
  const $ = cheerio.load(html);

  let title = $('h1').first().text().trim();
  if (!title) return null;

  let game_size = "Unknown";
  const sizeMatch = html.match(/Size[^\w]?\s*([0-9.]+\s*[MGT]B)/i);
  if (sizeMatch) {
    game_size = sizeMatch[1];
  } else {
    const storageMatch = html.match(/(?:Storage|Hard Drive|Space).*?(\d+(?:\.\d+)?\s*(?:MB|GB|TB|KB))/i);
    if (storageMatch) game_size = `~${storageMatch[1]}`;
  }

  let description = "";
  $('p').each((i, el) => {
    const text = $(el).text();
    if (text.length > 100 && !text.includes('SYSTEM REQUIREMENTS') && !text.includes('HOW TO DOWNLOAD')) {
      description = text.trim();
      return false;
    }
  });

  let sysReqHtml = html.substring(html.indexOf('SYSTEM REQUIREMENTS'), html.indexOf('HOW TO DOWNLOAD'));
  let system_requirements = cleanHtml(sysReqHtml) || "System requirements not specified.";

  const download_links = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && (href.includes('mega.nz') || href.includes('drive.google') || href.includes('1fichier') || href.includes('qiwi') || href.includes('gofile') || href.includes('pixeldrain') || href.includes('mediafire') || href.includes('buzzheavier') || href.includes('datanodes'))) {
      if (!download_links.includes(href)) download_links.push(href);
    }
  });

  const categories = realCategory ? [realCategory] : [];
  $('.category a, .tags a, [rel="category tag"]').each((i, el) => {
    const c = $(el).text().trim();
    if (c && !categories.includes(c)) categories.push(c);
  });

  const screenshots = [];
  $('.gallery-icon img, .tiled-gallery-item img, .gallery-item img').each((i, el) => {
    const src = $(el).attr('data-src') || $(el).attr('src');
    if (src && !src.includes('svg+xml') && !src.includes('Logo.png') && !src.includes('avatar')) {
      const full = src.replace(/-\d{2,4}x\d{2,4}(\.[a-zA-Z]+)$/, '$1');
      if (!screenshots.includes(full)) screenshots.push(full);
    }
  });

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
    poster_image: realPoster,
    download_links,
    categories: [...new Set(categories)],
    screenshots,
    trailer,
    created_at: new Date()
  };
}

async function syncThumbnails() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('GameLord');
  const collection = db.collection('games');

  for (let pageNum = 1; pageNum <= 8; pageNum++) {
    const url = pageNum === 1 ? 'https://repack-games.com/' : `https://repack-games.com/page/${pageNum}/`;
    console.log(`\nFetching ${url}...`);
    const html = await fetchHtml(url);
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

    console.log(`Page ${pageNum}: Found ${posts.length} cards.`);

    let updatedCount = 0;
    let newCount = 0;

    for (const p of posts) {
      const cleanTitle = p.title.replace(/\s+/g, ' ').trim();
      const existing = await collection.findOne({
        $or: [
          { game_link: p.link },
          { game_title: { $regex: '^' + cleanTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', $options: 'i' } }
        ]
      });

      if (existing) {
        if (existing.poster_image !== p.img) {
          await collection.updateOne(
            { _id: existing._id },
            { $set: { poster_image: p.img } }
          );
          updatedCount++;
        }
      } else {
        const details = await scrapeGameDetails(p.link, p.img, p.cat);
        if (details) {
          await collection.insertOne(details);
          newCount++;
        }
      }
    }
    console.log(`Page ${pageNum} done: ${updatedCount} posters updated, ${newCount} new games inserted.`);
  }

  console.log('\nAll pages synced successfully!');
  await client.close();
}

syncThumbnails().catch(console.error);
