import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cube, Stack, Wrench, Sparkle, ShieldCheck, Truck, Headphones, Medal, ClockCounterClockwise, CreditCard, Lightning, Cpu, Eye, Thermometer, WhatsappLogo, Heart } from '@phosphor-icons/react';
import { PRODUCTS, BRANDS } from '../constants/data';
import { cartService } from '../services/cartService';
import { getImageUrl, parsePriceLocal, PLACEHOLDER_SVG } from '../utils/imageUtils';
import PopupModal from '../components/PopupModal';

import { API_BASE_URL } from '../api/config';

import SEO from '../components/SEO';
import { generateProductSlug } from '../utils/stringUtils';

const isColorDark = (color) => {
  if (!color) return true;
  const c = color.trim().toLowerCase();
  
  if (c === '#fff' || c === '#ffffff' || c === 'white' || c === 'rgb(255,255,255)' || c === 'rgba(255,255,255,1)') {
    return false;
  }
  if (c === 'var(--text-dark)' || c === '#000' || c === '#000000' || c === 'black' || c.startsWith('rgba(15,23,42') || c.startsWith('rgb(15,23,42')) {
    return true;
  }
  
  if (c.startsWith('#')) {
    let hex = c.substring(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
      );
      return hsp < 170;
    }
  }
  
  return false;
};

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
      brandColor: "var(--secondary)",
      title: "PHOTON M3",
      subtitle: "Ultra-Precision MSLA",
      price: "₹45,999/-",
      features: ["8K RESOLUTION SCREEN", "SMART RESIN FILL", "LIGHMAKER UV MATRIX", "WIFI & APP CONNECTIVITY"]
    },
    {
      img: getImageUrl("/images/hero-printer-3-1774868059995.png"),
      brand: "Creality",
      brandColor: "var(--primary)",
      title: "K1C 3D PRINTER",
      subtitle: "Professional CoreXY Speed",
      price: "₹52,999/-",
      features: ["CARBON-READY NOZZLE", "AI-CAMERA BUILT-IN", "AMS COMPATIBLE", "QUICK-SWAP NOZZLE"]
    },
    {
      img: getImageUrl("/images/hero-printer-4-1774868325785.png"),
      brand: "Snapmaker",
      brandColor: "var(--success)",
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
              brandColor: slide.brandColor || 'var(--primary)',
              bgColor: slide.bgColor || 'var(--text-dark)',
              textColor: slide.textColor || '#ffffff',
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

  // Auto-scroll logic moved below goToSlide

  const [wishlist, setWishlist] = useState([]);
  const [dbFeaturedProducts, setDbFeaturedProducts] = useState([]);
  const [dbNewArrivals, setDbNewArrivals] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [partnerPosters, setPartnerPosters] = useState({ left: null, right: null });

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
  }, [dbFeaturedProducts, dbNewArrivals, blogs]);

  const addToRevealRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
        revealRefs.current.push(el);
    }
  };

  const heroSliderRef = useRef(null);
  const arrivalSliderRef = useRef(null);
  const partnerSliderRef = useRef(null);
  const isScrollingHero = useRef(false);

  useEffect(() => {
    const handleHeroScroll = () => {
        if (!heroSliderRef.current || isScrollingHero.current) return;
        const { scrollLeft, clientWidth } = heroSliderRef.current;
        const index = Math.round(scrollLeft / clientWidth);
        if (index !== currentSlide) {
            setCurrentSlide(index);
        }
    };

    const slider = heroSliderRef.current;
    if (slider) {
        slider.addEventListener('scroll', handleHeroScroll);
    }
    return () => {
        if (slider) slider.removeEventListener('scroll', handleHeroScroll);
    };
  }, [currentSlide]);

  const goToSlide = (index) => {
    if (heroSliderRef.current) {
        isScrollingHero.current = true;
        setCurrentSlide(index);
        heroSliderRef.current.scrollTo({
            left: index * heroSliderRef.current.clientWidth,
            behavior: 'smooth'
        });
        setTimeout(() => {
            isScrollingHero.current = false;
        }, 500);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (slides.length > 0) {
        goToSlide((currentSlide + 1) % slides.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, slides.length]);

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
                setDbNewArrivals(await res.json());
            }
        } catch (error) {
            console.error("Error fetching new arrivals:", error);
        }
    };

    const fetchBlogs = async () => {
        try {
            const blogsRes = await fetch(`${API_BASE_URL}/api/blogs`);
            if (blogsRes.ok) {
                const blogsData = await blogsRes.json();
                console.log("Blogs fetched successfully:", blogsData);
                setBlogs(blogsData);
            } else {
                console.error("Failed to fetch blogs, status:", blogsRes.status);
            }
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    };


    const fetchPartnerPosters = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/partner-posters`);
            if (res.ok) {
                const data = await res.json();
                const posters = { left: null, right: null };
                data.forEach(p => {
                    if (p.isActive) {
                        posters[p.position] = p;
                    }
                });
                setPartnerPosters(posters);
            }
        } catch (err) {
            console.error(err);
        }
    };

    fetchPartnerPosters();

    fetchFeatured();
    fetchNewArrivals();
    fetchBlogs();

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
                description="PINAKA TECHNOLOGIES SG PRIVATE LIMITED is India's leading destination for premium 3D printers, filaments, resins, and 3D printing services. Explore top brands like Bambu Lab, Anycubic, and Creality."
                keywords="PINAKA TECHNOLOGIES SG PRIVATE LIMITED, 3D printer India, Buy 3D printer, 3D printing services, filaments, resins, industrial 3D printers"
            />
            <PopupModal />

            {/* Hero Section */}
      <section className="hero">
        <div 
          className="hero-slider" 
          ref={heroSliderRef}
          style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            scrollSnapType: 'x mandatory', 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            height: '100%'
          }}
        >
          {slides.map((slide, index) => {
            const textIsDark = isColorDark(slide.textColor);
            const stripBg = textIsDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.75)';
            const brandTagBg = textIsDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 23, 42, 0.8)';
            
            return (
              <div 
                key={index} 
                className="hero-slide"
                onClick={() => { if (slide.btnLink && slide.btnLink !== 'undefined') navigate(slide.btnLink); }}
                style={{ minWidth: '100%', scrollSnapAlign: 'start', position: 'relative', backgroundColor: slide.bgColor || 'var(--text-dark)', cursor: (slide.btnLink && slide.btnLink !== 'undefined') ? 'pointer' : 'default' }}
              >
                <img src={slide.img} alt={slide.title} className="hero-bg" />
                {/* The user wants the banner to be just an image with a link. Removed text and buttons. */}
              </div>
            );
          })}
        </div>

        <div className="slider-controls">
          {slides.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></div>
          ))}
        </div>

        <button 
          className="hero-nav prev" 
          onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
          style={{ position: 'absolute', left: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '56px', height: '56px', color: 'white', display: isMobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 10, transition: 'all 0.3s ease' }}
        >
          <Lightning size={28} weight="fill" style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button 
          className="hero-nav next" 
          onClick={() => goToSlide((currentSlide + 1) % slides.length)}
          style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', width: '56px', height: '56px', color: 'white', display: isMobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 10, transition: 'all 0.3s ease' }}
        >
          <Lightning size={28} weight="fill" />
        </button>
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
      </section>

      {/* New Arrivals Section */}
      {dbNewArrivals.length > 0 && (
        <section className="section container" style={{ marginTop: '-2rem', position: 'relative' }}>
          <div className="products-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '15px' }}>
              <div style={{ flex: '1 1 200px' }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    New Arrivals <Sparkle size={isMobile ? 24 : 32} color="var(--warning)" weight="fill" />
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>The latest and greatest in 3D printing technology</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => scrollArrivals('left')}
                    style={{ background: 'var(--colorful-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  >
                    <Lightning size={24} weight="bold" style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <button 
                    onClick={() => scrollArrivals('right')}
                    style={{ background: 'var(--colorful-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
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
                          background: 'var(--colorful-bg)', 
                          borderRadius: '16px', 
                          padding: isMobile ? '16px' : '24px', 
                          border: '1px solid var(--border-color)', 
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', 
                          transition: 'all 0.3s ease', 
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column'
                      }}
                  >
                      <Link to={product.name ? `/product/${generateProductSlug(product.name || product.title)}` : '/products'} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
                          <div className="image-wrapper" style={{ height: isMobile ? '180px' : '240px', marginBottom: '15px', overflow: 'hidden', borderRadius: '12px', background: 'var(--light-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <button 
                                  className={`wishlist-btn ${wishlist.some(item => (item.productId || '').toString() === (product._id || product.id || '').toString()) ? 'active' : ''}`} 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToWishlist(product); }}
                                  style={{ zIndex: 10, position: 'absolute', top: '10px', right: '10px' }}
                                  title="Add to Wishlist"
                              >
                                  <Heart size={20} weight={wishlist.some(item => (item.productId || '').toString() === (product._id || product.id || '').toString()) ? "fill" : "bold"} />
                              </button>
                              <div className="badge" style={{ background: 'var(--primary)', color: 'white', zIndex: 5, borderTopLeftRadius: '12px', borderBottomRightRadius: '12px', padding: '6px 16px 6px 24px', fontSize: '0.85rem', fontWeight: 900, position: 'absolute', top: 0, left: 0, margin: 0, boxShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>{product.badge || 'NEW'}</div>
                              <img 
                                  src={getImageUrl(product.image)} 
                                  alt={product.name || product.title} 
                                  style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} 
                                  onError={(e) => (e.target.src = PLACEHOLDER_SVG)}
                              />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>
                              {product.category}
                          </div>
                          <h3 style={{ 
                              fontSize: isMobile ? '1.1rem' : '1.25rem', 
                              color: 'var(--text-dark)', 
                              marginBottom: '12px', 
                              height: '3rem', 
                              overflow: 'hidden',
                              lineHeight: 1.3,
                              fontWeight: 700
                          }}>{product.name || product.title}</h3>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
                              <div style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                                  ₹{price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {hasDiscount && (
                                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                          ₹{originalPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                      </div>
                                  )}
                                  {hasDiscount && (
                                       <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, background: '#f0fdf4', padding: '2px 8px', borderRadius: '6px' }}>
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
                              background: 'var(--text-dark)', 
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

      {/* Featured Products */}
      <section className="section container" style={{ marginTop: '2rem' }}>
        <div className="products-header reveal" ref={addToRevealRefs} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
            <div style={{ flex: '1 1 200px' }}>
                <h2>Featured Products</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.9rem' : '1rem' }}>Handpicked premium 3D printers for professionals</p>
            </div>
            <button className="btn btn-dark" onClick={() => navigate('/products')} style={{ whiteSpace: 'nowrap', padding: isMobile ? '8px 16px' : '12px 24px', fontSize: isMobile ? '0.85rem' : '1rem' }}>View All</button>
        </div>

        <div className="products-grid">
            {(dbFeaturedProducts.length > 0 ? dbFeaturedProducts : PRODUCTS.filter(p => p.featured)).map((product, index) => {
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
                        background: 'var(--colorful-bg)', 
                        borderRadius: '12px', 
                        padding: isMobile ? '12px' : '20px', 
                        border: '1px solid var(--border-color)', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)', 
                        transition: 'transform 0.2s', 
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Link to={product.name ? `/product/${generateProductSlug(product.name || product.title)}` : '/products'} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
                        <div className="image-wrapper" style={{ height: isMobile ? '160px' : '220px', marginBottom: '12px', overflow: 'hidden', borderRadius: '8px', background: 'var(--light-bg)', position: 'relative' }}>
                            <button 
                                className={`wishlist-btn ${wishlist.some(item => (item.productId || '').toString() === (product._id || product.id || '').toString()) ? 'active' : ''}`} 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToWishlist(product); }}
                                style={{ zIndex: 10, position: 'absolute', top: '8px', right: '8px' }}
                                title="Add to Wishlist"
                            >
                                <Heart size={20} weight={wishlist.some(item => (item.productId || '').toString() === (product._id || product.id || '').toString()) ? "fill" : "bold"} />
                            </button>
                            {product.badge && <div className="badge" style={{ ...product.badgeStyle, zIndex: 5, borderTopLeftRadius: '8px', borderBottomRightRadius: '8px', padding: '4px 12px 4px 16px', fontSize: '0.8rem', fontWeight: 900, position: 'absolute', top: 0, left: 0, margin: 0, boxShadow: '2px 3px 0 rgba(0,0,0,0.15)' }}>{product.badge}</div>}
                            <img 
                                src={getImageUrl(product.image)} 
                                alt={product.name || product.title} 
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }} 
                                onError={(e) => (e.target.src = PLACEHOLDER_SVG)}
                            />
                        </div>
                        <div style={{ fontSize: isMobile ? '0.7rem' : '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {product.category}
                        </div>
                        <h3 style={{ 
                            fontSize: isMobile ? '0.95rem' : '1.1rem', 
                            color: 'var(--text-dark)', 
                            marginBottom: '8px', 
                            height: isMobile ? '2.4rem' : '2.8rem', 
                            overflow: 'hidden',
                            lineHeight: 1.3,
                            fontWeight: 600
                        }}>{product.name || product.title}</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: 'auto' }}>
                            <div style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                                ₹{price.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {hasDiscount && (
                                    <div style={{ fontSize: isMobile ? '0.8rem' : '0.95rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                        ₹{originalPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </div>
                                )}
                                {hasDiscount && (
                                     <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, background: '#f0fdf4', padding: '2px 4px', borderRadius: '4px' }}>
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
                            background: 'var(--card-bg-dark)', 
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





      {/* External Website Premium Banner Section */}
      {(partnerPosters.left || partnerPosters.right) && (
        <section className="section container" style={{ marginTop: '2rem', marginBottom: '3rem', position: 'relative' }}>
          <div className="products-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '15px' }}>
              <div style={{ flex: '1 1 200px' }}>
                  <div style={{ display: 'inline-block', padding: '4px 10px', background: 'var(--border-color)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', border: '1px solid #bfdbfe' }}>
                      PREMIUM PARTNERS
                  </div>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    Our Partner Brands
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>Check out our recommended tools and partner brands.</p>
              </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px', alignItems: 'stretch' }}>
              {/* Left Poster */}
              {partnerPosters.left && (
                  <a href={partnerPosters.left.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                      <img src={partnerPosters.left.imageUrl} alt="Partner Poster" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  </a>
              )}
              
              {/* Right Poster */}
              {partnerPosters.right && (
                  <a href={partnerPosters.right.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                      <img src={partnerPosters.right.imageUrl} alt="Partner Poster" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  </a>
              )}
          </div>
        </section>
      )}


      {/* Blogs Section */}
      {blogs && blogs.length > 0 && (
          <section className="section container" style={{ padding: '4rem 1rem' }}>
              <div className="section-header reveal" ref={addToRevealRefs}>
                  <h2>Latest News & Updates</h2>
                  <p>Stay informed with our latest articles and announcements</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                  {blogs.map(blog => {
                      const safeContent = blog.content || '';
                      const formatDate = (dateStr) => {
                          try {
                              if (!dateStr) return '';
                              const d = new Date(dateStr);
                              return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
                          } catch(e) { return ''; }
                      };
                      return (
                      <div key={blog._id || Math.random()} className="reveal" ref={addToRevealRefs} style={{ background: 'var(--light-bg)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                          <a href={`/blog/${blog._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                              <div style={{ height: '220px', overflow: 'hidden' }}>
                                  <img 
                                      src={getImageUrl(blog.thumbnailImage) || PLACEHOLDER_SVG} 
                                      alt={blog.title || 'Blog'} 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                  />
                              </div>
                              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '10px' }}>
                                      By {blog.author || 'Admin'} {formatDate(blog.createdAt) ? `• ${formatDate(blog.createdAt)}` : ''}
                                  </div>
                                  <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', color: 'var(--text-dark)', lineHeight: 1.4 }}>
                                      {blog.title || 'Untitled'}
                                  </h3>
                                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', flex: 1 }}>
                                      {safeContent.length > 120 ? safeContent.substring(0, 120) + '...' : safeContent}
                                  </p>
                                  <div style={{ marginTop: '20px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      Read More &rarr;
                                  </div>
                              </div>
                          </a>
                      </div>
                  )})}
              </div>
          </section>
      )}


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
                    text: "PINAKA TECHNOLOGIES SG PRIVATE LIMITED has been our go-to partner for all our prototyping needs. Their Anycubic Kobra 3 setup is a beast—unbeatable precision and speed!", 
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
                    <div className="stars" style={{ color: 'var(--warning)', marginBottom: '1rem' }}>★★★★★</div>
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
