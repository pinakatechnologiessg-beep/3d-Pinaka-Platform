import express from 'express';
import MarketplaceLink from '../models/MarketplaceLink.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get links
router.get('/', async (req, res) => {
    try {
        let links = await MarketplaceLink.findOne();
        if (!links) {
            links = new MarketplaceLink();
            await links.save();
        }
        res.json(links);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update links
router.put('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { amazon, flipkart, indiamart } = req.body;
        
        let links = await MarketplaceLink.findOne();
        if (!links) {
            links = new MarketplaceLink();
        }
        
        links.amazon = amazon !== undefined ? amazon : links.amazon;
        links.flipkart = flipkart !== undefined ? flipkart : links.flipkart;
        links.indiamart = indiamart !== undefined ? indiamart : links.indiamart;
        
        await links.save();
        res.json(links);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
