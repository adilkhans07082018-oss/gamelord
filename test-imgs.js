const https = require('https');
const cheerio = require('cheerio');

https.get('https://repack-games.com/grand-theft-auto-v-free-download/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const $ = cheerio.load(data);
        const imgs = $('img');
        
        imgs.each((i, el) => {
            console.log(i, $(el).attr('src'), $(el).attr('data-src') || '');
        });
    });
});
