import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { ArrowLeft, Trash, ShoppingCart, WhatsappLogo, CheckCircle, Package, MapPin, Phone, User as UserIcon, X } from '@phosphor-icons/react';
import { cartService, SHOW_TOAST } from '../services/cartService';
import { getImageUrl } from '../utils/imageUtils';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isOrderSuccess, setIsOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        customerEmail: '',
        companyName: '',
        gstNumber: '',
        streetAddress: '',
        streetAddress2: '',
        city: '',
        state: '',
        postcode: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    
    useEffect(() => {
        if (cartItems.length === 0) {
            setTimeLeft(600);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    clearCart();
                    window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
                        detail: { message: 'Cart expired! Items have been released.', type: 'error' } 
                    }));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [cartItems.length]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setForm(prev => ({
                    ...prev,
                    firstName: user.firstName || user.name?.split(' ')[0] || '',
                    lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
                    phone: user.mobile || '',
                    customerEmail: user.email || ''
                }));
            } catch (e) { /* ignore */ }
        }
    }, []);

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

        // Phone validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(form.phone)) {
            window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
                detail: { message: 'Invalid phone number. Must be 10 digits.', type: 'error' } 
            }));
            return;
        }

        setLoading(true);
        
        const orderData = {
            firstName: form.firstName,
            lastName: form.lastName,
            customerName: `${form.firstName} ${form.lastName}`.trim(),
            customerEmail: form.customerEmail,
            phone: form.phone,
            companyName: form.companyName,
            gstNumber: form.gstNumber,
            streetAddress: form.streetAddress,
            streetAddress2: form.streetAddress2,
            city: form.city,
            state: form.state,
            postcode: form.postcode,
            address: `${form.streetAddress}, ${form.streetAddress2 ? form.streetAddress2 + ', ' : ''}${form.city}, ${form.state} - ${form.postcode}`,
            productName: cartItems.map(i => i.title).join(', '),
            quantity: cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0),
            items: cartItems.map(i => ({
                productId: i.productId,
                productName: i.title,
                quantity: i.quantity || 1,
                price: i.price
            })),
            totalPrice: total,
            status: 'Pending',
            paymentStatus: paymentMethod === 'Online' ? 'Unpaid' : 'Pending',
            paymentMethod: paymentMethod === 'Online' ? 'Razorpay' : 'Cash on Delivery'
        };

        try {
            const res = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            const data = await res.json();
            
            if(res.ok) {
                if (paymentMethod === 'Online') {
                    // Initialize Razorpay
                    const options = {
                        key: data.razorpayKeyId,
                        amount: data.totalPrice * 100,
                        currency: "INR",
                        name: "3D Pinaka",
                        description: "Purchase from 3D Pinaka",
                        order_id: data.razorpayOrderId,
                        handler: async function (response) {
                            // Verify Payment
                            const verifyRes = await fetch(`${API_BASE_URL}/api/orders/verify`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: data.orderId
                                })
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                setOrderId(data.orderId);
                                setIsOrderSuccess(true);
                                cartService.clearCart();
                                updateCart();
                            } else {
                                alert("Payment verification failed: " + verifyData.message);
                            }
                        },
                        prefill: {
                            name: `${form.firstName} ${form.lastName}`.trim(),
                            contact: form.phone,
                            email: form.customerEmail
                        },
                        theme: {
                            color: "#1e293b"
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    setOrderId(data.orderId);
                    setIsOrderSuccess(true);
                    cartService.clearCart();
                    updateCart();
                }
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
                <h1 style={{ marginBottom: '2.5rem', marginTop: '1rem', fontSize: '2rem', fontWeight: 800 }}>Shopping Cart</h1>
                
                <div style={{ 
                    background: timeLeft < 60 ? '#fee2e2' : '#f0fdf4', 
                    color: timeLeft < 60 ? '#991b1b' : '#166534', 
                    padding: '10px 15px', 
                    borderRadius: '8px', 
                    marginBottom: '20px', 
                    fontSize: '0.9rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    border: timeLeft < 60 ? '1px solid #fecaca' : '1px solid #bbf7d0',
                    transition: 'all 0.3s ease'
                }}>
                    <span role="img" aria-label="clock">⏰</span> 
                    {cartItems.length > 0 
                        ? `Items reserved for ${formatTime(timeLeft)}` 
                        : "Cart is empty"
                    }
                </div>
                
                <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '2rem', alignItems: 'start' }}>
                    <div id="cart-items-section">
                        {cartItems.length === 0 ? (
                            <div className="cart-empty" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                <ShoppingCart size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <h3>Your cart is empty</h3>
                                <p>Looks like you have not added anything to your cart yet.</p>
                            </div>
                        ) : (
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Cart Summary</h2>
                                {cartItems.map((item, index) => (
                                    <div key={index} className="cart-item-new" style={{ display: 'flex', gap: '15px', padding: '15px 0', borderBottom: index === cartItems.length - 1 ? 'none' : '1px dotted #e2e8f0' }}>
                                        <div style={{ width: '80px', height: '80px', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '5px', flexShrink: 0 }}>
                                            <img 
                                                src={getImageUrl(item.image)} 
                                                alt={item.title} 
                                                onError={(e) => (e.target.src = "/placeholder.png")}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginBottom: '8px', lineHeight: '1.4' }}>{item.title}</h4>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                                    ₹{item.price} <span style={{ margin: '0 4px' }}>×</span> {item.quantity || 1}
                                                </div>
                                                <div style={{ fontWeight: 700, color: '#4338ca' }}>
                                                    ₹{(parseInt(String(item.price).replace(/[^0-9]/g, '')) * (item.quantity || 1)).toLocaleString('en-IN')}
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                    <button onClick={() => handleQuantity(item.id, -1)} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>-</button>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity || 1}</span>
                                                    <button onClick={() => handleQuantity(item.id, 1)} style={{ border: 'none', background: 'none', padding: '2px 8px', cursor: 'pointer' }}>+</button>
                                                </div>
                                                <button onClick={() => removeItem(item.id)} style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {cartItems.length > 0 && (
                                    <button className="btn" onClick={clearCart} style={{ color: '#ef4444', background: 'transparent', padding: '5px 0', fontSize: '0.9rem', marginTop: '15px' }}>Clear All Items</button>
                                )}
                            </div>
                        )}
                    </div>

                    <div id="billing-summary-section">
                        {cartItems.length > 0 && !isOrderSuccess && (
                            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1e293b' }}>Billing Summary</h2>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: '#64748b' }}>Subtotal</span>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>₹{total.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: '#64748b' }}>Coupon Discount</span>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No coupon applied</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dotted #e2e8f0' }}>
                                    <span style={{ color: '#64748b' }}>Apply Robu Points</span>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No points applied</span>
                                </div>

                                <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '12px 0', fontStyle: 'italic' }}>
                                    You can use either a coupon or points, but not both at the same time.
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ color: '#64748b' }}>Total with GST</span>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: '#334155' }}>₹{total.toLocaleString('en-IN')}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(Incl. GST)</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16a34a' }}>Grand Total</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>₹{total.toLocaleString('en-IN')}</span>
                                </div>

                                <div style={{ background: '#4338ca', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>Points Earned</span>
                                    <div style={{ background: 'white', color: '#4338ca', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {Math.floor(total/100)} points
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                    <label style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>
                                        <input type="checkbox" required />
                                        <span>I have read and agree to the website <Link to="/terms" style={{ color: 'var(--primary)' }}>Terms of Conditions*</Link></span>
                                    </label>
                                    <label style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#64748b', cursor: 'pointer', alignItems: 'center' }}>
                                        <input type="checkbox" />
                                        <span><WhatsappLogo size={18} color="#25D366" weight="fill" style={{ verticalAlign: 'middle', marginRight: '4px' }} /> I want to receive order updates on WhatsApp</span>
                                    </label>
                                </div>

                                <button 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', padding: '15px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 800 }}
                                    onClick={() => {
                                        const storedUser = localStorage.getItem('user');
                                        if (!storedUser) {
                                            window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
                                                detail: { message: 'Please login to continue', type: 'error' } 
                                            }));
                                            setTimeout(() => navigate('/login'), 2000);
                                            return;
                                        }
                                        setIsCheckoutModalOpen(true);
                                    }}
                                >
                                    PROCEED TO CHECKOUT
                                </button>
                            </div>
                        )}
                    </div>
                </div>

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
                    <div style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        background: 'rgba(0,0,0,0.6)', 
                        zIndex: 1000, 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        justifyContent: 'center', 
                        backdropFilter: 'blur(4px)',
                        overflowY: 'auto',
                        padding: '2rem 1rem'
                    }}>
                        <div style={{ 
                            background: 'white', 
                            padding: '2.5rem', 
                            borderRadius: '20px', 
                            maxWidth: '500px', 
                            width: '100%', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            position: 'relative',
                            marginTop: '2rem',
                            marginBottom: '2rem'
                        }}>
                            <button 
                                onClick={() => setIsCheckoutModalOpen(false)} 
                                style={{ 
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    background: '#f1f5f9', 
                                    border: 'none', 
                                    padding: '8px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748b',
                                    zIndex: 10,
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            >
                                <X size={20} weight="bold" />
                            </button>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontWeight: 800 }}>Complete Your Order</h2>
                            </div>                            <form onSubmit={handleCheckout} style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>First Name*</label>
                                        <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="First Name" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Last Name*</label>
                                        <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="Last Name" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Company Name (Optional)</label>
                                    <input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="Business Entity" />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>GST Number (Optional)</label>
                                    <input value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="GSTIN" />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Email Address*</label>
                                    <input required type="email" value={form.customerEmail} onChange={e => setForm({...form, customerEmail: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="email@address.com" />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Street Address*</label>
                                    <input required value={form.streetAddress} onChange={e => setForm({...form, streetAddress: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', marginBottom: '10px' }} placeholder="House number and street name" />
                                    <input value={form.streetAddress2} onChange={e => setForm({...form, streetAddress2: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="Apartment, suite, unit, etc. (optional)" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>State*</label>
                                        <input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="State" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>City*</label>
                                        <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="Town / City" />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Postcode*</label>
                                        <input required value={form.postcode} onChange={e => setForm({...form, postcode: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="PIN code" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Phone*</label>
                                        <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="10-digit number" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '10px', fontWeight: 600 }}>Payment Method</label>
                                    <div 
                                        style={{ 
                                            padding: '12px', 
                                            borderRadius: '10px', 
                                            border: `2px solid var(--primary)`,
                                            background: '#f0f9ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        <CheckCircle size={20} weight="fill" color="var(--primary)" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Secure Online Payment (Razorpay)</span>
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
