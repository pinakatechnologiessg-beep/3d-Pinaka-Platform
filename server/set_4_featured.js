import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const col = mongoose.connection.db.collection('products');
        
        // 1. First reset ALL products to NOT featured
        await col.updateMany({}, { $set: { featured: false } });
        
        // 2. Select 4 specific high-quality products to be featured
        const featuredNames = [
            'Bambu Lab P1S Combo',
            'Creality K1 Max 3D Printer',
            'Anycubic Kobra 3 Combo',
            'Snapmaker Artisan Premium 3-In-1 3D Printer (Dual Extrusion. 200W CNC. 40W Laser)'
        ];

        const r = await col.updateMany(
            { name: { $in: featuredNames.map(f => new RegExp(f, 'i')) } },
            { $set: { featured: true } }
        );
        
        console.log('Successfully set 4 products as featured.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
