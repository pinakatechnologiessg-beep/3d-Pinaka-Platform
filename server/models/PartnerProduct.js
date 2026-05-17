import mongoose from 'mongoose';

const partnerProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  externalLink: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  price: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PartnerProduct = mongoose.model('PartnerProduct', partnerProductSchema);
export default PartnerProduct;
