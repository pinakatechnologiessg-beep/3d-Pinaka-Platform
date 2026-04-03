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

if (!fs.existsSync(serverPublicImagesDir)){
    fs.mkdirSync(serverPublicImagesDir, { recursive: true });
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 5000 });
    console.log("Connected to DB");

    // 1. Rename files in client/public/images
    if (fs.existsSync(clientPublicImagesDir)) {
      const files = fs.readdirSync(clientPublicImagesDir);
      for (const file of files) {
         const oldPath = path.join(clientPublicImagesDir, file);
         if (!fs.statSync(oldPath).isFile()) continue;

         let newName = file.toLowerCase().replace(/\s+/g, '-');
         
         const newClientPath = path.join(clientPublicImagesDir, newName);
         if (file !== newName) {
            const tempClientPath = path.join(clientPublicImagesDir, 'tmp_rn_' + file);
            fs.renameSync(oldPath, tempClientPath);
            fs.renameSync(tempClientPath, newClientPath);
            console.log(`Renamed in client: ${file} -> ${newName}`);
         }
      }
    }

    // 2. Rename/Copy files to server/public/images
    if (fs.existsSync(serverPublicImagesDir)) {
      const files = fs.readdirSync(serverPublicImagesDir);
      for (const file of files) {
         const oldPath = path.join(serverPublicImagesDir, file);
         if (!fs.statSync(oldPath).isFile()) continue;

         let newName = file.toLowerCase().replace(/\s+/g, '-');
         
         const newServerPath = path.join(serverPublicImagesDir, newName);
         if (file !== newName) {
            const tempServerPath = path.join(serverPublicImagesDir, 'tmp_rn_' + file);
            fs.renameSync(oldPath, tempServerPath);
            fs.renameSync(tempServerPath, newServerPath);
            console.log(`Renamed in server: ${file} -> ${newName}`);
         }
      }
    }

    // Ensure all client images are copied to server
    if (fs.existsSync(clientPublicImagesDir)) {
      const clientFiles = fs.readdirSync(clientPublicImagesDir);
      for (const file of clientFiles) {
        if (!fs.statSync(path.join(clientPublicImagesDir, file)).isFile()) continue;
        const serverPath = path.join(serverPublicImagesDir, file);
        if (!fs.existsSync(serverPath)) {
            fs.copyFileSync(path.join(clientPublicImagesDir, file), serverPath);
        }
      }
    }


    // 3. Update DB
    const products = await Product.find({});
    let updatedCount = 0;

    const collection = mongoose.connection.db.collection('products');
    
    for (let product of products) {
        if (!product.image) continue;
        if (product.image.startsWith('http')) continue;

        let imgUrl = decodeURIComponent(product.image);
        let baseName = path.basename(imgUrl);
        
        // Ensure fully lowercase and dash-separated
        let newBaseName = baseName.toLowerCase().replace(/\s+/g, '-');
        
        let targetUrl = `/images/${newBaseName}`;
        
        if (product.image !== targetUrl) {
            await collection.updateOne({ _id: product._id }, { $set: { image: targetUrl } });
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
