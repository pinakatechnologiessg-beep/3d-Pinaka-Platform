import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import calculatorRoutes from './routes/calculatorRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import popupRoutes from './routes/popupRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import heroRoutes from './routes/heroRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import Order from './models/Order.js';
import { sendOrderEmailNotification } from './routes/orderRoutes.js';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Files
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Route
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// API Base Route
app.get("/api", (req, res) => {
  res.send("API working 🚀");
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Routes Logging
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        console.log(`API Request: ${req.method} ${req.path}`);
    }
    next();
});

// Razorpay Webhook Handler
app.post('/api/webhook', express.json(), async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    try {
        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (expectedSignature === signature) {
            const { event, payload } = req.body;
            console.log(`Razorpay Webhook Verified: ${event}`);

            if (event === 'payment.captured' || event === 'order.paid') {
                const paymentEntity = payload.payment ? payload.payment.entity : payload.order.entity;
                const razorpayOrderId = paymentEntity.order_id;
                const razorpayPaymentId = paymentEntity.id;

                // Find order by razorpay_order_id
                const order = await Order.findOne({ razorpay_order_id: razorpayOrderId });
                
                if (order && order.paymentStatus !== 'Paid') {
                    order.paymentStatus = 'Paid';
                    order.status = 'Order Confirmed';
                    order.razorpay_payment_id = razorpayPaymentId;
                    await order.save();
                    console.log(`Order ${order.orderId} marked as Order Confirmed via Webhook`);
                    
                    // Trigger email notification to admin and customer
                    await sendOrderEmailNotification(order);
                }
            }
            return res.status(200).json({ status: 'ok' });
        } else {
            console.error('Invalid Razorpay Webhook Signature');
            return res.status(400).send('Invalid signature');
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).send('Webhook Processing Failed');
    }
});

/**
 * Cleanup Task: Delete "Pending" orders older than 36 hours
 * Runs every hour
 */
setInterval(async () => {
    try {
        const thirtySixHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000);
        // Using dynamic import or referencing from the routes if needed, 
        // but here we can just use the Order model directly if we import it
        const result = await Order.deleteMany({
            status: "Pending",
            createdAt: { $lt: thirtySixHoursAgo }
        });
        if (result.deletedCount > 0) {
            console.log(`Cleanup: Deleted ${result.deletedCount} pending orders older than 36 hours.`);
        }
    } catch (err) {
        console.error("Cleanup Error:", err);
    }
}, 3600000); // 1 hour interval

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/calculate', calculatorRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/popup', popupRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/hero', heroRoutes);


// Global Error Handler to avoid returning HTML for 500 errors
app.use((err, req, res, next) => {
  console.error("Express Error Detail:", err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || "Internal Server Error - Check Backend Logs",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// MongoDB Connection with Retry Logic
const connectDB = async (retryCount = 0) => {
    const maxRetries = 5;
    const retryInterval = 5000; // 5 seconds

    if (!process.env.MONGODB_URI) {
        console.log('MongoDB connection skipped: MONGODB_URI is missing in .env');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });
        console.log('✅ Connected to MongoDB: 3D Print Hub Database');
    } catch (err) {
        console.error(`❌ MongoDB connection error (Attempt ${retryCount + 1}/${maxRetries}):`, err.message);
        
        if (retryCount < maxRetries) {
            console.log(`Retrying in ${retryInterval/1000}s...`);
            setTimeout(() => connectDB(retryCount + 1), retryInterval);
        } else {
            console.error('CRITICAL: Failed to connect to MongoDB after maximum retries.');
        }
    }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Connection Error:', err);
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
