const mongoose = require('mongoose');
const uri = "mongodb://admin:Rachit12@ac-kxdsipc-shard-00-00.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-01.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-02.m8mypwk.mongodb.net:27017/3dprinter?ssl=true&replicaSet=atlas-u6vim9-shard-0&authSource=admin&retryWrites=true&w=majority";

const productSchema = new mongoose.Schema({
  name: String,
  condition: String,
});

const Product = mongoose.model('Product', productSchema);

async function check() {
    try {
        await mongoose.connect(uri);
        const products = await Product.find({}, "name condition");
        const status = products.reduce((acc, p) => {
            acc[p.condition || 'null'] = (acc[p.condition || 'null'] || 0) + 1;
            return acc;
        }, {});
        console.log('Final counts:', status);
        
        // Find which Anycubic products are refurbished
        const anycubicRefurbished = products.filter(p => p.name.includes("Anycubic") && p.condition === "Refurbished").map(p => p.name);
        console.log('Anycubic Refurbished:', anycubicRefurbished);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
