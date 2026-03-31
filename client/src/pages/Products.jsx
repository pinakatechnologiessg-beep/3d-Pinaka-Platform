import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, Heart, FunnelSimple, CaretDown, X } from '@phosphor-icons/react';
import { PRODUCTS, BRANDS } from '../constants/data';
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
import { useState, useMemo } from 'react';

const toCard = (p) => ({
    id: p.id, title: p.title, price: p.price, category: p.category,
    image: p.image, stars: p.stars,
    badge: p.badges?.[0] === 'sale' ? 'Sale' : p.badges?.[0] === 'new' ? 'New' : p.badges?.[0] === 'top' ? 'Top' : p.badges?.[0] === 'clearance' ? 'Clearance' : undefined,
    badgeStyle: p.badges?.[0] === 'sale' ? { background: '#ef4444', color: 'white' } : p.badges?.[0] === 'new' ? { background: '#6366f1', color: 'white' } : p.badges?.[0] === 'top' ? { background: '#10b981', color: 'white' } : undefined,
    inStock: p.inStock !== false,
    oldPrice: p.oldPrice
});

const ALL_PRODUCTS = [
    ...PRODUCTS,
    ...ANYCUBIC_PRODUCTS.map(toCard),
    ...BAMBU_PRODUCTS.map(toCard),
    ...CREALITY_PRODUCTS.map(toCard),
    ...SNAPMAKER_PRODUCTS.map(toCard),
    ...ROTRICS_PRODUCTS.map(toCard),
    ...FLASHFORGE_PRODUCTS.map(toCard),
    ...MAGFORMS_PRODUCTS.map(toCard),
    ...ZMORPH_PRODUCTS.map(toCard),
    ...ELEGOO_PRODUCTS.map(toCard),
];

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const revealRefs = useRef([]);
    const [showFilter, setShowFilter] = useState(true);
    const [sortBy, setSortBy] = useState('best');
    const [sortOpen, setSortOpen] = useState(false);
    
    // Filters from URL or state
    const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brand') ? searchParams.get('brand').split(',') : []);
    const [selectedCats, setSelectedCats] = useState(searchParams.get('category') ? searchParams.get('category').split(',') : []);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPriceVal, setMaxPriceVal] = useState(1000000);

    const parsePriceLocal = (p) => parseInt(p.replace(/[^0-9]/g, '')) || 0;
    const realMaxPrice = useMemo(() => Math.max(...ALL_PRODUCTS.map(p => parsePriceLocal(p.price)), 1000000), []);
    const realMinPrice = useMemo(() => Math.min(...ALL_PRODUCTS.map(p => parsePriceLocal(p.price)), 0), []);

    useEffect(() => {
        setMaxPriceVal(realMaxPrice);
        setMinPrice(realMinPrice);
    }, [realMaxPrice, realMinPrice]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const addToRevealRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    const handleAddToCart = (product) => {
        cartService.addToCart(product);
    };

    const handleAddToWishlist = (product) => {
        cartService.addToWishlist(product);
    };

    const products = useMemo(() => {
        let filtered = [...ALL_PRODUCTS];

        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p => selectedBrands.some(b => p.title.toLowerCase().includes(b.toLowerCase())));
        }

        if (selectedCats.length > 0) {
            filtered = filtered.filter(p => {
                const pCat = p.category.toLowerCase();
                return selectedCats.some(cat => {
                    const c = cat.toLowerCase();
                    if (c === '3d printer') return ['fdm', 'resin', 'industrial', 'dental', 'fdm printer', 'resin printer', 'industrial-max'].some(t => pCat.includes(t));
                    return pCat.includes(c.replace(/s$/, '')) || c.includes(pCat.replace(/s$/, ''));
                });
            });
        }

        filtered = filtered.filter(p => {
            const pr = parsePriceLocal(p.price);
            return pr >= minPrice && pr <= maxPriceVal;
        });

        const SORT_OPTIONS = [
            { label: 'Best selling', value: 'best' },
            { label: 'Alphabetically, A-Z', value: 'az' },
            { label: 'Alphabetically, Z-A', value: 'za' },
            { label: 'Price, low to high', value: 'price_asc' },
            { label: 'Price, high to low', value: 'price_desc' },
        ];

        switch (sortBy) {
            case 'az': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'za': filtered.sort((a, b) => b.title.localeCompare(a.title)); break;
            case 'price_asc': filtered.sort((a, b) => parsePriceLocal(a.price) - parsePriceLocal(b.price)); break;
            case 'price_desc': filtered.sort((a, b) => parsePriceLocal(b.price) - parsePriceLocal(a.price)); break;
            default: break;
        }

        return filtered;
    }, [selectedBrands, selectedCats, minPrice, maxPriceVal, sortBy]);

    const toggleBrand = (brand) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    const toggleCat = (cat) => setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    
    const categoriesList = ['3D Printer', 'Laser Engraver', 'Food Printer', '3D Scanner', 'CNC Router', 'Robotics', '3D Pens', 'Filaments', 'Resins', 'Spare Parts', 'Accessories'];

    const activeTags = [
        ...selectedBrands.map(b => ({ type: 'brand', value: b, label: `Brand: ${b}` })),
        ...selectedCats.map(c => ({ type: 'cat', value: c, label: `Category: ${c}` }))
    ];

    const removeTag = (tag) => {
        if (tag.type === 'brand') toggleBrand(tag.value);
        if (tag.type === 'cat') toggleCat(tag.value);
    };

    const clearAll = () => {
        setSelectedBrands([]);
        setSelectedCats([]);
        setMinPrice(realMinPrice);
        setMaxPriceVal(realMaxPrice);
    };

    return (
        <main>
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>{activeTags.length === 1 ? activeTags[0].label : 'All 3D Printers'}</h1>
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
                                <div className="filter-section-header"><h4>Brand</h4></div>
                                <div className="filter-scroll-area">
                                    {BRANDS.map(b => (
                                        <label key={b.path} className="filter-checkbox">
                                            <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)} />
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

                    <div className={`products-grid ${showFilter ? '' : 'full-width'}`} style={{ flex: 1 }}>
                        {products.length > 0 ? products.map((product) => (
                            <div key={product.id} className={`product-card reveal ${!product.inStock ? 'sold-out' : ''}`} ref={addToRevealRefs}>
                                <button 
                                    className="wishlist-btn" 
                                    onClick={() => handleAddToWishlist(product)}
                                    title="Add to Wishlist"
                                >
                                    <Heart size={20} weight="bold" />
                                </button>
                                {product.badge && (
                                    <div className="badge" style={product.badgeStyle}>{product.badge}</div>
                                )}
                                <div className="product-img-wrapper" style={{ position: 'relative' }}>
                                    <img src={product.image} alt={product.title} className="product-img" />
                                    {!product.inStock && (
                                        <div className="sold-out-overlay">
                                            <div className="sold-out-circle">Sold Out</div>
                                        </div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <div className="product-cat">{product.category}</div>
                                    <div className="product-title">{product.title}</div>
                                    <div className="stars">{product.stars}</div>
                                    <div className="product-price">
                                        {product.price}
                                        {product.oldPrice && <strike>{product.oldPrice}</strike>}
                                        {!product.inStock && <span className="out-of-stock-label">Out Of Stock</span>}
                                    </div>
                                    {product.inStock ? (
                                        <button className="btn btn-block" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                                    ) : (
                                        <button className="btn btn-block" disabled style={{ background: '#94a3b8', color: 'white', cursor: 'not-allowed' }}>Out of Stock</button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                                <p>No products match your filters.</p>
                                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={clearAll}>Clear Filters</button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            
            <a href="https://wa.me/1234567890" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Products;
