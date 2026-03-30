const fs = require('fs');

// General updates
const files = ['index.html', 'products.html', 'materials.html', 'support.html'];
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        '<i class="ph ph-shopping-cart"></i>',
        '<a href="cart.html" class="cart-icon-wrap" style="color:var(--text-dark); text-decoration:none;"><i class="ph ph-shopping-cart"></i><span class="cart-badge">0</span></a>'
    );
    if (!content.includes('whatsapp-float')) {
        content = content.replace('</body>', '    <a href="https://wa.me/1234567890" class="whatsapp-float" target="_blank"><i class="ph ph-whatsapp-logo"></i></a>\n</body>');
    }
    fs.writeFileSync(file, content);
});

// Back to Home button updates
const innerFiles = [
    { name: 'products.html', search: '<h1>All 3D Printers</h1>' },
    { name: 'materials.html', search: '<h1>Filaments & Resins</h1>' },
    { name: 'support.html', search: '<h1>How can we help you?</h1>' }
];

innerFiles.forEach(target => {
    let content = fs.readFileSync(target.name, 'utf8');
    if (!content.includes('back-home-btn')) {
        content = content.replace(
            target.search,
            '<a href="index.html" class="back-home-btn"><i class="ph ph-arrow-left"></i> Back to Home</a>\n        ' + target.search
        );
        fs.writeFileSync(target.name, content);
    }
});

// Brand links in index.html
let indexContent = fs.readFileSync('index.html', 'utf8');
const brands = [
    { search: '<div class="brand-logo"><span style="color:#2563eb; font-weight:800; font-size:1.2rem;">ANYCUBIC</span></div>',
      replace: '<a href="products.html?brand=Anycubic" class="brand-logo"><span style="color:#2563eb; font-weight:800; font-size:1.2rem;">ANYCUBIC</span></a>' },
    { search: '<div class="brand-logo"><span style="color:#10b981; font-weight:800; font-size:1.2rem;">Bambu Lab</span></div>',
      replace: '<a href="products.html?brand=Bambu" class="brand-logo"><span style="color:#10b981; font-weight:800; font-size:1.2rem;">Bambu Lab</span></a>' },
    { search: '<div class="brand-logo"><span style="font-style:italic; font-weight:800; font-size:1.2rem; color:#333;">snapmaker</span></div>',
      replace: '<a href="products.html?brand=Snapmaker" class="brand-logo"><span style="font-style:italic; font-weight:800; font-size:1.2rem; color:#333;">snapmaker</span></a>' },
    { search: '<div class="brand-logo"><span style="color:#000; font-weight:800; font-size:1.2rem;">CREALITY</span></div>',
      replace: '<a href="products.html?brand=Creality" class="brand-logo"><span style="color:#000; font-weight:800; font-size:1.2rem;">CREALITY</span></a>' },
    { search: '<div class="brand-logo"><span style="color:#ef4444; font-weight:800; font-size:1.2rem;">HOTRIOS</span></div>',
      replace: '<a href="products.html?brand=Hotrios" class="brand-logo"><span style="color:#ef4444; font-weight:800; font-size:1.2rem;">HOTRIOS</span></a>' },
    { search: '<div class="brand-logo"><span style="font-weight:800; font-size:1.2rem;">Modix</span></div>',
      replace: '<a href="products.html?brand=Modix" class="brand-logo"><span style="font-weight:800; font-size:1.2rem;">Modix</span></a>' }
];

brands.forEach(b => {
    indexContent = indexContent.replace(b.search, b.replace);
});
fs.writeFileSync('index.html', indexContent);

console.log("HTML files updated successfully!");
