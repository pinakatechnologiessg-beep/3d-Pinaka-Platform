import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true },
  brand: { type: String },
  brandColor: { type: String },
  price: { type: String },
  features: [{ type: String }],
  btnText: { type: String },
  btnLink: { type: String },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
export default HeroSlide;
