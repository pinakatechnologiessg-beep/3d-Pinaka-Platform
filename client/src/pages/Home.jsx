import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cube, Stack, Wrench, Sparkle, ShieldCheck, Truck, Headphones, Medal, ClockCounterClockwise, CreditCard, Lightning, Cpu, Eye, Thermometer, WhatsappLogo, Heart } from '@phosphor-icons/react';
import { PRODUCTS, BRANDS } from '../constants/data';
import { cartService } from '../services/cartService';
import { getImageUrl, parsePriceLocal, PLACEHOLDER_SVG } from '../utils/imageUtils';
import PopupModal from '../components/PopupModal';

import { API_BASE_URL } from '../api/config';

import SEO from '../components/SEO';

const Home = () => {

    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();
    const revealRefs = useRef([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    const BASE_URL = API_BASE_URL;
  
  const parsePriceLocal = (price) => {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    return Number(price.toString().replace(/[^0-9.-]+/g, ""));
  };



  const staticSlides = [
    {
      img: getImageUrl("/images/hero-printer-1-1774867967898.png"),
      brand: "Bambu Lab",
      title: "X1 CARBON",
      subtitle: "Global Flagship Performance",
      price: "₹1,49,999/-",
      features: ["LIDAR ERROR DETECTION", "600MM/S MAX SPEED", "DUAL AUTO BED LEVELING", "AMS MULTI-MATERIAL CAPABLE"]
    },
    {
      img: getImageUrl("/images/hero-printer-2-1774868029567.png"),
      brand: "Anycubic",
      brandColor: "#f97316",
      title: "PHOTON M3",
      subtitle: "Ultra-Precision MSLA",
      price: "₹45,999/-",
      features: ["8K RESOLUTION SCREEN", "SMART RESIN FILL", "LIGHMAKER UV MATRIX", "WIFI & APP CONNECTIVITY"]
    },
    {
      img: getImageUrl("/images/hero-printer-3-1774868059995.png"),
      brand: "Creality",
      brandColor: "#3b82f6",
      title: "K1C 3D PRINTER",
      subtitle: "Professional CoreXY Speed",
      price: "₹52,999/-",
      features: ["CARBON-READY NOZZLE", "AI-CAMERA BUILT-IN", "AMS COMPATIBLE", "QUICK-SWAP NOZZLE"]
    },
    {
      img: getImageUrl("/images/hero-printer-4-1774868325785.png"),
      brand: "Snapmaker",
      brandColor: "#10b981",
      title: "A350T 3-IN-1",
      subtitle: "Industrial 3-in-1 Powerhouse",
      price: "₹1,99,000/-",
      features: ["CNC & LASER INCLUDED", "ALL-METAL DESIGN", "LINEAR RAILS & MODULES", "POWER-LOSS RECOVERY"]
    }
  ];

  const [slides, setSlides] = useState(staticSlides);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/hero`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Map the data to the format expected by the frontend
            const mappedSlides = data.map(slide => ({
              _id: slide._id,
              img: slide.img ? (slide.img.startsWith('http') ? slide.img : getImageUrl(slide.img)) : getImageUrl(""),
              brand: slide.brand || '',
              brandColor: slide.brandColor || '#3b82f6',
              title: slide.title,
              subtitle: slide.subtitle,
              price: slide.price,
              features: slide.features || [],
              btnText: slide.btnText,
              btnLink: slide.btnLink
            }));
            setSlides(mappedSlides);
          }
        }
      } catch (err) {
        console.error("Failed to fetch hero slides", err);
      }
    };
    fetchSlides();
  }, [BASE_URL]);

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
  const [dbFeaturedProducts, setDbFeaturedProducts] = useState([]);
  const [dbNewArrivals, setDbNewArrivals] = useState([]);
  const arrivalSliderRef = useRef(null);

  useEffect(() => {
    const fetchFeatured = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products?featured=true`);
            if (res.ok) {
                const data = await res.json();
                console.log("Featured Products Data:", data); 
                if (data && data.length > 0) {
                    setDbFeaturedProducts(data);
                } else {
                    // Force static fallback if DB is empty
                    console.log("DB featured empty, using static fallback");
                    setDbFeaturedProducts([]);
                }
            }
        } catch (err) {
            console.error("Fetch featured error:", err);
            // On error, let it fallback to static PRODUCTS automatically via the conditional render
        }
    };

    const fetchNewArrivals = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/products/new-arrivals`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    setDbNewArrivals(data);
                }
            }
        } catch (err) {
            console.error("Fetch new arrivals error:", err);
        }
    };

    fetchFeatured();
    fetchNewArrivals();

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

  const scrollArrivals = (direction) => {
    if (arrivalSliderRef.current) {
        const { scrollLeft, clientWidth } = arrivalSliderRef.current;
        const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
        arrivalSliderRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
    }
  };

    return (
        <main>
            <SEO 
                title="Home" 
                description="3D Pinaka is India's leading destination for premium 3D printers, filaments, resins, and 3D printing services. Explore top brands like Bambu Lab, Anycubic, and Creality."
                keywords="3D Pinaka, 3D printer India, Buy 3D printer, 3D printing services, filaments, resins, industrial 3D printers"
            />
            <PopupModal />

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
                <button className="btn btn-primary" onClick={() => navigate((slide.btnLink && slide.btnLink !== 'undefined') ? slide.btnLink : '/products')}>
                  {(slide.btnText && slide.btnText !== 'undefined') ? slide.btnText : 'Shop Now'}
                </button>
                
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
                onClick={() => navigate(`/products?brand=${brand.name}`)}
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

      {/* Featured Products */}
      <section className="section container" style={{ marginTop: '-2rem' }}>
        <div className="products-header reveal" ref={addToRevealRefs}>
            <div>
                <h2>Featured Products</h2>
                <p style={{ color: 'var(--text-muted)' }}>Handpicked premium 3D printers for professionals</p>
            </div>
            <button className="btn btn-dark" onClick={() => navigate('/products')}>View All Products</button>
        </div>

        <div className="products-grid">
            {(dbFeaturedProducts.length > 0 ? dbFeaturedProducts : PRODUCTS.filter(p => p.featured)).map((product, index) => {
                console.log("Featured Product Item:", product); // Debug Step: Console log individual product
                
                const price = Number(parsePriceLocal(product.price));
                const originalPrice = Number(parsePriceLocal(product.mrp || product.originalPrice));
                const hasDiscount = originalPrice > price;
                const discountPercent = product.discount || (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

                return (
                <div 
                    key={product._id || product.id} 
                    className="reveal" 
                    ref={addToRevealRefs}
                    style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        padding: isMobile ? '12px' : '20px', 
                        border: '1px solid #f1f5f9', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)', 
                        transition: 'transform 0.2s', 
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <button 
                        className={`wishlist-btn ${wishlist.some(item => (item.productId || '').toString() === (product._id || product.id || '').toString()) ? 'active' : ''}`} 
                        onClick={() => handleAddToWishlist(product)}
                        style={{ zIndex: 10 }}
                        title="Add to Wishlist"
                    >
                        <Heart size={20} weight={wishlist.some(item => (item.productId || '').toString() === (product._id || product.id || '').toString()) ? "fill" : "bold"} />
                    </button>
                    {product.badge && <div className="badge" style={{ ...product.badgeStyle, zIndex: 5 }}>{product.badge}</div>}
                    
                    <Link to={product._id ? `/product/${product._id}` : '/products'} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
                        <div className="image-wrapper" style={{ height: isMobile ? '160px' : '220px', marginBottom: '12px', overflow: 'hidden', borderRadius: '8px', background: '#f8fafc' }}>
                            <img 
                                src={getImageUrl(product.image)} 
                                alt={product.name || product.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} 
                                onError={(e) => (e.target.src = PLACEHOLDER_SVG)}
                            />
                        </div>
                        <div style={{ fontSize: isMobile ? '0.7rem' : '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {product.category}
                        </div>
                        <h3 style={{ 
                            fontSize: isMobile ? '0.95rem' : '1.1rem', 
                            color: '#1e293b', 
                            marginBottom: '8px', 
                            height: isMobile ? '2.4rem' : '2.8rem', 
                            overflow: 'hidden',
                            lineHeight: 1.3,
                            fontWeight: 600
                        }}>{product.name || product.title}</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: 'auto' }}>
                            <div style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 800, color: '#2563eb' }}>
                                ₹{price.toLocaleString('en-IN')}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {hasDiscount && (
                                    <div style={{ fontSize: isMobile ? '0.8rem' : '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                        ₹{originalPrice.toLocaleString('en-IN')}
                                    </div>
                                )}
                                {hasDiscount && (
                                     <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, background: '#f0fdf4', padding: '2px 4px', borderRadius: '4px' }}>
                                        {discountPercent}% OFF
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                    
                    <button 
                        className="btn btn-dark" 
                        onClick={() => handleAddToCart(product)}
                        style={{ 
                            width: '100%', 
                            marginTop: '12px', 
                            padding: isMobile ? '10px' : '12px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            background: '#111827', 
                            color: 'white', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            fontSize: isMobile ? '0.85rem' : '1rem'
                        }}
                    >
                        Add to Cart
                    </button>
                </div>
                );
            })}
        </div>
      </section>

      {/* New Arrivals Section */}
      {dbNewArrivals.length > 0 && (
        <section className="section container" style={{ marginTop: '2rem', position: 'relative' }}>
          <div className="products-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
                    New Arrivals <Sparkle size={32} color="#f59e0b" weight="fill" />
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '1.1rem' }}>The latest and greatest in 3D printing technology</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => scrollArrivals('left')}
                    style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  >
                    <Lightning size={24} weight="bold" style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <button 
                    onClick={() => scrollArrivals('right')}
                    style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  >
                    <Lightning size={24} weight="bold" />
                  </button>
              </div>
          </div>

          <div 
            ref={arrivalSliderRef}
            className="arrivals-slider"
            style={{ 
                display: 'flex', 
                gap: '20px', 
                overflowX: 'auto', 
                scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                padding: '10px 5px'
            }}
          >
              {dbNewArrivals.map((product) => {
                  const price = Number(parsePriceLocal(product.price));
                  const originalPrice = Number(parsePriceLocal(product.mrp || product.originalPrice));
                  const hasDiscount = originalPrice > price;
                  const discountPercent = product.discount || (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

                  return (
                  <div 
                      key={product._id || product.id} 
                      style={{ 
                          minWidth: isMobile ? '280px' : '320px',
                          scrollSnapAlign: 'start',
                          background: 'white', 
                          borderRadius: '16px', 
                          padding: isMobile ? '16px' : '24px', 
                          border: '1px solid #f1f5f9', 
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', 
                          transition: 'all 0.3s ease', 
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column'
                      }}
                  >
                      <button 
                          className={`wishlist-btn ${wishlist.some(item => (item.productId || '').toString() === (product._id || product.id || '').toString()) ? 'active' : ''}`} 
                          onClick={() => handleAddToWishlist(product)}
                          style={{ zIndex: 10, position: 'absolute', top: '15px', right: '15px' }}
                          title="Add to Wishlist"
                      >
                          <Heart size={20} weight={wishlist.some(item => (item.productId || '').toString() === (product._id || product.id || '').toString()) ? "fill" : "bold"} />
                      </button>
                      <div className="badge" style={{ background: '#3b82f6', color: 'white', zIndex: 5, borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700 }}>{product.badge || 'NEW'}</div>
                      
                      <Link to={product._id ? `/product/${product._id}` : '/products'} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
                          <div className="image-wrapper" style={{ height: isMobile ? '180px' : '240px', marginBottom: '15px', overflow: 'hidden', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img 
                                  src={getImageUrl(product.image)} 
                                  alt={product.name || product.title} 
                                  style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} 
                                  onError={(e) => (e.target.src = PLACEHOLDER_SVG)}
                              />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>
                              {product.category}
                          </div>
                          <h3 style={{ 
                              fontSize: isMobile ? '1.1rem' : '1.25rem', 
                              color: '#1e293b', 
                              marginBottom: '12px', 
                              height: '3rem', 
                              overflow: 'hidden',
                              lineHeight: 1.3,
                              fontWeight: 700
                          }}>{product.name || product.title}</h3>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
                              <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: '#2563eb' }}>
                                  ₹{price.toLocaleString('en-IN')}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {hasDiscount && (
                                      <div style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                          ₹{originalPrice.toLocaleString('en-IN')}
                                      </div>
                                  )}
                                  {hasDiscount && (
                                       <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: '6px' }}>
                                          {discountPercent}% OFF
                                      </div>
                                  )}
                              </div>
                          </div>
                      </Link>
                      
                      <button 
                          className="btn btn-dark" 
                          onClick={() => handleAddToCart(product)}
                          style={{ 
                              width: '100%', 
                              marginTop: '20px', 
                              padding: '14px', 
                              borderRadius: '10px', 
                              border: 'none', 
                              background: '#0f172a', 
                              color: 'white', 
                              fontWeight: 600, 
                              cursor: 'pointer',
                              fontSize: '1rem',
                              transition: 'background 0.2s'
                          }}
                      >
                          Add to Cart
                      </button>
                  </div>
                  );
              })}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <div className="promo-banner">
        <div className="marquee">
          <div className="marquee-content">
            <span>✦ Best Deals</span>
            <span>✦ Safe Transactions</span>
            <span>✦ Fast Shipping</span>
            <span>✦ 7 Days Return Policy</span>
            <span>✦ Affordable Pricing</span>
            <span>✦ 24/7 Support</span>
          </div>
          <div className="marquee-content">
            <span>✦ Best Deals</span>
            <span>✦ Safe Transactions</span>
            <span>✦ Fast Shipping</span>
            <span>✦ 7 Days Return Policy</span>
            <span>✦ Affordable Pricing</span>
            <span>✦ 24/7 Support</span>
          </div>
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
            
            <div className="tech-images reveal" ref={addToRevealRefs}>
                <div className="tech-main-card">
                    <img src={getImageUrl("/images/pinaka-office.png")} alt="Pinaka Technologies Office" className="tech-featured-img" />
                    <div className="tech-card-overlay">
                        <h4>Expert Consultation</h4>
                        <p>Visit our state-of-the-art facility for a live demo</p>
                    </div>
                </div>
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
            {[
                { 
                    name: "Rajesh S. Khanna", 
                    role: "Industrial Designer, Bangalore", 
                    text: "Pinaka Technologies has been our go-to partner for all our prototyping needs. Their Anycubic Kobra 3 setup is a beast—unbeatable precision and speed!", 
                    img: "https://i.pravatar.cc/150?img=12" 
                },
                { 
                    name: "Dr. Sunita Rao", 
                    role: "Professor, IIT Kanpur", 
                    text: "The team at Pinaka helped us set up our entire research lab. Their expert consultation and technical support were invaluable to our project's success.", 
                    img: "https://i.pravatar.cc/150?img=5" 
                },
                { 
                    name: "Vikram Malhotra", 
                    role: "Founder, MechDesigns", 
                    text: "Incredible speed and accuracy. The Snapmaker Artisan I bought from them has been running 24/7 with zero issues. Highly recommend their services!", 
                    img: "https://i.pravatar.cc/150?img=11" 
                }
            ].map((testi, i) => (
                <div key={i} className="testi-card reveal" ref={addToRevealRefs}>
                    <div className="stars" style={{ color: '#f59e0b', marginBottom: '1rem' }}>★★★★★</div>
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: '#334155' }}>"{testi.text}"</p>
                    <div className="user-info" style={{ marginTop: '1.5rem' }}>
                        <img src={testi.img} alt={testi.name} className="user-avatar" style={{ border: '2px solid var(--primary)' }} />
                        <div className="user-details">
                            <h5 style={{ fontSize: '1rem', fontWeight: 700 }}>{testi.name}</h5>
                            <span style={{ fontSize: '0.85rem' }}>{testi.role}</span>
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
