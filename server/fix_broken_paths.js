import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const col = mongoose.connection.db.collection('products');
        
        // 1. Fix Bambu P1S
        const b = await col.updateOne(
            { name: /Bambu Lab P1S Combo/i },
            { $set: { image: '/images/bambu-lab-p1s-combo-3d-printer.png' } }
        );
        console.log('Fixed Bambu:', b.modifiedCount);

        // 2. Fix Creality K1 Max
        const k = await col.updateOne(
            { name: /Creality K1 Max/i },
            { $set: { image: '/images/creality-k1-max-3d-printer.png' } }
        );
        console.log('Fixed Creality:', k.modifiedCount);

        // 3. Fix Snapmaker Artisan
        const a = await col.updateOne(
            { name: /Snapmaker Artisan/i },
            { $set: { image: '/images/snapmaker-artisan-premium-3-in-1-3d-printer-dual-extrusion-200w-cnc-40w-laser-.png' } }
        );
        console.log('Fixed Artisan:', a.modifiedCount);

        // 4. Fix Snapmaker 2.0
        const s = await col.updateOne(
            { name: /Snapmaker 2.0 A350T/i },
            { $set: { image: '/images/snapmaker-2.0-a350t-3-in-1-3d-printer.png' } }
        );
        console.log('Fixed Snapmaker 2.0:', s.modifiedCount);

        // 5. Fix Zmorph
        const z = await col.updateOne(
            { name: /Zmorph Fab Advance/i },
            { $set: { image: '/images/zmorph-fab-advance-2-in-1-3d-printer.png' } }
        );
        console.log('Fixed Zmorph:', z.modifiedCount);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
