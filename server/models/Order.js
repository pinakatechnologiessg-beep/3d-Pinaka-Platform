import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customerName: { type: String },
  customerEmail: { type: String }, // Added for linking with user account
  phone: { type: String },
  address: { type: String },
  productName: { type: String },
  quantity: { type: Number },
  totalPrice: { type: Number },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Printing", "Delivered"],
    default: "Pending"
  },
  paymentMethod: {
    type: String,
    default: "COD"
  },
  paymentStatus: {
    type: String,
    default: "Pending"
  },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
