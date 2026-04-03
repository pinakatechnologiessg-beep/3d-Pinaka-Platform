import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const r = await mongoose.connection.db.collection('products').updateMany({}, { $set: { featured: true } });
        console.log('U:', r.modifiedCount);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
