const fs = require('fs');
const files = ['index.html', 'products.html', 'materials.html', 'support.html', 'cart.html'];

const menuHTML = `<div class="dropdown">
                    <a href="products.html" class="dropbtn">Products <i class="ph ph-caret-down"></i></a>
                    <div class="dropdown-content mega-menu">
                        <div class="mega-menu-grid">
                            <div class="mega-col">
                                <div class="col-header">
                                    <h4>BRANDS</h4>
                                    <a href="products.html" class="view-all">VIEW ALL</a>
                                </div>
                                <ul class="mega-list">
                                    <li><a href="products.html?brand=Anycubic">Anycubic</a></li>
                                    <li><a href="products.html?brand=Bambu">Bambu Lab</a></li>
                                    <li><a href="products.html?brand=Creality">Creality</a></li>
                                    <li><a href="products.html?brand=Snapmaker">Snapmaker</a></li>
                                    <li><a href="products.html?brand=Rotrics">Rotrics</a></li>
                                    <li><a href="products.html?brand=3DMAKERPRO">3DMAKERPRO</a></li>
                                    <li><a href="products.html?brand=Flsun">Flsun</a></li>
                                    <li><a href="products.html?brand=Sunlu">Sunlu</a></li>
                                    <li><a href="products.html?brand=Zortrax">Zortrax</a></li>
                                    <li><a href="products.html?brand=eSun">eSun</a></li>
                                    <li><a href="products.html?brand=Zmorph">Zmorph</a></li>
                                </ul>
                            </div>
                            <div class="mega-col">
                                <div class="col-header">
                                    <h4>CATEGORIES</h4>
                                </div>
                                <ul class="mega-list">
                                    <li><a href="products.html?category=3D%20Printer">3D Printer <span class="hot-badge">Hot</span></a></li>
                                    <li><a href="products.html?category=Laser%20Engraver">Laser Engraver</a></li>
                                    <li><a href="products.html?category=Food%20Printer">Food Printer</a></li>
                                    <li><a href="products.html?category=3D%20Scanner">3D Scanner</a></li>
                                    <li><a href="products.html?category=CNC%20Router">CNC Router</a></li>
                                    <li><a href="products.html?category=Robotics">Robotics</a></li>
                                    <li><a href="products.html?category=3D%20Pens">3D Pens</a></li>
                                    <li><a href="products.html?category=Filaments">Filaments</a></li>
                                    <li><a href="products.html?category=Resins">Resins</a></li>
                                    <li><a href="products.html?category=Spare%20Parts">Spare Parts</a></li>
                                    <li><a href="products.html?category=Accessories">Accessories</a></li>
                                </ul>
                            </div>
                            <div class="mega-col" style="border-right:none; padding-right:0;">
                                <div class="col-header">
                                    <h4>3IDEA EXCLUSIVE</h4>
                                </div>
                                <ul class="mega-list">
                                    <li><a href="products.html?brand=Anycubic">Anycubic Kobra 2 Neo 3D Printer</a></li>
                                    <li><a href="products.html?brand=Anycubic">Anycubic Photon Mono 4 3D Printer</a></li>
                                    <li><a href="products.html?brand=Anycubic">Anycubic Kobra 3 3D Printer</a></li>
                                    <li><a href="products.html?brand=Snapmaker">Snapmaker Artisan 3-In-1 3D Printer</a></li>
                                    <li><a href="products.html?brand=Rotrics">Rotrics DexArm Hyper Luxury Kit</a></li>
                                </ul>
                            </div>
                            <div class="mega-col mega-img-col">
                                <a href="products.html?category=3D%20Printer" class="mega-img-card">
                                    <img src="images/product_fdm_1_1774868367269.png" alt="3D Printer">
                                    <span class="label" style="box-shadow: 0 4px 10px rgba(0,0,0,0.1);">3D Printer</span>
                                </a>
                            </div>
                            <div class="mega-col mega-img-col">
                                <a href="products.html?category=Laser%20Engraver" class="mega-img-card laser-img" style="background:#e2e8f0;">
                                    <img src="images/product_resin_2_1774868383507.png" alt="Laser Engraver">
                                    <span class="label" style="box-shadow: 0 4px 10px rgba(0,0,0,0.1);">Laser Engraver</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>`;

files.forEach(file => {
    if (fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        // Replace ONLY the first instance, which corresponds to the header Products link
        html = html.replace('<a href="products.html">Products</a>', menuHTML);
        fs.writeFileSync(file, html);
    }
});

console.log("Updated HTML files with Mega Menu.");
