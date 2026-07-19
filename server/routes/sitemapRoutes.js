import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        
        const baseUrl = 'https://3dpinaka.in';
        
        // Static URLs
        const staticPaths = [
            '/',
            '/products',
            '/materials',
            '/printing-services',
            '/about',
            '/support',
            '/testimonials',
            '/wishlist',
            '/login'
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        // Add static URLs
        staticPaths.forEach(path => {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${path}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n`;
            xml += `  </url>\n`;
        });

        // Add dynamic product URLs
        products.forEach(product => {
            if (product.name) {
                const slug = encodeURIComponent(product.name.replace(/ /g, '-'));
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/product/${slug}</loc>\n`;
                xml += `    <changefreq>daily</changefreq>\n`;
                xml += `    <priority>0.9</priority>\n`;
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
