import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Shield, Package, Heart, SignOut, ArrowLeft, Envelope, Phone, ChatCircleText } from '@phosphor-icons/react';
import { cartService } from '../services/cartService';

const Account = () => {
    const [user, setUser] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setUser(JSON.parse(storedUser)); } catch (e) { setUser(null); }
        } else {
            navigate('/login');
        }

        setWishlistCount(cartService.getWishlistCount());
        const handleWishlist = () => setWishlistCount(cartService.getWishlistCount());
        window.addEventListener('wishlistUpdated', handleWishlist);
        return () => window.removeEventListener('wishlistUpdated', handleWishlist);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        navigate('/');
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
                    <div className="account-content">
                        <div className="content-card" style={{ background: 'var(--white)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: '100%' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package size={24} color="var(--primary)" /> My Activities
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                                <Link to="/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="activity-card" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                                        <h4 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>0</h4>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Orders</div>
                                    </div>
                                </Link>
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

                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={24} color="var(--primary)" /> Recent Activity
                            </h3>
                            
                            <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#fcfcfc', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                                <Package size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                                <p style={{ color: 'var(--text-muted)' }}>No recent activity to show.</p>
                                <button onClick={() => navigate('/products')} className="btn btn-dark" style={{ marginTop: '1rem', padding: '8px 24px' }}>Start Shopping</button>
                            </div>
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
                @media (max-width: 991px) {
                    .account-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                    .account-sidebar {
                        margin-bottom: 2rem;
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
