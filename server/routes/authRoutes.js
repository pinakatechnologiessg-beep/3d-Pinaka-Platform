import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

const router = express.Router();

// GET /api/auth -> Base status
router.get('/', (req, res) => {
  res.json({ status: "OK", message: "Auth API working 🔐" });
});

router.get('/status', (req, res) => {
  res.json({ status: "OK", service: "Authentication Service" });
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, password } = req.body;

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email do not exist or invalid format' });
    }

    // Deep check for domain MX records
    const domain = email.split('@')[1];
    try {
      const mxRecords = await resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ message: 'Email do not exist (Domain has no mail server)' });
      }
    } catch (e) {
      return res.status(400).json({ message: 'Email do not exist (Invalid or non-existent domain)' });
    }

    // Mobile validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number. Must be 10 digits.' });
    }

    const user = new User({ firstName, lastName, mobile, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email address already registered' });
    }
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = await Admin.findOne({ email });
    let isRoleAdmin = false;
    
    if (user) {
      if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      isRoleAdmin = true;
    } else {
      user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (user.status === 'Blocked') {
        return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
      }
    }
    
    const role = isRoleAdmin ? 'admin' : user.role;
    const token = jwt.sign({ id: user._id, role: role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        firstName: isRoleAdmin ? 'Admin' : user.firstName, 
        lastName: isRoleAdmin ? '' : user.lastName, 
        email: user.email, 
        mobile: isRoleAdmin ? '0000000000' : user.mobile, 
        role: role 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
