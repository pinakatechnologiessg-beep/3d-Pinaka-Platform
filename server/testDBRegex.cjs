const mongoose = require('mongoose');
const Product = require('./models/Product.js');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/3d-print-hub').then(async () => {
    try {
        const p = await Product.findOne({ name: /Snapmaker Artisan/i });
        console.log('Found product in DB:', p ? p.name : 'null');
        
        const identifier = 'Snapmaker-Artisan-Premium-3-In-1-3D-Printer-(Dual-Extrusion%2C-200W-CNC%2C-40W-Laser)';
        const decodedName = decodeURIComponent(identifier);
        const escapedName = decodedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchPattern = escapedName.replace(/[-\s]/g, '[\\-\\s]').replace(/\\?\.|,/g, '[\\.,]');
        
        console.log('Search pattern:', searchPattern);
        
        const regex = new RegExp('^' + searchPattern + '$', 'i');
        console.log('Regex matches DB name?', p ? regex.test(p.name) : 'N/A');
        
        // Let's also do the actual findOne using the regex
        const p2 = await Product.findOne({ name: { $regex: regex } });
        console.log('Found using regex query?', p2 ? p2.name : 'null');
        
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
});
