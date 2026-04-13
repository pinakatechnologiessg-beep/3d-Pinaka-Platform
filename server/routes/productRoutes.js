import express from 'express';
import Product from '../models/Product.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET /api/products/status -> status check
router.get('/status', (req, res) => {
  res.json({ status: "OK", service: "Product Service" });
});

// Get all products metadata
router.get('/meta', async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    const categories = await Product.distinct("category");
    
    // Normalize casing for display (ensuring "3D Printer", "FDM", "CNC" etc. are capitalized properly)
    const normalize = (str) => {
        if (!str) return "";
        const s = str.trim();
        
        // Specific fix for 3D products
        if (s.toLowerCase() === "3d printer") return "3D Printer";
        if (s.toLowerCase() === "3d scanner") return "3D Scanner";
        if (s.toLowerCase() === "3d pen" || s.toLowerCase() === "3d pens") return "3D Pens";
        
        // Common Acronyms that should be ALL CAPS
        const acronyms = ["fdm", "cnc", "ai", "sla", "dlp", "lcd", "diy"];
        
        // General capitalization logic
        return s.split(' ').map(word => {
            const lowerWord = word.toLowerCase();
            // If it's a known acronym, return it in all caps
            if (acronyms.includes(lowerWord)) return word.toUpperCase();
            // If it starts with a number, return it in all caps (e.g. "3d" -> "3D")
            if (/^[0-9]/.test(word)) return word.toUpperCase(); 
            // Default: Sentence case
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    };

    res.json({ 
        brands: [...new Set(brands.filter(Boolean).map(normalize))].sort(), 
        categories: [...new Set(categories.filter(Boolean).map(normalize))].sort() 
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
      filter.condition = new RegExp(`^${condition}$`, 'i');
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
        badge: p.badge || (p.tags === 'Sale' ? 'sale' : p.tags === 'Best Seller' ? 'best-seller' : null),
        featured: p.featured || false
    }));
    
    console.log("Fetching all products...");
    res.json(mappedProducts);
  } catch (err) {
    console.error("GET Products error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Add a single product
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 6 }]), async (req, res) => {
  console.log("POST /api/products request received");
  console.log("Form Body:", req.body);
  console.log("Files Uploaded:", req.files ? "YES" : "NO");
  if (req.files && req.files['image']) console.log("Main Image Path (Cloudinary):", req.files['image'][0].path);
  if (req.files && req.files['images']) console.log("Additional Images Count:", req.files['images'].length);
  
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
      brand: (brand || "Custom").trim(),
      category: (category || "Other").trim(),
      price: Number(price) || 0,
      mrp: Number(mrp) || Number(price) || 0,
      inStock: String(inStock) === 'true',
      rating: Number(rating) || 5.0,
      tags: tags || 'None',
      condition: condition || 'New',
      description: description || '',
      badgeStyle: parsedBadge,
      specifications: parsedSpecs,
      featured: String(req.body.featured) === 'true' || req.body.featured === true
    };

    if (req.files && req.files['image']) {
      productData.image = req.files['image'][0].path;
    } else {
      console.error("VALIDATION ERROR: Image file is mandatory.");
      return res.status(400).json({ message: "Product image is required." });
    }

    if (req.files && req.files['images']) {
      productData.images = req.files['images'].map(file => file.path);
    }
    
    if (productData.image && !productData.image.startsWith("http")) {
      throw new Error("Only Cloudinary URLs allowed");
    }
    
    if (productData.images && productData.images.some(img => !img.startsWith("http"))) {
        throw new Error("Only Cloudinary URLs allowed for additional images");
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
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 6 }]), async (req, res) => {
  try {
    const { name, brand, category, price, mrp, inStock, rating, tags, description, specifications, badgeStyle, condition } = req.body;
    const updateData = {
      name,
      brand: brand ? brand.trim() : undefined,
      category: category ? category.trim() : undefined,
      price: price ? Number(price) : undefined,
      mrp: mrp ? Number(mrp) : undefined,
      inStock: inStock !== undefined ? (inStock === 'true' || inStock === true) : undefined,
      rating: rating ? Number(rating) : undefined,
      tags,
      condition,
      description,
      badgeStyle: badgeStyle ? JSON.parse(badgeStyle) : undefined,
      specifications: specifications ? JSON.parse(specifications) : undefined,
      featured: req.body.featured !== undefined ? (String(req.body.featured) === 'true' || req.body.featured === true) : undefined,
    };

    if (req.files && req.files['image']) {
      // With CloudinaryStorage, req.file.path contains the direct URL
      updateData.image = req.files['image'][0].path;
    }
    
    if (req.files && req.files['images']) {
        updateData.images = req.files['images'].map(file => file.path);
    }
    
    if (updateData.image && !updateData.image.startsWith("http")) {
      throw new Error("Only Cloudinary URLs allowed");
    }

    if (updateData.images && updateData.images.some(img => !img.startsWith("http"))) {
        throw new Error("Only Cloudinary URLs allowed for additional images");
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
    const limit = parseInt(req.query.limit) || 50;
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
        badge: p.badge || (p.tags === 'Sale' ? 'sale' : p.tags === 'Best Seller' ? 'best-seller' : null),
        featured: p.featured || false
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
