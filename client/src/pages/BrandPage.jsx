import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, Heart, ShoppingCart, FunnelSimple, CaretDown, X } from '@phosphor-icons/react';
import { BRANDS } from '../constants/data';
import { cartService } from '../services/cartService';

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
                <img 
                    src={product.image?.startsWith('/uploads') ? `http://localhost:5000${product.image}` : (product.image || 'https://via.placeholder.com/300x300?text=No+Image')} 
                    alt={product.name || product.title} 
                    className="product-img" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found'; }}
                />
                {!product.inStock && (
                    <div className="sold-out-overlay">
                        <div className="sold-out-circle">Sold Out</div>
                    </div>
                )}
            </div>
            <div className="content">
                <div className="product-cat">{product.category} {product.brand && `| ${product.brand}`}</div>
                <h3 className="title">{product.name || product.title}</h3>
                <div className="reviews">
                    <span className="stars">
                        {typeof product.rating === 'number' ? 
                            ('★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating))) : 
                            (product.stars?.split(' ')[0] || '★★★★★')
                        }
                    </span>
                    <span className="review-count">
                        {typeof product.rating === 'number' ? 
                            `(${product.rating.toFixed(1)})` : 
                            (product.stars?.split(' ')[1] || '(5.0)')
                        }
                    </span>
                </div>
                {product.specs && product.specs.length > 0 && (
                    <div className="spec-grid">
                        {product.specs.slice(0, 4).map((spec, i) => (
                            <div key={i} className="spec-item">
                                <span className="spec-label">{spec.label}</span>
                                <span className="spec-value">{spec.value}</span>
                            </div>
                        ))}
                    </div>
                )}
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
                    ) : null}
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
    const location = useLocation();
    const revealRefs = useRef([]);
    const [showFilter, setShowFilter] = useState(true);
    const [sortBy, setSortBy] = useState('best');
    const [sortOpen, setSortOpen] = useState(false);
    const ALL_CATS = useMemo(() => ['3D Printer', 'Filament', 'Resin', 'Accessory', 'Spare Parts', '3D Pen', '3D Scanner', 'Laser Engraver', 'CNC Router', 'Food Printer', 'Robotics', 'Safety'], []);
    const [availabilityFilter, setAvailabilityFilter] = useState([]);
    const [selectedCats, setSelectedCats] = useState(ALL_CATS.map(c => c.toLowerCase()));
    const [minPrice, setMinPrice] = useState(0);
    const [maxPriceVal, setMaxPriceVal] = useState(1000000);
    const [dbProducts, setDbProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const effectiveBrandName = brandName || location.pathname.split('/').pop().replace('.html', '');
    const brand = BRANDS.find(b => b.path === effectiveBrandName) || { name: effectiveBrandName.charAt(0).toUpperCase() + effectiveBrandName.slice(1) };
    
    useEffect(() => {
        const fetchBrandProducts = async () => {
            setLoading(true);
            try {
                let queryStr = `brand=${brand.name.toLowerCase()}&`;
                // If exactly 1 filter is selected, send it. If 0 or 2, send nothing (show all)
                if (availabilityFilter.length === 1) {
                    queryStr += `availability=${availabilityFilter[0]}&`;
                }
                const res = await fetch(`http://localhost:5000/api/products?${queryStr.replace(/&$/, '')}`);
                if (res.ok) {
                    setDbProducts(await res.json());
                }
            } catch (err) {
                console.error("Brand fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBrandProducts();
    }, [brand.name, availabilityFilter]);

    const realMaxPrice = useMemo(() => Math.max(...dbProducts.map(p => parsePrice(p.price)), 100000), [dbProducts]);
    const realMinPrice = useMemo(() => Math.min(...dbProducts.map(p => parsePrice(p.price)), 0), [dbProducts]);

    useEffect(() => {
        if (dbProducts.length > 0) {
            setMinPrice(realMinPrice);
            setMaxPriceVal(realMaxPrice);
        }
    }, [dbProducts, realMaxPrice, realMinPrice]);

    const products = useMemo(() => {
        // Find static products for this brand
        let staticBrandProducts = [];
        const bLabel = brand.name.toLowerCase();
        // (Removing static products for brevity if they are not in use, but normally we'd keep them if they exist)
        
        let filtered = [...dbProducts];

        // Availability filtering is handled by the backend API.
        // Frontend handles categories/price/sort.

        if (selectedCats.length < ALL_CATS.length) {
            filtered = filtered.filter(p => {
                const pCat = (p.category || '').toLowerCase();
                return selectedCats.some(cat => {
                    const c = cat.toLowerCase();
                    if (c === '3d printer') return ['fdm', 'resin', 'industrial', 'dental', 'fdm printer', 'resin printer', 'industrial-max'].some(t => pCat.includes(t));
                    return pCat.includes(c.replace(/s$/, '')) || c.includes(pCat.replace(/s$/, ''));
                });
            });
        }

        filtered = filtered.filter(p => {
            const pr = parsePrice(p.price);
            return pr >= minPrice && pr <= maxPriceVal;
        });

        switch (sortBy) {
            case 'az': filtered.sort((a, b) => (a.name || a.title).localeCompare(b.name || b.title)); break;
            case 'za': filtered.sort((a, b) => (b.name || b.title).localeCompare(a.name || a.title)); break;
            case 'price_asc': filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
            case 'price_desc': filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
            default: break;
        }
        return filtered;
    }, [dbProducts, minPrice, maxPriceVal, sortBy, availabilityFilter, selectedCats, ALL_CATS]);

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
        }, 50);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [products, availabilityFilter]);

    const addToRevealRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    revealRefs.current = [];

    const toggleAvailability = (val) => setAvailabilityFilter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    const toggleCat = (cat) => {
        const cLow = cat.toLowerCase();
        setSelectedCats(prev => prev.includes(cLow) ? prev.filter(c => c !== cLow) : [...prev, cLow]);
    };
    const removeTag = (tag) => { 
        if (tag.type === 'availability') toggleAvailability(tag.value); 
        if (tag.type === 'category') toggleCat(tag.value);
    };
    const clearAll = () => { 
        setAvailabilityFilter([]); 
        setSelectedCats(ALL_CATS.map(c => c.toLowerCase()));
        setMinPrice(realMinPrice); 
        setMaxPriceVal(realMaxPrice); 
    };

    const activeTags = [
        ...(availabilityFilter.length === 1 ? availabilityFilter.map(a => ({
            type: 'availability', value: a,
            label: `Availability: ${a === 'inStock' ? 'In stock' : 'Out of stock'}`
        })) : []),
        ...(selectedCats.length < ALL_CATS.length ? selectedCats.map(c => ({
            type: 'category', value: c,
            label: `Category: ${c}`
        })) : [])
    ];

    const showOutOfStockMsg = availabilityFilter.length === 1 && availabilityFilter.includes('out') && !products.some(p => !p.inStock);
    const SortOptionLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Best selling';

    return (
        <main>
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>{brand.name} Printers</h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Explore the latest collection from {brand.name}</p>
            </div>

            {dbProducts.length > 0 ? (
                <section className="section container">
                    <div className="filter-topbar">
                        <button className="filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
                            <FunnelSimple size={18} weight="bold" />
                            {showFilter ? 'Hide filter' : 'Show filter'}
                        </button>
                        <div className="sort-wrapper">
                            <span className="sort-label">Sort by:</span>
                            <div className="sort-dropdown" onClick={() => setSortOpen(!sortOpen)}>
                                <span>{SortOptionLabel}</span>
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
                                        <input type="checkbox" checked={availabilityFilter.includes('inStock')} onChange={() => setAvailabilityFilter(prev => prev.includes('inStock') ? prev.filter(v => v !== 'inStock') : [...prev, 'inStock'])} />
                                        <span>In Stock</span>
                                    </label>
                                    <label className="filter-checkbox">
                                        <input type="checkbox" checked={availabilityFilter.includes('outOfStock')} onChange={() => setAvailabilityFilter(prev => prev.includes('outOfStock') ? prev.filter(v => v !== 'outOfStock') : [...prev, 'outOfStock'])} />
                                        <span>Out Of Stock</span>
                                    </label>
                                </div>
                                <div className="filter-section">
                                    <div className="filter-section-header"><h4>Category</h4></div>
                                    <div className="filter-scroll-area">
                                        <label className="filter-checkbox all-option">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedCats.length === ALL_CATS.length} 
                                                onChange={() => setSelectedCats(ALL_CATS.map(c => c.toLowerCase()))} 
                                            />
                                            <span style={{ fontWeight: 600 }}>All</span>
                                        </label>
                                        {ALL_CATS.map(cat => (
                                            <label key={cat} className="filter-checkbox">
                                                <input type="checkbox" checked={selectedCats.includes(cat.toLowerCase())} onChange={() => toggleCat(cat)} />
                                                <span>{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="filter-section">
                                    <div className="filter-section-header"><h4>Price</h4></div>
                                    <div className="dual-range-container">
                                        <div className="range-marks">
                                            <span>₹{realMinPrice.toLocaleString()}</span>
                                            <span>₹{realMaxPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="dual-range-track">
                                            <div className="dual-range-fill" style={{
                                                left: `${((minPrice - realMinPrice) / (realMaxPrice - realMinPrice)) * 100}%`,
                                                right: `${100 - ((maxPriceVal - realMinPrice) / (realMaxPrice - realMinPrice)) * 100}%`
                                            }}></div>
                                        </div>
                                        <input type="range" className="dual-range-input" min={realMinPrice} max={realMaxPrice} value={minPrice} onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value), maxPriceVal))} />
                                        <input type="range" className="dual-range-input" min={realMinPrice} max={realMaxPrice} value={maxPriceVal} onChange={(e) => setMaxPriceVal(Math.max(parseInt(e.target.value), minPrice))} />
                                    </div>
                                    <p className="price-range-label">Price: ₹{minPrice.toLocaleString('en-IN')} - ₹{maxPriceVal.toLocaleString('en-IN')}</p>
                                </div>
                            </aside>
                        )}

                        <div className={`brand-product-grid ${showFilter ? '' : 'full-width'}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', flex: 1 }}>
                            {products.length > 0 ? products.map((product) => (
                                <BrandProductCard key={product._id || product.id} product={product} revealRef={addToRevealRefs} />
                            )) : (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                    <p>No products match your filters.</p>
                                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={clearAll}>Clear Filters</button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            ) : (
                <section className="section container">
                    <div className="products-grid">
                        <div className="reveal" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'var(--light-bg)', borderRadius: '12px' }} ref={addToRevealRefs}>
                            <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>{brand.name} Collection</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                Loading products for {brand.name}...
                            </p>
                        </div>
                    </div>
                </section>
            )}
            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default BrandPage;
