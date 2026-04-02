const mongoose = require('mongoose');
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
        const products = await Product.find({ condition: "Refurbished" }, "name brand condition");
        console.log('All Refurbished Products:', JSON.stringify(products, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
