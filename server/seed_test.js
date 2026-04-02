import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function seedTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // Mark some printers as Refurbished for testing multi-filters
        const products = await Product.find({ category: "3D Printer" }).limit(15);
        const ids = products.map(p => p._id);
        const seedRes = await Product.updateMany(
            { _id: { $in: ids } },
            { $set: { condition: "Refurbished" } }
        );
        console.log(`Marked ${seedRes.modifiedCount} printers as Refurbished for testing.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
seedTest();
