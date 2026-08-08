import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { ArrowLeft, Trash, ShoppingCart, WhatsappLogo, CheckCircle, Package, MapPin, Phone, User as UserIcon, X } from '@phosphor-icons/react';
import { cartService, SHOW_TOAST } from '../services/cartService';
import { getImageUrl } from '../utils/imageUtils';
import { generateProductSlug } from '../utils/stringUtils';

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
    const [availablePoints, setAvailablePoints] = useState(0);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [appliedPoints, setAppliedPoints] = useState(0);

    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);

    


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
                setAvailablePoints(user.points || 0);
            } catch (e) { /* ignore */ }
        }

        const fetchCoupons = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/coupons`);
                if (res.ok) setAvailableCoupons(await res.json());
            } catch (err) {}
        };
        fetchCoupons();
    }, []);

    const applyPoints = (amount) => {
        const pts = Math.min(availablePoints, amount, total);
        setAppliedPoints(pts);
        setPointsToUse(pts);
        setAppliedCoupon(null); // Clear coupon if points applied
        setCouponDiscount(0);
    };

    const useAllPoints = () => {
        const pts = Math.min(availablePoints, total);
        setAppliedPoints(pts);
        setPointsToUse(pts);
        setAppliedCoupon(null); // Clear coupon if points applied
        setCouponDiscount(0);
    };

    const applyCoupon = async (codeOverride) => {
        const codeToApply = codeOverride || couponCode;
        if (!codeToApply) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    code: codeToApply, 
                    cartTotal: total,
                    cartItemCount: cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)
                })
            });
            const data = await res.json();
            if (res.ok) {
                setAppliedCoupon(data.coupon);
                setCouponDiscount(data.discountAmount);
                setAppliedPoints(0); // Clear points if coupon applied
                setPointsToUse(0);
                window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
                    detail: { message: 'Coupon applied successfully!', type: 'success' } 
                }));
            } else {
                window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
                    detail: { message: data.message, type: 'error' } 
                }));
            }
        } catch (err) {
            window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
                detail: { message: 'Failed to validate coupon', type: 'error' } 
            }));
        }
    };

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

    const sendOrderEmail = async (orderData, orderIdStr) => {
        try {
            const message = `
New Order Details:
------------------
Order ID: ${orderIdStr}
Customer: ${orderData.customerName}
Email: ${orderData.customerEmail}
Phone: ${orderData.phone}
Address: ${orderData.address}

Items Ordered:
${orderData.items.map(item => `- ${item.productName} (Qty: ${item.quantity}) - ₹${item.price}`).join('\n')}

