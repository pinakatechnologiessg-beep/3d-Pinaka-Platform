import React, { useEffect, useRef } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo } from '@phosphor-icons/react';
import { BRANDS } from '../constants/data';

const BrandPage = () => {
    const { brandName } = useParams();
    const location = useLocation();
    const revealRefs = useRef([]);
    
    // Extract brand from pathname if it's a .html route (e.g., /bambu.html)
    const effectiveBrandName = brandName || location.pathname.split('/').pop().replace('.html', '');
    
    const brand = BRANDS.find(b => b.path === effectiveBrandName) || { 
        name: effectiveBrandName.charAt(0).toUpperCase() + effectiveBrandName.slice(1) 
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, [brandName]);

    return (
        <main>
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>{brand.name} Printers</h1>
                <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Explore the latest collection from {brand.name}</p>
            </div>

            <section className="section container">
                <div className="products-grid">
                    <div className="reveal" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', background: 'var(--light-bg)', borderRadius: '12px', marginBottom: '2rem' }} ref={el => el && revealRefs.current.push(el)}>
                        <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>{brand.name} Collection</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Products and images for this brand will be added here later.</p>
                        <Link to="/products" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>View All General Products</Link>
                    </div>
                </div>
            </section>
            
            <a href="https://wa.me/1234567890" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default BrandPage;
