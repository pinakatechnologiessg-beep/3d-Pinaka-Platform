import express from 'express';
import PartnerProduct from '../models/PartnerProduct.js';
import upload from '../middleware/upload.js';

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
router.post('/', upload.single('imageFile'), async (req, res) => {
    try {
        const { name, externalLink, category, price } = req.body;
        let image = req.body.image; // fallback to string URL

        if (req.file) {
            image = req.file.path; // Use uploaded file path (e.g. Cloudinary URL)
        }

        if (!image) {
            return res.status(400).json({ msg: 'Please provide an image URL or upload an image file.' });
        }

        const newProduct = new PartnerProduct({
            name,
            image,
            externalLink,
            category: category || 'Uncategorized',
            price: price ? Number(price) : 0
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a partner product
router.put('/:id', upload.single('imageFile'), async (req, res) => {
    try {
        const { name, externalLink, category, price } = req.body;
        let product = await PartnerProduct.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        let image = req.body.image; // fallback to string URL
        if (req.file) {
            image = req.file.path; // Use uploaded file path (e.g. Cloudinary URL)
        }

        product.name = name || product.name;
        product.externalLink = externalLink || product.externalLink;
        product.category = category !== undefined ? category : product.category;
        product.price = price !== undefined ? Number(price) : product.price;
        if (image) {
            product.image = image;
        }

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
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
