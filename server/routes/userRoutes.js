import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

// GET /api/users -> Fetch all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        
        // Map to expected format
        const mappedUsers = users.map(u => ({
            id: u.userId || u._id.toString(), // fallback
            name: `${u.firstName} ${u.lastName}`.trim() || u.name,
            email: u.email,
            phone: u.mobile || u.phone,
            totalOrders: u.totalOrders,
            totalSpending: u.totalSpending,
            status: u.status,
            address: 'Not available currently', // Can be enhanced later
            joinedDate: new Date(u.createdAt).toISOString().split('T')[0]
        }));
        res.status(200).json(mappedUsers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err.message });
    }
});

// GET /api/users/:id -> Fetch single user details + recent orders
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ 
            $or: [{ userId: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }]
        });
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch recent orders. Order uses customer email or phone. Link by email
        const orders = await Order.find({ phone: user.mobile }).sort({ createdAt: -1 }).limit(10);
        
        const mappedUser = {
            id: user.userId || user._id.toString(),
            name: `${user.firstName} ${user.lastName}`.trim() || user.name,
            email: user.email,
            phone: user.mobile || user.phone,
            totalOrders: user.totalOrders,
            totalSpending: user.totalSpending,
            status: user.status,
            address: 'Not available currently',
            joinedDate: new Date(user.createdAt).toISOString().split('T')[0],
            recentOrders: orders.map(o => ({
                orderId: o.orderId,
                productName: o.productName,
                totalPrice: o.totalPrice,
                status: o.status,
                createdAt: o.createdAt,
                customerName: o.customerName,
                phone: o.phone,
                address: o.address, // Optional
                quantity: o.quantity || 1,
                paymentMethod: o.paymentMethod || 'COD',
                paymentStatus: o.paymentStatus || 'Pending'
            }))
        };

        res.status(200).json(mappedUser);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user details', error: err.message });
    }
});

// POST /api/users -> Create user test endpoint
router.post('/', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create user', error: err.message });
    }
});

// PUT /api/users/:id -> Block/Unblock
router.put('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const queryId = req.params.id;
        
        // Find user by userId or MongoDB _id
        let user;
        if (mongoose.isValidObjectId(queryId)) {
            user = await User.findOne({ 
                $or: [{ userId: queryId }, { _id: queryId }] 
            });
        } else {
            user = await User.findOne({ userId: queryId });
        }
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.status = status;
        await user.save();
        
        res.status(200).json({ 
            success: true, 
            message: `User status updated to ${status}`,
            status: user.status 
        });
    } catch (err) {
        console.error('Error updating user status:', err);
        res.status(500).json({ message: 'Failed to update user status', error: err.message });
    }
});

export default router;
