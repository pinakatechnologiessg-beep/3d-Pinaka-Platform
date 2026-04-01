import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookLogo, TwitterLogo, InstagramLogo, YoutubeLogo, MapPin, Phone, Envelope } from '@phosphor-icons/react';

const Footer = () => {
  return (
    <footer>
      <div className="container footer-grid">
        <div className="footer-col">
          <div className="logo-box footer-logo">3D</div> <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>Print Hub</span>
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
            <li><Link to="/support.html">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/support.html">Help Center</Link></li>
            <li><Link to="/support.html">Track Order</Link></li>
            <li><Link to="/support.html">Shipping Info</Link></li>
            <li><Link to="/support.html">Returns</Link></li>
            <li><Link to="/support.html">Warranty</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <ul style={{ gap: '1rem' }}>
            <li style={{ display: 'flex', gap: '10px' }}><MapPin size={20} style={{ color: 'var(--primary)' }} /> 123 Innovation Street, Tech Park, Bangalore - 560001</li>
            <li style={{ display: 'flex', gap: '10px' }}><Phone size={20} style={{ color: 'var(--primary)' }} /> +91 8299475268</li>
            <li style={{ display: 'flex', gap: '10px' }}><Envelope size={20} style={{ color: 'var(--primary)' }} /> support@printhub.com</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>&copy; 2026 3D Print Hub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
