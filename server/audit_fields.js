import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function auditFields() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const products = await Product.find({}).limit(50);
        console.log('--- PRODUCTS LOG ---');
        products.forEach(p => {
           console.log(`[${p._id}] Name: "${p.name}" Category: "${p.category}" Price: ${p.price}`);
        });
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
auditFields();
