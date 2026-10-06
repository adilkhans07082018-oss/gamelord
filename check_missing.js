const { MongoClient } = require('mongodb');
async function run() { 
    const uri = 'mongodb+srv://adilkhans07082018_db_user:aK6LHKX8ecKJTpvZ@cluster0.ntxxr0c.mongodb.net/'; 
    const client = new MongoClient(uri); 
    await client.connect(); 
    const db = client.db('GameLord'); 
    
    const badScreenshots = await db.collection('games').find({
        $or: [
            { screenshots: null },
            { screenshots: { $exists: false } },
            { screenshots: { $size: 0 } }
        ]
    }).limit(10).toArray();

    console.log('Games missing screenshots:');
    badScreenshots.forEach(g => console.log(g.game_title, ' | Poster:', g.poster_image));
    
    await client.close(); 
} 
run();
