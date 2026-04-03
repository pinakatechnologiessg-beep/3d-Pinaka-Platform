import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const clientPublicImagesDir = path.join(__dirname, '../client/public/images');
const serverPublicImagesDir = path.join(__dirname, 'public/images');

// Make sure server/public/images exists
if (!fs.existsSync(serverPublicImagesDir)){
    fs.mkdirSync(serverPublicImagesDir, { recursive: true });
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    // Copy and Rename local images in client/public/images as well
    if (fs.existsSync(clientPublicImagesDir)) {
      const files = fs.readdirSync(clientPublicImagesDir);
      for (const file of files) {
         const oldPath = path.join(clientPublicImagesDir, file);
         
         if (!fs.statSync(oldPath).isFile()) continue;

         // kebab-case: remove whitespace, trim
         let newName = file.replace(/\s+/g, '-');
         const newClientPath = path.join(clientPublicImagesDir, newName);
         const newServerPath = path.join(serverPublicImagesDir, newName);

         // Rename in client (if it has spaces)
         if (file !== newName) {
            fs.renameSync(oldPath, newClientPath);
            console.log(`Renamed in client: ${file} -> ${newName}`);
         }
         
         // Copy to server (so backend can serve it)
         if (!fs.existsSync(newServerPath)) {
            fs.copyFileSync(newClientPath, newServerPath);
            console.log(`Copied to server: ${newName}`);
         }
      }
    } else {
      console.log("Client images directory not found");
    }

    // Update DB URLs
    const products = await Product.find({});
    let updatedCount = 0;

    for (let product of products) {
        if (!product.image) continue;
        if (product.image.startsWith('http')) continue;

        let imgUrl = decodeURIComponent(product.image);
        let baseName = path.basename(imgUrl);
        
        let newBaseName = baseName.replace(/\s+/g, '-');
        
        let targetUrl = `/images/${newBaseName}`;
        
        if (product.image !== targetUrl) {
            product.image = targetUrl;
            await product.save();
            updatedCount++;
            console.log(`Updated DB: ${product.name} -> ${targetUrl}`);
        }
    }
    
    console.log(`Successfully updated ${updatedCount} products in DB.`);

  } catch(e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB");
  }
}

run();
