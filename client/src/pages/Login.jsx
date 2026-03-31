import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, WhatsappLogo } from '@phosphor-icons/react';

const Login = () => {
    const [activeTab, setActiveTab] = useState('login');
    const navigate = useNavigate();

    return (
        <main>
            <div className="auth-wrapper" style={{ backgroundColor: 'var(--light-bg)', padding: '4rem 0', minHeight: 'calc(100vh - 400px)' }}>
                <div className="container">
                    <Link to="/" className="back-home-btn" style={{ marginBottom: '2rem', display: 'inline-block' }}><ArrowLeft /> Back to Home</Link>
                    <div className="auth-container reveal active" style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem', background: 'var(--white)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
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
                            <form className="auth-form active" onSubmit={(e) => {e.preventDefault(); navigate('/');}}>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Email Address</label>
                                    <input type="email" placeholder="Enter your email" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Password</label>
                                    <input type="password" placeholder="Enter your password" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                </div>
                                <a href="javascript:void(0)" className="forgot-password" style={{ display: 'block', textAlign: 'right', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Forgot password?</a>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In</button>
                            </form>
                        )}

                        {/* Register Form */}
                        {activeTab === 'register' && (
                            <form className="auth-form active" onSubmit={(e) => {e.preventDefault(); setActiveTab('login'); alert('Account created successfully!');}}>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Full Name</label>
                                    <input type="text" placeholder="Enter your full name" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Email Address</label>
                                    <input type="email" placeholder="Enter your email" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                </div>
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>Password</label>
                                    <input type="password" placeholder="Create a password" style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '6px' }} required />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            
            <a href="https://wa.me/1234567890" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Login;
