const mongoose = require('mongoose');
const uri = "mongodb://admin:Rachit12@ac-kxdsipc-shard-00-00.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-01.m8mypwk.mongodb.net:27017,ac-kxdsipc-shard-00-02.m8mypwk.mongodb.net:27017/3dprinter?ssl=true&replicaSet=atlas-u6vim9-shard-0&authSource=admin&retryWrites=true&w=majority";

const productSchema = new mongoose.Schema({
  condition: String,
});

const Product = mongoose.model('Product', productSchema);

async function check() {
    try {
        await mongoose.connect(uri);
        const counts = await Product.aggregate([
            { $group: { _id: "$condition", count: { $sum: 1 } } }
        ]);
        console.log('Condition counts:', JSON.stringify(counts, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
