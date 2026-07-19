import express from 'express';
import Blog from '../models/Blog.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get all blogs (public)
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all blogs for admin
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create blog
router.post('/', verifyToken, isAdmin, upload.fields([{ name: 'thumbnailImage', maxCount: 1 }, { name: 'extraImages', maxCount: 10 }]), async (req, res) => {
    try {
        const { title, author, content, isActive } = req.body;
        const newBlog = new Blog({
            title, author, content,
            isActive: isActive === 'true' || isActive === true
        });

        if (req.files && req.files.thumbnailImage) {
            newBlog.thumbnailImage = req.files.thumbnailImage[0].path;
        }
        
        if (req.files && req.files.extraImages) {
            newBlog.extraImages = req.files.extraImages.map(file => file.path);
        }

        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update blog
router.put('/:id', verifyToken, isAdmin, upload.fields([{ name: 'thumbnailImage', maxCount: 1 }, { name: 'extraImages', maxCount: 10 }]), async (req, res) => {
    try {
        const { title, author, content, isActive } = req.body;
        const updateData = { title, author, content };
        if (isActive !== undefined) {
            updateData.isActive = isActive === 'true' || isActive === true;
        }

        if (req.files && req.files.thumbnailImage) {
            updateData.thumbnailImage = req.files.thumbnailImage[0].path;
        }
        
        const blog = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        // Append extra images if new ones are uploaded
        if (req.files && req.files.extraImages) {
            blog.extraImages = [...blog.extraImages, ...req.files.extraImages.map(file => file.path)];
            await blog.save();
        }

        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete blog
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
