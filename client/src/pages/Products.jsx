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
    const [showFilter, setShowFilter] = useState(true);
    
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
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn" style={{ textDecoration: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> Back to Home
                </Link>
                <h1 style={{ marginTop: '1.5rem', fontSize: '2.5rem' }}>
                    {searchParams.get('condition') === 'Refurbished' ? 'Refurbished Store' : 'All 3D Printers'}
                </h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Professional 3D Printing solutions by 3DPINAKA</p>
            </div>

            <section className="section container">
                {/* Topbar: Filter Toggle + Sort */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                    <button 
                        onClick={() => setShowFilter(!showFilter)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                        <FunnelSimple size={18} weight="bold" />
                        {showFilter ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>Sort by:</span>
                        <select 
                            value={filters.sort}
                            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', outline: 'none' }}
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
                    {/* Sidebar Filters */}
                    {showFilter && (
                        <aside style={{ width: '280px', flexShrink: 0 }}>
                            {/* Availability */}
                            <div style={{ marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Availability</h4>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
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
                                        <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
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
                                        <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
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
                                    <h3 style={{ fontSize: '1.5rem', color: '#1e293b' }}>Showing {products.length} Products</h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                                    {products.length > 0 ? (
                                        products.map(product => (
                                            <div key={product._id} style={{ background: 'white', borderRadius: '15px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'transform 0.2s', position: 'relative' }}>
                                                <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                                                    <div className="image-wrapper" style={{ height: '220px', marginBottom: '15px' }}>
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
                                                            <div className="stock-badge">
                                                                OUT OF STOCK
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '5px' }}>
                                                        {product.category} | {product.brand}
                                                    </div>
                                                    <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '10px', height: '2.8rem', overflow: 'hidden' }}>{product.name}</h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb' }}>
                                                            ₹{parsePriceLocal(product.price).toLocaleString('en-IN')}
                                                        </div>
                                                        {product.mrp && product.mrp > product.price && (
                                                            <div style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                                                ₹{parsePriceLocal(product.mrp).toLocaleString('en-IN')}
                                                            </div>
                                                        )}
                                                        {product.mrp && product.mrp > product.price && (
                                                            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700, background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>
                                                                {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                                <button 
                                                    disabled={!product.inStock}
                                                    onClick={() => cartService.addToCart(product)}
                                                    style={{ width: '100%', marginTop: '15px', padding: '12px', borderRadius: '10px', border: 'none', background: product.inStock ? '#111827' : '#94a3b8', color: 'white', fontWeight: 600, cursor: product.inStock ? 'pointer' : 'not-allowed' }}
                                                >
                                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                                            <FunnelSimple size={60} style={{ opacity: 0.2, marginBottom: '20px' }} />
                                            <h3>No products matches your filters</h3>
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

            <a href="https://wa.me/918299475268" style={{ position: 'fixed', bottom: '30px', right: '30px', background: '#25d366', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 1000 }} target="_blank" rel="noreferrer">
                <WhatsappLogo size={32} weight="fill" />
            </a>
        </main>
    );
};

export default Products;
