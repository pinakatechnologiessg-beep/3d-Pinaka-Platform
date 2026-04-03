import express from 'express';
import Product from '../models/Product.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET /api/products/status -> status check
router.get('/status', (req, res) => {
  res.json({ status: "OK", service: "Product Service" });
});

// Get all products
router.get('/meta', async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    const categories = await Product.distinct("category");
    res.json({ 
        brands: brands.filter(Boolean).map(b => b.charAt(0).toUpperCase() + b.slice(1)), 
        categories: categories.filter(Boolean).map(c => c.charAt(0).toUpperCase() + c.slice(1)) 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { brand, category, availability, condition, q, minPrice, maxPrice, sort } = req.query;
    let filter = {};

    if (brand) {
      filter.brand = { $in: brand.split(",").map(b => new RegExp(b.trim(), 'i')) };
    }

    if (category) {
      filter.category = { $in: category.split(",").map(c => new RegExp(c.trim(), 'i')) };
    }

    if (condition) {
      filter.condition = condition;
    }

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }

    if (availability === "in") {
      filter.inStock = true;
    } else if (availability === "out") {
      filter.inStock = false;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (req.query.featured === 'true') {
        filter.featured = true;
    }

    console.log("FILTER:", filter);
    
    let dbQuery = Product.find(filter);

    if (sort === "low") dbQuery = dbQuery.sort({ price: 1 });
    else if (sort === "high") dbQuery = dbQuery.sort({ price: -1 });
    else if (sort === "az") dbQuery = dbQuery.sort({ name: 1 });
    else if (sort === "za") dbQuery = dbQuery.sort({ name: -1 });
    else dbQuery = dbQuery.sort({ createdAt: -1 });

    const products = await dbQuery;
    
    // Step 3: Backend response fix
    const mappedProducts = products.map(p => ({
        _id: p._id,
        name: p.name || p.title || "Unnamed Product",
        brand: p.brand || "Custom",
        category: p.category || "Category",
        price: typeof p.price === 'number' ? p.price : (parseInt(String(p.price || p.sellingPrice || 0).replace(/[^0-9]/g, '')) || 0),
        mrp: typeof p.mrp === 'number' ? p.mrp : (parseInt(String(p.mrp || p.oldPrice || 0).replace(/[^0-9]/g, '')) || 0),
        originalPrice: typeof p.mrp === 'number' ? p.mrp : (parseInt(String(p.mrp || p.oldPrice || 0).replace(/[^0-9]/g, '')) || 0),
        rating: p.rating || 5.0,
        inStock: p.inStock,
        condition: p.condition || "New",
        image: p.image,
        tags: p.tags || "None",
        badgeStyle: p.badgeStyle,
        badge: p.badge || (p.tags === 'Sale' ? 'sale' : p.tags === 'Best Seller' ? 'best-seller' : null)
    }));
    
    console.log("Fetching all products...");
    res.json(mappedProducts);
  } catch (err) {
    console.error("GET Products error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add a single product
router.post('/', upload.single('image'), async (req, res) => {
  console.log("POST /api/products request received");
  console.log("Form Body:", req.body);
  console.log("File Uploaded:", req.file ? "YES" : "NO");
  if (req.file) console.log("File Path (Cloudinary):", req.file.path);
  
  try {
    const { name, brand, category, price, mrp, inStock, rating, tags, description, specifications, badgeStyle, condition } = req.body;
    
    // Detailed parsing logs to identify JSON.parse failures
    let parsedBadge = undefined;
    let parsedSpecs = undefined;
    
    try {
        if (badgeStyle) parsedBadge = JSON.parse(badgeStyle);
    } catch(e) {
        console.error("Failed to parse badgeStyle:", badgeStyle);
    }

    try {
        if (specifications) parsedSpecs = JSON.parse(specifications);
    } catch(e) {
        console.error("Failed to parse specifications:", specifications);
    }

    const productData = {
      name: name || "New Product",
      brand: (brand || "Custom").toLowerCase(),
      category: (category || "Other").toLowerCase(),
      price: Number(price) || 0,
      mrp: Number(mrp) || Number(price) || 0,
      inStock: String(inStock) === 'true',
      rating: Number(rating) || 5.0,
      tags: tags || 'None',
      condition: condition || 'New',
      description: description || '',
      badgeStyle: parsedBadge,
      specifications: parsedSpecs
    };

    if (req.file) {
      productData.image = req.file.path;
    } else {
      console.error("VALIDATION ERROR: Image file is mandatory.");
      return res.status(400).json({ message: "Product image is required." });
    }
    
    console.log("Saving product to MongoDB...");
    const product = new Product(productData);
    await product.save();
    
    console.log("SUCCESS: Product created:", product._id);
    return res.status(201).json(product);

  } catch (err) {
    console.error("PRODUCT CREATION ERROR:", err);
    
    // Check if it's a validation error from Mongoose
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation Error", 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }

    res.status(500).json({ message: "Failed to create product: " + err.message });
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
    const { name, brand, category, price, mrp, inStock, rating, tags, description, specifications, badgeStyle, condition } = req.body;
    const updateData = {
      name,
      brand: brand ? brand.toLowerCase() : undefined,
      category: category ? category.toLowerCase() : undefined,
      price: price ? Number(price) : undefined,
      mrp: mrp ? Number(mrp) : undefined,
      inStock: inStock !== undefined ? (inStock === 'true' || inStock === true) : undefined,
      rating: rating ? Number(rating) : undefined,
      tags,
      condition,
      description,
      badgeStyle: badgeStyle ? JSON.parse(badgeStyle) : undefined,
      specifications: specifications ? JSON.parse(specifications) : undefined
    };

    if (req.file) {
      // With CloudinaryStorage, req.file.path contains the direct URL
      updateData.image = req.file.path;
    }
    
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ featured: true }).limit(limit);
    
    const mappedProducts = products.map(p => ({
        _id: p._id,
        name: p.name || p.title || "Unnamed Product",
        brand: p.brand || "Custom",
        category: p.category || "Category",
        price: typeof p.price === 'number' ? p.price : (parseInt(String(p.price || p.sellingPrice || 0).replace(/[^0-9]/g, '')) || 0),
        mrp: typeof p.mrp === 'number' ? p.mrp : (parseInt(String(p.mrp || p.oldPrice || 0).replace(/[^0-9]/g, '')) || 0),
        originalPrice: typeof p.mrp === 'number' ? p.mrp : (parseInt(String(p.mrp || p.oldPrice || 0).replace(/[^0-9]/g, '')) || 0),
        rating: p.rating || 5.0,
        inStock: p.inStock,
        condition: p.condition || "New",
        image: p.image,
        tags: p.tags || "None",
        badgeStyle: p.badgeStyle,
        badge: p.badge || (p.tags === 'Sale' ? 'sale' : p.tags === 'Best Seller' ? 'best-seller' : null)
    }));
    
    console.log("Fetching featured products...");
    res.json(mappedProducts);
  } catch (err) {
    console.error("GET Featured error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add Review
router.post('/:id/review', async (req, res) => {
  try {
    const { userName, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const newReview = {
      userName,
      rating: Number(rating),
      comment,
      createdAt: new Date()
    };

    product.reviews.push(newReview);
    
    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, rev) => sum + rev.rating, 0);
    product.rating = totalRating / product.reviews.length;

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
