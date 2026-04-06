import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookLogo, TwitterLogo, InstagramLogo, YoutubeLogo, MapPin, Phone, Envelope } from '@phosphor-icons/react';

const Footer = () => {
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-col" style={{ textAlign: 'left' }}>
          <Link to="/" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
            <img src="/footer-logo.png" alt="Pinaka Technologies" style={{ height: '85px', width: 'auto' }} />
          </Link>
          <p style={{ marginTop: '1rem', maxWidth: '300px' }}>Your one-stop destination for premium 3D printers, materials, and accessories. Bringing innovation to life.</p>
          <div className="social-icons">
            <a href="#"><FacebookLogo /></a>
            <a href="#"><TwitterLogo /></a>
            <a href="#"><InstagramLogo /></a>
            <a href="#"><YoutubeLogo /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/about-us.html">About Us</Link></li>
            <li><Link to="/products.html">All Products</Link></li>
            <li><Link to="/products.html?sort=popularity">Best Sellers</Link></li>
            <li><Link to="/products.html?sort=newest">New Arrivals</Link></li>
            <li><Link to="/printing-services">Printing Services</Link></li>
            <li><Link to="/materials">Materials</Link></li>
            <li><Link to="/testimonials">Testimonials</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/support.html">Customer Support</Link></li>
            <li><Link to="/terms-and-conditions">Terms and Conditions</Link></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul style={{ gap: '1rem' }}>
            <li style={{ display: 'flex', gap: '10px' }}><MapPin size={20} style={{ color: 'var(--primary)' }} /> 86, Sanjay Gandhi Nagar, Naubasta, Kanpur, Uttar Pradesh-208021, India</li>
            <li style={{ display: 'flex', gap: '10px' }}><Phone size={20} style={{ color: 'var(--primary)' }} /> (+91)-8299475268 (Whatsapp), +91-9935404850</li>
            <li style={{ display: 'flex', gap: '10px' }}><Envelope size={20} style={{ color: 'var(--primary)' }} /> sales@3dpinaka.in</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>@2023 3DPinaka.com. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
