import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo } from '@phosphor-icons/react';

const ShippingPolicy = () => {

    return (
        <main>
            {/* Header Section */}
            <div className="policy-header" style={{ background: 'var(--dark-bg)', padding: '5rem 0', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Link to="/" className="back-home-btn" style={{ position: 'absolute', top: '-60px', left: '0' }}>
                            <ArrowLeft /> Back to Home
                        </Link>
                        <h1 className="policy-title" style={{ fontSize: '3rem', fontWeight: 800 }}>Shipping &amp; Delivery Policy</h1>
                        <p className="policy-subtitle" style={{ opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                            Learn about our shipping coverage, delivery timelines, and handling of shipments.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <section className="section container policy-content" style={{ background: 'var(--colorful-bg)', padding: '3rem', borderRadius: '15px', border: '1px solid var(--border-color)', margin: '2rem auto', maxWidth: '1000px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ color: 'var(--text-dark)', lineHeight: '1.8' }}>

                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}><strong>Last Updated: May 2026</strong></p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Shipping Coverage</h3>
                    <p>We currently deliver products <strong>across India</strong>.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Delivery Time</h3>
                    <p>Delivery timelines may vary depending upon:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Product type</li>
                        <li>Customization requirements</li>
                        <li>Production complexity</li>
                        <li>Delivery location</li>
                        <li>Courier availability</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Delays</h3>
                    <p>We are <strong>not responsible</strong> for delays caused by:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Courier companies</li>
                        <li>Weather conditions</li>
                        <li>Government restrictions</li>
                        <li>Natural disasters</li>
                        <li>Unforeseen operational issues</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>4. Damaged Shipments</h3>
                    <p>Customers must inspect packages before accepting delivery. <strong>Damaged or tampered packages should not be accepted.</strong></p>

                </div>
            </section>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default ShippingPolicy;
