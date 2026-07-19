import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo } from '@phosphor-icons/react';

const RefundPolicy = () => {

    return (
        <main>
            {/* Header Section */}
            <div className="policy-header" style={{ background: 'var(--dark-bg)', padding: '5rem 0', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Link to="/" className="back-home-btn" style={{ position: 'absolute', top: '-60px', left: '0' }}>
                            <ArrowLeft /> Back to Home
                        </Link>
                        <h1 className="policy-title" style={{ fontSize: '3rem', fontWeight: 800 }}>Refund, Return &amp; Cancellation Policy</h1>
                        <p className="policy-subtitle" style={{ opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                            Understand our policies on refunds, returns, and order cancellations.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <section className="section container policy-content" style={{ background: 'var(--colorful-bg)', padding: '3rem', borderRadius: '15px', border: '1px solid var(--border-color)', margin: '2rem auto', maxWidth: '1000px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ color: 'var(--text-dark)', lineHeight: '1.8' }}>

                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}><strong>Last Updated: May 2026</strong></p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Cancellation Policy</h3>
                    <p>Once an order is placed and confirmed, it <strong>cannot be cancelled</strong>.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Return Policy</h3>
                    <p>Once products are sold, they <strong>cannot be returned</strong>.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Replacement Policy</h3>
                    <p>If any manufacturing defect is found within <strong>7 days of purchase</strong>, replacement of damaged parts may be provided after approval from the manufacturer/company.</p>
                    <p>Replacement is subject to:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Product inspection</li>
                        <li>Verification of manufacturing defect</li>
                        <li>Approval by company/manufacturer</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>4. Non-Eligible Cases</h3>
                    <p>Replacement requests shall <strong>not be accepted</strong> for:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Customer misuse</li>
                        <li>Physical damage after delivery</li>
                        <li>Improper handling</li>
                        <li>Normal wear and tear</li>
                        <li>Minor surface marks or dimensional tolerances</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>5. Important Delivery Note</h3>
                    <p>At the time of delivery, customers must ensure:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li>Product packaging is properly sealed</li>
                        <li>Package is not damaged or tampered</li>
                    </ul>
                    <p>If the package appears damaged or tampered, customers should:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li><strong>Refuse delivery immediately</strong></li>
                        <li>Contact our support team without delay</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>6. Payment Gateway Charges</h3>
                    <p>Any payment gateway charges applicable on online transactions shall be borne by the customer.</p>

                </div>
            </section>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default RefundPolicy;
