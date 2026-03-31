import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, Heart, ShoppingCart, FunnelSimple, CaretDown, X } from '@phosphor-icons/react';
import { BRANDS } from '../constants/data';
import { ANYCUBIC_PRODUCTS } from '../constants/anycubic_data';
import { BAMBU_PRODUCTS } from '../constants/bambu_data';
import { CREALITY_PRODUCTS } from '../constants/creality_data';
import { SNAPMAKER_PRODUCTS } from '../constants/snapmaker_data';
import { ROTRICS_PRODUCTS } from '../constants/rotrics_data';
import { FLASHFORGE_PRODUCTS } from '../constants/flashforge_data';
import { MAGFORMS_PRODUCTS } from '../constants/magforms_data';
import { ZMORPH_PRODUCTS } from '../constants/zmorph_data';
import { ELEGOO_PRODUCTS } from '../constants/elegoo_data';
import { cartService } from '../services/cartService';

const BrandProductCard = ({ product, revealRef }) => (
    <div className={`brand-product-card reveal ${!product.inStock ? 'sold-out' : ''}`} ref={revealRef}>
        <div className="badges-row">
            {product.badges?.map((b, i) => (
                <span key={i} className={`mini-badge ${b}`}>
                    {b === 'sale' ? 'Sale' : b === 'flash' ? 'Flash Sale' : b === 'top' ? 'Top' : b === 'pre' ? 'Pre Order' : b === 'new' ? 'New' : b === 'clearance' ? 'Clearance' : b}
                </span>
            ))}
        </div>
        <div className="image-wrapper">
            <img src={product.image} alt={product.title} className="product-img" />
            {!product.inStock && (
                <div className="sold-out-overlay">
                    <div className="sold-out-circle">Sold Out</div>
                </div>
            )}
        </div>
        <div className="content">
            <h3 className="title">{product.title}</h3>
            <div className="reviews">
                <span className="stars">{product.stars.split(' ')[0]}</span>
                <span className="review-count">{product.stars.split(' ')[1]}</span>
            </div>
            <div className="spec-grid">
                {product.specs.map((spec, i) => (
                    <div key={i} className="spec-item">
                        <span className="spec-label">{spec.label}</span>
                        <span className="spec-value">{spec.value}</span>
                    </div>
                ))}
            </div>
            <div className="footer">
                <div className="price-section">
                    <span className="current-price">{product.price}</span>
                    {product.oldPrice && <span className="old-price">{product.oldPrice}</span>}
                    {!product.inStock && <span className="out-of-stock-label">Out Of Stock</span>}
                </div>
                {product.inStock ? (
                    <>
                        <button className="add-cart-btn" onClick={() => cartService.addToCart(product)} title="Add to Cart">
                            <ShoppingCart size={22} weight="bold" />
                        </button>
                        <button className="add-cart-btn" onClick={() => cartService.addToWishlist(product)} style={{ marginLeft: '10px' }} title="Add to Wishlist">
                            <Heart size={22} weight="bold" />
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    </div>
);

const SORT_OPTIONS = [
    { label: 'Best selling', value: 'best' },
    { label: 'Alphabetically, A-Z', value: 'az' },
    { label: 'Alphabetically, Z-A', value: 'za' },
    { label: 'Price, low to high', value: 'price_asc' },
    { label: 'Price, high to low', value: 'price_desc' },
];

const parsePrice = (p) => parseInt(p.replace(/[^0-9]/g, '')) || 0;

const BrandPage = () => {
    const { brandName } = useParams();
    const location = useLocation();
    const revealRefs = useRef([]);
    const [showFilter, setShowFilter] = useState(true);
    const [sortBy, setSortBy] = useState('best');
    const [sortOpen, setSortOpen] = useState(false);
    const [availabilityFilter, setAvailabilityFilter] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPriceVal, setMaxPriceVal] = useState(100000);

    const effectiveBrandName = brandName || location.pathname.split('/').pop().replace('.html', '');
    const brand = BRANDS.find(b => b.path === effectiveBrandName) || { name: effectiveBrandName.charAt(0).toUpperCase() + effectiveBrandName.slice(1) };
    const isAnycubic = effectiveBrandName.toLowerCase() === 'anycubic';
    const isBambu = effectiveBrandName.toLowerCase() === 'bambu';
    const isCreality = effectiveBrandName.toLowerCase() === 'creality';
    const isSnapmaker = effectiveBrandName.toLowerCase() === 'snapmaker';
    const isRotrics = effectiveBrandName.toLowerCase() === 'rotrics';
    const isFlashforge = effectiveBrandName.toLowerCase() === 'flashforge';
    const isSkriware = effectiveBrandName.toLowerCase() === 'skriware';
    const isMagforms = effectiveBrandName.toLowerCase() === 'magforms';
    const isZmorph = effectiveBrandName.toLowerCase() === 'zmorph';
    const isElegoo = effectiveBrandName.toLowerCase() === 'elegoo';
    const allProducts = isAnycubic ? ANYCUBIC_PRODUCTS : isBambu ? BAMBU_PRODUCTS : isCreality ? CREALITY_PRODUCTS : isSnapmaker ? SNAPMAKER_PRODUCTS : isRotrics ? ROTRICS_PRODUCTS : isFlashforge ? FLASHFORGE_PRODUCTS : isMagforms ? MAGFORMS_PRODUCTS : isZmorph ? ZMORPH_PRODUCTS : isElegoo ? ELEGOO_PRODUCTS : [];

    const realMaxPrice = useMemo(() => Math.max(...allProducts.map(p => parsePrice(p.price)), 100000), [allProducts]);
    const realMinPrice = useMemo(() => Math.min(...allProducts.map(p => parsePrice(p.price)), 0), [allProducts]);

    useEffect(() => {
        if (allProducts.length > 0) {
            setMinPrice(realMinPrice);
            setMaxPriceVal(realMaxPrice);
        }
    }, [allProducts, realMaxPrice, realMinPrice]);

    const showOutOfStockMsg = availabilityFilter.length === 1 && availabilityFilter.includes('out');

    const products = useMemo(() => {
        if (showOutOfStockMsg) return [];
        let filtered = [...allProducts];
        
        // Availability Logic: If both or none selected, show all. If only 'in' selected, show all (since all are in stock).
        // If only 'out' selected, show none (handled by showOutOfStockMsg).
        
        filtered = filtered.filter(p => {
            const pr = parsePrice(p.price);
            return pr >= minPrice && pr <= maxPriceVal;
        });

        switch (sortBy) {
            case 'az': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'za': filtered.sort((a, b) => b.title.localeCompare(a.title)); break;
            case 'price_asc': filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
            case 'price_desc': filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
            default: break;
        }
        return filtered;
    }, [allProducts, minPrice, maxPriceVal, sortBy, showOutOfStockMsg]);

    const activeTags = availabilityFilter.map(a => ({
        type: 'availability', value: a,
        label: `Availability: ${a === 'in' ? 'In stock' : 'Out of stock'}`
    }));

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

    // Reset refs list on each render so stale nodes don't accumulate
    revealRefs.current = [];

    const toggleAvailability = (val) => setAvailabilityFilter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
    const removeTag = (tag) => { if (tag.type === 'availability') setAvailabilityFilter(prev => prev.filter(v => v !== tag.value)); };
    const clearAll = () => { setAvailabilityFilter([]); setMinPrice(realMinPrice); setMaxPriceVal(realMaxPrice); };

    return (
        <main>
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>{brand.name} Printers</h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Explore the latest collection from {brand.name}</p>
            </div>

            {allProducts.length > 0 ? (
                <section className="section container">
                    <div className="filter-topbar">
                        <button className="filter-toggle-btn" onClick={() => setShowFilter(!showFilter)}>
                            <FunnelSimple size={18} weight="bold" />
                            {showFilter ? 'Hide filter' : 'Show filter'}
                        </button>
                        <div className="sort-wrapper">
                            <span className="sort-label">Sort by:</span>
                            <div className="sort-dropdown" onClick={() => setSortOpen(!sortOpen)}>
                                <span>{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
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
                                    <div className="filter-section-header">
                                        <h4>Availability <span className="filter-count-badge">2</span></h4>
                                    </div>
                                    <label className="filter-checkbox">
                                        <input type="checkbox" checked={availabilityFilter.includes('in')} onChange={() => toggleAvailability('in')} />
                                        <span>In Stock</span>
                                        <span className="filter-item-count">{allProducts.length}</span>
                                    </label>
                                    <label className="filter-checkbox">
                                        <input type="checkbox" checked={availabilityFilter.includes('out')} onChange={() => toggleAvailability('out')} />
                                        <span>Out Of Stock</span>
                                        <span className="filter-item-count">0</span>
                                    </label>
                                </div>

                                <div className="filter-section">
                                    <div className="filter-section-header"><h4>Price</h4></div>
                                    <div className="dual-range-container">
                                        <div className="range-marks">
                                            <span>₹{realMinPrice}</span>
                                            <span>₹{realMaxPrice}</span>
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

                        <div className={`brand-product-grid ${showFilter ? '' : 'full-width'}`}>
                            {showOutOfStockMsg ? (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#16a34a', marginBottom: '0.5rem' }}>🎉 Great news!</p>
                                    <p style={{ color: '#15803d' }}>Everything is currently in stock. All {allProducts.length} products are available for purchase!</p>
                                    <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={clearAll}>View All Products</button>
                                </div>
                            ) : products.length > 0 ? products.map((product) => (
                                <BrandProductCard key={`${product.id}-${sortBy}`} product={product} revealRef={addToRevealRefs} />
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
                                {['Skriware', 'Sunlu'].includes(brand.name) ? 'No products available' : 'Products and images for this brand will be added here later.'}
                            </p>
                            <Link to="/products" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>View All General Products</Link>
                        </div>
                    </div>
                </section>
            )}
            <a href="https://wa.me/1234567890" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default BrandPage;
