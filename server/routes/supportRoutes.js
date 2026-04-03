import express from 'express';
import SupportTicket from '../models/SupportTicket.js';
import nodemailer from 'nodemailer';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "support@3dpinaka.in",
    pass: process.env.EMAIL_PASS || ""
  }
});

/**
 * @route   GET /api/support
 * @desc    Admin: Get all support tickets
 * @access  Admin
 */
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error("Support GET Error:", error);
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
});

/**
 * @route   GET /api/support/my-tickets
 * @desc    User: Get their own support tickets
 * @access  User (Logged in)
 */
router.get('/my-tickets', verifyToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    console.error("Support GET Personal Error:", error);
    res.status(500).json({ message: 'Error fetching your tickets', error: error.message });
  }
});

/**
 * @route   POST /api/support
 * @desc    Submit a new support ticket (public or user)
 * @access  Mixed (optional token)
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, userId } = req.body;
    
    // Save to Database
    const newTicket = new SupportTicket({ 
        user: userId || null, 
        name, 
        email, 
        subject, 
        message 
    });
    
    await newTicket.save();

    // EMAIL (Non-blocking)
    try {
        await transporter.sendMail({
          from: email,
          to: "connect2rachit882@gmail.com", // Keeping previous target as well
          subject: `Support Ticket [New]: ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\nUser ID: ${userId || 'Guest'}\n\nMessage:\n${message}`
        });
    } catch (emailErr) {
        console.error("Email notification failed (Non-blocking):", emailErr);
    }

    return res.status(200).json({ 
        success: true, 
        message: 'Your support ticket has been created successfully. Our team will get back to you soon.',
        ticket: newTicket
    });

  } catch (error) {
    console.error("Support creation API Error:", error);
    return res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error - Ticket not saved' 
    });
  }
});

/**
 * @route   PUT /api/support/:id/status
 * @desc    Admin: Update ticket status
 * @access  Admin
 */
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
        req.params.id, 
        { status }, 
        { new: true, runValidators: true }
    );
    
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket status', error: error.message });
  }
});

/**
 * @route   POST /api/support/:id/reply
 * @desc    User or Admin: Add reply to ticket
 * @access  Logged-in User or Admin
 */
router.post('/:id/reply', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;
    const senderRole = req.user.role === 'admin' ? 'admin' : 'user';
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Ensure user can only reply to their own ticket (unless admin)
    if (req.user.role !== 'admin' && ticket.user?.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    ticket.replies.push({
      sender: senderRole,
      message,
      date: new Date()
    });

    // Automatically set to pending if admin replies
    if (senderRole === 'admin' && ticket.status === 'New') {
        ticket.status = 'Pending';
    }

    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error adding reply', error: error.message });
  }
});

export default router;
