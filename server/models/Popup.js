import mongoose from 'mongoose';

const popupSchema = new mongoose.Schema({
  title: { type: String, default: "Sale" },
  image: { type: String },
  link: { type: String, default: "" },
  isActive: { type: Boolean, default: false },
  showOnce: { type: Boolean, default: true },
  useTemplate: { type: Boolean, default: false },
  templateType: { type: String, default: 'sale' },
  templateData: { type: Object, default: {} },
  templateImage: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Popup', popupSchema);
