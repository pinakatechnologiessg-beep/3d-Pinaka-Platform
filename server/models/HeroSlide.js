import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  img: { type: String, required: true },
  brand: { type: String },
  brandColor: { type: String },
  bgColor: { type: String },
  textColor: { type: String }, // New background color field
  price: { type: String },
  features: [{ type: String }],
  btnText: { type: String },
  btnLink: { type: String },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
export default HeroSlide;
