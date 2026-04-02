import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, Heart, FunnelSimple, CaretDown, X } from '@phosphor-icons/react';
import { BRANDS } from '../constants/data';
import { cartService } from '../services/cartService';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const revealRefs = useRef([]);
    const [showFilter, setShowFilter] = useState(true);
    const [sortBy, setSortBy] = useState('best');
    const [sortOpen, setSortOpen] = useState(false);
    
    const [dbProducts, setDbProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters - synced with URL
    const ALL_CATS = useMemo(() => ['3D Printer', 'Filament', 'Resin', 'Accessory', 'Spare Parts', '3D Pen', '3D Scanner', 'Laser Engraver', 'CNC Router', 'Food Printer', 'Robotics', 'Safety'], []);
    const ALL_BRANDS = useMemo(() => BRANDS.map(b => b.name.toLowerCase()), []);

    // Filters - synced with URL
    const selectedBrands = useMemo(() => {
        const b = searchParams.get('brand');
        return b ? b.toLowerCase().split(',') : ALL_BRANDS;
    }, [searchParams, ALL_BRANDS]);

    const selectedCats = useMemo(() => {
        const c = searchParams.get('category');
        return c ? c.toLowerCase().split(',') : ALL_CATS.map(cat => cat.toLowerCase());
    }, [searchParams, ALL_CATS]);

    const [availabilityFilter, setAvailabilityFilter] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPriceVal, setMaxPriceVal] = useState(1000000);
    useEffect(() => {
        const fetchFilteredProducts = async () => {
            setLoading(true);
            try {
                const b = searchParams.get('brand');
                const c = searchParams.get('category');
                const q = searchParams.get('q');
                const cond = searchParams.get('condition');
                
                let queryStr = '';
                if (b) queryStr += `brand=${b.toLowerCase()}&`;
                if (c) queryStr += `category=${c}&`;
                if (q) queryStr += `q=${q}&`;
                if (cond) queryStr += `condition=${cond}&`;
                
                // If exactly 1 filter is selected, send it. If 0 or 2, send nothing (show all)
                if (availabilityFilter.length === 1) {
                    queryStr += `availability=${availabilityFilter[0]}&`;
                }
                
                const res = await fetch(`http://localhost:5000/api/products?${queryStr.replace(/&$/, '')}`);
                if (res.ok) {
                    setDbProducts(await res.json());
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFilteredProducts();
    }, [searchParams, availabilityFilter]);

    const toggleBrand = (brand) => {
        const bLow = brand.toLowerCase();
        const newParams = new URLSearchParams(searchParams);
        const current = searchParams.get('brand') ? selectedBrands : ALL_BRANDS;
        const next = current.includes(bLow) ? current.filter(b => b !== bLow) : [...current, bLow];
        
        if (next.length === ALL_BRANDS.length || next.length === 0) newParams.delete('brand');
        else newParams.set('brand', next.join(','));
        setSearchParams(newParams);
    };

    const toggleCat = (cat) => {
        const cLow = cat.toLowerCase();
        const newParams = new URLSearchParams(searchParams);
        const current = searchParams.get('category') ? selectedCats : ALL_CATS.map(c => c.toLowerCase());
        const next = current.includes(cLow) ? current.filter(c => c !== cLow) : [...current, cLow];
        
        if (next.length === ALL_CATS.length || next.length === 0) newParams.delete('category');
        else newParams.set('category', next.join(','));
        setSearchParams(newParams);
    };

    const parsePriceLocal = (p) => typeof p === 'number' ? p : (parseInt(String(p).replace(/[^0-9]/g, '')) || 0);
    const realMaxPrice = useMemo(() => Math.max(...dbProducts.map(p => parsePriceLocal(p.price)), 1000000), [dbProducts]);
    const realMinPrice = useMemo(() => Math.min(...dbProducts.map(p => parsePriceLocal(p.price)), 0), [dbProducts]);

    useEffect(() => {
        if (dbProducts.length > 0) {
            setMaxPriceVal(realMaxPrice);
            setMinPrice(realMinPrice);
        }
    }, [realMaxPrice, realMinPrice, dbProducts]);

    const products = useMemo(() => {
        let filtered = [...dbProducts];

        // Availability filtering is handled by the backend API.
        // Frontend handles visibility and price/sort logic.

        filtered = filtered.filter(p => {
            const pr = parsePriceLocal(p.price);
            // Safety: if maxPriceVal looks like it hasn't updated to match real data yet, don't filter.
            if (maxPriceVal === 1000000 && pr > 1000000) return true;
            return pr >= minPrice && pr <= maxPriceVal;
        });
        console.log(`Grid Refresh: ${filtered.length} products ready for reveal.`);

        switch (sortBy) {
            case 'az': filtered.sort((a, b) => (a.name || a.title).localeCompare(b.name || b.title)); break;
            case 'za': filtered.sort((a, b) => (b.name || b.title).localeCompare(a.name || a.title)); break;
            case 'price_asc': filtered.sort((a, b) => parsePriceLocal(a.price) - parsePriceLocal(b.price)); break;
            case 'price_desc': filtered.sort((a, b) => parsePriceLocal(b.price) - parsePriceLocal(a.price)); break;
            default: break;
        }

        return filtered;
    }, [dbProducts, minPrice, maxPriceVal, sortBy, availabilityFilter]);

    useEffect(() => {
        if (loading) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        const timer = setTimeout(() => {
            revealRefs.current.forEach(el => {
                if (el) {
                    el.classList.remove('active');
                    observer.observe(el);
                }
            });
        }, 200);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [products, searchParams, loading, minPrice, maxPriceVal, availabilityFilter]);

    const [wishlist, setWishlist] = useState([]);
    useEffect(() => {
        const updateWishlist = () => setWishlist(cartService.getWishlistItems());
        updateWishlist();
        window.addEventListener('wishlistUpdated', updateWishlist);
        return () => window.removeEventListener('wishlistUpdated', updateWishlist);
    }, []);

    const addToRevealRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    const activeTags = [
        ...(availabilityFilter.length === 1 ? availabilityFilter.map(a => ({ 
            type: 'availability', 
            value: a, 
            label: `Availability: ${a === 'inStock' ? 'In stock' : 'Out of stock'}` 
        })) : []),
        ...(searchParams.has('brand') && selectedBrands.length < ALL_BRANDS.length ? selectedBrands.map(b => ({ type: 'brand', value: b, label: `Brand: ${b}` })) : []),
        ...(searchParams.has('category') && selectedCats.length < ALL_CATS.length ? selectedCats.map(c => ({ type: 'cat', value: c, label: `Category: ${c}` })) : []),
        ...(searchParams.has('q') ? [{ type: 'search', value: searchParams.get('q'), label: `Search: ${searchParams.get('q')}` }] : []),
        ...(searchParams.has('condition') ? [{ type: 'condition', value: searchParams.get('condition'), label: `Store: ${searchParams.get('condition')}` }] : [])
    ];

    const removeTag = (tag) => {
        const newParams = new URLSearchParams(searchParams);
        if (tag.type === 'brand') {
            const next = selectedBrands.filter(b => b !== tag.value.toLowerCase());
            if (next.length === 0 || next.length === ALL_BRANDS.length) newParams.delete('brand');
            else newParams.set('brand', next.join(','));
        }
        if (tag.type === 'cat') {
            const next = selectedCats.filter(c => c !== tag.value.toLowerCase());
            if (next.length === 0 || next.length === ALL_CATS.length) newParams.delete('category');
            else newParams.set('category', next.join(','));
        }
        if (tag.type === 'availability') setAvailabilityFilter(prev => prev.filter(v => v !== tag.value));
        if (tag.type === 'search') newParams.delete('q');
        if (tag.type === 'condition') newParams.delete('condition');
        setSearchParams(newParams);
    };

    const clearAll = () => {
        const newParams = new URLSearchParams();
        const cond = searchParams.get('condition');
        if (cond) newParams.set('condition', cond);
        setSearchParams(newParams);
        setAvailabilityFilter([]);
        setMinPrice(realMinPrice);
        setMaxPriceVal(realMaxPrice);
    };

    const renderGrid = () => {
        revealRefs.current = [];
        return (
            <div className={`products-grid ${showFilter ? '' : 'full-width'}`} style={{ flex: 1 }}>
                {products.length > 0 ? products.map((product) => (
                    <div key={product._id || product.id} className={`product-card reveal ${!product.inStock ? 'sold-out' : ''}`} ref={addToRevealRefs}>
                        <button 
                            className={`wishlist-btn ${wishlist.some(item => (item.name || item.title || '').toLowerCase() === (product.name || product.title || '').toLowerCase()) ? 'active' : ''}`} 
                            onClick={() => cartService.toggleWishlist(product)}
                            title="Add to Wishlist"
                        >
                            <Heart size={20} weight={wishlist.some(item => (item.name || item.title || '').toLowerCase() === (product.name || product.title || '').toLowerCase()) ? "fill" : "bold"} />
                        </button>
                        {product.badge && (
                            <div className="badge" style={product.badgeStyle}>{product.badge}</div>
                        )}
                        <div className="product-img-wrapper" style={{ position: 'relative' }}>
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
                        <div className="product-info">
                            <div className="product-cat">{product.category} {product.brand && `| ${product.brand}`}</div>
                            <div className="product-title">{product.name || product.title || "Unnamed Product"}</div>
                            <div className="stars">
                                {typeof product.rating === 'number' ? 
                                    ('★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating)) + ` (${product.rating.toFixed(1)})`) : 
                                    (product.stars || '★★★★★ (5.0)')
                                }
                            </div>
                            <div className="product-price">
                                ₹{Number(parsePriceLocal(product.price || 0)).toLocaleString('en-IN')}
                                {(product.mrp || product.oldPrice) && (
                                    <>
                                        <span className="mrp-label">MRP: ₹{parsePriceLocal(product.mrp || product.oldPrice).toLocaleString('en-IN')}</span>
                                        {(() => {
                                            const cur = parsePriceLocal(product.price);
                                            const old = parsePriceLocal(product.mrp || product.oldPrice);
                                            const off = Math.round(((old - cur) / old) * 100);
                                            return off > 0 ? <span className="off-badge">{off}% Off</span> : null;
                                        })()}
                                    </>
                                )}
                                {!product.inStock && <span className="out-of-stock-label">Out Of Stock</span>}
                            </div>
                            {product.inStock ? (
                                <button className="btn btn-block" onClick={() => cartService.addToCart(product)}>Add to Cart</button>
                            ) : (
                                <button className="btn btn-block" disabled style={{ background: '#94a3b8', color: 'white', cursor: 'not-allowed' }}>Out of Stock</button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        No products match your current filters.
                    </div>
                )}
            </div>
        );
    };

    return (
        <main>
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>{searchParams.get('condition') === 'Refurbished' ? `Refurbished ${searchParams.get('category') || ''} Store` : activeTags.length === 1 ? activeTags[0].label : 'All 3D Printers'}</h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Professional FDM, Resin & Industrial Graded Printers</p>
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
                            <span>{sortBy === 'best' ? 'Best selling' : sortBy === 'az' ? 'Alphabetically, A-Z' : sortBy === 'za' ? 'Alphabetically, Z-A' : sortBy === 'price_asc' ? 'Price, low to high' : 'Price, high to low'}</span>
                            <CaretDown size={16} />
                            {sortOpen && (
                                <div className="sort-menu">
                                    {[
                                        { label: 'Best selling', value: 'best' },
                                        { label: 'Alphabetically, A-Z', value: 'az' },
                                        { label: 'Alphabetically, Z-A', value: 'za' },
                                        { label: 'Price, low to high', value: 'price_asc' },
                                        { label: 'Price, high to low', value: 'price_desc' },
                                    ].map(opt => (
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
                                <div className="filter-section-header">
                                    <h4>Availability</h4>
                                </div>
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
                                            checked={!searchParams.has('category') || selectedCats.length === ALL_CATS.length} 
                                            onChange={() => {
                                                const newParams = new URLSearchParams(searchParams);
                                                newParams.delete('category');
                                                setSearchParams(newParams);
                                            }} 
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
                                <div className="filter-section-header"><h4>Brand</h4></div>
                                <div className="filter-scroll-area">
                                    <label className="filter-checkbox all-option">
                                        <input 
                                            type="checkbox" 
                                            checked={!searchParams.has('brand') || selectedBrands.length === ALL_BRANDS.length} 
                                            onChange={() => {
                                                const newParams = new URLSearchParams(searchParams);
                                                newParams.delete('brand');
                                                setSearchParams(newParams);
                                            }} 
                                        />
                                        <span style={{ fontWeight: 600 }}>All</span>
                                    </label>
                                    {BRANDS.map(b => (
                                        <label key={b.path} className="filter-checkbox">
                                            <input type="checkbox" checked={selectedBrands.includes(b.name.toLowerCase())} onChange={() => toggleBrand(b.name)} />
                                            <span>{b.name}</span>
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

                        {loading ? (
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : renderGrid()}
                    </div>
                </section>
            
            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Products;
