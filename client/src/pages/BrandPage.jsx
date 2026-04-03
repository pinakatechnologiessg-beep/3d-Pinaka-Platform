import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, Heart, ShoppingCart, FunnelSimple, CaretDown, X } from '@phosphor-icons/react';
import { BRANDS } from '../constants/data';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../utils/imageUtils';

const BrandProductCard = ({ product, revealRef }) => {
    const [isInWishlist, setIsInWishlist] = useState(cartService.isInWishlist(product.name || product.title));
    const parsePrice = (p) => typeof p === 'number' ? p : (parseInt(String(p).replace(/[^0-9]/g, '')) || 0);

    useEffect(() => {
        const checkWishlist = () => setIsInWishlist(cartService.isInWishlist(product.name || product.title));
        window.addEventListener('wishlistUpdated', checkWishlist);
        return () => window.removeEventListener('wishlistUpdated', checkWishlist);
    }, [product.name, product.title]);

    return (
        <div className={`brand-product-card reveal ${!product.inStock ? 'sold-out' : ''}`} ref={revealRef}>
            <div className="badges-row">
                {product.tags && <span className="mini-badge sale">{product.tags}</span>}
                {product.badge && <span className="mini-badge">{product.badge}</span>}
            </div>
            <div className="image-wrapper">
                <Link to={`/product/${product._id}`} style={{ display: 'block', height: '100%' }}>
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name || product.title} 
                        className="product-img" 
                        onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                </Link>
                {!product.inStock && (
                    <div className="sold-out-overlay">
                        <div className="sold-out-circle">Sold Out</div>
                    </div>
                )}
            </div>
            <div className="content">
                <div className="product-cat">{product.category} {product.brand && `| ${product.brand}`}</div>
                <Link to={`/product/${product._id}`} className="title" style={{ textDecoration: 'none', color: 'inherit' }}>
                    {product.name || product.title}
                </Link>
                <div className="reviews">
                    <span className="stars">
                        {typeof product.rating === 'number' ? 
                            ('★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))) : 
                            ('★★★★★')
                        }
                    </span>
                    <span className="review-count">
                        {typeof product.rating === 'number' ? 
                            `(${product.rating.toFixed(1)})` : 
                            '(5.0)'
                        }
                    </span>
                </div>
                <div className="footer">
                    <div className="price-section">
                        <span className="current-price">₹{parsePrice(product.price).toLocaleString('en-IN')}</span>
                        {(product.mrp || product.oldPrice) && <span className="old-price">₹{parsePrice(product.mrp || product.oldPrice).toLocaleString('en-IN')}</span>}
                        {!product.inStock && <span className="out-of-stock-label">Out Of Stock</span>}
                    </div>
                    {product.inStock ? (
                        <>
                            <button className="add-cart-btn" onClick={() => cartService.addToCart(product)} title="Add to Cart">
                                <ShoppingCart size={22} weight="bold" />
                            </button>
                            <button 
                                className={`add-cart-btn wishlist-btn ${isInWishlist ? 'active' : ''}`} 
                                onClick={() => cartService.toggleWishlist(product)} 
                                style={{ marginLeft: '10px' }} 
                                title="Add to Wishlist"
                            >
                                <Heart size={22} weight={isInWishlist ? "fill" : "bold"} />
                            </button>
                        </>
                    ) : (
                        <button className="add-cart-btn sold-out-btn" disabled style={{ background: '#94a3b8', cursor: 'not-allowed' }}>
                             <ShoppingCart size={22} weight="bold" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const SORT_OPTIONS = [
    { label: 'Best selling', value: 'best' },
    { label: 'Alphabetically, A-Z', value: 'az' },
    { label: 'Alphabetically, Z-A', value: 'za' },
    { label: 'Price, low to high', value: 'price_asc' },
    { label: 'Price, high to low', value: 'price_desc' },
];

const parsePrice = (p) => typeof p === 'number' ? p : (parseInt(String(p).replace(/[^0-9]/g, '')) || 0);

const BrandPage = () => {
    const { brandName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const revealRefs = useRef([]);
    const [showFilter, setShowFilter] = useState(true);
    const [sortBy, setSortBy] = useState('best');
    const [sortOpen, setSortOpen] = useState(false);
    
    const [dbProducts, setDbProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        brand: [],
        category: [],
        availability: []
    });

    const effectiveBrandName = useMemo(() => {
        if (brandName) return brandName;
        return window.location.pathname.split('/').pop().replace('.html', '');
    }, [brandName]);

    const brand = useMemo(() => {
        return BRANDS.find(b => b.path === effectiveBrandName) || { name: effectiveBrandName.charAt(0).toUpperCase() + effectiveBrandName.slice(1) };
    }, [effectiveBrandName]);

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchBrandProducts = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                query.append('brand', brand.name.toLowerCase());
                
                if (filters.category.length > 0) {
                    query.append("category", filters.category.join(","));
                }
                
                if (filters.availability.length === 1) {
                    const value = filters.availability[0] === "In Stock" ? "in" : "out";
                    query.append("availability", value);
                }

                const url = `${BASE_URL}/api/products?${query.toString()}`;
                console.log("API URL (Brand):", url);

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    console.log("Brand Products Count:", data.length);
                    setDbProducts(data);
                }
            } catch (err) {
                console.error("Brand fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBrandProducts();
    }, [brand.name, filters]);

    const products = useMemo(() => {
        let items = [...dbProducts];
        switch (sortBy) {
            case 'az': items.sort((a, b) => (a.name || a.title).localeCompare(b.name || b.title)); break;
            case 'za': items.sort((a, b) => (b.name || b.title).localeCompare(a.name || a.title)); break;
            case 'price_asc': items.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
            case 'price_desc': items.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
            default: break;
        }
        return items;
    }, [dbProducts, sortBy]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
        }, { threshold: 0.1 });

        const timer = setTimeout(() => {
            revealRefs.current.forEach(el => {
                if (el) {
                    el.classList.remove('active');
                    observer.observe(el);
                }
            });
        }, 100);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [products, loading]);

    const addToRevealRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    const toggleAvailability = (val) => {
        setFilters(prev => ({
            ...prev,
            availability: prev.availability.includes(val) ? prev.availability.filter(v => v !== val) : [...prev.availability, val]
        }));
    };

    const toggleCat = (cat) => {
        const c = cat.toLowerCase();
        setFilters(prev => ({
            ...prev,
            category: prev.category.includes(c) ? prev.category.filter(x => x !== c) : [...prev.category, c]
        }));
    };

    const clearAll = () => setFilters({ brand: [], category: [], availability: [] });

    const activeTags = useMemo(() => {
        const tags = [];
        filters.availability.forEach(a => tags.push({ type: 'availability', label: a }));
        filters.category.forEach(c => tags.push({ type: 'category', label: c.charAt(0).toUpperCase() + c.slice(1), value: c }));
        return tags;
    }, [filters]);

    const removeTag = (tag) => {
        if (tag.type === 'availability') toggleAvailability(tag.label);
        if (tag.type === 'category') toggleCat(tag.value);
    };

    const ALL_CATS = ['3D Printer', 'Filament', 'Resin', 'Accessory', 'Spare Parts', '3D Pen', '3D Scanner', 'Laser Engraver', 'CNC Router', 'Food Printer', 'Robotics', 'Safety'];

    return (
        <main>
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>{brand.name} Printers</h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Professional 3D Printing solutions by {brand.name}</p>
            </div>

            <section className="section container">
                <div className="filter-topbar">
                    <button className="filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
                        <FunnelSimple size={18} weight="bold" />
                        {showFilter ? 'Hide filter' : 'Show filter'}
                    </button>
                    <div className="sort-wrapper">
                        <span className="sort-label">Sort by:</span>
                        <div className="sort-dropdown" onClick={() => setSortOpen(!sortOpen)}>
                            <span>{SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}</span>
                            <CaretDown size={16} />
                            {sortOpen && (
                                <div className="sort-menu">
                                    {SORT_OPTIONS.map(opt => (
                                        <div key={opt.value} className={`sort-option ${sortBy === opt.value ? 'active' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); setSortBy(opt.value); setSortOpen(false); }}>
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {activeTags.length > 0 && (
                    <div className="active-tags">
                        {activeTags.map((tag, i) => (
                            <span key={i} className="tag-pill">{tag.label} <X size={14} weight="bold" onClick={() => removeTag(tag)} /></span>
                        ))}
                        <button className="tag-clear" onClick={clearAll}>Remove all</button>
                    </div>
                )}

                <div className="filter-layout">
                    {showFilter && (
                        <aside className="filter-sidebar">
                            <div className="filter-section">
                                <div className="filter-section-header"><h4>Availability</h4></div>
                                <label className="filter-checkbox">
                                    <input type="checkbox" checked={filters.availability.includes('In Stock')} onChange={() => toggleAvailability('In Stock')} />
                                    <span>In Stock</span>
                                </label>
                                <label className="filter-checkbox">
                                    <input type="checkbox" checked={filters.availability.includes('Out of Stock')} onChange={() => toggleAvailability('Out of Stock')} />
                                    <span>Out Of Stock</span>
                                </label>
                            </div>
                            <div className="filter-section">
                                <div className="filter-section-header"><h4>Category</h4></div>
                                <div className="filter-scroll-area">
                                    {ALL_CATS.map(cat => (
                                        <label key={cat} className="filter-checkbox">
                                            <input type="checkbox" checked={filters.category.includes(cat.toLowerCase())} onChange={() => toggleCat(cat)} />
                                            <span>{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    )}

                    <div className={`brand-product-grid ${showFilter ? '' : 'full-width'}`} style={{ flex: 1 }}>
                        {console.log("Rendering Brand Products:", products?.length)}
                        {loading ? (
                            <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : products && products.length > 0 ? (
                            products.map((product) => (
                                <BrandProductCard key={product._id || product.id} product={product} revealRef={addToRevealRefs} />
                            ))
                        ) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '8rem 2rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <h3 style={{ marginBottom: '1rem' }}>No Products Found</h3>
                                <p style={{ color: '#64748b' }}>We couldn't find any products matching your selected filters for this brand.</p>
                                <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={clearAll}>Clear All Filters</button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default BrandPage;
