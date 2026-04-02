const mongoose = require('mongoose');
const uri = "mongodb://admin:Rachit12@ac-kxdsipc-shard-00-00.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-01.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-02.m8mypwk.mongodb.net:27017/3dprinter?ssl=true&replicaSet=atlas-u6vim9-shard-0&authSource=admin&retryWrites=true&w=majority";

const productSchema = new mongoose.Schema({
  name: String,
  condition: String,
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function fix() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');
        
        // 1. Mark products with "Refurbished" in name
        const res = await Product.updateMany(
            { name: /refurb/i, condition: { $ne: "Refurbished" } },
            { $set: { condition: "Refurbished" } }
        );
        console.log(`Updated ${res.modifiedCount} products to "Refurbished" condition`);
        
        // 2. Also ensure brands are lowercase for ALL products (since that's our standard)
        // This is a safety measure to ensure filtering works globally
        const products = await Product.find({ brand: { $exists: true } });
        let updatedCount = 0;
        for (const p of products) {
            if (p.brand && p.brand !== p.brand.toLowerCase()) {
                p.brand = p.brand.toLowerCase();
                await p.save();
                updatedCount++;
            }
        }
        console.log(`Normalized brands for ${updatedCount} products`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
fix();
