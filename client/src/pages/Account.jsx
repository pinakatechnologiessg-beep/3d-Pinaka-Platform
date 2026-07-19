import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, Package, Heart, SignOut, ArrowLeft, Envelope, Phone, ChatCircleText, Clock, CheckCircle, Truck } from '@phosphor-icons/react';
import { cartService } from '../services/cartService';
import { API_BASE_URL } from '../api/config';
import { getImageUrl } from '../utils/imageUtils';
import './Account.css'; // Import the new CSS

const Account = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    // New tab state
    const [activeTab, setActiveTab] = useState('Dashboard');
    const tabs = ['Dashboard', 'Addresses', 'Account details', 'Orders', 'Order Invoices'];
    if (user?.role === 'admin') tabs.push('Admin Panel');
    tabs.push('Logout');

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { 
                const userData = JSON.parse(storedUser);
                setUser(userData);
                fetchProfile(userData.email);
                fetchOrders(userData.email);
            } catch (e) { setUser(null); }
        }
    }, [navigate]);

    const fetchProfile = async (email) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/profile/${email}`);
            if (res.ok) {
                const data = await res.json();
                setUser(prev => ({ ...prev, ...data }));
                localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...data }));
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchOrders = async (email) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/orders/user/${email}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        navigate('/');
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Order Confirmed': return <CheckCircle size={20} color="#16a34a" />;
            case 'Shipped / Dispatched': return <Truck size={20} color="var(--primary)" />;
            case 'In Transit': return <Truck size={20} color="#4338ca" />;
            case 'Delivered': return <Package size={20} color="#059669" />;
            case 'Completed': return <CheckCircle size={20} color="var(--text-dark)" />;
            default: return <Clock size={20} color="var(--warning)" />;
        }
    };

    if (!user) return (
        <main style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div className="container">
                <div style={{ background: 'var(--colorful-bg)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '500px', margin: '0 auto' }}>
                    <User size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                    <h2 style={{ marginBottom: '1rem' }}>not loged in pls login</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please sign in to view your orders and manage your account.</p>
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%', display: 'inline-block' }}>Login Now</Link>
                </div>
            </div>
        </main>
    );

    return (
        <main style={{ backgroundColor: '#fcf8ff', padding: '0 0 4rem 0', minHeight: 'calc(100vh - 400px)' }}>
            <div className="pigglitz-top-border"></div>
            
            <div className="pigglitz-container">
                <Link to="/" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <ArrowLeft /> Back to Home
                </Link>

                <div className="pigglitz-layout">
                    {/* Sidebar Tabs */}
                    <div className="pigglitz-sidebar">
                        {tabs.map(tab => (
                            <div 
                                key={tab}
                                className={`pigglitz-tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => tab === 'Logout' ? handleLogout() : tab === 'Admin Panel' ? navigate('/admin') : setActiveTab(tab)}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="pigglitz-content">
                        {activeTab === 'Dashboard' && (
                            <>
                                <div className="pigglitz-welcome">
                                    <div className="pigglitz-welcome-icon">👋</div>
                                    <div>
                                        <h2>Hello, {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name}!</h2>
                                        <p>From your account dashboard you can view your recent orders, manage your shipping addresses, and edit your password and account details.</p>
                                    </div>
                                </div>
                                
                                <div className="pigglitz-stats">
                                    <div className="number">{orders.length}</div>
                                    <div className="label">Total Orders</div>
                                </div>
                                
                            </>
                        )}

                        {activeTab === 'Orders' && (
                            <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Your Orders</h3>
                                {loadingOrders ? (
                                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your orders...</div>
                                ) : orders.length === 0 ? (
                                    <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#fcfcfc', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                                        <Package size={48} color="var(--border-color)" style={{ margin: '0 auto 1rem' }} />
                                        <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
                                        <button onClick={() => navigate('/products')} className="btn btn-dark" style={{ marginTop: '1rem', padding: '8px 24px', background: 'var(--primary)', border: 'none' }}>Start Shopping</button>
                                    </div>
                                ) : (
                                    <div className="pigglitz-orders-container">
                                        <div className="pigglitz-orders-header">
                                            <div>Order</div>
                                            <div>Date</div>
                                            <div>Status</div>
                                            <div>Total</div>
                                            <div style={{ textAlign: 'right' }}>Actions</div>
                                        </div>
                                        {orders.map(order => (
                                            <div key={order.orderId} className="pigglitz-order-row" onClick={() => setSelectedOrder(selectedOrder === order.orderId ? null : order.orderId)}>
                                                <div className="order-id">#{order.orderId}</div>
                                                <div className="order-date">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </div>
                                                <div className="order-status" style={{ color: order.status === 'Delivered' ? '#059669' : 'var(--primary)' }}>
                                                    {order.status}
                                                </div>
                                                <div className="order-total">
                                                    ₹{order.totalPrice?.toLocaleString('en-IN', {minimumFractionDigits: 2})} for {order.quantity || 1} items
                                                </div>
                                                <div className="order-actions">
                                                    <button className="icon-btn" title="View Details" onClick={(e) => { e.stopPropagation(); setSelectedOrder(selectedOrder === order.orderId ? null : order.orderId); }}>
                                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                    </button>
                                                    <button className="track-btn" onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        if (order.trackingLink) {
                                                            window.open(order.trackingLink, '_blank');
                                                        } else {
                                                            alert('Tracking link not available yet.');
                                                        }
                                                    }}>Track</button>
                                                </div>
                                                
                                                {/* Expanded view replaced by modal */}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'Account details' && (
                            <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Account Details</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                                        {(user.firstName ? user.firstName.charAt(0) : user.name?.charAt(0))?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-dark)' }}>{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name}</div>
                                        <div style={{ color: 'var(--text-muted)' }}>{user.role === 'admin' ? 'Administrator' : 'Customer'}</div>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--light-bg)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#334155' }}>
                                        <Envelope size={20} color="var(--primary)" />
                                        <span>{user.email}</span>
                                    </div>
                                    {user.mobile && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: '#334155' }}>
                                            <Phone size={20} color="var(--primary)" />
                                            <span>{user.mobile}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#334155' }}>
                                        <Heart size={20} color="var(--primary)" />
                                        <span>Reward Points: <strong>{user.points || 0}</strong></span>
                                    </div>
                                </div>
                                {user.role === 'admin' && (
                                    <button onClick={() => navigate('/admin')} style={{ marginTop: '2rem', background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Shield size={20} /> Go to Admin Panel
                                    </button>
                                )}
                            </div>
                        )}

                        {activeTab === 'Addresses' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                {/* Billing Addresses */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                        <h3 style={{ color: 'var(--text-dark)', margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Billing Addresses</h3>
                                        <button className="pigglitz-btn">Add Billing Address</button>
                                    </div>
                                    <div className="pigglitz-address-card">
                                        <div className="address-header">
                                            <div className="address-name">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name}</div>
                                            <div className="address-actions">
                                                <span>Edit</span> <span>Delete</span>
                                            </div>
                                        </div>
                                        <div className="address-body">
                                            {user.address && user.address.streetAddress ? (
                                                <>
                                                    <p>{user.address.streetAddress}</p>
                                                    {user.address.streetAddress2 && <p>{user.address.streetAddress2}</p>}
                                                    <p>{user.address.city}, {user.address.postcode}</p>
                                                    <p>{user.address.state || 'India'}</p>
                                                </>
                                            ) : (
                                                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                                    No address saved yet. It will be automatically saved after your first order.
                                                </p>
                                            )}
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                                <p>Phone: {user.mobile}</p>
                                                <p>Email: {user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Addresses */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                        <h3 style={{ color: 'var(--text-dark)', margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Shipping Addresses</h3>
                                        <button className="pigglitz-btn">Add Shipping Address</button>
                                    </div>
                                    <div className="pigglitz-address-card">
                                        <div className="address-header">
                                            <div className="address-name">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name}</div>
                                            <div className="address-actions">
                                                <span>Edit</span> <span>Delete</span>
                                            </div>
                                        </div>
                                        <div className="address-body">
                                            {user.address && user.address.streetAddress ? (
                                                <>
                                                    <p>{user.address.streetAddress}</p>
                                                    {user.address.streetAddress2 && <p>{user.address.streetAddress2}</p>}
                                                    <p>{user.address.city}, {user.address.postcode}</p>
                                                    <p>{user.address.state || 'India'}</p>
                                                </>
                                            ) : (
                                                <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                                                    No address saved yet. It will be automatically saved after your first order.
                                                </p>
                                            )}
                                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                                <p>Phone: {user.mobile}</p>
                                                <p>Email: {user.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Order Invoices' && (
                            <div className="invoice-table-container">
                                <h3>Order Invoices</h3>
                                {loadingOrders ? (
                                    <p style={{ color: 'var(--text-muted)' }}>Loading invoices...</p>
                                ) : orders.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>No invoices available yet.</p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="invoice-table">
                                            <thead>
                                                <tr>
                                                    <th>Order Number</th>
                                                    <th>Order Placed Date</th>
                                                    <th>Order Status</th>
                                                    <th>View Details</th>
                                                    <th>Download Invoice</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order.orderId}>
                                                        <td style={{ fontWeight: 600 }}>#{order.orderId}</td>
                                                        <td>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                        <td className="invoice-status">{order.status}</td>
                                                        <td>
                                                            <button className="btn-gray" onClick={() => {
                                                                setActiveTab('Orders');
                                                                setSelectedOrder(order.orderId);
                                                            }}>View Details</button>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className="btn-blue" 
                                                                onClick={() => {
                                                                    if (order.invoiceImage) {
                                                                        window.open(getImageUrl(order.invoiceImage), '_blank');
                                                                    } else {
                                                                        alert('Invoice is not available yet. Please check back later.');
                                                                    }
                                                                }}
                                                            >
                                                                Request Invoice
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="online-stores-banner">
                    <div className="online-stores-header">Online Stores</div>
                    <div className="store-logos-container">
                        <div className="store-logo-box store-amazon">amazon</div>
                        <div className="store-logo-box store-flipkart">Flipkart</div>
                        <div className="store-logo-box store-indiamart">IndiaMART</div>
                    </div>
                </div>
            </div>
            
            {/* Order Tracking Modal */}
            {selectedOrder && (() => {
                const order = orders.find(o => o.orderId === selectedOrder);
                if (!order) return null;

                const statusObj = {
                    'Pending': 1,
                    'Order Confirmed': 1,
                    'Processing': 1,
                    'Packed / Ready for Dispatch': 1,
                    'Shipped / Dispatched': 2,
                    'In Transit': 2,
                    'Out for Delivery': 3,
                    'Delivered': 4
                };

                const currentStep = statusObj[order.status] || 1;

                return (
                    <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="order-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="order-modal-header">
                                <h3>Order #{order.orderId}</h3>
                                <button className="order-modal-close" onClick={() => setSelectedOrder(null)}>&times;</button>
                            </div>
                            <div className="order-modal-body">
                                <h4>Items Ordered:</h4>
                                <div className="order-item-box">
                                    <div className="order-item-name">{order.quantity || 1}x {order.productName}</div>
                                    <button className="write-review-btn" onClick={() => alert('Review feature coming soon!')}>Write a Review</button>
                                </div>

                                <div className="order-tracking-box">
                                    <div className="tracking-timeline">
                                        <div className="tracking-line"></div>
                                        <div className="tracking-line-fill" style={{ width: `${(currentStep - 1) * 33.33}%` }}></div>
                                        
                                        <div className={`tracking-step ${currentStep >= 1 ? 'active' : ''}`}>
                                            <div className="tracking-icon"><CheckCircle weight="fill" size={24} /></div>
                                            <div className="tracking-label">Order Placed</div>
                                        </div>
                                        
                                        <div className={`tracking-step ${currentStep >= 2 ? 'active' : ''}`}>
                                            <div className="tracking-icon"><CheckCircle weight="fill" size={24} /></div>
                                            <div className="tracking-label">In Transit</div>
                                        </div>
                                        
                                        <div className={`tracking-step ${currentStep >= 3 ? 'active' : ''}`}>
                                            <div className="tracking-icon"><CheckCircle weight="fill" size={24} /></div>
                                            <div className="tracking-label">Out for Delivery</div>
                                        </div>
                                        
                                        <div className={`tracking-step ${currentStep >= 4 ? 'active' : ''}`}>
                                            <div className="tracking-icon"><CheckCircle weight="fill" size={24} /></div>
                                            <div className="tracking-label">Delivered</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </main>
    );
};

export default Account;
