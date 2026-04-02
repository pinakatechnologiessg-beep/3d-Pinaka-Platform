import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, Heart } from '@phosphor-icons/react';
import { MATERIALS } from '../constants/data';
import { cartService } from '../services/cartService';

const Materials = () => {
    const revealRefs = useRef([]);
    const [dbProducts, setDbProducts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:5000/api/products?category=Filament,Resin');
                if (res.ok) {
                    setDbProducts(await res.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    const parsePrice = (p) => typeof p === 'number' ? p : (parseInt(String(p).replace(/[^0-9]/g, '')) || 0);

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

    const [wishlist, setWishlist] = React.useState([]);

    useEffect(() => {
        const updateWishlist = () => setWishlist(cartService.getWishlistItems());
        updateWishlist();
        window.addEventListener('wishlistUpdated', updateWishlist);
        return () => window.removeEventListener('wishlistUpdated', updateWishlist);
    }, []);

    const handleAddToCart = (item) => {
        cartService.addToCart(item);
    };

    const handleAddToWishlist = (item) => {
        cartService.toggleWishlist(item);
    };

    return (
        <main>
            <div style={{ background: 'var(--secondary)', padding: '4rem 0', textAlign: 'center', color: 'white' }}>
                <Link to="/" className="back-home-btn"><ArrowLeft /> Back to Home</Link>
                <h1>Filaments & Resins</h1>
                <p style={{ color: '#dbeafe', marginTop: '1rem' }}>Premium quality materials in all colors and types</p>
            </div>

            <section className="section container">
                <div className="products-grid">
                    {[...dbProducts, ...MATERIALS.map(p => ({ ...p, name: p.title }))].map((item) => (
                        <div key={item._id || item.id} className="product-card reveal" ref={addToRevealRefs}>
                            <button 
                                className={`wishlist-btn ${wishlist.some(w => w.title === (item.name || item.title)) ? 'active' : ''}`} 
                                onClick={() => handleAddToWishlist(item)}
                                title="Add to Wishlist"
                            >
                                <Heart size={20} weight={wishlist.some(w => w.title === (item.name || item.title)) ? "fill" : "bold"} />
                            </button>
                            <img src={item.image?.startsWith('/uploads') ? `http://localhost:5000${item.image}` : item.image} alt={item.name || item.title} className="product-img" />
                            <div className="product-info">
                                <div className="product-cat">{item.category} {item.brand && `| ${item.brand}`}</div>
                                <div className="product-title">{item.name || item.title}</div>
                                <div className="stars">
                                    {typeof item.rating === 'number' ? 
                                        ('★'.repeat(Math.floor(item.rating)) + '☆'.repeat(5 - Math.floor(item.rating)) + ` (${item.rating.toFixed(1)})`) : 
                                        (item.stars || '★★★★★ (5.0)')
                                    }
                                </div>
                                <div className="product-price">₹{parsePrice(item.price).toLocaleString('en-IN')}</div>
                                <button className="btn btn-block btn-dark" onClick={() => handleAddToCart(item)}>Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Materials;
