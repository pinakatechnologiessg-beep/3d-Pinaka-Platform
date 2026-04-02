import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function checkRefurbished() {
  await mongoose.connect(process.env.MONGODB_URI);
  const items = await Product.find({ condition: 'Refurbished' });
  console.log(`Total Refurbished Items: ${items.length}`);
  
  const newItems = await Product.find({ condition: 'New' });
  console.log(`Total New Items: ${newItems.length}`);
  const noConditionItems = await Product.find({ condition: { $exists: false } });
  console.log(`Total Items without condition: ${noConditionItems.length}`);
  
  const categories = [...new Set(items.map(i => i.category))];
  console.log('Categories found in Refurbished Store:', categories);
  
  const brands = [...new Set(items.map(i => i.brand))];
  console.log('Brands found in Refurbished Store:', brands);

  const samplePrinters = await Product.find({ 
    condition: 'Refurbished', 
    category: /printer|fdm|resin/i 
  }).limit(5);
  console.log('Sample Printers found:', samplePrinters.map(p => ({
    name: p.name || p.title,
    category: p.category,
    condition: p.condition
  })));

  await mongoose.disconnect();
}

checkRefurbished();
