import express from 'express';
import multer from 'multer';
import path from 'path';
import Product from '../models/Product.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Get all products
router.get('/', async (req, res) => {
  try {
    const { brand, category, minPrice, maxPrice, q, condition } = req.query;
    let query = {};

    if (brand) {
        const brandArr = String(brand).split(',').map(b => b.toLowerCase().trim()).filter(b => b);
        if (brandArr.length > 0) {
            query.brand = { $in: brandArr.map(b => new RegExp(`^${b}$`, 'i')) };
        }
    }
    if (category) {
        const catArr = String(category).split(',').map(c => c.trim()).filter(c => c);
        if (catArr.length > 0) {
            // Regexes in $in allow case-insensitive match for category if needed
            query.category = { $in: catArr.map(c => new RegExp(c, 'i')) };
        }
    }
    if (condition) {
        // Strict match for condition
        query.condition = condition.trim();
    }
    if (q) {
        query.name = { $regex: q, $options: 'i' };
    }
    
    const { availability } = req.query;
    if (availability === "inStock") {
      query.inStock = true;
    } 
    else if (availability === "outOfStock") {
      query.inStock = false;
    }

    console.log("Availability:", req.query.availability);
    console.log("Mongo Filter:", JSON.stringify(query, null, 2));
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    // Step 3: Backend response fix
    const mappedProducts = products.map(p => ({
        _id: p._id,
        name: p.name || p.title || "Unnamed Product",
        brand: p.brand || "Custom",
        category: p.category || "Category",
        price: typeof p.price === 'number' ? p.price : (parseInt(String(p.price || p.sellingPrice || 0).replace(/[^0-9]/g, '')) || 0),
        mrp: typeof p.mrp === 'number' ? p.mrp : (parseInt(String(p.mrp || p.oldPrice || 0).replace(/[^0-9]/g, '')) || 0),
        rating: p.rating || 5.0,
        inStock: p.inStock,
        condition: p.condition || "New",
        image: p.image,
        tags: p.tags || "None",
        badgeStyle: p.badgeStyle,
        badge: p.badge || (p.tags === 'Sale' ? 'sale' : p.tags === 'Best Seller' ? 'best-seller' : null)
    }));
    
    res.json(mappedProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a single product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, brand, category, price, mrp, inStock, rating, tags, description, specs, badgeStyle, condition } = req.body;
    const productData = {
      name,
      brand: (brand || "Custom").toLowerCase(),
      category: (category || "Category").toLowerCase(),
      price: Number(price),
      mrp: Number(mrp),
      inStock: inStock === 'true' || inStock === true,
      rating: Number(rating),
      tags,
      condition,
      description,
      badgeStyle: badgeStyle ? JSON.parse(badgeStyle) : undefined,
      specs: specs ? JSON.parse(specs) : undefined
    };

    if (req.file) {
      productData.image = `/uploads/${req.file.filename}`;
    }
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Seed data
router.post('/seed', async (req, res) => {
  try {
    // Delete existing products for full re-seed (optional)
    // await Product.deleteMany({});
    const products = await Product.insertMany(req.body);
    res.status(201).json(products);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Update product via PUT
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, brand, category, price, mrp, inStock, rating, tags, description, specs, badgeStyle, condition } = req.body;
    const updateData = {
      name,
      brand,
      category,
      price: Number(price),
      mrp: Number(mrp),
      inStock: inStock === 'true' || inStock === true,
      rating: Number(rating),
      tags,
      condition,
      description,
      badgeStyle: badgeStyle ? JSON.parse(badgeStyle) : undefined,
      specs: specs ? JSON.parse(specs) : undefined
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update stock status via PATCH (Backward Compatible Support)
router.patch('/:id/stock', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    product.inStock = req.body.inStock;
    await product.save();
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a product permanently
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted permanently' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
