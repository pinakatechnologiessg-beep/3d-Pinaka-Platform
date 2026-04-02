import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function runFinalMigration() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({}).lean();
        console.log(`Found ${products.length} products to check...`);

        let updated = 0;
        for (const p of products) {
            const updates = {};
            
            // 1. Fix Name from Title
            if (!p.name && p.title) {
                updates.name = p.title;
            } else if (!p.name) {
                updates.name = "Unnamed Product";
            }

            // 2. Fix Price from various fields
            if (typeof p.price !== 'number') {
                const rawPrice = p.price || p.sellingPrice || p.oldPrice || "0";
                const parsed = parseInt(String(rawPrice).replace(/[^0-9]/g, '')) || 0;
                updates.price = parsed;
            }

            // 3. Fix MRP from various fields
            if (typeof p.mrp !== 'number') {
                const rawMRP = p.mrp || p.oldPrice || p.mrpPrice || "0";
                const parsed = parseInt(String(rawMRP).replace(/[^0-9]/g, '')) || 0;
                updates.mrp = parsed;
            }

            // 4. Ensure Condition
            if (!p.condition) {
                updates.condition = "New";
            }

            // 5. Ensure inStock is Boolean
            if (typeof p.inStock !== 'boolean') {
                updates.inStock = p.inStock !== false;
            }

            if (Object.keys(updates).length > 0) {
                await Product.updateOne({ _id: p._id }, { $set: updates });
                updated++;
            }
        }

        console.log(`COMPLETED! Updated ${updated} products.`);
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e);
        process.exit(1);
    }
}

runFinalMigration();
