const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read .env from server directory
const envPath = path.join(__dirname, 'server/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUri = envContent.match(/MONGODB_URI=(.*)/)[1].trim();

async function checkDb() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db();
    const products = db.collection('products');
    
    const allCount = await products.countDocuments();
    const featuredCount = await products.countDocuments({ featured: true });
    const sample = await products.find({ featured: true }).limit(3).toArray();
    
    console.log(`ALL_COUNT: ${allCount}`);
    console.log(`FEATURED_COUNT: ${featuredCount}`);
    console.log(`SAMPLE: ${JSON.stringify(sample)}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkDb();
