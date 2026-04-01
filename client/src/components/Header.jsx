import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CaretDown, MagnifyingGlass, User, Heart, ShoppingCart, List } from '@phosphor-icons/react';

const Header = ({ user, cartCount, wishlistCount, toggleMobileMenu }) => {
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
                    <Link to="/products.html" className="view-all">VIEW ALL</Link>
                  </div>
                  <ul className="mega-list">
                    <li><Link to="/anycubic.html">Anycubic</Link></li>
                    <li><Link to="/bambu.html">Bambu Lab</Link></li>
                    <li><Link to="/creality.html">Creality</Link></li>
                    <li><Link to="/snapmaker.html">Snapmaker</Link></li>
                    <li><Link to="/rotrics.html">Rotrics</Link></li>
                    <li><Link to="/flashforge.html">Flashforge</Link></li>
                    <li><Link to="/skriware.html">Skriware</Link></li>
                    <li><Link to="/magforms.html">Magforms</Link></li>
                    <li><Link to="/zmorph.html">Zmorph</Link></li>
                    <li><Link to="/sunlu.html">Sunlu</Link></li>
                    <li><Link to="/elegoo.html">Elegoo</Link></li>
                  </ul>
                </div>
                <div className="mega-col">
                  <div className="col-header">
                    <h4>CATEGORIES</h4>
                  </div>
                  <ul className="mega-list">
                    <li><Link to="/products.html?category=3D Printer" onClick={() => {}}>3D Printer <span className="hot-badge">Hot</span></Link></li>
                    <li><Link to="/products.html?category=Laser Engraver">Laser Engraver</Link></li>
                    <li><Link to="/products.html?category=Food Printer">Food Printer</Link></li>
                    <li><Link to="/products.html?category=3D Scanner">3D Scanner</Link></li>
                    <li><Link to="/products.html?category=CNC Router">CNC Router</Link></li>
                    <li><Link to="/products.html?category=Robotics">Robotics</Link></li>
                    <li><Link to="/products.html?category=3D Pens">3D Pens</Link></li>
                    <li><Link to="/products.html?category=Filaments">Filaments</Link></li>
                    <li><Link to="/products.html?category=Resins">Resins</Link></li>
                    <li><Link to="/products.html?category=Spare Parts">Spare Parts</Link></li>
                    <li><Link to="/products.html?category=Accessories">Accessories</Link></li>
                  </ul>
                </div>
                <div className="mega-col" style={{ borderRight: 'none', paddingRight: 0 }}>
                  <div className="col-header">
                    <h4>3IDEA EXCLUSIVE</h4>
                  </div>
                  <ul className="mega-list">
                    <li><Link to="/anycubic.html">Anycubic Kobra 2 Neo 3D Printer</Link></li>
                    <li><Link to="/anycubic.html">Anycubic Photon Mono 4 3D Printer</Link></li>
                    <li><Link to="/anycubic.html">Anycubic Kobra 3 3D Printer</Link></li>
                    <li><Link to="/snapmaker.html">Snapmaker Artisan 3-In-1 3D Printer</Link></li>
                    <li><Link to="/rotrics.html">Rotrics DexArm Hyper Luxury Kit</Link></li>
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
            <Link to="/products.html?q=Refurbished" className="dropbtn">
              Refurbished Store <CaretDown size={14} weight="bold" />
            </Link>
            <div className="dropdown-content mega-menu refurbished-mega">
              <div className="mega-menu-grid refurbished-grid">
                <div className="mega-col categories-col">
                  <div className="col-header">
                    <h4>Categories</h4>
                  </div>
                  <ul className="mega-list">
                    <li><Link to="/products.html?q=Refurbished&category=3D Printer">3D Printer</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=Laser Engraver">Laser Engraver</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=Food Printer">Food Printer</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=3D Scanner">3D Scanner</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=CNC Router">CNC Router</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=3D Pens">3D Pens</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=Filaments">Filaments</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=Resins">Resins</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=Spare Parts">Spare Parts</Link></li>
                    <li><Link to="/products.html?q=Refurbished&category=Accessories">Accessories</Link></li>
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
                          <Link to="/products.html?q=Refurbished" className="product-name">Refurbished Anycubic Kobra 3 Combo 3D Printer</Link>
                          <span className="product-price">₹36,999.00</span>
                        </div>
                      </div>
                      <div className="refurbished-product-item">
                        <div className="product-thumb">
                          <img src="/images/Refurbished Ender-3 S1 Pro 3D Printer.png" alt="Refurbished Ender-3 S1 Pro 3D Printer" />
                        </div>
                        <div className="product-details">
                          <Link to="/products.html?q=Refurbished" className="product-name">Refurbished Ender-3 S1 Pro 3D Printer</Link>
                          <span className="product-price">₹34,999.00</span>
                        </div>
                      </div>
                      <div className="refurbished-product-item">
                        <div className="product-thumb">
                          <img src="/images/Refurbished Anycubic Kobra 3 Combo 3D Printer with 4 Color 3Idea PLA Filaments (Green,Purple,Sky Blue,Skin).png" alt="Refurbished Anycubic Kobra 3 Combo 3D Printer with 4 Color 3Idea PLA Filaments" />
                        </div>
                        <div className="product-details">
                          <Link to="/products.html?q=Refurbished" className="product-name">Refurbished Anycubic Kobra 3 Combo 3D Printer with 4 Color 3Idea PLA Filaments (Green,Purple,Sky Blue,Skin)</Link>
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
          <div className="desktop-only">
            {user ? (
                <Link to="/login.html" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={20} />
                <span style={{ fontSize: '0.85rem' }}>{user.name.split(' ')[0]}</span>
                </Link>
            ) : (
                <Link to="/login.html" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}><User size={20} /></Link>
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
    </header>
  );
};

export default Header;
