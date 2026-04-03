import mongoose from 'mongoose';

const supportQuerySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "new",
    enum: ["new", "pending", "resolved"]
  }
}, { timestamps: true });

export default mongoose.model('SupportQuery', supportQuerySchema);
