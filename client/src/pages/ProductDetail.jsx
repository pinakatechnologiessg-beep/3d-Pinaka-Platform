import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, WhatsappLogo, ArrowLeft, Plus, Minus, CheckCircle, Truck, ShieldCheck, ArrowsCounterClockwise } from '@phosphor-icons/react';
import ProductImageZoom from '../components/ProductImageZoom';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../utils/imageUtils';
import './ProductDetail.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    
    // Review form state
    const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${BASE_URL}/api/products/${id}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                console.log("Product Detail Data:", data); // Debug Step: Console log API response
                setProduct(data);
                
                // Fetch related products
                const relatedRes = await fetch(`${BASE_URL}/api/products?category=${data.category}`);
                if (relatedRes.ok) {
                    const relatedData = await relatedRes.json();
                    setRelatedProducts(relatedData.filter(p => p._id !== id).slice(0, 4));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await fetch(`${BASE_URL}/api/products/${id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewForm)
            });
            if (res.ok) {
                const updatedProduct = await res.json();
                setProduct(updatedProduct);
                setReviewForm({ userName: '', rating: 5, comment: '' });
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Review added successfully!', type: 'success' } }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingReview(false);
        }
    };

    const getRatingStats = (reviews = []) => {
        const total = reviews.length;
        const counts = [0, 0, 0, 0, 0]; // 1-5
        reviews.forEach(r => {
            const star = Math.round(r.rating);
            if (star >= 1 && star <= 5) counts[star - 1]++;
        });
        return counts.map((count, i) => ({
            star: i + 1,
            count,
            percent: total ? (count / total) * 100 : 0
        })).reverse();
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;
    if (error) return <div className="error-container"><h2>{error}</h2><Link to="/products" className="btn">Back to Products</Link></div>;
    if (!product) return null;

    const stats = getRatingStats(product.reviews);
    const avgRating = product.reviews?.length > 0 
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
        : 5.0;

    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
    
    let imageUrl = getImageUrl(product.image);
    // DEBUG and targeted fix for specific product without affecting global logic
    if (product.name === "Refurbished Bambu Lab A1 Mini 3D Printer") {
        console.log("Debugging specific product image:", product.image);
        imageUrl = imageUrl.replace(/\s/g, "%20").replace(/\/\//g, "/");
    }

    return (
        <main className="product-detail-page">
            <div className="container">
                <nav className="breadcrumb">
                    <Link to="/"><ArrowLeft size={16} /> Home</Link>
                    <span>/</span>
                    <Link to="/products">Shop</Link>
                    <span>/</span>
                    <Link to={`/products?category=${product.category}`}>{product.category}</Link>
                    <span>/</span>
                    <span className="current">{product.name}</span>
                </nav>

                <div className="product-main">
                    <div className="product-gallery">
                        <div className="main-image">
                            <ProductImageZoom image={imageUrl} alt={product.name} />
                        </div>
                    </div>

                    <div className="product-info-panel">
                        <div className="brand-badge">{product.brand}</div>
                        <h1 className="product-title">{product.name}</h1>
                        
                        <div className="rating-summary">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={18} 
                                        weight={i < Math.floor(product.rating || 0) ? "fill" : "regular"} 
                                        color={i < Math.floor(product.rating || 0) ? "#f59e0b" : "#cbd5e1"}
                                    />
                                ))}
                            </div>
                            <span className="rating-text">({product.rating?.toFixed(1) || '5.0'})</span>
                            <span className="review-count">{product.reviews?.length || 0} reviews</span>
                        </div>

                        <div className="price-section">
                            <div className="current-price">₹{product.price?.toLocaleString('en-IN')}</div>
                            {product.mrp > product.price && (
                                <>
                                    <div className="mrp-price">MRP: ₹{product.mrp?.toLocaleString('en-IN')}</div>
                                    <div className="discount-tag">{discount}% OFF</div>
                                </>
                            )}
                        </div>

                        <div className="stock-status">
                            {product.inStock ? (
                                <span className="in-stock"><CheckCircle size={18} weight="fill" /> In Stock</span>
                            ) : (
                                <span className="out-of-stock">Currently Out of Stock</span>
                            )}
                        </div>

                        <div className="action-area">
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}><Minus size={16} /></button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(prev => prev + 1)}><Plus size={16} /></button>
                            </div>
                            <button 
                                className="btn btn-primary add-to-cart-btn" 
                                disabled={!product.inStock}
                                onClick={() => cartService.addToCart(product, quantity)}
                            >
                                <ShoppingCart size={20} weight="bold" /> Add to Cart
                            </button>
                            <button 
                                className="wishlist-btn-secondary"
                                onClick={() => cartService.toggleWishlist(product)}
                            >
                                <Heart size={24} />
                            </button>
                        </div>

                        <div className="trust-badges">
                            <div className="badge-item">
                                <Truck size={24} />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="badge-item">
                                <ShieldCheck size={24} />
                                <span>1 Year Warranty</span>
                            </div>
                            <div className="badge-item">
                                <ArrowsCounterClockwise size={24} />
                                <span>Easy Returns</span>
                            </div>
                        </div>

                        <div className="whatsapp-inquiry">
                            <a href={`https://wa.me/918299475268?text=I'm interested in ${product.name}`} target="_blank" rel="noreferrer">
                                <WhatsappLogo size={20} weight="fill" /> Inquiry on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                <div className="product-tabs-container">
                    <div className="tabs-header">
                        <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</button>
                        <button className={activeTab === 'specifications' ? 'active' : ''} onClick={() => setActiveTab('specifications')}>Specifications</button>
                        <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews ({product.reviews?.length || 0})</button>
                    </div>
                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="description-content">
                                {product.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
                                ) : (
                                    <p>No description available for this product.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'specifications' && (
                            <div className="specs-content">
                                {product.specifications && product.specifications.length > 0 ? (
                                    <table className="specs-table">
                                        <tbody>
                                            {product.specifications.map((spec, i) => (
                                                <tr key={i}>
                                                    <td className="spec-key">{spec.key}</td>
                                                    <td className="spec-value">{spec.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No specifications available.</p>
                                )}
                            </div>
                        )}
                        {activeTab === 'reviews' && (
                            <div className="reviews-content">
                                <div className="reviews-stats-overview">
                                    <div className="overall-rating">
                                        <div className="big-avg">{avgRating.toFixed(1)}</div>
                                        <div className="avg-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={22} 
                                                    weight={i < Math.floor(avgRating) ? "fill" : "regular"} 
                                                    color="#f59e0b"
                                                />
                                            ))}
                                        </div>
                                        <div className="total-revs">{product.reviews?.length || 0} Reviews</div>
                                    </div>
                                    
                                    <div className="rating-breakdown">
                                        {stats.map((item) => (
                                            <div key={item.star} className="rating-row">
                                                <span className="star-label">{item.star} Star</span>
                                                <div className="bar">
                                                    <div 
                                                        className="fill"
                                                        style={{ width: `${item.percent}%` }}
                                                    ></div>
                                                </div>
                                                <span className="percent-label">{Math.round(item.percent)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="reviews-list">
                                    {product.reviews && product.reviews.length > 0 ? (
                                        product.reviews.map((review, i) => (
                                            <div key={i} className="review-card">
                                                <div className="review-header">
                                                    <strong>{review.userName}</strong>
                                                    <div className="review-stars">
                                                        {[...Array(5)].map((_, starI) => (
                                                            <Star 
                                                                key={starI} 
                                                                size={14} 
                                                                weight={starI < review.rating ? "fill" : "regular"} 
                                                                color="#f59e0b"
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="review-comment">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No reviews yet. Be the first to review!</p>
                                    )}
                                </div>

                                <div className="add-review-section">
                                    <h3>Add a Review</h3>
                                    <form onSubmit={handleAddReview} className="review-form">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={reviewForm.userName}
                                                onChange={(e) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                                                placeholder="Your Name"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Rating</label>
                                            <select 
                                                value={reviewForm.rating}
                                                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                            >
                                                <option value="5">5 Stars</option>
                                                <option value="4">4 Stars</option>
                                                <option value="3">3 Stars</option>
                                                <option value="2">2 Stars</option>
                                                <option value="1">1 Star</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Comment</label>
                                            <textarea 
                                                required 
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                placeholder="Share your thoughts about this product..."
                                                rows="4"
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                                            {submittingReview ? 'Submitting...' : 'Post Review'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <section className="related-products">
                        <h2 className="section-title">Related Products</h2>
                        <div className="products-grid">
                            {relatedProducts.map(p => (
                                <Link to={`/product/${p._id}`} key={p._id} className="product-card">
                                    <div className="product-img-wrapper">
                                        <img 
                                            src={getImageUrl(p.image)} 
                                            alt={p.name} 
                                        />
                                    </div>
                                    <div className="product-info">
                                        <div className="product-title">{p.name}</div>
                                        <div className="product-price" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 700, color: '#2563eb' }}>₹{p.price?.toLocaleString('en-IN')}</span>
                                            {p.mrp && p.mrp > p.price && (
                                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{p.mrp?.toLocaleString('en-IN')}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
};

export default ProductDetail;
