const https = require('https');
const cheerio = require('cheerio');

https.get('https://repack-games.com/winter-memories-free-download-v/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const $ = cheerio.load(data);
        console.log('Images in article:');
        $('article img').each((i, el) => {
            console.log($(el).attr('data-src') || $(el).attr('src'));
        });
    });
});
