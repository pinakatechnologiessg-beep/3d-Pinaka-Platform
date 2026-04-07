import express from 'express';
import Order from '../models/Order.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

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
    const { customerEmail } = req.body;

    // Deep check for domain MX records
    if (customerEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(customerEmail)) {
        return res.status(400).json({ message: 'Email do not exist or invalid format' });
      }

      const domain = customerEmail.split('@')[1];
      try {
        const mxRecords = await resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
          return res.status(400).json({ message: 'Email do not exist (Domain has no mail server)' });
        }
      } catch (e) {
        return res.status(400).json({ message: 'Email do not exist (Invalid domain)' });
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${randomSuffix}`;

    const newOrder = new Order({
      ...req.body,
      orderId
    });

    const savedOrder = await newOrder.save();

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
      await Order.findOneAndUpdate(
        { orderId: orderId },
        {
          paymentStatus: "Paid",
          razorpay_payment_id,
          razorpay_signature,
          status: "Confirmed"
        }
      );
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
    const { status } = req.body;
    
    let order;
    if (req.params.id.startsWith('ORD-')) {
        order = await Order.findOneAndUpdate({ orderId: req.params.id }, { status }, { new: true, runValidators: true });
    } else {
        order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
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
