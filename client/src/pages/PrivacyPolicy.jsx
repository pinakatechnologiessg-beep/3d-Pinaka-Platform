import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo } from '@phosphor-icons/react';

const PrivacyPolicy = () => {

    return (
        <main>
            {/* Header Section */}
            <div className="policy-header" style={{ background: 'var(--dark-bg)', padding: '5rem 0', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Link to="/" className="back-home-btn" style={{ position: 'absolute', top: '-60px', left: '0' }}>
                            <ArrowLeft /> Back to Home
                        </Link>
                        <h1 className="policy-title" style={{ fontSize: '3rem', fontWeight: 800 }}>Privacy Policy</h1>
                        <p className="policy-subtitle" style={{ opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                            Your privacy is important to us. Learn how we collect and use your data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <section className="section container policy-content" style={{ background: 'white', padding: '3rem', borderRadius: '15px', border: '1px solid var(--border-color)', margin: '2rem auto', maxWidth: '1000px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ color: 'var(--text-dark)', lineHeight: '1.8' }}>

                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}><strong>Last Updated: May 2026</strong></p>

                    <p>Welcome to <strong>3DPinaka</strong>. This Privacy Policy explains how Pinaka Technologies SG Pvt Ltd collects, uses, and protects customer information.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Company Information</h3>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyle: 'none' }}>
                        <li><strong>Company Name:</strong> Pinaka Technologies SG Pvt Ltd</li>
                        <li><strong>Brand Name:</strong> 3DPinaka</li>
                        <li><strong>GSTIN:</strong> 09AALCP3503BIZQ</li>
                        <li><strong>Address:</strong> 86 Sanjay Gandhi Nagar, Naubasta, Kanpur, Uttar Pradesh, India</li>
                        <li><strong>Email:</strong> <a href="mailto:PINAKATECHNOLOGIESSG@GMAIL.COM" style={{ color: 'var(--primary)' }}>PINAKATECHNOLOGIESSG@GMAIL.COM</a></li>
                        <li><strong>Contact Number:</strong> 8299475268 / 9935404850</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Information We Collect</h3>
                    <p>We may collect customer information including:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Full Name</li>
                        <li>Email Address</li>
                        <li>Phone Number</li>
                        <li>Billing &amp; Shipping Address</li>
                        <li>Payment Information</li>
                        <li>Uploaded 3D Design Files</li>
                        <li>Device &amp; Browser Information</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. How We Use Your Information</h3>
                    <p>Customer information is used for:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Order Processing</li>
                        <li>Product Manufacturing</li>
                        <li>Shipping &amp; Delivery</li>
                        <li>Customer Support</li>
                        <li>Payment Verification</li>
                        <li>Service Improvement</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>4. Payment Security</h3>
                    <p>All online payments are processed securely through <strong>Razorpay</strong> and trusted payment partners. Additional payment gateway charges, if applicable, shall be borne by the customer.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>5. Intellectual Property</h3>
                    <p>Customers uploading STL, CAD, or any other design files confirm that they own the rights or permissions to use those files. The company shall not be responsible for any copyright or trademark violations committed by customers.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>6. Information Sharing</h3>
                    <p>We do not sell or rent customer information. Data may only be shared with:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Payment Gateway Providers</li>
                        <li>Courier &amp; Logistics Partners</li>
                        <li>Legal/Government Authorities when required by law</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>7. Data Security</h3>
                    <p>We use reasonable security measures to protect customer information. However, no online transmission or storage system is completely secure.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>8. Contact Information</h3>
                    <p>For privacy-related concerns:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', listStyle: 'none' }}>
                        <li><strong>Email:</strong> <a href="mailto:PINAKATECHNOLOGIESSG@GMAIL.COM" style={{ color: 'var(--primary)' }}>PINAKATECHNOLOGIESSG@GMAIL.COM</a></li>
                        <li><strong>Phone:</strong> 8299475268 / 9935404850</li>
                    </ul>

                </div>
            </section>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default PrivacyPolicy;
