const { MongoClient } = require('mongodb');
async function run() { 
    const uri = 'mongodb+srv://adilkhans07082018_db_user:aK6LHKX8ecKJTpvZ@cluster0.ntxxr0c.mongodb.net/'; 
    const client = new MongoClient(uri); 
    await client.connect(); 
    const db = client.db('GameLord'); 
    await db.collection('games').updateOne(
        { game_title: { $regex: /Winter Memories/i } }, 
        { $set: { poster_image: 'https://cdn.akamai.steamstatic.com/steam/apps/2495450/extras/Winter_Memories_Description_1-EN.png?t=1699454782' } }
    );
    console.log('Fixed Winter Memories'); 
    await client.close(); 
} 
run();
