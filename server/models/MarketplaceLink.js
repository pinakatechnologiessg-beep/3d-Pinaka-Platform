import mongoose from 'mongoose';

const marketplaceLinkSchema = new mongoose.Schema({
    amazon: { type: String, default: '' },
    flipkart: { type: String, default: '' },
    indiamart: { type: String, default: '' }
}, { timestamps: true });

const MarketplaceLink = mongoose.model('MarketplaceLink', marketplaceLinkSchema);
export default MarketplaceLink;
