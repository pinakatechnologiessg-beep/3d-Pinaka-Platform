import express from 'express';
const router = express.Router();
import Coupon from '../models/Coupon.js';

// Get all active coupons (For users)
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find({ 
            isActive: true, 
            expiryDate: { $gte: new Date() } 
        });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all coupons (For admin)
router.get('/admin', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a coupon (Admin)
router.post('/', async (req, res) => {
    const coupon = new Coupon(req.body);
    try {
        const newCoupon = await coupon.save();
        res.status(201).json(newCoupon);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a coupon (Admin)
router.delete('/:id', async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Validate a coupon (For users at checkout)
router.post('/validate', async (req, res) => {
    const { code, cartTotal } = req.body;
    try {
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(), 
            isActive: true,
            expiryDate: { $gte: new Date() }
        });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        if (cartTotal < coupon.minOrderValue) {
            return res.status(400).json({ 
                message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` 
            });
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
        } else {
            discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed total
        discountAmount = Math.min(discountAmount, cartTotal);

        res.json({ 
            success: true, 
            discountAmount, 
            couponCode: coupon.code,
            description: coupon.description 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
