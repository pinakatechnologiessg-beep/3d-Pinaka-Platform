import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash, ShoppingCart, Heart, WhatsappLogo } from '@phosphor-icons/react';
import { cartService, WISHLIST_UPDATED } from '../services/cartService';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);

    const updateWishlist = () => {
        const items = cartService.getWishlistItems();
        setWishlistItems(items);
    };

    useEffect(() => {
        updateWishlist();
        window.addEventListener(WISHLIST_UPDATED, updateWishlist);
        return () => window.removeEventListener(WISHLIST_UPDATED, updateWishlist);
    }, []);

    const removeItem = (id) => {
        cartService.removeFromWishlistById(id);
        updateWishlist();
    };

    const addToCart = (product) => {
        cartService.addToCart(product);
    };

    return (
        <main>
            <div className="container wishlist-container reveal active" style={{ padding: '4rem 20px', minHeight: '60vh' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Continue Shopping</Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', marginTop: '1rem' }}>
                    <h1 style={{ marginBottom: 0 }}>My Wishlist</h1>
                    {wishlistItems.length > 0 && (
                        <button 
                            className="btn btn-outline-danger" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #f43f5e', color: '#f43f5e', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => cartService.clearWishlist()}
                        >
                            <Trash size={18} /> Remove All
                        </button>
                    )}
                </div>
                
                <div className="products-grid">
                    {wishlistItems.length === 0 ? (
                        <div className="cart-empty" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                            <Heart size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>Your wishlist is empty</h3>
                            <p>Save your favorite printers and materials for later!</p>
                            <Link to="/products" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>Explore Products</Link>
                        </div>
                    ) : (
                        wishlistItems.map((item) => (
                            <div key={item.id} className="product-card" style={{ height: 'auto', display: 'flex', flexDirection: 'column' }}>
                                <button className="wishlist-btn active" onClick={() => removeItem(item.id)}>
                                    <Trash size={18} weight="bold" />
                                </button>
                                <img src={item.image} alt={item.title} className="product-img" style={{ height: '200px' }} />
                                <div className="product-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h5 className="product-title" style={{ fontSize: '1rem', marginBottom: '10px' }}>{item.title}</h5>
                                    <div className="product-price" style={{ marginBottom: '15px' }}>{item.price}</div>
                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-block" onClick={() => addToCart(item)} style={{ flex: 1 }}>Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Wishlist;
