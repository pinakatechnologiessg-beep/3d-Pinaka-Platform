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
        const p = await Product.findOne({ name: "Anycubic Kobra 3 V2 Combo" });
        console.log('Result:', JSON.stringify(p, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
