import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo } from '@phosphor-icons/react';

const TermsAndConditions = () => {

    return (
        <main>
            {/* Header Section */}
            <div className="policy-header" style={{ background: 'var(--dark-bg)', padding: '5rem 0', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Link to="/" className="back-home-btn" style={{ position: 'absolute', top: '-60px', left: '0' }}>
                            <ArrowLeft /> Back to Home
                        </Link>
                        <h1 className="policy-title" style={{ fontSize: '3rem', fontWeight: 800 }}>Terms &amp; Conditions</h1>
                        <p className="policy-subtitle" style={{ opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                            Please read these terms and conditions carefully before using our service.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <section className="section container policy-content" style={{ background: 'white', padding: '3rem', borderRadius: '15px', border: '1px solid var(--border-color)', margin: '2rem auto', maxWidth: '1000px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ color: 'var(--text-dark)', lineHeight: '1.8' }}>

                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}><strong>Last Updated: May 2026</strong></p>

                    <p>By accessing and using <strong>3DPinaka</strong>, you agree to the following Terms &amp; Conditions.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Services</h3>
                    <p>We provide:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>3D Printing Services</li>
                        <li>Custom Manufacturing</li>
                        <li>3D Design &amp; Prototyping</li>
                        <li>Related Products &amp; Accessories</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Custom Orders</h3>
                    <p>Products manufactured based on customer specifications may have slight variations in:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Color</li>
                        <li>Texture</li>
                        <li>Finish</li>
                        <li>Dimensions</li>
                    </ul>
                    <p>Such variations are natural in 3D printing and shall not be considered defects.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Pricing</h3>
                    <p>Prices are subject to change without prior notice. Taxes, shipping charges, and payment gateway fees may apply additionally.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>4. Payments</h3>
                    <p>Orders will be processed only after successful payment confirmation through approved payment methods.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>5. Intellectual Property</h3>
                    <p>Customers remain responsible for all uploaded design files and confirm they possess necessary legal rights for reproduction and manufacturing.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>6. Limitation of Liability</h3>
                    <p>Pinaka Technologies SG Pvt Ltd shall not be liable for:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Indirect damages</li>
                        <li>Delays caused by courier/logistics</li>
                        <li>Production delays due to technical issues</li>
                        <li>Minor dimensional or finishing variations inherent to 3D printing</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>7. Governing Law</h3>
                    <p>These terms shall be governed under the laws of <strong>India</strong>.</p>

                </div>
            </section>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default TermsAndConditions;
