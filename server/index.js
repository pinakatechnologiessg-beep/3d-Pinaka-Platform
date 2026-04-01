import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import calculatorRoutes from './routes/calculatorRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/calculate', calculatorRoutes);

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle client routing, return all requests to React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
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
