import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash, ShoppingCart, WhatsappLogo } from '@phosphor-icons/react';
import { cartService } from '../services/cartService';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    const updateCart = () => {
        const items = cartService.getCartItems();
        setCartItems(items);
        
        let sum = 0;
        items.forEach(item => {
            const priceStr = item.price || "0";
            const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
            if(!isNaN(num)) sum += num;
        });
        setTotal(sum);
    };

    useEffect(() => {
        updateCart();
        window.addEventListener('storage', updateCart);
        return () => window.removeEventListener('storage', updateCart);
    }, []);

    const removeItem = (id) => {
        cartService.removeFromCartById(id);
        updateCart();
    };

    const clearCart = () => {
        cartService.clearCart();
        updateCart();
    };

    return (
        <main>
            <div className="container cart-container reveal active" style={{ padding: '4rem 20px', minHeight: '60vh' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Continue Shopping</Link>
                <h1 style={{ marginBottom: '2.5rem', marginTop: '1rem' }}>Your Shopping Cart</h1>
                
                <div id="cart-items">
                    {cartItems.length === 0 ? (
                        <div className="cart-empty" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                            <ShoppingCart size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3>Your cart is empty</h3>
                            <p>Looks like you have not added anything to your cart yet.</p>
                        </div>
                    ) : (
                        cartItems.map((item, index) => (
                            <div key={index} className="cart-item" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                                <img src={item.image} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '8px', background: 'var(--light-bg)' }} />
                                <div className="cart-item-info" style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: '5px' }}>{item.title}</h3>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{item.price}</div>
                                </div>
                                <button className="btn" style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', fontSize: '0.9rem' }} onClick={() => removeItem(item.id)}>
                                    <Trash size={16} /> Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
                
                {cartItems.length > 0 && (
                    <div id="cart-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button className="btn btn-dark" onClick={clearCart} style={{ background: '#ef4444' }}>Clear Cart</button>
                        <div className="cart-total" style={{ textAlign: 'right', fontSize: '1.5rem', fontWeight: 700, marginTop: '20px' }}>
                            Total: ₹<span id="cart-total-price">{total.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ textAligned: 'right', marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={() => alert('Proceeding to Checkout!')}>Proceed to Checkout</button>
                        </div>
                    </div>
                )}
            </div>
            
            <a href="https://wa.me/1234567890" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Cart;
