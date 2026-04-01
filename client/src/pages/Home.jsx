import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cube, Stack, Wrench, Sparkle, ShieldCheck, Truck, Headphones, Medal, ClockCounterClockwise, CreditCard, Lightning, Cpu, Eye, Thermometer, WhatsappLogo, Heart } from '@phosphor-icons/react';
import { PRODUCTS, BRANDS } from '../constants/data';
import { cartService } from '../services/cartService';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const revealRefs = useRef([]);

  const slides = [
    {
      img: "/images/hero_printer_1_1774867967898.png",
      brand: "Bambu Lab",
      title: "P2S COMBO",
      subtitle: "The Icon, Redefined",
      price: "₹99,999/-",
      features: ["4-SYSTEM FILAMENT MIXING", "ACOLD-AIR ADAPTIVE COOLING", "1080P HIGH-RATE CAMERA", "BLAZING SPEED AT 600 MM/S"]
    },
    {
      img: "/images/hero_printer_2_1774868029567.png",
      brand: "Anycubic",
      brandColor: "#f97316",
      title: "PHOTON M3 PRO",
      subtitle: "Ultra-Precision MSLA",
      price: "₹45,999/-",
      features: ["8K RESOLUTION SCREEN", "SMART RESIN FILL", "WIFI CONNECTIVITY", "LIGHMAKER UV MATRIX"]
    },
    {
      img: "/images/hero_printer_3_1774868059995.png",
      brand: "Creality",
      brandColor: "#3b82f6",
      title: "ENDER-3 V3",
      subtitle: "Next-Gen Fundamentals",
      price: "₹28,999/-",
      features: ["COREXZ MOTION", "AUTO CALIBRATION", "QUICK-SWAP NOZZLE"]
    },
    {
      img: "/images/hero_printer_4_1774868325785.png",
      brand: "Snapmaker",
      brandColor: "#10b981",
      title: "J1 PRO IDEX",
      subtitle: "Industrial Grade Multi-Tool",
      price: "₹2,49,999/-",
      features: ["INDEPENDENT DUAL EXTRUDERS", "LINEAR RAILS", "CNC & LASER MODULES"]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealRefs.current.forEach(el => {
        if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addToRevealRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
        revealRefs.current.push(el);
    }
  };

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const updateWishlist = () => setWishlist(cartService.getWishlistItems());
    updateWishlist();
    window.addEventListener('wishlistUpdated', updateWishlist);
    return () => window.removeEventListener('wishlistUpdated', updateWishlist);
  }, []);

  const handleAddToCart = (product) => {
    cartService.addToCart(product);
  };

  const handleAddToWishlist = (product) => {
    cartService.toggleWishlist(product);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-slider">
          {slides.map((slide, index) => (
            <div 
              key={index} 
              className="hero-slide" 
              style={{ display: currentSlide === index ? 'flex' : 'none' }}
            >
              <img src={slide.img} alt={slide.title} className="hero-bg" />
              <div className="container hero-content">
                <div className="brand-tag">
                  <div className="brand-icon" style={{ background: slide.brandColor || 'var(--success)' }}></div> 
                  {slide.brand}
                </div>
                <h1>{slide.title}</h1>
                <h3>{slide.subtitle}</h3>
                <div className="price">{slide.price}</div>
                <button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button>
                
                <div className="hero-features">
                  {slide.features.map((feat, i) => (
                    <div key={i} className="feature-tag">{feat}</div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="slider-controls">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <div className="promo-banner">
        <div className="marquee">
          <span>✦ Best Deals</span>
          <span>✦ Safe Transactions</span>
          <span>✦ Fast Shipping</span>
          <span>✦ 7 Days Return Policy</span>
          <span>✦ Best Deals</span>
          <span>✦ Safe Transactions</span>
          <span>✦ Fast Shipping</span>
          <span>✦ 7 Days Return Policy</span>
          <span>✦ Best Deals</span>
          <span>✦ Safe Transactions</span>
          <span>✦ Fast Shipping</span>
          <span>✦ 7 Days Return Policy</span>
        </div>
      </div>

      {/* Explore Collection */}
      <section className="section container">
        <div className="section-header reveal" ref={addToRevealRefs}>
            <h2>Explore Our Collection</h2>
            <p>Everything you need for 3D printing excellence</p>
        </div>
        
        <div className="collections-grid">
            <div className="collection-card reveal" ref={addToRevealRefs} onClick={() => navigate('/products')}>
                <div className="collection-icon"><Cube size={24} /></div>
                <h4>3D Printers</h4>
                <p>Professional FDM & Resin printers for all needs</p>
                <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>50+ Models →</div>
            </div>
            <div className="collection-card reveal" ref={addToRevealRefs} onClick={() => navigate('/materials')}>
                <div className="collection-icon"><Stack size={24} /></div>
                <h4>Filaments & Resins</h4>
                <p>Premium quality materials in all colors</p>
                <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>200+ Options →</div>
            </div>
            <div className="collection-card reveal" ref={addToRevealRefs} onClick={() => navigate('/products')}>
                <div className="collection-icon"><Wrench size={24} /></div>
                <h4>Parts & Accessories</h4>
                <p>Upgrade and maintain your printer</p>
                <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>500+ Items →</div>
            </div>
            <div className="collection-card reveal" ref={addToRevealRefs} onClick={() => navigate('/support')}>
                <div className="collection-icon"><Sparkle size={24} /></div>
                <h4>Custom Solutions</h4>
                <p>Enterprise-grade printing solutions</p>
                <div style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>On Demand →</div>
            </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section container">
        <div className="products-header reveal" ref={addToRevealRefs}>
            <div>
                <h2>Featured Products</h2>
                <p style={{ color: 'var(--text-muted)' }}>Handpicked premium 3D printers for professionals</p>
            </div>
            <button className="btn btn-dark" onClick={() => navigate('/products')}>View All Products</button>
        </div>

        <div className="products-grid">
            {PRODUCTS.slice(0, 4).map((product, index) => (
                <div key={product.id} className="product-card reveal" ref={addToRevealRefs}>
                    <button 
                        className={`wishlist-btn ${wishlist.some(item => item.title === product.title) ? 'active' : ''}`} 
                        onClick={() => handleAddToWishlist(product)}
                        title="Add to Wishlist"
                    >
                        <Heart size={20} weight={wishlist.some(item => item.title === product.title) ? "fill" : "bold"} />
                    </button>
                    <div className="badge" style={product.badgeStyle}>{product.badge || (index === 0 ? 'Best Seller' : index === 1 ? 'New Arrival' : index === 2 ? 'Popular' : 'Premium')}</div>
                    <img src={product.image} alt={product.title} className="product-img" />
                    <div className="product-info">
                        <div className="product-cat">{product.category}</div>
                        <div className="product-title">{product.title}</div>
                        <div className="stars">{product.stars}</div>
                        <div className="product-price">{product.price}</div>
                        <button 
                            className="btn btn-block" 
                            onClick={() => handleAddToCart(product)}
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Shop by Brand */}
      <section className="section container">
        <div className="section-header reveal" ref={addToRevealRefs}>
          <h2>Shop By Brand</h2>
          <p>Explore top 3D printing brands</p>
        </div>
        <div className="brand-marquee-wrapper">
          <div className="brand-marquee-track">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <div
                key={i}
                className="brand-marquee-card"
                onClick={() => navigate(`/brand/${brand.path}`)}
                style={{ '--brand-color': brand.color }}
              >
                <span style={{ color: brand.color, fontStyle: brand.italic ? 'italic' : 'normal' }}>
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-dark" onClick={() => navigate('/products')}>View All Products</button>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="dark-section">
        <div className="container">
            <div className="section-header reveal" ref={addToRevealRefs}>
                <h2>Why Choose Us</h2>
                <p>Your trusted partner in 3D printing excellence</p>
            </div>

            <div className="features-grid">
                {[
                  { icon: ShieldCheck, title: "Authentic Products", desc: "100% genuine products" },
                  { icon: Truck, title: "Fast Delivery", desc: "Free shipping above ₹50k" },
                  { icon: Headphones, title: "24/7 Support", desc: "Expert technical support" },
                  { icon: Medal, title: "Warranty Coverage", desc: "Extended warranty" },
                  { icon: ClockCounterClockwise, title: "Easy Returns", desc: "7-day return policy" },
                  { icon: CreditCard, title: "Secure Payment", desc: "Multiple options with EMI" }
                ].map((feat, i) => (
                  <div key={i} className="feature-box reveal" ref={addToRevealRefs}>
                    <div className="feat-icon"><feat.icon size={32} /></div>
                    <h4>{feat.title}</h4>
                    <p>{feat.desc}</p>
                  </div>
                ))}
            </div>

            <div className="stats-grid">
                {[
                  { val: "10K+", label: "Happy Customers" },
                  { val: "500+", label: "Products" },
                  { val: "50+", label: "Brands" },
                  { val: "24/7", label: "Support" }
                ].map((stat, i) => (
                  <div key={i} className="stat-item reveal" ref={addToRevealRefs}>
                    <h3>{stat.val}</h3>
                    <p>{stat.label}</p>
                  </div>
                ))}
            </div>
        </div>
      </section>

      {/* Dynamic Brand Marquee logic is in Header or global CSS */}

      {/* Technology */}
      <section className="section container">
        <div className="tech-section">
            <div className="tech-info reveal" ref={addToRevealRefs}>
                <h2>Cutting-Edge Technology</h2>
                <p>Experience the future of 3D printing with our advanced printer technology.</p>
                
                <div className="tech-list">
                    {[
                      { icon: Lightning, color: "blue", title: "Lightning Fast Speed", desc: "Print up to 600mm/s" },
                      { icon: Cpu, color: "purple", title: "AI-Powered Intelligence", desc: "Smart sensors and auto-detection" },
                      { icon: Eye, color: "orange", title: "Real-Time Monitoring", desc: "1080p HD camera" },
                      { icon: Thermometer, color: "green", title: "Adaptive Cooling", desc: "Advanced thermal management" }
                    ].map((tech, i) => (
                      <div key={i} className="tech-item reveal" ref={addToRevealRefs}>
                        <div className={`tech-icon ${tech.color}`}><tech.icon size={24} /></div>
                        <div>
                            <h5>{tech.title}</h5>
                            <p>{tech.desc}</p>
                        </div>
                      </div>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/products')}>Explore Technology</button>
            </div>
            
            <div className="tech-images">
                <img src="/images/Creality K1 Max 3D Printer.png" alt="High Speed Printing" className="tech-img" />
                <img src="/images/Snapmaker 2.0 A350T 3-in-1 3D Printer.png" alt="Cutting Edge Tech" className="tech-img" />
                <img src="/images/3D Printing Kit.png" alt="Precision Components" className="tech-img" />
            </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section container" style={{ backgroundColor: 'var(--light-bg)', borderRadius: '20px', padding: '4rem 2rem' }}>
        <div className="section-header reveal" ref={addToRevealRefs}>
            <h2>What Our Clients Say</h2>
            <p>Trusted by thousands of professionals across India</p>
        </div>
        
        <div className="testi-grid">
            {[1, 2, 3].map((i) => (
                <div key={i} className="testi-card reveal" ref={addToRevealRefs}>
                    <div className="stars">★★★★★</div>
                    <p>"The Bambu Lab P2S has transformed our prototyping workflow. The print quality is exceptional!"</p>
                    <div className="user-info">
                        <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="User" className="user-avatar" />
                        <div className="user-details">
                            <h5>{i === 1 ? 'Rajesh Kumar' : i === 2 ? 'Priya Sharma' : 'Amit Patel'}</h5>
                            <span>{i === 1 ? 'Product Designer' : i === 2 ? 'Architect' : 'Manager'}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button className="btn btn-dark" onClick={() => navigate('/testimonials')}>View All Testimonials</button>
        </div>
      </section>

      {/* Whatsapp Float */}
      <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
    </main>
  );
};

export default Home;
