import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import { promisify } from 'util';

import nodemailer from 'nodemailer';

const resolveMx = promisify(dns.resolveMx);

const router = express.Router();

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "support@3dpinaka.in",
    pass: process.env.EMAIL_PASS || ""
  }
});

// Temp in-memory storage for OTPs (or use a dedicated collection)
const otpStore = new Map();

// GET /api/auth -> Base status
router.get('/', (req, res) => {
  res.json({ status: "OK", message: "Auth API working 🔐" });
});

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  // Email format check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Email do not exist' });
  }

  // Deep check for domain MX records
  const domain = email.split('@')[1];
  try {
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return res.status(400).json({ message: 'Email do not exist' });
    }
  } catch (e) {
    return res.status(400).json({ message: 'Email do not exist' });
  }

  // Check if already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'Email already registered' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 600000 }); // 10 mins

  console.log(`[AUTH] OTP for ${email}: ${otp}`);

  // Send Email (Attempt)
  if (process.env.EMAIL_PASS) {
    try {
      // Set a short timeout for mail delivery attempt
      await Promise.race([
        transporter.sendMail({
          from: `"3D Pinaka" <${process.env.EMAIL_USER || "support@3dpinaka.in"}>`,
          to: email,
          subject: "Verify your email - 3D Pinaka",
          html: `<h3>Welcome to 3D Pinaka!</h3><p>Your verification code is: <b>${otp}</b></p><p>This code expires in 10 minutes.</p>`
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
      ]);
      res.json({ message: 'Verification code sent to your email' });
    } catch (err) {
      console.warn("MAIL ERROR: ", err.message);
      // If we can't send mail, it's highly likely the email is invalid or service is down
      return res.status(400).json({ message: 'Email do not exist' });
    }
  } else {
    // Development fallback
    res.json({ 
        message: 'Verification code generated! (Testing Mode)', 
        debug: `[Code: ${otp}]` 
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, password, otp } = req.body;

    // Verify OTP
    const stored = otpStore.get(email);
    if (!stored || stored.otp !== otp || stored.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    
    // Clear OTP after use
    otpStore.delete(email);

    const user = new User({ firstName, lastName, mobile, email, password, isVerified: true });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email or Mobile already registered' });
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
