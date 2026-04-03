import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash, ShoppingCart, WhatsappLogo, CheckCircle, Package, MapPin, Phone, User as UserIcon } from '@phosphor-icons/react';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../utils/imageUtils';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        customerName: '',
        phone: '',
        address: ''
    });

    const updateCart = () => {
        const items = cartService.getCartItems();
        setCartItems(items);
        
        let sum = 0;
        items.forEach(item => {
            const priceStr = String(item.price || "0");
            const num = parseInt(priceStr.replace(/[^0-9]/g, ''));
            if(!isNaN(num)) sum += num * (item.quantity || 1);
        });
        setTotal(sum);
    };

    useEffect(() => {
        updateCart();
        window.addEventListener('storage', updateCart);
        window.addEventListener('cartUpdated', updateCart);
        return () => {
            window.removeEventListener('storage', updateCart);
            window.removeEventListener('cartUpdated', updateCart);
        };
    }, []);

    const handleQuantity = (id, amount) => {
        cartService.updateQuantity(id, amount);
        updateCart();
    };

    const removeItem = (id) => {
        cartService.removeFromCartById(id);
        updateCart();
    };

    const clearCart = () => {
        cartService.clearCart();
        updateCart();
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const orderData = {
            customerName: form.customerName,
            phone: form.phone,
            address: form.address,
            productName: cartItems.map(i => i.title).join(', '),
            quantity: cartItems.length,
            totalPrice: total,
            status: 'Pending',
            paymentStatus: 'Unpaid',
            paymentMethod: 'Cash on Delivery'
        };

        try {
            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const data = await res.json();
            if(res.ok) {
                setOrderId(data.orderId);
                setIsOrderSuccess(true);
                cartService.clearCart();
                updateCart();
            } else {
                alert('Order failed: ' + data.message);
            }
        } catch (err) {
            alert('Error network: ' + err.message);
        } finally {
            setLoading(false);
        }
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
                                <img 
                                    src={getImageUrl(item.image)} 
                                    alt={item.title} 
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/fallback.png'; }}
                                    style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '8px', background: 'var(--light-bg)' }} 
                                />
                                <div className="cart-item-info" style={{ flex: 1 }}>
                                    <h3 style={{ marginBottom: '5px' }}>{item.title}</h3>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '10px' }}>{item.price}</div>
                                    
                                    <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Quantity:</span>
                                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                                            <button 
                                                onClick={() => handleQuantity(item.id, -1)}
                                                style={{ border: 'none', background: 'none', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                                            >-</button>
                                            <span style={{ padding: '0 8px', minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity || 1}</span>
                                            <button 
                                                onClick={() => handleQuantity(item.id, 1)}
                                                style={{ border: 'none', background: 'none', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn" style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => removeItem(item.id)}>
                                    <Trash size={16} /> Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
                
                {cartItems.length > 0 && !isOrderSuccess && (
                    <div id="cart-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <button className="btn btn-dark" onClick={clearCart} style={{ background: '#ef4444' }}>Clear Cart</button>
                        <div className="cart-total" style={{ textAlign: 'right', fontSize: '1.5rem', fontWeight: 700, marginTop: '20px' }}>
                            Total: ₹<span id="cart-total-price">{total.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ textAligned: 'right', marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn btn-primary" onClick={() => setIsCheckoutModalOpen(true)}>Proceed to Checkout</button>
                        </div>
                    </div>
                )}

                {isOrderSuccess && (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f0fdf4', borderRadius: '24px', border: '2px solid #bbf7d0', marginTop: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', background: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
                            <CheckCircle size={48} weight="fill" />
                        </div>
                        <h2 style={{ fontSize: '2.5rem', color: '#166534', marginBottom: '0.5rem' }}>Order Confirmed!</h2>
                        <p style={{ color: '#15803d', fontSize: '1.1rem', marginBottom: '2rem' }}>Your order <strong>{orderId}</strong> has been successfully placed.</p>
                        <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>Return to Shop</Link>
                    </div>
                )}

                {isCheckoutModalOpen && !isOrderSuccess && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', maxWidth: '500px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontWeight: 800 }}>Complete Your Order</h2>
                                <button onClick={() => setIsCheckoutModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            </div>
                            <form onSubmit={handleCheckout}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <UserIcon size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="John Doe" />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="+91 XXXX XXX XXX" />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 600 }}>Delivery Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
                                        <textarea required value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', minHeight: '80px' }} placeholder="Building, Street, City..."></textarea>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                                        <span>Grand Total:</span>
                                        <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {loading ? 'Processing...' : 'Confirm Delivery Order'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            
            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Cart;
