import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function normalizeBrands() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Step 1: Normalize Brands (Lowercase)
        // Find all products and their current brand
        const products = await Product.find({ brand: { $exists: true } });
        console.log(`Checking ${products.length} products...`);
        
        let count = 0;
        for (const p of products) {
            if (p.brand && p.brand !== p.brand.toLowerCase()) {
                await Product.updateOne({ _id: p._id }, { $set: { brand: p.brand.toLowerCase() } });
                count++;
            }
        }
        
        console.log(`Normalized ${count} brand names to lowercase.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
normalizeBrands();
