import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: Number, default: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  images: [{ type: String }],
  rating: { type: Number, default: 5.0 },
  tags: { type: String },
  badgeStyle: { type: Object },
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  brand: { type: String, required: true, trim: true },
  condition: { type: String, enum: ['New', 'Refurbished'], default: 'New' },
  description: { type: String },
  specifications: [
    {
      key: { type: String },
      value: { type: String }
    }
  ],
  reviews: [
    {
      userName: { type: String },
      rating: { type: Number },
      comment: { type: String },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
