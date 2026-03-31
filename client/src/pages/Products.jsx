import React, { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, Heart } from '@phosphor-icons/react';
import { PRODUCTS } from '../constants/data';
import { ANYCUBIC_PRODUCTS } from '../constants/anycubic_data';
import { cartService } from '../services/cartService';

const ALL_PRODUCTS = [
    ...PRODUCTS,
    ...ANYCUBIC_PRODUCTS.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        image: p.image,
        stars: p.stars,
        badge: p.badges?.[0] === 'sale' ? 'Sale' : p.badges?.[0] === 'new' ? 'New' : p.badges?.[0] === 'top' ? 'Top' : undefined,
        badgeStyle: p.badges?.[0] === 'sale' ? { background: '#ef4444', color: 'white' } : undefined
    }))
];

const Products = () => {
    const [searchParams] = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const brandFilter = searchParams.get('brand');
    const revealRefs = useRef([]);

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

    return (
        <main>
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>{brandFilter ? brandFilter : categoryFilter ? categoryFilter : 'All 3D Printers'}</h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Professional FDM, Resin & Industrial Graded Printers</p>
            </div>

            <section className="section container">
                <div className="products-grid">
                    {ALL_PRODUCTS.map((product) => (
                        <div key={product.id} className="product-card reveal" ref={addToRevealRefs}>
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
                            <img src={product.image} alt={product.title} className="product-img" />
                            <div className="product-info">
                                <div className="product-cat">{product.category}</div>
                                <div className="product-title">{product.title}</div>
                                <div className="stars">{product.stars}</div>
                                <div className="product-price">{product.price}</div>
                                <button className="btn btn-block" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            <a href="https://wa.me/1234567890" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Products;
