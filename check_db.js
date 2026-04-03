import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

import Product from '../server/models/Product.js';

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const featuredCount = await Product.countDocuments({ featured: true });
    const allCount = await Product.countDocuments();
    const featuredList = await Product.find({ featured: true }).limit(5);
    
    console.log(`Total Products: ${allCount}`);
    console.log(`Featured Products: ${featuredCount}`);
    console.log("Featured List Sample:", JSON.stringify(featuredList, null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkProducts();
