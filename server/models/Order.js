import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  customerEmail: { type: String },
  phone: { type: String },
  companyName: { type: String, default: "" },
  gstNumber: { type: String, default: "" },
  streetAddress: { type: String },
  streetAddress2: { type: String, default: "" },
  city: { type: String },
  state: { type: String },
  postcode: { type: String },
  address: { type: String }, // Keep for backward compatibility
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },
  quantity: { type: Number },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String },
    quantity: { type: Number },
    price: { type: Number }
  }],
  totalPrice: { type: Number },
  status: {
    type: String,
    enum: [
      "Pending", 
      "Order Confirmed", 
      "Processing", 
      "Packed / Ready for Dispatch", 
      "Shipped / Dispatched", 
      "In Transit", 
      "Out for Delivery", 
      "Delivered", 
      "Attempted Delivery", 
      "Delayed", 
      "Completed"
    ],
    default: "Pending"
  },
  trackingDetails: {
    type: String,
    default: ""
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
