import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Envelope, WhatsappLogo } from '@phosphor-icons/react';

const Support = () => {
    const revealRefs = React.useRef([]);
    const [submitted, setSubmitted] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        type: 'General Support',
        message: ''
    });

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const addToRevealRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('http://localhost:5000/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <main>
            <div style={{ background: 'var(--gradient)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>How can we help you?</h1>
                <p style={{ color: '#f8fafc', marginTop: '1rem', opacity: 0.9 }}>Our experts are 24/7 ready to assist you</p>
            </div>

            <section className="section container support-section reveal" ref={addToRevealRefs}>
                <div>
                    <h2>Get in touch</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Fill out the form below and we will contact you within 24 hours.</p>
                    
                    {submitted ? (
                        <div style={{ padding: '2rem', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }}>✓</div>
                            <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>Query Received!</h3>
                            <p style={{ color: '#065f46' }}>Thank you for reaching out. Our team will get back to you shortly.</p>
                            <button onClick={() => setSubmitted(false)} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Send Another</button>
                        </div>
                    ) : (
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', borderRadius: '6px', marginTop: '5px' }} required />
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', borderRadius: '6px', marginTop: '5px' }} required />
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enquiry Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', borderRadius: '6px', marginTop: '5px' }}>
                                    <option value="General Support">General Support</option>
                                    <option value="Bulk Enquiry">Bulk Enquiry</option>
                                    <option value="Printing Services">Printing Services</option>
                                    <option value="Refurbished Item Info">Refurbished Item Info</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Message</label>
                                <textarea name="message" rows="5" value={formData.message} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #94a3b8', backgroundColor: '#f1f5f9', borderRadius: '6px', marginTop: '5px' }} required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={loading}>
                                {loading ? 'Sending...' : 'Submit Message'}
                            </button>
                        </form>
                    )}
                </div>
                
                <div>
                    <h2>Contact Information</h2>
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--light-bg)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)', fontSize: '1.5rem' }}>
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '0.3rem' }}>Office Address</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>123 Innovation Street, Tech Park,<br />Bangalore - 560001</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--light-bg)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)', fontSize: '1.5rem' }}>
                                <Phone size={24} />
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '0.3rem' }}>Phone Number</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Support: +91 8299475268<br />Email: support@printhub.com</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--light-bg)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)', fontSize: '1.5rem' }}>
                                <Envelope size={24} />
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '0.3rem' }}>Email Addresses</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>support@printhub.com<br />sales@printhub.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Support;
