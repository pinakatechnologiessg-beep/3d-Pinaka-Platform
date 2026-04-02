const mongoose = require('mongoose');
const uri = "mongodb://admin:Rachit12@ac-kxdsipc-shard-00-00.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-01.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-02.m8mypwk.mongodb.net:27017/3dprinter?ssl=true&replicaSet=atlas-u6vim9-shard-0&authSource=admin&retryWrites=true&w=majority";

const productSchema = new mongoose.Schema({
  condition: { type: String, default: 'New' },
});

const Product = mongoose.model('Product', productSchema);

async function migrate() {
    try {
        await mongoose.connect(uri);
        console.log('Connected');
        const result = await Product.updateMany(
            { condition: { $exists: false } },
            { $set: { condition: "New" } }
        );
        console.log(`Updated ${result.modifiedCount} products with default condition: "New"`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
migrate();
