const https = require('https');
const cheerio = require('cheerio');

https.get('https://repack-games.com/nivalis-nights-free-download/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const $ = cheerio.load(data);
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.includes('youtube.com')) {
                console.log('YouTube Link:', href);
            }
        });
        const iframes = $('iframe');
        iframes.each((i, el) => {
            console.log('Iframe src:', $(el).attr('src') || $(el).attr('data-src'));
        });
    });
});
