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
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/calculate', calculatorRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Error Handler to avoid returning HTML for 500 errors
app.use((err, req, res, next) => {
  console.error("Express Error Detail:", err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || "Internal Server Error - Check Backend Logs",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// MongoDB Connection
if (process.env.MONGODB_URI) {
  // Forced IPv4 network resolution to bypass Windows DNS connection blocking on Atlas
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB: 3D Print Hub Database'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('MongoDB connection skipped: MONGODB_URI is missing in .env');
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
