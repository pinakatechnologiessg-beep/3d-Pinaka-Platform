import express from 'express';
import Product from '../models/Product.js';
import Blog from '../models/Blog.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}).select('name updatedAt');
        const blogs = await Blog.find({ isActive: true }).select('_id title updatedAt');
        
        // Use domain from environment or default
        const baseUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://3dpinaka.in';
        
        // Static URLs (Standard & Policies)
        const staticPaths = [
            { path: '/', priority: '1.0', changefreq: 'daily' },
            { path: '/shop', priority: '0.9', changefreq: 'daily' },
            { path: '/products', priority: '0.9', changefreq: 'daily' },
            { path: '/blogs', priority: '0.8', changefreq: 'weekly' },
            { path: '/about', priority: '0.8', changefreq: 'monthly' },
            { path: '/contact', priority: '0.8', changefreq: 'monthly' },
            { path: '/materials', priority: '0.8', changefreq: 'weekly' },
            { path: '/printing-services', priority: '0.8', changefreq: 'weekly' },
            { path: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
            { path: '/terms-conditions', priority: '0.5', changefreq: 'yearly' },
            { path: '/shipping-policy', priority: '0.5', changefreq: 'yearly' },
            { path: '/return-policy', priority: '0.5', changefreq: 'yearly' },
            { path: '/payment-policy', priority: '0.5', changefreq: 'yearly' },
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        const today = new Date().toISOString().split('T')[0];

        // Add static URLs
        staticPaths.forEach(({ path, priority, changefreq }) => {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${path}</loc>\n`;
            xml += `    <lastmod>${today}</lastmod>\n`;
            xml += `    <changefreq>${changefreq}</changefreq>\n`;
            xml += `    <priority>${priority}</priority>\n`;
            xml += `  </url>\n`;
        });

        // Add dynamic product URLs
        products.forEach(product => {
            if (product.name) {
                const slug = encodeURIComponent(product.name.replace(/ /g, '-'));
                const lastMod = product.updatedAt ? product.updatedAt.toISOString().split('T')[0] : today;
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/product/${slug}</loc>\n`;
                xml += `    <lastmod>${lastMod}</lastmod>\n`;
                xml += `    <changefreq>daily</changefreq>\n`;
                xml += `    <priority>0.9</priority>\n`;
                xml += `  </url>\n`;
            }
        });

        // Add dynamic blog URLs
        blogs.forEach(blog => {
            if (blog.title || blog._id) {
                // Adjust this slug logic if your frontend uses blog ID or title slug (defaulting to ID)
                const slug = blog._id.toString(); 
                const lastMod = blog.updatedAt ? blog.updatedAt.toISOString().split('T')[0] : today;
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/blog/${slug}</loc>\n`;
                xml += `    <lastmod>${lastMod}</lastmod>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.7</priority>\n`;
                xml += `  </url>\n`;
            }
        });

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error("Sitemap generation error:", err);
        res.status(500).send("Error generating sitemap");
    }
});

export default router;
