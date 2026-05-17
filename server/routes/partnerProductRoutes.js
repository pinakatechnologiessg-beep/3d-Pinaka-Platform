import express from 'express';
import PartnerProduct from '../models/PartnerProduct.js';

const router = express.Router();

// Get all partner products
router.get('/', async (req, res) => {
    try {
        const products = await PartnerProduct.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new partner product
router.post('/', async (req, res) => {
    const { name, image, externalLink } = req.body;

    try {
        const newProduct = new PartnerProduct({
            name,
            image,
            externalLink
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete a partner product
router.delete('/:id', async (req, res) => {
    try {
        const product = await PartnerProduct.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        await PartnerProduct.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
});

export default router;
