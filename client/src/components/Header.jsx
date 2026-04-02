import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CaretDown, MagnifyingGlass, User, Heart, ShoppingCart, List, Shield } from '@phosphor-icons/react';

const Header = ({ user, cartCount, wishlistCount, toggleMobileMenu }) => {
  const [showAdminAlert, setShowAdminAlert] = useState(false);

  return (
    <header>
      <div className="container navbar">
        <div className="mobile-menu-trigger">
          <List size={22} className="menu-btn" onClick={toggleMobileMenu} />
        </div>

        <Link to="/" className="logo">
          <span className="logo-box">3D</span> Print Hub
        </Link>
        
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <div className="dropdown">
            <a href="javascript:void(0)" className="dropbtn">
              Products <CaretDown size={14} weight="bold" />
            </a>
            <div className="dropdown-content mega-menu">
              <div className="mega-menu-grid">
                <div className="mega-col">
                  <div className="col-header">
                    <h4>BRANDS</h4>
                    <Link to="/products" className="view-all">VIEW ALL</Link>
                  </div>
                  <ul className="mega-list">
                    <li><Link to="/products?brand=anycubic">Anycubic</Link></li>
                    <li><Link to="/products?brand=bambu lab">Bambu Lab</Link></li>
                    <li><Link to="/products?brand=creality">Creality</Link></li>
                    <li><Link to="/products?brand=snapmaker">Snapmaker</Link></li>
                    <li><Link to="/products?brand=rotrics">Rotrics</Link></li>
                    <li><Link to="/products?brand=flashforge">Flashforge</Link></li>
                    <li><Link to="/products?brand=skriware">Skriware</Link></li>
                    <li><Link to="/products?brand=magforms">Magforms</Link></li>
                    <li><Link to="/products?brand=zmorph">Zmorph</Link></li>
                    <li><Link to="/products?brand=sunlu">Sunlu</Link></li>
                    <li><Link to="/products?brand=elegoo">Elegoo</Link></li>
                  </ul>
                </div>
                <div className="mega-col">
                  <div className="col-header">
                    <h4>CATEGORIES</h4>
                  </div>
                  <ul className="mega-list">
                    <li><Link to="/products?category=3D Printer">3D Printer <span className="hot-badge">Hot</span></Link></li>
                    <li><Link to="/products?category=Laser Engraver">Laser Engraver</Link></li>
                    <li><Link to="/products?category=Food Printer">Food Printer</Link></li>
                    <li><Link to="/products?category=3D Scanner">3D Scanner</Link></li>
                    <li><Link to="/products?category=CNC Router">CNC Router</Link></li>
                    <li><Link to="/products?category=Robotics">Robotics</Link></li>
                    <li><Link to="/products?category=3D Pen">3D Pen</Link></li>
                    <li><Link to="/products?category=Filament">Filament</Link></li>
                    <li><Link to="/products?category=Resin">Resin</Link></li>
                    <li><Link to="/products?category=Spare Parts">Spare Parts</Link></li>
                    <li><Link to="/products?category=Accessory">Accessory</Link></li>
                  </ul>
                </div>
                <div className="mega-col" style={{ borderRight: 'none', paddingRight: 0 }}>
                  <div className="col-header">
                    <h4>3IDEA EXCLUSIVE</h4>
                  </div>
                  <ul className="mega-list">
                    <li><Link to="/products?brand=Anycubic">Anycubic Kobra 2 Neo 3D Printer</Link></li>
                    <li><Link to="/products?brand=Anycubic">Anycubic Photon Mono 4 3D Printer</Link></li>
                    <li><Link to="/products?brand=Anycubic">Anycubic Kobra 3 3D Printer</Link></li>
                    <li><Link to="/products?brand=Snapmaker">Snapmaker Artisan 3-In-1 3D Printer</Link></li>
                    <li><Link to="/products?brand=Rotrics">Rotrics DexArm Hyper Luxury Kit</Link></li>
                  </ul>
                </div>
                <div className="mega-col mega-img-col">
                  <Link to="/products.html?category=3D Printer" className="mega-img-card">
                    <img src="/images/product_fdm_1_1774868367269.png" alt="3D Printer" />
                    <span className="label" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>3D Printer</span>
                  </Link>
                </div>
                <div className="mega-col mega-img-col">
                  <Link to="/products.html?category=Laser Engraver" className="mega-img-card laser-img" style={{ background: '#e2e8f0' }}>
                    <img src="/images/product_resin_2_1774868383507.png" alt="Laser Engraver" />
                    <span className="label" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>Laser Engraver</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Link to="/materials.html">Materials</Link>
          <Link to="/support.html">Bulk Enquiry</Link>
          <div className="dropdown">
            <Link to="/products?condition=Refurbished" className="dropbtn">
              Refurbished Store <CaretDown size={14} weight="bold" />
            </Link>
            <div className="dropdown-content mega-menu refurbished-mega">
              <div className="mega-menu-grid refurbished-grid">
                <div className="mega-col categories-col">
                  <div className="col-header">
                    <h4>Categories</h4>
                  </div>
                  <ul className="mega-list">
                    <li><Link to="/products?condition=Refurbished&category=3D Printer">3D Printer</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=Laser Engraver">Laser Engraver</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=Food Printer">Food Printer</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=3D Scanner">3D Scanner</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=CNC Router">CNC Router</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=3D Pen">3D Pen</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=Filament">Filament</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=Resin">Resin</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=Spare Parts">Spare Parts</Link></li>
                    <li><Link to="/products?condition=Refurbished&category=Accessory">Accessory</Link></li>
                  </ul>
                </div>
                <div className="mega-col products-col">
                    <div className="col-header">
                      <h4>Top Products</h4>
                    </div>
                    <div className="refurbished-products-list">
                      <div className="refurbished-product-item">
                        <div className="product-thumb">
                          <img src="/images/Refurbished Anycubic Kobra 3 Combo 3D Printer.png" alt="Refurbished Anycubic Kobra 3 Combo 3D Printer" />
                        </div>
                        <div className="product-details">
                          <Link to="/products?condition=Refurbished&brand=anycubic" className="product-name">Refurbished Anycubic Kobra 3 Combo 3D Printer</Link>
                          <span className="product-price">₹36,999.00</span>
                        </div>
                      </div>
                      <div className="refurbished-product-item">
                        <div className="product-thumb">
                          <img src="/images/Refurbished Ender-3 S1 Pro 3D Printer.png" alt="Refurbished Ender-3 S1 Pro 3D Printer" />
                        </div>
                        <div className="product-details">
                          <Link to="/products?condition=Refurbished&brand=creality" className="product-name">Refurbished Ender-3 S1 Pro 3D Printer</Link>
                          <span className="product-price">₹34,999.00</span>
                        </div>
                      </div>
                      <div className="refurbished-product-item">
                        <div className="product-thumb">
                          <img src="/images/Refurbished Anycubic Kobra 3 Combo 3D Printer with 4 Color 3Idea PLA Filaments (Green,Purple,Sky Blue,Skin).png" alt="Refurbished Anycubic Kobra 3 Combo 3D Printer with 4 Color 3Idea PLA Filaments" />
                        </div>
                        <div className="product-details">
                          <Link to="/products?condition=Refurbished&brand=anycubic" className="product-name">Refurbished Anycubic Kobra 3 Combo 3D Printer with 4 Color 3Idea PLA Filaments (Green,Purple,Sky Blue,Skin)</Link>
                          <span className="product-price">₹49,999.00</span>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
          <Link to="/support.html">Support</Link>
          <Link to="/printing-services">Printing Services</Link>
          <Link to="/about-us.html">About Us</Link>
        </nav>

        <div className="nav-icons">
          <div className="desktop-only" style={{ marginRight: '8px' }}>
              <Link 
                to={user && user.role === 'admin' ? '/admin' : '#'} 
                style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }} 
                title="Admin Dashboard"
                onClick={(e) => {
                    if (!user || user.role !== 'admin') {
                        e.preventDefault();
                        setShowAdminAlert(true);
                    }
                }}
              >
                  <Shield size={22} weight="fill" />
                  <span style={{ fontSize: '0.85rem' }}>Admin</span>
              </Link>
          </div>

          <div className="desktop-only">
            {user ? (
                <Link to="/login" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={20} />
                <span style={{ fontSize: '0.85rem' }}>{user.firstName || user.name?.split(' ')[0] || 'User'}</span>
                </Link>
            ) : (
                <Link to="/login" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}><User size={20} /></Link>
            )}
          </div>

          <Link to="/wishlist.html" className="heart-icon-wrap desktop-only" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
            <Heart size={20} />
            {wishlistCount > 0 && <span className="heart-badge">{wishlistCount}</span>}
          </Link>
          
          <Link to="/products.html" className="search-icon-mobile" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
            <MagnifyingGlass size={22} />
          </Link>

          <Link to="/cart.html" className="cart-icon-wrap" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
            <ShoppingCart size={22} />
            <span className="cart-badge">{cartCount}</span>
          </Link>
        </div>
      </div>

      {/* Admin Access Denied Modal */}
      {showAdminAlert && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative' }}>
            <button onClick={() => setShowAdminAlert(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><Shield size={24} color="#f43f5e" /></button>
            <div style={{ background: '#ffe4e6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Shield size={32} color="#e11d48" weight="fill" />
            </div>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.2rem' }}>Access Denied</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '15px', lineHeight: '1.5' }}>
              You don't have permission to view this page. Please log in as an administrator to access the admin panel.
            </p>
            <button 
              onClick={() => setShowAdminAlert(false)} 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
              onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}
            >
              Okay, I understand
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
