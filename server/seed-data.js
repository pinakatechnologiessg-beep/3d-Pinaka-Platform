import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import Product from './models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const clientConstantsDir = path.join(__dirname, '../client/src/constants');
    const files = fs.readdirSync(clientConstantsDir).filter(f => f.endsWith('_data.js') || f === 'data.js');

    let allProducts = [];

    for (const file of files) {
      if (file === 'data.js') continue; // Contains duplicate or different structure we might skip? Wait, let's include it but filter

      const modulePath = pathToFileURL(path.join(clientConstantsDir, file)).href;
      const mod = await import(modulePath);

      // Extract the array from exported objects
      for (const key in mod) {
        if (Array.isArray(mod[key])) {
          allProducts = allProducts.concat(mod[key]);
        }
      }
    }

    // Now process data.js too to get general PRODUCTS if missing
    const dataModPath = pathToFileURL(path.join(clientConstantsDir, 'data.js')).href;
    const dataMod = await import(dataModPath);
    if (dataMod.PRODUCTS && Array.isArray(dataMod.PRODUCTS)) {
      // Avoid exact duplicates by title
      const existingTitles = new Set(allProducts.map(p => p.title));
      const freshProducts = dataMod.PRODUCTS.filter(p => !existingTitles.has(p.title));
      allProducts = allProducts.concat(freshProducts);
    }

    // Map frontend structure to backend schema
    const mappedProducts = allProducts.map(p => {
      // Determine brand from title
      let brand = 'Other';
      const lowercaseTitle = p.title.toLowerCase();
      if (lowercaseTitle.includes('anycubic')) brand = 'Anycubic';
      else if (lowercaseTitle.includes('bambu')) brand = 'Bambu Lab';
      else if (lowercaseTitle.includes('creality')) brand = 'Creality';
      else if (lowercaseTitle.includes('snapmaker')) brand = 'Snapmaker';
      else if (lowercaseTitle.includes('rotrics')) brand = 'Rotrics';
      else if (lowercaseTitle.includes('flashforge')) brand = 'Flashforge';
      else if (lowercaseTitle.includes('elegoo')) brand = 'Elegoo';
      else if (lowercaseTitle.includes('zmorph')) brand = 'Zmorph';
      else if (lowercaseTitle.includes('magforms')) brand = 'Magforms';
      else if (lowercaseTitle.includes('sunlu')) brand = 'Sunlu';

      // Map badge/badges
      let badge = p.badge;
      if (!badge && p.badges && p.badges.length > 0) {
        badge = p.badges[0];
      }

      return {
        title: p.title || 'Untitled',
        price: p.price || '₹0',
        oldPrice: p.oldPrice || null,
        category: p.category || 'Printer',
        image: p.image || '/placeholder.png',
        stars: p.stars || '★★★★★ (5.0)',
        badge: badge,
        badgeStyle: p.badgeStyle || null,
        inStock: p.inStock !== false,
        brand: brand,
        specs: p.specs || [],
        description: p.description || '',
        images: p.images || []
      };
    });

    const inserted = await Product.insertMany(mappedProducts);
    console.log(`Seeded ${inserted.length} products successfully!`);

    process.exit(0);

  } catch (err) {
    console.error('Failed to seed DB:', err);
    process.exit(1);
  }
};

seedDatabase();
