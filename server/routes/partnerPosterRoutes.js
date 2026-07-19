import express from 'express';
import PartnerPoster from '../models/PartnerPoster.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all posters
router.get('/', async (req, res) => {
    try {
        const posters = await PartnerPoster.find();
        res.json(posters);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update or Create a poster
router.put('/:position', verifyToken, isAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { position } = req.params;
        if (!['left', 'right'].includes(position)) {
            return res.status(400).json({ message: 'Invalid position' });
        }

        let { imageUrl, link, isActive } = req.body;
        
        if (req.file) {
            imageUrl = req.file.path;
        }

        const updatedPoster = await PartnerPoster.findOneAndUpdate(
            { position },
            { imageUrl, link, isActive, position },
            { new: true, upsert: true } // upsert creates it if it doesn't exist
        );

        res.json(updatedPoster);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a poster
router.delete('/:position', verifyToken, isAdmin, async (req, res) => {
    try {
        const { position } = req.params;
        await PartnerPoster.findOneAndDelete({ position });
        res.json({ message: 'Poster deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
