document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = '#fff';
            navLinks.style.padding = '1rem';
            navLinks.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
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
});
