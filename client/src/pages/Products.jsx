import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, FunnelSimple, CaretDown, X } from '@phosphor-icons/react';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../utils/imageUtils';
import { API_BASE_URL } from '../api/config';

const parsePriceLocal = (price) => {
  if (!price) return 0;
  return Number(price.toString().replace(/[^0-9.-]+/g, ""));
};

const Products = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(window.innerWidth > 1024);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // 1. FILTER STATE (INITIALIZED FROM URL)
    const [filters, setFilters] = useState(() => {
        const brand = searchParams.get('brand');
        const category = searchParams.get('category');
        const sort = searchParams.get('sort');
        return {
            brand: brand ? [brand] : [],
            category: category ? [category] : [],
            availability: [],
            minPrice: "",
            maxPrice: "",
            sort: sort || ""
        };
    });

    // Sync filters when searchParams change (navigation-based filtering)
    useEffect(() => {
        const brand = searchParams.get('brand');
        const category = searchParams.get('category');
        const sort = searchParams.get('sort');
        
        setFilters(prev => {
            // Only update if searchParams actually changed from current state to avoid infinite loops
            const brandMatch = brand ? (prev.brand.length === 1 && prev.brand[0].toLowerCase() === brand.toLowerCase()) : (prev.brand.length === 0);
            const catMatch = category ? (prev.category.length === 1 && prev.category[0].toLowerCase() === category.toLowerCase()) : (prev.category.length === 0);
            
            if (brandMatch && catMatch && (sort || "") === prev.sort) return prev;

            return {
                ...prev,
                brand: brand ? [brand] : [],
                category: category ? [category] : [],
                sort: sort || prev.sort
            };
        });
    }, [searchParams]);

    // 2. META STATE (DYNAMIC OPTIONS)
    const [meta, setMeta] = useState({
        brands: [],
        categories: []
    });

    const BASE_URL = API_BASE_URL;

    // 3. LOAD META OPTIONS
    useEffect(() => {
        fetch(`${BASE_URL}/api/products/meta`)
            .then(res => res.json())
            .then(data => {
                console.log("Loaded Meta:", data);
                setMeta(data);
            })
            .catch(err => console.error("Meta fetch error:", err));
    }, [BASE_URL]);

    // 4. API CALL (LOAD PRODUCTS)
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();

                if (filters.brand.length > 0) {
                    query.append("brand", filters.brand.join(","));
                }
                if (filters.category.length > 0) {
                    query.append("category", filters.category.join(","));
                }

                if (filters.availability.length === 1) {
                    const value = filters.availability[0] === "In Stock" ? "in" : "out";
                    query.append("availability", value);
                }

                if (filters.minPrice) query.append("minPrice", filters.minPrice);
                if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
                if (filters.sort) query.append("sort", filters.sort);

                // Handle search and condition from URL
                const cond = searchParams.get('condition');
                if (cond) query.append('condition', cond);
                const q = searchParams.get('q');
                if (q) query.append('q', q);

                const url = `${BASE_URL}/api/products?${query.toString()}`;
                console.log("Fetching Products:", url);

                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    console.log("Fetched Products Data:", data); // Debug Step: Console log API response
                    setProducts(data);
                }
            } catch (err) {
                console.error("Products fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters, searchParams, BASE_URL]);

    const normalize = (val) => val?.toLowerCase().trim() || "";

    const updateFilter = (type, value) => {
        setFilters(prev => {
            const val = normalize(value);
            const exists = prev[type].some(v => normalize(v) === val);
            const updated = exists
                ? prev[type].filter(v => normalize(v) !== val)
                : [...prev[type], value];
            return { ...prev, [type]: updated };
        });
    };

    const clearAll = () => setFilters({
        brand: [],
        category: [],
        availability: [],
        minPrice: "",
        maxPrice: "",
        sort: filters.sort
    });

    return (
        <main>
            {/* Header */}
            <div style={{ background: 'var(--dark-bg)', padding: isMobile ? '2.5rem 1rem' : '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn" style={{ textDecoration: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> Back to Home
                </Link>
                <h1 style={{ marginTop: '1.5rem', fontSize: isMobile ? '1.8rem' : '2.5rem', padding: '0 10px' }}>
                    {searchParams.get('condition') === 'Refurbished' ? 'Refurbished Store' : 'All 3D Printers'}
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>Professional 3D Printing solutions by 3DPINAKA</p>
            </div>

            <section className="section container" style={{ padding: isMobile ? '15px' : undefined }}>
                {/* Topbar: Filter Toggle + Sort */}
                <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between', 
                    alignItems: isMobile ? 'stretch' : 'center', 
                    gap: isMobile ? '15px' : '20px',
                    marginBottom: '30px', 
                    padding: isMobile ? '15px' : '20px', 
                    background: '#f8fafc', 
                    borderRadius: '12px' 
                }}>
                    <button 
                        onClick={() => setShowFilter(!showFilter)}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '8px', 
                            padding: '12px 18px', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '8px', 
                            background: 'white', 
                            fontWeight: 600, 
                            cursor: 'pointer',
                            color: '#1e293b'
                        }}
                    >
                        <FunnelSimple size={18} weight="bold" />
                        {showFilter && !isMobile ? 'Hide Filters' : 'Filter Products'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                        <span style={{ fontWeight: 600, color: '#64748b', fontSize: isMobile ? '0.9rem' : '1rem' }}>Sort by:</span>
                        <select 
                            value={filters.sort}
                            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                            style={{ 
                                padding: '10px 15px', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0', 
                                background: 'white', 
                                cursor: 'pointer', 
                                outline: 'none',
                                flex: isMobile ? 1 : 'none'
                            }}
                        >
                            <option value="">Best Selling</option>
                            <option value="low">Price: Low to High</option>
                            <option value="high">Price: High to Low</option>
                            <option value="az">Alphabetically, A-Z</option>
                            <option value="za">Alphabetically, Z-A</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '40px' }}>
                    {/* Overlay for mobile filter */}
                    {isMobile && showFilter && (
                        <div 
                            onClick={() => setShowFilter(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0,0,0,0.5)',
                                zIndex: 1999,
                                backdropFilter: 'blur(2px)'
                            }}
                        />
                    )}

                    {/* Sidebar Filters */}
                    {(showFilter || !isMobile) && (
                        <aside style={isMobile ? {
                            position: 'fixed',
                            top: 0,
                            right: showFilter ? 0 : '-100%',
                            width: '85%',
                            maxWidth: '320px',
                            height: '100%',
                            background: 'white',
                            zIndex: 2000,
                            padding: '25px',
                            boxShadow: '-5px 0 25px rgba(0,0,0,0.15)',
                            transition: 'right 0.3s ease-in-out',
                            overflowY: 'auto',
                            display: 'block'
                        } : { width: '280px', flexShrink: 0 }}>
                            
                            {isMobile && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Filters</h3>
                                    <button 
                                        onClick={() => setShowFilter(false)} 
                                        style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            {/* Availability */}
                            <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Availability</h4>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={filters.availability.some(v => normalize(v) === normalize('In Stock'))} 
                                        onChange={() => updateFilter('availability', 'In Stock')} 
                                        style={{ width: '18px', height: '18px' }} 
                                    />
                                    <span>In Stock</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={filters.availability.some(v => normalize(v) === normalize('Out of Stock'))} 
                                        onChange={() => updateFilter('availability', 'Out of Stock')} 
                                        style={{ width: '18px', height: '18px' }} 
                                    />
                                    <span>Out of Stock</span>
                                </label>
                            </div>

                            {/* Categories (Dynamic) */}
                            <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Categories</h4>
                                <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                                    {meta.categories.map(cat => (
                                        <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={filters.category.some(v => normalize(v) === normalize(cat))} 
                                                onChange={() => updateFilter('category', cat)} 
                                                style={{ width: '18px', height: '18px' }} 
                                            />
                                            <span>{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brands (Dynamic) */}
                            <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Brands</h4>
                                <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '10px' }}>
                                    {meta.brands.map(brand => (
                                        <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={filters.brand.some(v => normalize(v) === normalize(brand))} 
                                                onChange={() => updateFilter('brand', brand)} 
                                                style={{ width: '18px', height: '18px' }} 
                                            />
                                            <span>{brand}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div style={{ marginBottom: '30px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Price Range</h4>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="number" 
                                        placeholder="Min" 
                                        value={filters.minPrice} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                        style={{ width: '50%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    />
                                    <input 
                                        type="number" 
                                        placeholder="Max" 
                                        value={filters.maxPrice} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                        style={{ width: '50%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    />
                                </div>
                                <button 
                                    onClick={clearAll}
                                    style={{ marginTop: '20px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: '#f1f5f9', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Reset Filters
                                </button>
                                {isMobile && (
                                    <button 
                                        onClick={() => setShowFilter(false)}
                                        style={{ marginTop: '10px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', background: '#111827', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Apply Filters
                                    </button>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* Products Grid */}
                    <div style={{ flex: 1 }}>
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                                <div className="loading-spinner"></div>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', color: '#1e293b' }}>
                                        {products.length} Products Found
                                    </h3>
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'repeat(auto-fill, minmax(280px, 1fr))', 
                                    gap: isMobile ? '15px' : '30px' 
                                }}>
                                    {products.length > 0 ? (
                                        products.map(product => (
                                            <div key={product._id} style={{ 
                                                background: 'white', 
                                                borderRadius: '12px', 
                                                padding: isMobile ? '12px' : '20px', 
                                                border: '1px solid #f1f5f9', 
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.02)', 
                                                transition: 'transform 0.2s', 
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block', flex: 1 }}>
                                                    <div className="image-wrapper" style={{ height: isMobile ? '160px' : '220px', marginBottom: '12px', overflow: 'hidden', borderRadius: '8px' }}>
                                                        <img 
                                                            src={
                                                                product.name === "Refurbished Bambu Lab A1 Mini 3D Printer" 
                                                                ? getImageUrl(product.image).replace(/\s/g, "%20").replace(/\/\//g, "/")
                                                                : getImageUrl(product.image)
                                                            }
                                                            alt={product.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => (e.target.src = "/placeholder.png")}
                                                        />
                                                        {!product.inStock && (
                                                            <div className="stock-badge" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                                                                OUT OF STOCK
                                                            </div>
                                                        )}
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
                                                        lineHeight: 1.3
                                                    }}>{product.name}</h3>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: 'auto' }}>
                                                        <div style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', fontWeight: 800, color: '#2563eb' }}>
                                                            ₹{parsePriceLocal(product.price).toLocaleString('en-IN')}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {product.mrp && product.mrp > product.price && (
                                                                <div style={{ fontSize: isMobile ? '0.8rem' : '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                                                    ₹{parsePriceLocal(product.mrp).toLocaleString('en-IN')}
                                                                </div>
                                                            )}
                                                            {product.mrp && product.mrp > product.price && (
                                                                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, background: '#f0fdf4', padding: '2px 4px', borderRadius: '4px' }}>
                                                                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                                <button 
                                                    disabled={!product.inStock}
                                                    onClick={() => cartService.addToCart(product)}
                                                    style={{ 
                                                        width: '100%', 
                                                        marginTop: '12px', 
                                                        padding: isMobile ? '10px' : '12px', 
                                                        borderRadius: '8px', 
                                                        border: 'none', 
                                                        background: product.inStock ? '#111827' : '#94a3b8', 
                                                        color: 'white', 
                                                        fontWeight: 600, 
                                                        cursor: product.inStock ? 'pointer' : 'not-allowed',
                                                        fontSize: isMobile ? '0.85rem' : '1rem'
                                                    }}
                                                >
                                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
                                            <FunnelSimple size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                            <h3>No products match your filters</h3>
                                            <p style={{ color: '#64748b' }}>Try clearing some filters or search for something else.</p>
                                            <button onClick={clearAll} style={{ marginTop: '20px', padding: '10px 25px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Clear All</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <a href="https://wa.me/918299475268" style={{ 
                position: 'fixed', 
                bottom: isMobile ? '90px' : '30px', 
                right: '20px', 
                background: '#25d366', 
                color: 'white', 
                width: isMobile ? '50px' : '60px', 
                height: isMobile ? '50px' : '60px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                zIndex: 1000 
            }} target="_blank" rel="noreferrer">
                <WhatsappLogo size={isMobile ? 28 : 32} weight="fill" />
            </a>
        </main>
    );
};

export default Products;
