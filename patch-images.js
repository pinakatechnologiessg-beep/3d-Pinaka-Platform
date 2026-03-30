const fs = require('fs');
const files = ['index.html', 'products.html', 'materials.html', 'support.html', 'cart.html'];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        html = html.replace(
            '<img src="https://images.unsplash.com/photo-1627389955800-410a4db687a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Laser Engraver" style="mix-blend-mode: multiply;">',
            '<img src="images/product_resin_2_1774868383507.png" alt="Laser Engraver">'
        );
        html = html.replace(
            'class="mega-img-card laser-img"',
            'class="mega-img-card laser-img" style="background:#e2e8f0;"'
        );
        fs.writeFileSync(file, html);
        console.log("Patched " + file);
    }
});
