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
router.post('/', upload.single('img'), async (req, res) => {
  try {
    const { title, subtitle, brand, brandColor, bgColor, textColor, price, features, btnText, btnLink, order, active } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const slideData = {
      title,
      subtitle: subtitle || '',
      brand: brand || '',
      brandColor: brandColor || '',
      bgColor: bgColor || '#0f172a',
      textColor: textColor || '#ffffff',
      price: price || '',
      features: features ? JSON.parse(features) : [],
      btnText: btnText || 'Explore Now',
      btnLink: btnLink || '/products',
      order: order ? Number(order) : 0,
      active: String(active) !== 'false',
      img: req.file.path
    };

    const newSlide = new HeroSlide(slideData);
    await newSlide.save();
    res.status(201).json(newSlide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a slide
router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { title, subtitle, brand, brandColor, bgColor, textColor, price, features, btnText, btnLink, order, active } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (brand !== undefined) updateData.brand = brand;
    if (brandColor !== undefined) updateData.brandColor = brandColor;
    if (bgColor !== undefined) updateData.bgColor = bgColor;
    if (textColor !== undefined) updateData.textColor = textColor;
    if (price !== undefined) updateData.price = price;
    if (features !== undefined) updateData.features = JSON.parse(features);
    if (btnText !== undefined) updateData.btnText = btnText;
    if (btnLink !== undefined) updateData.btnLink = btnLink;
    if (order !== undefined) updateData.order = Number(order);
    if (active !== undefined) updateData.active = String(active) !== 'false';

    if (req.file) {
      updateData.img = req.file.path;
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

// Seed slides (Reset to defaults)
router.get('/seed', async (req, res) => {
  try {
    const defaultSlides = [
      {
        title: "X1 CARBON",
        subtitle: "Global Flagship Performance",
        brand: "Bambu Lab",
        brandColor: "#2D3436",
        price: "₹1,49,999/-",
        features: ["LIDAR ERROR DETECTION", "600MM/S MAX SPEED", "DUAL AUTO BED LEVELING", "AMS MULTI-MATERIAL CAPABLE"],
        btnText: "Explore Now",
        btnLink: "/products",
        order: 0,
        active: true,
        img: "/images/hero-printer-1-1774867967898.png"
      },
      {
        title: "PHOTON M3",
        subtitle: "Ultra-Precision MSLA",
        brand: "Anycubic",
        brandColor: "#f97316",
        price: "₹45,999/-",
        features: ["8K RESOLUTION SCREEN", "SMART RESIN FILL", "LIGHMAKER UV MATRIX", "WIFI & APP CONNECTIVITY"],
        btnText: "Explore Now",
        btnLink: "/products",
        order: 1,
        active: true,
        img: "/images/hero-printer-2-1774868029567.png"
      },
      {
        title: "K1C 3D PRINTER",
        subtitle: "Professional CoreXY Speed",
        brand: "Creality",
        brandColor: "#3b82f6",
        price: "₹52,999/-",
        features: ["CARBON-READY NOZZLE", "AI-CAMERA BUILT-IN", "AMS COMPATIBLE", "QUICK-SWAP NOZZLE"],
        btnText: "Explore Now",
        btnLink: "/products",
        order: 2,
        active: true,
        img: "/images/hero-printer-3-1774868059995.png"
      },
      {
        title: "A350T 3-IN-1",
        subtitle: "Industrial 3-in-1 Powerhouse",
        brand: "Snapmaker",
        brandColor: "#10b981",
        price: "₹1,99,000/-",
        features: ["CNC & LASER INCLUDED", "ALL-METAL DESIGN", "LINEAR RAILS & MODULES", "POWER-LOSS RECOVERY"],
        btnText: "Explore Now",
        btnLink: "/products",
        order: 3,
        active: true,
        img: "/images/hero-printer-4-1774868325785.png"
      }
    ];

    // Optional: clear existing ones first? The user said "do not disturb anything else"
    // but they also said "store these in database... soo that issue resolve".
    // I'll just add them if they don't exist, or just insert them.
    // Let's check for titles to avoid duplicates.
    for (const slide of defaultSlides) {
      const exists = await HeroSlide.findOne({ title: slide.title });
      if (!exists) {
        await new HeroSlide(slide).save();
      }
    }

    res.json({ message: "Default slides seeded successfully (if missing)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
