import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RocketLaunch, Cpu, Users, Globe, WhatsappLogo } from '@phosphor-icons/react';

const About = () => {
    const revealRefs = useRef([]);

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
    }, []);

    const addToRevealRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    return (
        <main>
            {/* Hero Section */}
            <div style={{ position: 'relative', height: '400px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', backgroundColor: '#000' }}>
                <img src="/images/about-hero.png" alt="About Us Hero" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, filter: 'brightness(0.35)' }} />
                
                <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                    <div style={{ position: 'absolute', top: '-110px', left: '15px' }}>
                        <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                    </div>
                    <div className="about-hero-content">
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: '1.2' }}>Our Story</h1>
                        <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', opacity: 0.9, padding: '0 15px' }}>Redefining the future of manufacturing through innovation and precision 3D printing.</p>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <section className="section container reveal" ref={addToRevealRefs}>
                <div className="about-mission-grid">
                    <div style={{ padding: '0 5px' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--text-dark)', lineHeight: '1.3' }}>Empowering Innovation Through Precision 3D Printing</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                            Welcome to <strong>3D Pinaka</strong>, India's premier destination for cutting-edge additive manufacturing solutions. Based in the industrial heart of <strong>Kanpur, Uttar Pradesh</strong>, we are more than just an e-commerce store—we are your partners in turning digital concepts into physical reality.
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8' }}>
                            At 3D Pinaka, we specialize in providing high-performance <strong>3D printers, premium filaments, laser engravers, and resin systems</strong> from world-renowned brands like <strong>Bambu Lab, Creality, Anycubic, and Flashforge</strong>.
                        </p>
                    </div>
                    <div style={{ background: 'var(--light-bg)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '10px', height: 'fit-content', flexShrink: 0 }}>
                                    <RocketLaunch size={24} weight="bold" />
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>Innovation First</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Always bringing the latest 3D printing tech to your doorstep.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: '#a855f7', color: 'white', padding: '12px', borderRadius: '10px', height: 'fit-content', flexShrink: 0 }}>
                                    <Cpu size={24} weight="bold" />
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>Expert Support</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dedicated engineers ready to assist with your technical needs.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: '#3b82f6', color: 'white', padding: '12px', borderRadius: '10px', height: 'fit-content', flexShrink: 0 }}>
                                    <Users size={24} weight="bold" />
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>Community Driven</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Building a thriving network of makers across the globe.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Gradient */}
            <div style={{ background: 'var(--dark-bg)', padding: '4rem 0', color: 'white' }}>
                <div className="container stats-grid reveal" ref={addToRevealRefs}>
                    <div className="stat-item" style={{ padding: '10px' }}>
                        <h3 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>10k+</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Happy Customers</p>
                    </div>
                    <div className="stat-item" style={{ padding: '10px' }}>
                        <h3 style={{ fontSize: '3rem', color: '#a855f7', marginBottom: '0.5rem' }}>500+</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Expert Engineers</p>
                    </div>
                    <div className="stat-item" style={{ padding: '10px' }}>
                        <h3 style={{ fontSize: '3rem', color: '#3b82f6', marginBottom: '0.5rem' }}>25+</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Premium Brands</p>
                    </div>
                    <div className="stat-item" style={{ padding: '10px' }}>
                        <h3 style={{ fontSize: '3rem', color: '#10b981', marginBottom: '0.5rem' }}>24/7</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Customer Support</p>
                    </div>
                </div>
            </div>

            {/* Our Values Section */}
            <section className="section container reveal" ref={addToRevealRefs} style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', padding: '0 15px' }}>Why Choose 3D Pinaka?</h2>
                <div className="about-values-grid" style={{ padding: '0 15px' }}>
                    <div className="feature-box" style={{ background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', margin: 0 }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}><Globe size={40} /></div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Global Presence</h3>
                        <p style={{ fontSize: '0.9rem' }}>We ship internationally, ensuring premium 3D tech reaches every corner.</p>
                    </div>
                    <div className="feature-box" style={{ background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', margin: 0 }}>
                        <div style={{ color: '#a855f7', marginBottom: '1rem' }}><Cpu size={40} /></div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Quality Assured</h3>
                        <p style={{ fontSize: '0.9rem' }}>Every printer undergoes rigorous testing before it leaves our facility.</p>
                    </div>
                    <div className="feature-box" style={{ background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', margin: 0 }}>
                        <div style={{ color: '#3b82f6', marginBottom: '1rem' }}><Users size={40} /></div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Customer First</h3>
                        <p style={{ fontSize: '0.9rem' }}>Our priority is your success. We're with you from the first print.</p>
                    </div>
                </div>
            </section>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default About;
