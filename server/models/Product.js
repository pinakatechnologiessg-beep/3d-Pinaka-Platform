import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  category: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 5.0 },
  tags: { type: String },
  badgeStyle: { type: Object },
  inStock: { type: Boolean, default: true },
  brand: { type: String, required: true },
  condition: { type: String, enum: ['New', 'Refurbished'], default: 'New' },
  specs: [{ label: String, value: String }],
  description: { type: String }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
