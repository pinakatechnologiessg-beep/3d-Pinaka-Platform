import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Envelope, User, ChatCircleText, PaperPlaneTilt, CheckCircle, Info } from '@phosphor-icons/react';

const Support = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setFormData(prev => ({
                ...prev,
                name: `${parsedUser.firstName} ${parsedUser.lastName || ''}`.trim(),
                email: parsedUser.email
            }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('http://localhost:5000/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    userId: user?.id || user?._id
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: data.message });
                setFormData({
                    ...formData,
                    subject: '',
                    message: ''
                });
            } else {
                setMessage({ type: 'error', text: data.message || 'Something went wrong' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="support-page" style={{ background: 'var(--light-bg)', padding: '5rem 0', minHeight: 'calc(100vh - 400px)' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="support-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Support Center</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Have a question or need assistance? Our team is here to help you.</p>
                </div>

                <div className="support-card" style={{ background: 'var(--white)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                    {user && (
                        <div style={{ marginBottom: '2rem', textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '10px' }}>Already have an active request? Check your conversation status here.</p>
                            <button onClick={() => navigate('/my-tickets')} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                                <ChatCircleText size={20} /> View My Support Tickets
                            </button>
                        </div>
                    )}
                    {message.text && (
                        <div style={{ 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            marginBottom: '2rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            color: message.type === 'success' ? '#166534' : '#991b1b',
                            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                        }}>
                            {message.type === 'success' ? <CheckCircle size={24} /> : <Info size={24} />}
                            <span style={{ fontWeight: 500 }}>{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Envelope size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                        style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Subject</label>
                            <div style={{ position: 'relative' }}>
                                <ChatCircleText size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="Brief summary of your query"
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '0.9rem' }}>Message</label>
                            <textarea 
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                placeholder="Describe your issue in detail..."
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary" 
                            style={{ 
                                width: '100%', 
                                padding: '14px', 
                                fontSize: '1.1rem', 
                                borderRadius: '10px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '10px',
                                background: loading ? '#91a7ff' : 'var(--primary)',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    <PaperPlaneTilt size={20} weight="fill" />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                input:focus, textarea:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                @media (max-width: 600px) {
                    .support-card { padding: 1.5rem !important; }
                    grid-template-columns: 1fr !important;
                    .form-group:nth-child(1), .form-group:nth-child(2) {
                        grid-column: span 2;
                    }
                }
            `}</style>
        </main>
    );
};

export default Support;
