document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if(menuBtn) {
        // Inject Mobile Menu HTML
        const mobileMenuHTML = `
        <div class="mobile-menu-overlay" id="mobileMenuOverlay"></div>
        <div class="mobile-offcanvas" id="mobileMenu">
          <div class="mobile-menu-header">
             <i class="ph ph-x close-menu-btn" id="closeMenuBtn"></i>
          </div>
          <div class="mobile-menu-actions">
             <button class="menu-action-btn" onclick="window.location.href='login.html'"><i class="ph ph-user"></i> Login</button>
             <button class="menu-action-btn" onclick="window.location.href='cart.html'"><i class="ph ph-heart"></i> Wishlist</button>
          </div>
          <ul class="mobile-menu-list">
             <li><a href="index.html">Home</a></li>
             <li><a href="products.html">Brands</a></li>
             <li class="has-dropdown">
                 <div class="menu-dropdown-toggle">Categories <i class="ph ph-plus"></i></div>
                 <ul class="menu-dropdown-items">
                     <li><a href="products.html?category=3D%20Printer">3D Printer</a></li>
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
             </li>
             <li class="has-dropdown">
                 <div class="menu-dropdown-toggle">3 Idea Exclusive <i class="ph ph-plus"></i></div>
                 <ul class="menu-dropdown-items">
                     <li><a href="anycubic.html">Anycubic Kobra 2 Neo 3D Printer</a></li>
                     <li><a href="anycubic.html">Anycubic Photon Mono 4 3D Printer</a></li>
                     <li><a href="anycubic.html">Anycubic Kobra 3 3D Printer</a></li>
                     <li><a href="snapmaker.html">Snapmaker Artisan 3-In-1 3D Printer</a></li>
                     <li><a href="rotrics.html">Rotrics DexArm Hyper Luxury Kit</a></li>
                 </ul>
             </li>
             <li class="has-dropdown">
                 <div class="menu-dropdown-toggle">Material <i class="ph ph-plus"></i></div>
                 <ul class="menu-dropdown-items">
                     <li><a href="materials.html">All Materials</a></li>
                 </ul>
             </li>
             <li class="has-dropdown">
                 <div class="menu-dropdown-toggle">Bulk Enquiry <i class="ph ph-plus"></i></div>
                 <ul class="menu-dropdown-items">
                     <li><a href="support.html">Contact Form</a></li>
                 </ul>
             </li>
             <li class="has-dropdown">
                 <div class="menu-dropdown-toggle">Refurbished Store <i class="ph ph-plus"></i></div>
                 <ul class="menu-dropdown-items">
                     <li><a href="products.html">View Refurbished</a></li>
                 </ul>
             </li>
             <li><a href="support.html">Printing Services</a></li>
             <li><a href="support.html">Support</a></li>
          </ul>
          <div class="mobile-menu-footer">
             <strong>Need Help?</strong>
             <p>10th Floor, Times Tower, Kamala City, Senapati Bapat Marg, Lower Parel West, Mumbai, Maharashtra 400013</p>
          </div>
        </div>
        `;
        if(!document.getElementById('mobileMenu')) {
            document.body.insertAdjacentHTML('beforeend', mobileMenuHTML);
        }

        const mobileMenu = document.getElementById('mobileMenu');
        const overlay = document.getElementById('mobileMenuOverlay');
        const closeBtn = document.getElementById('closeMenuBtn');

        const openMenu = () => {
            mobileMenu.classList.add('open');
            overlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('open');
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        };

        menuBtn.addEventListener('click', () => {
             if(navLinks) navLinks.style.display = '';
             openMenu();
        });
        
        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        // Accordion functionality for dropdowns
        document.querySelectorAll('.menu-dropdown-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const parent = e.target.closest('.has-dropdown');
                parent.classList.toggle('active');
                const icon = parent.querySelector('.ph-plus, .ph-minus');
                if(icon) {
                    if(parent.classList.contains('active')) {
                        icon.classList.remove('ph-plus');
                        icon.classList.add('ph-minus');
                    } else {
                        icon.classList.remove('ph-minus');
                        icon.classList.add('ph-plus');
                    }
                }
            });
        });
    }

    // Hero Carousel
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let slideInterval;

    const showSlide = (n) => {
        if(!slides.length) return;
        slides.forEach(slide => slide.style.display = 'none');
        dots.forEach(dot => dot.classList.remove('active'));
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].style.display = 'flex';
        // reset animations for feature tags
        const tags = slides[currentSlide].querySelectorAll('.feature-tag');
        tags.forEach(tag => {
            tag.style.animation = 'none';
            tag.offsetHeight; /* trigger reflow */
            tag.style.animation = null; 
        });

        if(dots[currentSlide]) dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => showSlide(currentSlide + 1);
    const prevSlide = () => showSlide(currentSlide - 1);

    // Initialize
    if (slides.length > 0) {
        showSlide(currentSlide);
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updateCartBadge = () => {
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => badge.innerText = cart.length);
    };
    updateCartBadge();

    // Custom Toast
    const showToast = (message) => {
        let toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.innerHTML = `<i class="ph ph-check-circle" style="color:var(--success); margin-right:8px; font-size:1.2rem;"></i> ${message}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    document.querySelectorAll('.btn-block, .btn-dark, .btn-primary').forEach(btn => {
        if(btn.innerText.includes('Add to Cart')) {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                if(card) {
                    const title = card.querySelector('.product-title').innerText;
                    // Extract just the price text ignoring <strike>
                    const priceNode = card.querySelector('.product-price').childNodes[0];
                    const priceText = priceNode ? priceNode.nodeValue.trim() : card.querySelector('.product-price').innerText;
                    const image = card.querySelector('img').src;
                    cart.push({ title, price: priceText, image });
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartBadge();
                    showToast('Item added to cart!');
                }
            });
        }
    });

    // Brand & Category Filtering
    const urlParams = new URLSearchParams(window.location.search);
    const brandFilter = urlParams.get('brand');
    const categoryFilter = urlParams.get('category');
    
    if (brandFilter || categoryFilter) {
        const title = document.querySelector('h1');
        if(title && title.innerText.includes('All 3D Printers')) {
            if(brandFilter) title.innerText = brandFilter + ' Printers';
            else if(categoryFilter) title.innerText = categoryFilter + 's';
        }
        document.querySelectorAll('.product-card').forEach(card => {
            const productTitle = card.querySelector('.product-title').innerText.toLowerCase();
            const productCat = card.querySelector('.product-cat') ? card.querySelector('.product-cat').innerText.toLowerCase() : '';
            
            let show = true;
            if (brandFilter && !productTitle.includes(brandFilter.toLowerCase())) {
                show = false;
            }
            if (categoryFilter) {
                // If the user searches for "3D Printer", we strip "3d " so it matches "FDM Printer", "Resin Printer"
                const query = categoryFilter.toLowerCase().replace('3d ', '');
                if (!productCat.includes(query) && !productTitle.includes(query)) {
                    show = false;
                }
            }
            if (!show) {
                card.style.display = 'none';
            }
        });
    }

    // Scroll Reveal Animation Observer
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));
});
