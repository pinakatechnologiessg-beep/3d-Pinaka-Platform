const fs = require('fs');

const coreFiles = ['index.html', 'products.html', 'materials.html', 'support.html', 'cart.html'];

// 1. Update the navbars in core files
coreFiles.forEach(file => {
    if(!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');
    
    // Change Products link to javascript:void(0) to prevent page navigation on click
    html = html.replace('<a href="products.html" class="dropbtn">', '<a href="javascript:void(0)" class="dropbtn">');
    
    // Change Brand links across the mega-menu and the index.html carousel
    // Replace "products.html?brand=XYZ" with "xyz.html"
    html = html.replace(/products\.html\?brand=([A-Za-z0-9_-]+)/g, (match, brandParam) => {
        return brandParam.toLowerCase() + '.html';
    });

    fs.writeFileSync(file, html);
    console.log(`Updated nav links in ${file}`);
});

// 2. Read modified products.html (which now has updated links) to use as a template
let template = fs.readFileSync('products.html', 'utf8');

const brands = [
    { name: 'Anycubic', file: 'anycubic.html' },
    { name: 'Bambu Lab', file: 'bambu.html' },
    { name: 'Creality', file: 'creality.html' },
    { name: 'Snapmaker', file: 'snapmaker.html' },
    { name: 'Rotrics', file: 'rotrics.html' },
    { name: '3DMAKERPRO', file: '3dmakerpro.html' },
    { name: 'Flsun', file: 'flsun.html' },
    { name: 'Sunlu', file: 'sunlu.html' },
    { name: 'Zortrax', file: 'zortrax.html' },
    { name: 'eSun', file: 'esun.html' },
    { name: 'Zmorph', file: 'zmorph.html' },
    { name: 'Hotrios', file: 'hotrios.html' }, // from index carousel
    { name: 'Modix', file: 'modix.html' }    // from index carousel
];

brands.forEach(brandObj => {
    let pageHtml = template;
    
    // Replace titles and headers
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/, `<title>${brandObj.name} Products | 3D Print Hub</title>`);
    pageHtml = pageHtml.replace(/<h1>.*?<\/h1>/, `<h1>${brandObj.name} Printers</h1>`);
    pageHtml = pageHtml.replace(/<p style="color:#94a3b8; margin-top:1rem;">.*?<\/p>/, `<p style="color:#94a3b8; margin-top:1rem;">Explore the latest collection from ${brandObj.name}</p>`);

    // Replace products grid with a placeholder specifically for that brand
    pageHtml = pageHtml.replace(
        /<div class="products-grid">[\s\S]*?<\/section>/,
        `<div class="products-grid">
            <div style="grid-column: 1 / -1; padding: 4rem; text-align: center; background: var(--light-bg); border-radius: 12px; margin-bottom: 2rem;">
                <h2 style="font-size: 2rem; color: var(--text-dark); margin-bottom: 1rem;">${brandObj.name} Collection</h2>
                <p style="color: var(--text-muted); font-size: 1.1rem;">Products and images for this brand will be added here later.</p>
                <a href="products.html" class="btn btn-primary" style="margin-top: 2rem; display: inline-block;">View All General Products</a>
            </div>
        </div>
    </section>`
    );
    
    fs.writeFileSync(brandObj.file, pageHtml);
    console.log(`Generated brand page: ${brandObj.file}`);
});
