import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema, 'products');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const newItems = await Product.find({ condition: 'New' });
  const cats = [...new Set(newItems.map(i => i.category))];
  const brands = [...new Set(newItems.map(i => i.brand))];
  console.log('Categories of NEW items:', cats);
  console.log('Brands of NEW items:', brands);
  
  const sample = newItems.slice(0, 3).map(p => ({ 
    name: p.name || p.title, 
    cat: p.category, 
    brand: p.brand 
  }));
  console.log('Sample NEW items:', sample);

  await mongoose.disconnect();
}
check();
