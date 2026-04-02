import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

async function normalizeDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Final Normalize Printers to "3D Printer"
        const catResult = await Product.updateMany(
            { category: { $in: ['FDM Printer', 'Resin Printer', 'FDM', 'Resin', 'Printer', '3d printer', '3D printer', '3-in-1', '3-in-1 Printer', 'Industrial Printer', 'Snapmaker', 'MakerBox'] } },
            { $set: { category: "3D Printer" } }
        );
        console.log(`Normalized ${catResult.modifiedCount} categories to "3D Printer"`);

        // Step 2: Fix Old Products (condition missing)
        const condResult = await Product.updateMany(
            { condition: { $exists: false } },
            { $set: { condition: "New" } }
        );
        console.log(`Updated ${condResult.modifiedCount} products with missing condition field`);

        process.exit(0);
    } catch (error) {
        console.error('Error normalizing database:', error);
        process.exit(1);
    }
}

normalizeDatabase();