Total Price: ₹${orderData.totalPrice}
Payment Method: ${orderData.paymentMethod}
Points Used: ${orderData.pointsUsed}
Coupon Discount: ₹${orderData.couponDiscount}
`;
            
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    access_key: "2c808a23-646b-4cd6-b983-20c8105cac41",
                    subject: `New Order Placed: ${orderIdStr}`,
                    from_name: "PINAKA TECHNOLOGIES SG PRIVATE LIMITED SG PRIVATE LIMITED System",
                    message: message
                })
            });
        } catch (error) {
            console.error("Failed to send email notification", error);
        }
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
            status: 'Pending',
            paymentStatus: paymentMethod === 'Online' ? 'Unpaid' : 'Pending',
            paymentMethod: paymentMethod === 'Online' ? 'Razorpay' : 'Cash on Delivery',
            pointsUsed: appliedPoints,
            couponCode: appliedCoupon?.code || null,
            couponDiscount: couponDiscount,
            totalPrice: total - appliedPoints - couponDiscount
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
                        amount: (total - appliedPoints - couponDiscount) * 100,
                        currency: "INR",
                        name: "PINAKA TECHNOLOGIES SG PRIVATE LIMITED SG PRIVATE LIMITED",
                        description: "Purchase from PINAKA TECHNOLOGIES SG PRIVATE LIMITED SG PRIVATE LIMITED",
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
                                sendOrderEmail(orderData, data.orderId);
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
                            color: "var(--text-dark)"
                        }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                } else {
                    setOrderId(data.orderId);
                    setIsOrderSuccess(true);
                    cartService.clearCart();
                    updateCart();
                    sendOrderEmail(orderData, data.orderId);
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
        <main style={{ overflowX: 'hidden' }}>
            <div className="container cart-container reveal active" style={{ padding: '2rem 15px', minHeight: '60vh' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Continue Shopping</Link>
                <h1 style={{ marginBottom: '2.5rem', marginTop: '1rem', fontSize: '2rem', fontWeight: 800 }}>Shopping Cart</h1>
                

                
                <div className="cart-layout">
                    <div id="cart-items-section">
                        {cartItems.length === 0 ? (
                            <div className="cart-empty" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'var(--colorful-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                <ShoppingCart size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <h3>Your cart is empty</h3>
                                <p>Looks like you have not added anything to your cart yet.</p>
                            </div>
                        ) : (
                            <div style={{ background: 'var(--colorful-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '16px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Cart Summary</h2>
                                {cartItems.map((item, index) => (
                                    <div key={index} className="cart-item-new" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '15px 0', borderBottom: index === cartItems.length - 1 ? 'none' : '1px dotted var(--border-color)' }}>
                                        <Link to={`/product/${generateProductSlug(item.title)}`} style={{ width: '80px', height: '80px', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '5px', flexShrink: 0, display: 'block' }}>
                                            <img 
                                                src={getImageUrl(item.image)} 
                                                alt={item.title} 
                                                onError={(e) => (e.target.src = "/placeholder.png")}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                            />
                                        </Link>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Link to={`/product/${generateProductSlug(item.title)}`} style={{ textDecoration: 'none' }}>
                                                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginBottom: '8px', lineHeight: '1.4', overflowWrap: 'break-word', wordWrap: 'break-word' }}>{item.title}</h4>
                                            </Link>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '5px' }}>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    ₹{item.price} <span style={{ margin: '0 4px' }}>×</span> {item.quantity || 1}
                                                </div>
                                                <div style={{ fontWeight: 700, color: '#4338ca' }}>
                                                    ₹{(parseInt(String(item.price).replace(/[^0-9]/g, '')) * (item.quantity || 1)).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </div>
                                            </div>
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--light-bg)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
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
                            <div style={{ background: 'var(--colorful-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Billing Summary</h2>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>₹{total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                                <div style={{ marginBottom: '15px', padding: '15px', background: 'var(--light-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Your Points: <span style={{ color: '#4338ca' }}>{availablePoints}</span></span>
                                        <button 
                                            type="button"
                                            onClick={useAllPoints}
                                            style={{ background: 'none', border: 'none', color: '#4338ca', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', minWidth: '60px', flexShrink: 0 }}
                                        >
                                            USE ALL
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            type="number" 
                                            value={pointsToUse} 
                                            onChange={(e) => setPointsToUse(Math.max(0, Math.min(availablePoints, parseInt(e.target.value) || 0)))}
                                            placeholder="Enter points"
                                            style={{ flex: 1, minWidth: 0, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => applyPoints(pointsToUse)}
                                            style={{ background: '#4338ca', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {appliedPoints > 0 && (
                                        <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#059669', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                                            <span>✓ {appliedPoints} points applied</span>
                                            <button onClick={() => { setAppliedPoints(0); setPointsToUse(0); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                        </div>
                                    )}
                                </div>

                                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dotted var(--border-color)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Points Discount</span>
                                    <span style={{ fontWeight: 600, color: '#059669' }}>-₹{appliedPoints.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                 </div>
                                                               {/* Coupon Section */}
                                <div style={{ marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>Apply Coupon</h3>
                                    
                                    {!appliedCoupon ? (
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                            <input 
                                                type="text" 
                                                value={couponCode} 
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Enter Coupon Code"
                                                style={{ flex: 1, minWidth: 0, padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontWeight: 600 }}
                                            />
                                            <button 
                                                onClick={() => applyCoupon()}
                                                style={{ background: 'var(--text-dark)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ background: '#ecfdf5', padding: '12px 15px', borderRadius: '12px', border: '1px solid var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ background: 'var(--success)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>{appliedCoupon.code}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>Applied Successfully!</div>
                                            </div>
                                            <button 
                                                onClick={() => { 
                                                    setAppliedCoupon(null); 
                                                    setCouponDiscount(0); 
                                                    setCouponCode(''); 
                                                }} 
                                                style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}

                                    {availableCoupons.length > 0 && !appliedCoupon && (
                                        <div style={{ marginTop: '10px' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Available Coupons:</p>
                                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                                                {availableCoupons.map(coupon => (
                                                    <div 
                                                        key={coupon._id}
                                                        onClick={() => { setCouponCode(coupon.code); applyCoupon(coupon.code); }}
                                                        style={{ 
                                                            padding: '8px 12px', background: '#f0f7ff', border: '1.5px dashed var(--primary)', borderRadius: '8px', 
                                                            color: 'var(--primary)', cursor: 'pointer', minWidth: '120px', flexShrink: 0
                                                        }}
                                                    >
                                                        <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '2px' }}>{coupon.code}</div>
                                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'normal', lineHeight: '1.2' }}>{coupon.description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dotted var(--border-color)' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Coupon Discount</span>
                                    <span style={{ fontWeight: 600, color: '#059669' }}>-₹{couponDiscount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>

                                <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '12px 0', fontStyle: 'italic' }}>
                                    You can use either a coupon or points, but not both at the same time.
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total with GST</span>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: '#334155' }}>₹{(total - appliedPoints - couponDiscount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Incl. GST)</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#16a34a' }}>Grand Total</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>₹{(total - appliedPoints - couponDiscount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>

                                <div style={{ background: '#4338ca', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>Points Earned</span>
                                    <div style={{ background: 'var(--colorful-bg)', color: '#4338ca', padding: '4px 12px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {Math.floor((total - appliedPoints - couponDiscount)/500)} points
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                    <label style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <input type="checkbox" required />
                                        <span>I have read and agree to the website <Link to="/terms-and-conditions" style={{ color: 'var(--primary)' }}>Terms and Conditions*</Link></span>
                                    </label>
                                    <label style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', alignItems: 'center' }}>
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
                        <div className="checkout-modal-container">
                            <button 
                                onClick={() => setIsCheckoutModalOpen(false)} 
                                style={{ 
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    background: 'var(--border-color)', 
                                    border: 'none', 
                                    padding: '8px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)',
                                    zIndex: 10,
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--border-color)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'var(--border-color)'}
                            >
                                <X size={20} weight="bold" />
                            </button>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontWeight: 800 }}>Complete Your Order</h2>
                            </div>                            <form onSubmit={handleCheckout} style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
                                <div className="checkout-form-grid">
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>First Name*</label>
                                        <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="First Name" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Last Name*</label>
                                        <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="Last Name" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Company Name (Optional)</label>
                                    <input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="Business Entity" />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>GST Number (Optional)</label>
                                    <input value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="GSTIN" />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Email Address*</label>
                                    <input required type="email" value={form.customerEmail} onChange={e => setForm({...form, customerEmail: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="email@address.com" />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Street Address*</label>
                                    <input required value={form.streetAddress} onChange={e => setForm({...form, streetAddress: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', marginBottom: '10px' }} placeholder="House number and street name" />
                                    <input value={form.streetAddress2} onChange={e => setForm({...form, streetAddress2: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="Apartment, suite, unit, etc. (optional)" />
                                </div>

                                <div className="checkout-form-grid">
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>State*</label>
                                        <input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="State" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>City*</label>
                                        <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="Town / City" />
                                    </div>
                                </div>

                                <div className="checkout-form-grid">
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Postcode*</label>
                                        <input required value={form.postcode} onChange={e => setForm({...form, postcode: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="PIN code" />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', fontWeight: 600 }}>Phone*</label>
                                        <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} placeholder="10-digit number" />
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
                                <div style={{ background: 'var(--light-bg)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px dashed #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
                                        <span>Grand Total:</span>
                                        <span style={{ color: 'var(--primary)' }}>₹{(total - appliedPoints - couponDiscount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
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
