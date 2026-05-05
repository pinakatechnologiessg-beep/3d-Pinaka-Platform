import express from 'express';
import HeroSlide from '../models/HeroSlide.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all active slides
router.get('/', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all slides (for admin)
router.get('/all', async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1, createdAt: -1 });
    res.json(slides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a slide
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, brand, brandColor, price, features, btnText, btnLink, order, active } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const slideData = {
      title,
      subtitle: subtitle || '',
      brand: brand || '',
      brandColor: brandColor || '',
      price: price || '',
      features: features ? JSON.parse(features) : [],
      btnText: btnText || 'Explore Now',
      btnLink: btnLink || '/products',
      order: order ? Number(order) : 0,
      active: String(active) !== 'false',
      image: req.file.path
    };

    const newSlide = new HeroSlide(slideData);
    await newSlide.save();
    res.status(201).json(newSlide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a slide
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, brand, brandColor, price, features, btnText, btnLink, order, active } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (brand !== undefined) updateData.brand = brand;
    if (brandColor !== undefined) updateData.brandColor = brandColor;
    if (price !== undefined) updateData.price = price;
    if (features !== undefined) updateData.features = JSON.parse(features);
    if (btnText !== undefined) updateData.btnText = btnText;
    if (btnLink !== undefined) updateData.btnLink = btnLink;
    if (order !== undefined) updateData.order = Number(order);
    if (active !== undefined) updateData.active = String(active) !== 'false';

    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedSlide = await HeroSlide.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedSlide) return res.status(404).json({ message: 'Slide not found' });
    res.json(updatedSlide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a slide
router.delete('/:id', async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json({ message: 'Slide deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
