import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const serverPublicImagesDir = path.join(__dirname, 'public/images');
const clientPublicImagesDir = path.join(__dirname, '../client/public/images');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 5000 });
    console.log("Connected to DB");

    const collection = mongoose.connection.db.collection('products');
    const products = await collection.find({}).toArray();
    let dbUpdated = 0;

    for (let product of products) {
        if (!product.image) continue;
        if (product.image.startsWith('http')) continue;

        let imgUrl = decodeURIComponent(product.image);
        let baseName = path.basename(imgUrl);
        
        // Remove spaces and any fancy characters, keeping only alphanumeric, dot, and dash
        let newBaseName = baseName.toLowerCase().replace(/[^a-z0-9.-]/g, '-').replace(/-+/g, '-');
        
        let targetUrl = `/images/${newBaseName}`;
        
        if (product.image !== targetUrl) {
            await collection.updateOne({ _id: product._id }, { $set: { image: targetUrl } });
            dbUpdated++;
            console.log(`Fixed DB: "${product.image}" -> "${targetUrl}"`);
        }
    }
    console.log(`Updated ${dbUpdated} products in DB.`);

    const renameDir = (dir) => {
        if (!fs.existsSync(dir)) return 0;
        const files = fs.readdirSync(dir);
        let renamed = 0;
        for (const file of files) {
            let newName = file.toLowerCase().replace(/[^a-z0-9.-]/g, '-').replace(/-+/g, '-');
            if (file !== newName) {
                const oldPath = path.join(dir, file);
                const tempPath = path.join(dir, 'tmp_rn3_' + Date.now() + '_' + file.replace(/[^a-zA-Z0-9]/g, ''));
                const newPath = path.join(dir, newName);
                if (fs.statSync(oldPath).isFile()) {
                   try {
                     fs.renameSync(oldPath, tempPath);
                     fs.renameSync(tempPath, newPath);
                     renamed++;
                     console.log(`Renamed file to: ${newName}`);
                   } catch(e) {
                     console.log('Failed to rename', file);
                   }
                }
            }
        }
        return renamed;
    };
    
    console.log(`Renamed client files: ${renameDir(clientPublicImagesDir)}`);
    console.log(`Renamed server files: ${renameDir(serverPublicImagesDir)}`);

    // Force sync server dir from client dir
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

  } catch(e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB");
  }
}

run();
