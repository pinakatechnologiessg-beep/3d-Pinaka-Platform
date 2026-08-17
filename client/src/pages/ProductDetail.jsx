import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, WhatsappLogo, ArrowLeft, Plus, Minus, CheckCircle, Truck, ShieldCheck, ArrowsCounterClockwise, Receipt } from '@phosphor-icons/react';
import ProductImageZoom from '../components/ProductImageZoom';
import { cartService, SHOW_TOAST, WISHLIST_UPDATED } from '../services/cartService';
import { getImageUrl, PLACEHOLDER_SVG } from '../utils/imageUtils';
import { API_BASE_URL } from '../api/config';
import SEO from '../components/SEO';
import { generateProductSlug } from '../utils/stringUtils';
import './ProductDetail.css';


const BASE_URL = API_BASE_URL;

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    
    // Review form state
    const [reviewForm, setReviewForm] = useState({ userName: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${BASE_URL}/api/products/${id}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                console.log("Product Detail Data:", data); // Debug Step: Console log API response
                setProduct(data);
                setActiveImage(getImageUrl(data.image));
                // Fetch related products safely
                try {
                    const categoryUrl = `${BASE_URL}/api/products?category=${encodeURIComponent(data.category || '')}`;
                    const relatedRes = await fetch(categoryUrl);
                    if (relatedRes.ok) {
                        const relatedText = await relatedRes.text();
                        try {
                            const relatedData = JSON.parse(relatedText);
                            setRelatedProducts(relatedData.filter(p => p._id !== data._id).slice(0, 4));
                        } catch (parseErr) {
                            console.warn("Failed to parse related products JSON");
                        }
                    }
                } catch (relatedErr) {
                    console.warn("Failed to fetch related products");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();

        const checkWishlistStatus = () => {
            setIsInWishlist(cartService.isInWishlist(id));
        };
        checkWishlistStatus();
        window.addEventListener(WISHLIST_UPDATED, checkWishlistStatus);
        return () => window.removeEventListener(WISHLIST_UPDATED, checkWishlistStatus);
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
                window.dispatchEvent(new CustomEvent(SHOW_TOAST, { detail: { message: 'Review added successfully!', type: 'success' } }));
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

    const handleBuyNow = () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
                detail: { message: 'not loged in pls login', type: 'error' } 
            }));
            setTimeout(() => navigate('/login'), 2000);
            return;
        }
        cartService.addToCart(product, quantity);
        navigate('/cart');
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;
    if (error) return (
        <div className="error-container">
            <SEO title="Product Not Found" noindex={true} />
            <h2>{error}</h2>
            <Link to="/products" className="btn">Back to Products</Link>
        </div>
    );
    if (!product) return null;

    const stats = getRatingStats(product.reviews);
    const avgRating = product.reviews?.length > 0 
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length 
        : 5.0;

    const discount = product.discount || (product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);
    
    let imageUrl = getImageUrl(product.image);
    // DEBUG and targeted fix for specific product without affecting global logic
    if (product.name === "Refurbished Bambu Lab A1 Mini 3D Printer") {
        console.log("Debugging specific product image:", product.image);
        imageUrl = imageUrl.replace(/\s/g, "%20").replace(/\/\//g, "/");
    }

    return (
        <main className="product-detail-page">
            <SEO 
                title={product.name} 
                description={product.description?.substring(0, 160) || `Buy ${product.name} at PINAKA TECHNOLOGIES SG PRIVATE LIMITED. High-quality 3D printer and materials.`}
                keywords={`${product.name}, ${product.brand}, ${product.category}, PINAKA TECHNOLOGIES SG PRIVATE LIMITED, buy 3D printer India`}
                image={imageUrl}
                type="product"
                productData={product}
            />
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
                            <ProductImageZoom 
                              image={activeImage || imageUrl} 
                              alt={product.name}
                              allImages={[imageUrl, ...(product.images || []).map(img => getImageUrl(img))]}
                            />
                        </div>
                        {product.images && product.images.length > 0 && (
                            <div className="thumbnail-gallery" style={{ display: 'flex', gap: '10px', marginTop: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
                                <div 
                                    className={`thumbnail-item ${activeImage === imageUrl ? 'active' : ''}`}
                                    onClick={() => setActiveImage(imageUrl)}
                                    style={{ width: '70px', height: '70px', borderRadius: '8px', border: `2px solid ${activeImage === imageUrl ? 'var(--primary)' : 'var(--border-color)'}`, overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
                                >
                                    <img src={imageUrl} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                {product.images.map((img, i) => {
                                    const thumbUrl = getImageUrl(img);
                                    return (
                                        <div 
                                            key={i}
                                            className={`thumbnail-item ${activeImage === thumbUrl ? 'active' : ''}`}
                                            onClick={() => setActiveImage(thumbUrl)}
                                            style={{ width: '70px', height: '70px', borderRadius: '8px', border: `2px solid ${activeImage === thumbUrl ? 'var(--primary)' : 'var(--border-color)'}`, overflow: 'hidden', cursor: 'pointer', flexShrink: 0 }}
                                        >
                                            <img src={thumbUrl} alt={`thumbnail ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                                        color={i < Math.floor(product.rating || 0) ? "var(--warning)" : "#cbd5e1"}
                                    />
                                ))}
                            </div>
                            <span className="rating-text">({product.rating?.toFixed(1) || '5.0'})</span>
                            <span className="review-count">{product.reviews?.length || 0} reviews</span>
                        </div>

                        <div className="price-section">
                            <div className="current-price">₹{product.price?.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            {product.mrp > product.price && (
                                <>
                                    <div className="mrp-price">MRP: ₹{product.mrp?.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                    <div className="discount-tag">{discount}% OFF</div>
                                </>
                            )}
                        </div>

                        <div className="stock-status">
                            {product.inStock && product.stockQuantity > 0 ? (
                                <>
                                    <span className="in-stock"><CheckCircle size={18} weight="fill" /> In Stock</span>
                                    {product.stockQuantity < 10 && (
                                        <span className="low-stock-warning" style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600, marginLeft: '10px' }}>
                                            Only {product.stockQuantity} left!
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span className="out-of-stock" style={{ color: '#ef4444', fontWeight: 700 }}>Out of Stock</span>
                            )}
                        </div>

                        <div className="action-area">
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} disabled={!product.inStock || product.stockQuantity <= 0}><Minus size={16} /></button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(prev => Math.min(product.stockQuantity || 0, prev + 1))} disabled={!product.inStock || product.stockQuantity <= 0 || quantity >= product.stockQuantity}><Plus size={16} /></button>
                            </div>
                            <button 
                                className="btn btn-primary add-to-cart-btn" 
                                disabled={!product.inStock || product.stockQuantity <= 0}
                                onClick={() => cartService.addToCart(product, quantity)}
                            >
                                <ShoppingCart size={20} weight="bold" /> Add to Cart
                            </button>
                             <button 
                                className={`wishlist-btn-secondary ${isInWishlist ? 'active' : ''}`}
                                onClick={() => cartService.toggleWishlist(product)}
                            >
                                <Heart size={24} weight={isInWishlist ? "fill" : "regular"} />
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
                            <div className="badge-item" style={{ gridColumn: 'span 3', background: 'var(--primary-light, var(--border-color))', border: '1px solid var(--primary, var(--primary))', color: 'var(--primary, var(--primary))' }}>
                                <Receipt size={24} />
                                <span style={{ fontWeight: 600 }}>GST Invoice Available</span>
                            </div>
                        </div>

                        <div className="buy-now-section" style={{ marginTop: '2rem' }}>
                            <button 
                                onClick={handleBuyNow}
                                style={{ 
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    backgroundColor: (!product.inStock || product.stockQuantity <= 0) ? 'var(--text-muted)' : 'var(--success)',
                                    color: 'white',
                                    padding: '1.1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    outline: 'none',
                                    cursor: (!product.inStock || product.stockQuantity <= 0) ? 'not-allowed' : 'pointer',
                                    fontWeight: 800,
                                    fontSize: '1.2rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: (!product.inStock || product.stockQuantity <= 0) ? 'none' : '0 10px 20px -5px rgba(16, 185, 129, 0.3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    opacity: (!product.inStock || product.stockQuantity <= 0) ? 0.6 : 1
                                }}
                                disabled={!product.inStock || product.stockQuantity <= 0}
                            >
                                <CheckCircle size={24} weight="bold" /> Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                <div className="product-tabs-container">
                    <div className="tabs-header">
                        <button className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</button>
                        <button className={activeTab === 'specifications' ? 'active' : ''} onClick={() => setActiveTab('specifications')}>Specifications</button>
                        <button className={activeTab === 'features' ? 'active' : ''} onClick={() => setActiveTab('features')}>Features & Contents</button>
                        <button className={activeTab === 'shipping' ? 'active' : ''} onClick={() => setActiveTab('shipping')}>Shipping & Warranty</button>
                        <button className={activeTab === 'faqs' ? 'active' : ''} onClick={() => setActiveTab('faqs')}>FAQs</button>
                        <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>Reviews ({product.reviews?.length || 0})</button>
                    </div>
                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="description-content">
                                {product.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: (product.description.includes('<') && product.description.includes('>')) ? product.description : product.description.replace(/\n/g, '<br/>') }} />
                                ) : (
                                    <p>No description available for this product.</p>
                                )}
                                {product.descriptionImages && product.descriptionImages.length > 0 && (
                                    <div className="description-images-gallery" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {product.descriptionImages.map((img, i) => (
                                            <img key={i} src={getImageUrl(img)} alt={`${product.name} detail ${i + 1}`} style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', objectFit: 'contain', maxHeight: '500px' }} />
                                        ))}
                                    </div>
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
                        {activeTab === 'features' && (
                            <div className="features-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                <div>
                                    <h3 style={{ marginBottom: '15px', color: 'var(--text-dark)' }}>Features & Benefits</h3>
                                    {product.features && product.features.length > 0 ? (
                                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.8', color: '#475569' }}>
                                            {product.features.map((feature, i) => (
                                                <li key={i}>{feature}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>High-quality construction with premium materials. Reliable performance and excellent value.</p>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ marginBottom: '15px', color: 'var(--text-dark)' }}>Package Contents</h3>
                                    {product.packageContents && product.packageContents.length > 0 ? (
                                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.8', color: '#475569' }}>
                                            {product.packageContents.map((item, i) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>1x {product.name}<br/>1x User Manual<br/>Standard Accessories included.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'shipping' && (
                            <div className="shipping-content">
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-dark)' }}>Shipping Information</h3>
                                <p style={{ lineHeight: '1.8', color: '#475569', marginBottom: '20px' }}>
                                    {product.shippingInfo || 'Ships within 24-48 hours. Free standard delivery on all orders above ₹5,000. Express shipping options available at checkout.'}
                                </p>
                                
                                <h3 style={{ marginBottom: '15px', color: 'var(--text-dark)' }}>Warranty & Support</h3>
                                <p style={{ lineHeight: '1.8', color: '#475569', marginBottom: '20px' }}>
                                    {product.warrantyInfo || '1 Year Standard Warranty. Covers manufacturing defects. Dedicated technical support team available for troubleshooting.'}
                                </p>

                                <div style={{ background: 'var(--light-bg)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--primary)', marginTop: '20px' }}>
                                    <strong>GST Invoice:</strong> A proper tax invoice with GST details will be provided with this product, allowing businesses to claim input tax credit (ITC).
                                </div>
                            </div>
                        )}
                        {activeTab === 'faqs' && (
                            <div className="faqs-content">
                                {product.faqs && product.faqs.length > 0 ? (
                                    <div className="faq-list">
                                        {product.faqs.map((faq, i) => (
                                            <div key={i} style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                                                <h4 style={{ color: 'var(--text-dark)', marginBottom: '8px', fontSize: '1.1rem' }}>Q: {faq.question}</h4>
                                                <p style={{ color: '#475569', lineHeight: '1.6' }}>A: {faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="faq-list">
                                        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                                            <h4 style={{ color: 'var(--text-dark)', marginBottom: '8px', fontSize: '1.1rem' }}>Q: Is this product authentic?</h4>
                                            <p style={{ color: '#475569', lineHeight: '1.6' }}>A: Yes, all our products are 100% authentic and sourced directly from manufacturers or authorized distributors.</p>
                                        </div>
                                        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                                            <h4 style={{ color: 'var(--text-dark)', marginBottom: '8px', fontSize: '1.1rem' }}>Q: Do you offer technical support?</h4>
                                            <p style={{ color: '#475569', lineHeight: '1.6' }}>A: Absolutely. We have a dedicated support team that can help you with setup and troubleshooting.</p>
                                        </div>
                                    </div>
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
                                                    color="var(--warning)"
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
                                                                color="var(--warning)"
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


            </div>
        </main>
    );
};

export default ProductDetail;
