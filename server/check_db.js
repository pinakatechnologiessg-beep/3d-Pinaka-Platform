import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const total = await Product.countDocuments({});
        const missing = await Product.countDocuments({ condition: { $exists: false } });
        console.log(`TOTAL PRODUCTS: ${total}`);
        console.log(`MISSING CONDITION: ${missing}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
