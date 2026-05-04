import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Function to send email notification to admin and customer
 */
export const sendOrderEmailNotification = async (order) => {
  try {
    const isPaid = order.paymentStatus === 'Paid';
    const statusText = isPaid ? 'Order Confirmed' : 'PLACED';
    
    await transporter.sendMail({
      from: `"3D Pinaka Notifications" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Order ${statusText}: ${order.orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #2c3e50; text-align: center;">New Order Received</h2>
          <hr />
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          <hr />
          <h3>Customer Details</h3>
          <p><strong>Name:</strong> ${order.customerName}</p>
          <p><strong>Email:</strong> ${order.customerEmail}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          ${order.companyName ? `<p><strong>Company Name:</strong> ${order.companyName}</p>` : ''}
          ${order.gstNumber ? `<p><strong>GST Number:</strong> ${order.gstNumber}</p>` : ''}
          <p><strong>Address:</strong> ${order.address}</p>
          <hr />
          <h3>Order Items</h3>
          <p><strong>Product:</strong> ${order.productName}</p>
          <p><strong>Quantity:</strong> ${order.quantity}</p>
          <p><strong>Total Price:</strong> ₹${order.totalPrice}</p>
          <hr />
          <p style="font-size: 0.9em; color: #7f8c8d; text-align: center;">
            This is an automated notification from your 3D Pinaka store.
          </p>
        </div>
      `
    });

    // Send confirmation email to customer
    await transporter.sendMail({
      from: `"3D Pinaka" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #16a34a; text-align: center;">Thank You for Your Order!</h2>
          <p>Hi ${order.customerName},</p>
          <p>Your order has been successfully ${statusText.toLowerCase()}. We'll start processing it right away!</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p><strong>Order ID:</strong> ${order.orderId}</p>
          <p><strong>Product:</strong> ${order.productName}</p>
          <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p>We will notify you once your order is shipped.</p>
          <p>Best regards,<br /><strong>3D Pinaka Team</strong></p>
        </div>
      `
    });

    console.log(`Notification emails sent to Admin and Customer for Order: ${order.orderId}`);
  } catch (error) {
    console.error("Order Email notification failed:", error);
  }
};

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/user/:email
router.get('/user/:email', async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${randomSuffix}`;

    // Verify Stock and Prepare Decrements
    const items = req.body.items || [{ productId: req.body.productId, quantity: req.body.quantity, productName: req.body.productName, price: req.body.totalPrice }];
    const productUpdates = [];

    for (const item of items) {
        if (!item.productId) continue;
        const product = await Product.findById(item.productId);
        if (!product) {
            return res.status(404).json({ message: `Product ${item.productName || item.productId} not found to verify stock.` });
        }
        if (product.stockQuantity < (item.quantity || 1)) {
            return res.status(400).json({ message: `Requested quantity for ${product.name} not available in stock.` });
        }
        productUpdates.push({ product, quantity: item.quantity || 1 });
    }

    // Execute Decrements
    for (const update of productUpdates) {
        update.product.stockQuantity -= update.quantity;
        if (update.product.stockQuantity <= 0) {
            update.product.inStock = false;
        }
        await update.product.save();
    }

    const newOrder = new Order({
      ...req.body,
      orderId,
      productId: items[0]?.productId, // Keep single fields for backward compatibility/Admin Dashboard
      productName: req.body.productName || items[0]?.productName,
      quantity: req.body.quantity || items.reduce((acc, i) => acc + (i.quantity || 1), 0),
      items // If items array was passed, save it properly
    });

    const savedOrder = await newOrder.save();

    // If it's COD, send notification immediately
    if (req.body.paymentMethod === 'COD') {
        sendOrderEmailNotification(savedOrder);
    }

    // If it's a Razorpay payment, create a Razorpay order
    if (req.body.paymentMethod === 'Razorpay') {
      const options = {
        amount: Math.round(req.body.totalPrice * 100), // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: orderId,
      };

      try {
        const rzpOrder = await razorpay.orders.create(options);
        savedOrder.razorpay_order_id = rzpOrder.id;
        await savedOrder.save();
        
        return res.status(201).json({
          ...savedOrder.toObject(),
          razorpayOrderId: rzpOrder.id,
          razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });
      } catch (rzpErr) {
        console.error("Razorpay Order Creation Error:", rzpErr);
        return res.status(500).json({ message: "Failed to create payment order" });
      }
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/orders/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId: orderId },
        {
          paymentStatus: "Paid",
          razorpay_payment_id,
          razorpay_signature,
          status: "Order Confirmed"
        },
        { new: true }
      );
      
      // Email Notification after verification
      if (updatedOrder) {
          sendOrderEmailNotification(updatedOrder);
      }

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id
router.put('/:id', async (req, res) => {
  try {
    const { status, trackingDetails } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (trackingDetails !== undefined) updateData.trackingDetails = trackingDetails;
    
    let order;
    if (req.params.id.startsWith('ORD-')) {
        order = await Order.findOneAndUpdate({ orderId: req.params.id }, updateData, { new: true, runValidators: true });
    } else {
        order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    }

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  try {
    let order;
    if (req.params.id.startsWith('ORD-')) {
        order = await Order.findOneAndDelete({ orderId: req.params.id });
    } else {
        order = await Order.findByIdAndDelete(req.params.id);
    }
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

