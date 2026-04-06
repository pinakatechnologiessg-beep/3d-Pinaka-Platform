import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, Package, Heart, SignOut, ArrowLeft, Envelope, Phone, ChatCircleText, Clock, CheckCircle, Truck, Printer } from '@phosphor-icons/react';
import { cartService } from '../services/cartService';
import { API_BASE_URL } from '../api/config';

const Account = () => {
    const [user, setUser] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { 
                const userData = JSON.parse(storedUser);
                setUser(userData);
                fetchOrders(userData.email);
            } catch (e) { setUser(null); }
        } else {
            navigate('/login');
        }

        setWishlistCount(cartService.getWishlistCount());
        const handleWishlist = () => setWishlistCount(cartService.getWishlistCount());
        window.addEventListener('wishlistUpdated', handleWishlist);
        return () => window.removeEventListener('wishlistUpdated', handleWishlist);
    }, [navigate]);

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
            case 'Confirmed': return <CheckCircle size={20} color="#16a34a" />;
            case 'Printing': return <Printer size={20} color="#2563eb" />;
            case 'Delivered': return <Package size={20} color="#059669" />;
            default: return <Clock size={20} color="#f59e0b" />;
        }
    };

    if (!user) return null;

    return (
        <main className="account-page" style={{ backgroundColor: 'var(--light-bg)', padding: '4rem 0', minHeight: 'calc(100vh - 400px)' }}>
            <div className="container">
                <Link to="/" className="back-home-btn" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <ArrowLeft /> Back to Home
                </Link>
                
                <div className="account-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
                    {/* Sidebar / Profile Info */}
                    <div className="account-sidebar">
                        <div className="profile-card" style={{ background: 'var(--white)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', margin: '0 auto 1.5rem', fontWeight: 'bold', border: '4px solid #eff6ff' }}>
                                {(user.firstName ? user.firstName.charAt(0) : user.name?.charAt(0))?.toUpperCase() || 'U'}
                            </div>
                            
                            <h2 style={{ marginBottom: '0.25rem', fontSize: '1.5rem', color: 'var(--text-dark)' }}>
                                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || 'User Account'}
                                {user.role === 'admin' && (
                                    <span title="Administrator" style={{ color: 'var(--primary)', marginLeft: '8px', display: 'inline-flex', verticalAlign: 'middle' }}>
                                        <Shield size={20} weight="fill" />
                                    </span>
                                )}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                {user.role === 'admin' ? 'Administrator Account' : 'Verified Customer'}
                            </p>

                            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                    <Envelope size={18} color="var(--primary)" />
                                    <span>{user.email}</span>
                                </div>
                                {user.mobile && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                                        <Phone size={18} color="var(--primary)" />
                                        <span>{user.mobile}</span>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => navigate('/my-tickets')} 
                                className="btn btn-outline" 
                                style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <ChatCircleText size={20} /> My Support Tickets
                            </button>

                            {user.role === 'admin' && (
                                <button 
                                    onClick={() => navigate('/admin')} 
                                    className="btn btn-primary" 
                                    style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Shield size={20} /> Go to Admin Panel
                                </button>
                            )}

                            <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <SignOut size={20} /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="account-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="content-card" style={{ background: 'var(--white)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package size={24} color="var(--primary)" /> My Activities
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="activity-card" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' }}>
                                    <h4 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>{orders.length}</h4>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Orders</div>
                                </div>
                                <Link to="/wishlist" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="activity-card" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                                        <h4 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>{wishlistCount}</h4>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>My Wishlist</div>
                                    </div>
                                </Link>
                                <Link to="/my-tickets" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="activity-card" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                                        <ChatCircleText size={28} color="var(--primary)" style={{ marginBottom: '8px' }} />
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-dark)', fontWeight: 600 }}>Get Support</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>View Conversation</div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className="content-card" style={{ background: 'var(--white)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package size={24} color="var(--primary)" /> Your Orders
                            </h3>
                            
                            {loadingOrders ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your orders...</div>
                            ) : orders.length === 0 ? (
                                <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#fcfcfc', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                                    <Package size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
                                    <button onClick={() => navigate('/products')} className="btn btn-dark" style={{ marginTop: '1rem', padding: '8px 24px' }}>Start Shopping</button>
                                </div>
                            ) : (
                                <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {orders.map(order => (
                                        <div 
                                            key={order.orderId} 
                                            className="order-item" 
                                            onClick={() => setSelectedOrder(selectedOrder === order.orderId ? null : order.orderId)}
                                            style={{ 
                                                padding: '1.5rem', 
                                                border: '1px solid var(--border-color)', 
                                                borderRadius: '10px', 
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: selectedOrder === order.orderId ? '#f8fafc' : 'white'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                                <div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ORDER #{order.orderId}</div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{order.productName}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</div>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '6px', 
                                                        fontSize: '0.85rem', 
                                                        fontWeight: 600,
                                                        color: order.status === 'Delivered' ? '#059669' : order.status === 'Printing' ? '#2563eb' : '#f59e0b',
                                                        padding: '4px 10px',
                                                        borderRadius: '20px',
                                                        background: order.status === 'Delivered' ? '#f0fdf4' : order.status === 'Printing' ? '#eff6ff' : '#fffbeb'
                                                    }}>
                                                        {getStatusIcon(order.status)} {order.status}
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedOrder === order.orderId && (
                                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)', animation: 'slideDown 0.3s ease-out' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                                        <div>
                                                            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Shipping Address</h5>
                                                            <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{order.address}</p>
                                                        </div>
                                                        <div>
                                                            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Payment Details</h5>
                                                            <p style={{ fontSize: '0.9rem' }}>Method: {order.paymentMethod}</p>
                                                            <p style={{ fontSize: '0.9rem' }}>Status: <span style={{ color: order.paymentStatus === 'Paid' ? '#059669' : 'inherit', fontWeight: 600 }}>{order.paymentStatus}</span></p>
                                                        </div>
                                                        <div>
                                                            <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Contact</h5>
                                                            <p style={{ fontSize: '0.9rem' }}>{order.customerName}</p>
                                                            <p style={{ fontSize: '0.9rem' }}>{order.phone}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                        <h5 style={{ fontSize: '0.85rem', marginBottom: '10px' }}>Order Status Timeline</h5>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
                                                            {['Pending', 'Confirmed', 'Printing', 'Delivered'].map((step, idx) => {
                                                                const isCompleted = ['Pending', 'Confirmed', 'Printing', 'Delivered'].indexOf(order.status) >= idx;
                                                                return (
                                                                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
                                                                        <div style={{ 
                                                                            width: '24px', 
                                                                            height: '24px', 
                                                                            borderRadius: '50%', 
                                                                            background: isCompleted ? 'var(--primary)' : '#e2e8f0',
                                                                            color: 'white',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontSize: '12px'
                                                                        }}>
                                                                            {isCompleted ? <CheckCircle size={14} weight="fill" /> : idx + 1}
                                                                        </div>
                                                                        <span style={{ fontSize: '0.7rem', fontWeight: isCompleted ? 700 : 500, color: isCompleted ? 'var(--text-dark)' : 'var(--text-muted)' }}>{step}</span>
                                                                    </div>
                                                                )
                                                            })}
                                                            <div style={{ 
                                                                position: 'absolute', 
                                                                top: '12px', 
                                                                left: '30px', 
                                                                right: '30px', 
                                                                height: '2px', 
                                                                background: '#e2e8f0', 
                                                                zIndex: 0 
                                                            }}>
                                                                <div style={{ 
                                                                    height: '100%', 
                                                                    background: 'var(--primary)', 
                                                                    width: `${(['Pending', 'Confirmed', 'Printing', 'Delivered'].indexOf(order.status) / 3) * 100}%`,
                                                                    transition: 'width 0.5s ease-in-out'
                                                                }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .activity-card:hover {
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
                    transform: translateY(-2px);
                    border-color: var(--primary) !important;
                }
                .order-item:hover {
                    border-color: var(--primary) !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 991px) {
                    .account-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                    .account-sidebar {
                        margin-bottom: 0;
                    }
                }
                @media (max-width: 480px) {
                    .account-page {
                        padding: 2rem 0 !important;
                    }
                    .content-card, .profile-card {
                        padding: 1.5rem !important;
                    }
                }
            `}</style>
        </main>
    );
};

export default Account;
