const mongoose = require('mongoose');
const fs = require('fs');
const uri = "mongodb://admin:Rachit12@ac-kxdsipc-shard-00-00.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-01.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-02.m8mypwk.mongodb.net:27017/3dprinter?ssl=true&replicaSet=atlas-u6vim9-shard-0&authSource=admin&retryWrites=true&w=majority";

const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  condition: String,
});

const Product = mongoose.model('Product', productSchema);

async function check() {
    try {
        await mongoose.connect(uri);
        const products = await Product.find({ condition: "Refurbished" }, "name brand");
        const lines = products.map(p => `NAME: ${p.name} | BRAND: ${p.brand}`).join('\n');
        fs.writeFileSync('server/refurb_names.txt', lines, 'utf8');
        process.exit(0);
    } catch (e) {
        process.exit(1);
    }
}
check();
