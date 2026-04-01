import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, WhatsappLogo } from '@phosphor-icons/react';
import { cartService, WISHLIST_UPDATED } from '../services/cartService';

const Login = () => {
    const [activeTab, setActiveTab] = useState('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { setCurrentUser(JSON.parse(storedUser)); } catch(e) {}
        }
        fetch('http://localhost:5000/api/auth/users')
            .then(res => res.json())
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));

        setWishlistCount(cartService.getWishlistCount());
        const updateWishlist = () => setWishlistCount(cartService.getWishlistCount());
        window.addEventListener(WISHLIST_UPDATED, updateWishlist);
        window.addEventListener('storage', updateWishlist);

        return () => {
            window.removeEventListener(WISHLIST_UPDATED, updateWishlist);
            window.removeEventListener('storage', updateWishlist);
        };
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setCurrentUser(data.user);
                window.dispatchEvent(new Event('storage'));
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error check if server is running');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Account created! You can now login.');
                setActiveTab('login');
                // Refresh users
                const updatedUsers = await fetch('http://localhost:5000/api/auth/users').then(r => r.json());
                setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Network error check if server is running');
        }
    };

    return (
        <main>
            <div className="auth-wrapper" style={{ backgroundColor: 'var(--light-bg)', padding: '4rem 0', minHeight: 'calc(100vh - 400px)' }}>
                <div className="container">
                    <Link to="/" className="back-home-btn" style={{ marginBottom: '2rem', display: 'inline-block' }}><ArrowLeft /> Back to Home</Link>
                    <div className="auth-container reveal active" style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        {currentUser ? (
                            <div className="profile-view" style={{ textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 1.5rem', fontWeight: 'bold' }}>
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', color: 'var(--text-dark)' }}>{currentUser.name}</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{currentUser.email}</p>
                                
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{ flex: 1, padding: '1rem', background: 'var(--light-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>0</h3>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Orders</span>
                                    </div>
                                    <div style={{ flex: 1, padding: '1rem', background: 'var(--light-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>{wishlistCount}</h3>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wishlist</span>
                                    </div>
                                </div>

                                <button onClick={() => { 
                                    localStorage.removeItem('token'); 
                                    localStorage.removeItem('user'); 
                                    setCurrentUser(null); 
                                    window.dispatchEvent(new Event('storage')); 
                                }} className="btn btn-outline" style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', background: 'transparent', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="auth-tabs" style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <div 
                                        className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} 
                                        onClick={() => setActiveTab('login')}
                                        style={{ flex: 1, textAlign: 'center', padding: '1rem', fontWeight: 600, color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'login' ? '2px solid var(--primary)' : 'none' }}
                                    >
                                        Login
                                    </div>
                                    <div 
                                        className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`} 
                                        onClick={() => setActiveTab('register')}
                                        style={{ flex: 1, textAlign: 'center', padding: '1rem', fontWeight: 600, color: activeTab === 'register' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'register' ? '2px solid var(--primary)' : 'none' }}
                                    >
                                        Register
                                    </div>
                                </div>

                                {/* Login Form */}
                                {activeTab === 'login' && (
                                    <form className="auth-form active" onSubmit={handleLogin}>
                                        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                                        {success && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}
                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Email Address</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Password</label>
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                        </div>
                                        <a href="javascript:void(0)" className="forgot-password" style={{ display: 'block', textAlign: 'right', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Forgot password?</a>
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
                                    </form>
                                )}

                                {/* Register Form */}
                                {activeTab === 'register' && (
                                    <form className="auth-form active" onSubmit={handleRegister}>
                                        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                                        {success && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}
                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Full Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Email Address</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Password</label>
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} minLength="6" required />
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
                                    </form>
                                )}
                            </>
                        )}
                    </div>

                    <div style={{ maxWidth: '480px', margin: '2rem auto 0', padding: '1.5rem', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--text-dark)' }}>Registered Users ({users.length})</h3>
                        {users.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No users registered yet.</p> : (
                            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                                {users.map(u => (
                                    <li key={u._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{u.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.email}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
            
            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Login;
