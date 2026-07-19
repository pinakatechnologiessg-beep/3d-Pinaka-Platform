import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, default: 'Admin' },
    content: { type: String, required: true },
    thumbnailImage: { type: String, default: '' },
    extraImages: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
