import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Quotes, WhatsappLogo } from '@phosphor-icons/react';

const Testimonials = () => {
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

    const allTestimonials = [
        { name: "Rajesh Kumar", role: "Product Designer", text: "The Bambu Lab P2S has transformed our prototyping workflow. The print quality is exceptional!", img: 11 },
        { name: "Priya Sharma", role: "Architect", text: "Creality K1 Max is a beast! The speed and stability are unmatched for our large scale models.", img: 12 },
        { name: "Amit Patel", role: "R&D Manager", text: "3D Pinaka provided us with end-to-end support for our industrial setup. Highly recommended!", img: 13 },
        { name: "Sneha Reddy", role: "Hobbyist", text: "Buying my first printer was easy with their expert guidance. Best after-sales support in India.", img: 14 },
        { name: "Vikram Singh", role: "Mechanical Engineer", text: "The J1 Pro IDEX is perfect for dual-material printing. 3D Pinaka's delivery was lightning fast.", img: 15 },
        { name: "Anjali Gupta", role: "Jewellery Designer", text: "Resin printing results from the Phrozen series are incredibly detailed. My designs look stunning.", img: 16 },
        { name: "Karthik Raja", role: "Tech Lead", text: "Seamless integration and top-tier products. Their filament quality is very consistent.", img: 17 },
        { name: "Meera Das", role: "Medical Researcher", text: "Precision is key in our field, and the printers supplied here meet every rigorous standard.", img: 18 },
        { name: "Suresh Menon", role: "Manufacturer", text: "Upgrading our facility with 3D Pinaka was the best decision for our production line.", img: 19 },
        { name: "Deepika Padukone", role: "Interior Designer", text: "Unique decor pieces are now possible thanks to the wide range of filaments available here.", img: 20 },
        { name: "Rohan Malhotra", role: "Automotive Engineer", text: "Prototyping car parts has never been faster. The technical support team is very knowledgeable.", img: 21 },
        { name: "Tanya Sharma", role: "Fashion Designer", text: "3D printed accessories are the future, and 3D Pinaka makes it accessible today.", img: 22 }
    ];

    return (
        <main>
            <div style={{ background: 'var(--dark-bg)', padding: '5rem 0', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Link to="/" className="back-home-btn" style={{ position: 'absolute', top: '-60px', left: '0' }}><ArrowLeft /> Back to Home</Link>
                        <Quotes size={48} weight="fill" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>Client Testimonials</h1>
                        <p style={{ opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Hear from our community of over 10,000+ satisfied innovators and creators.</p>
                    </div>
                </div>
            </div>

            <section className="section container">
                <div className="testi-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                    {allTestimonials.map((t, i) => (
                        <div key={i} className="testi-card reveal" ref={addToRevealRefs} style={{ background: 'white', border: '1px solid var(--border-color)', margin: 0 }}>
                            <div className="stars">★★★★★</div>
                            <p style={{ fontStyle: 'italic', color: 'var(--text-dark)', margin: '1.5rem 0' }}>"{t.text}"</p>
                            <div className="user-info">
                                <img src={`https://i.pravatar.cc/150?img=${t.img}`} alt={t.name} className="user-avatar" />
                                <div className="user-details">
                                    <h5 style={{ fontWeight: 700, margin: 0 }}>{t.name}</h5>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--light-bg)' }}>
                <h3>Ready to start your 3D printing journey?</h3>
                <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Explore Products</Link>
            </div>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Testimonials;
