import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo, Heart } from '@phosphor-icons/react';
import { MATERIALS } from '../constants/data';

const Materials = () => {
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

    const handleAddToCart = (item) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push({
            id: Date.now(),
            title: item.title,
            price: item.price,
            image: item.image
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `${item.title} added to cart!` } }));
    };

    const handleAddToWishlist = (item) => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        if (!wishlist.find(p => p.title === item.title)) {
            wishlist.push({
                id: Date.now(),
                title: item.title,
                price: item.price,
                image: item.image
            });
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            window.dispatchEvent(new Event('wishlistUpdated'));
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `${item.title} added to wishlist!` } }));
        } else {
            window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `${item.title} is already in wishlist!`, type: 'info' } }));
        }
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
                    {MATERIALS.map((item) => (
                        <div key={item.id} className="product-card reveal" ref={addToRevealRefs}>
                            <button 
                                className="wishlist-btn" 
                                onClick={() => handleAddToWishlist(item)}
                                title="Add to Wishlist"
                            >
                                <Heart size={20} weight="bold" />
                            </button>
                            <img src={item.image} alt={item.title} className="product-img" />
                            <div className="product-info">
                                <div className="product-cat">{item.category}</div>
                                <div className="product-title">{item.title}</div>
                                <div className="stars">{item.stars}</div>
                                <div className="product-price">{item.price}</div>
                                <button className="btn btn-block btn-dark" onClick={() => handleAddToCart(item)}>Add to Cart</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            <a href="https://wa.me/1234567890" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default Materials;
