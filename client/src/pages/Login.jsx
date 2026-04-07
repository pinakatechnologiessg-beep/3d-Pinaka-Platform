import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { ArrowLeft, User, Lock, WhatsappLogo } from '@phosphor-icons/react';
import { cartService, WISHLIST_UPDATED } from '../services/cartService';

const Login = () => {
    const [activeTab, setActiveTab] = useState('signin');
    const [formData, setFormData] = useState({ firstName: '', lastName: '', mobile: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try { 
                setCurrentUser(JSON.parse(storedUser)); 
                navigate('/account'); // Automatically go to account if already login
            } catch(e) { setCurrentUser(null); }
        }
        fetch(`${API_BASE_URL}/api/auth/users`)
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
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setSuccess('Successfully logged in! Welcome back, ' + data.user.firstName + '.');
                setCurrentUser(data.user);
                window.dispatchEvent(new Event('storage'));
                setTimeout(() => {
                    setSuccess('');
                    navigate('/account'); // Unified redirect
                }, 1500);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error check if server is running');
        }
    };

    const [registrationStep, setRegistrationStep] = useState('initial'); // 'initial', 'otp'
    const [otp, setOtp] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        
        // Client-side format checks
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email do not exist or invalid format');
            return;
        }

        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formData.mobile)) {
            setError('Invalid mobile number. Must be 10 digits.');
            return;
        }

        // STEP 1: Send OTP
        if (registrationStep === 'initial') {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: formData.email })
                });
                const data = await res.json();
                if (res.ok) {
                    setRegistrationStep('otp');
                    setSuccess(data.message + (data.debug ? ' ' + data.debug : ''));
                } else {
                    setError(data.message || 'Failed to send verification code');
                }
            } catch (err) {
                setError('Network error. Check if server is running.');
            }
            return;
        }

        // STEP 2: Finalize Registration
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, otp })
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Account created! You can now sign in.');
                setActiveTab('signin');
                setRegistrationStep('initial');
                setOtp('');
                const updatedUsers = await fetch(`${API_BASE_URL}/api/auth/users`).then(r => r.json());
                setUsers(Array.isArray(updatedUsers) ? updatedUsers : []);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Network error. Check if server is running.');
        }
    };


    return (
        <main>
            <div className="auth-wrapper" style={{ backgroundColor: 'var(--light-bg)', padding: '4rem 0', minHeight: 'calc(100vh - 400px)' }}>
                <div className="container">
                    <Link to="/" className="back-home-btn" style={{ marginBottom: '2rem', display: 'inline-block' }}><ArrowLeft /> Back to Home</Link>
                    <div className="auth-container reveal active" style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        {currentUser ? (
                            <div className="profile-redirection" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🚀</div>
                                <h2 style={{ marginBottom: '1rem' }}>Redirecting...</h2>
                                <p style={{ color: 'var(--text-muted)' }}>You are already logged in. Taking you to your profile.</p>
                            </div>
                        ) : (
                            <>
                                 <div className="auth-tabs" style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                                     <div 
                                         className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`} 
                                         onClick={() => { setActiveTab('signin'); setRegistrationStep('initial'); setError(''); setSuccess(''); }}
                                         style={{ flex: 1, textAlign: 'center', padding: '1rem', fontWeight: 600, color: activeTab === 'signin' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'signin' ? '2px solid var(--primary)' : 'none' }}
                                     >
                                         Sign In
                                     </div>
                                     <div 
                                         className={`auth-tab ${activeTab === 'create-account' ? 'active' : ''}`} 
                                         onClick={() => { setActiveTab('create-account'); setRegistrationStep('initial'); setError(''); setSuccess(''); }}
                                         style={{ flex: 1, textAlign: 'center', padding: '1rem', fontWeight: 600, color: activeTab === 'create-account' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: activeTab === 'create-account' ? '2px solid var(--primary)' : 'none' }}
                                     >
                                         Create Account
                                     </div>
                                 </div>

                                 {/* Sign In Form */}
                                 {activeTab === 'signin' && (
                                     <form className="auth-form active" onSubmit={handleLogin}>
                                         {error && <div style={{ padding: '12px', background: '#fff5f5', color: '#e53e3e', border: '1px solid #feb2b2', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                             <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
                                         </div>}
                                         {success && <div style={{ padding: '12px', background: '#f0fff4', color: '#38a169', border: '1px solid #9ae6b4', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                             <span style={{ fontSize: '1.2rem' }}>✅</span> {success}
                                         </div>}
                                         <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Email Address</label>
                                             <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                         </div>
                                         <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Password</label>
                                             <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                         </div>
                                         <button type="button" onClick={() => console.log('Forgot password clicked')} className="forgot-password" style={{ display: 'block', marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', outline: 'none', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1.5rem', padding: 0 }}>Forgot password?</button>
                                         <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
                                     </form>
                                 )}

                                 {/* Create Account Form */}
                                 {activeTab === 'create-account' && (
                                     <form className="auth-form active" onSubmit={handleRegister}>
                                         {error && <div style={{ padding: '12px', background: '#fff5f5', color: '#e53e3e', border: '1px solid #feb2b2', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                             <span style={{ fontSize: '1.2rem' }}>⚠️</span> {error}
                                         </div>}
                                         {success && <div style={{ padding: '12px', background: '#f0fff4', color: '#38a169', border: '1px solid #9ae6b4', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                             <span style={{ fontSize: '1.2rem' }}>✅</span> {success}
                                         </div>}
                                         
                                         {registrationStep === 'initial' ? (
                                             <>
                                                 <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                                     <div className="form-group" style={{ flex: 1 }}>
                                                         <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>First Name</label>
                                                         <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                                     </div>
                                                     <div className="form-group" style={{ flex: 1 }}>
                                                         <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Last Name</label>
                                                         <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                                     </div>
                                                 </div>
                                                 <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                                     <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Mobile Number</label>
                                                     <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Enter your mobile number" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                                 </div>
                                                 <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                                     <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Email Address</label>
                                                     <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                                 </div>
                                                 <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                                     <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Password</label>
                                                     <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} minLength="6" required />
                                                 </div>
                                                 <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Verification Code</button>
                                             </>
                                         ) : (
                                             <>
                                                 <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                                     <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Verification Code (OTP)</label>
                                                     <input 
                                                         type="text" 
                                                         value={otp} 
                                                         onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                                                         placeholder="Enter 6-digit code sent to your email" 
                                                         style={{ width: '100%', padding: '16px', border: '2px solid var(--primary)', borderRadius: '8px', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px', fontWeight: '700' }} 
                                                         maxLength="6" 
                                                         required 
                                                     />
                                                     <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                                                         Checking inbox for verification email at {formData.email}
                                                     </p>
                                                 </div>
                                                 <div style={{ display: 'flex', gap: '10px' }}>
                                                     <button type="button" onClick={() => { setRegistrationStep('initial'); setSuccess(''); }} className="btn btn-outline" style={{ flex: 1 }}>Change Email</button>
                                                     <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Verify & Create Account</button>
                                                 </div>
                                             </>
                                         )}
                                     </form>
                                 )}

                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Login;
