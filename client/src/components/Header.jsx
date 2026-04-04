import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, List, X, CaretDown, MagnifyingGlass, Package, Shield } from '@phosphor-icons/react';
import { cartService } from '../services/cartService';
import { getImageUrl } from '../utils/imageUtils';
import Logo from './Logo';
import MaterialsMenu from './MaterialsMenu';

const Header = ({ user, cartCount, wishlistCount, toggleMobileMenu }) => {
  const [showAdminAlert, setShowAdminAlert] = useState(false);

  return (
    <header>
      <div className="container navbar">
        <div className="mobile-menu-trigger">
          <List size={22} className="menu-btn" onClick={toggleMobileMenu} />
        </div>

        <Link to="/" className="logo">
          <Logo height={window.innerWidth < 768 ? 60 : 75} />
        </Link>
        
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <div className="dropdown">
            <span className="dropbtn" style={{ cursor: 'pointer' }}>
              Products <CaretDown size={14} weight="bold" />
            </span>
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
                    <img src={getImageUrl("/images/product-fdm-1-1774868367269.png")} alt="3D Printer" loading="lazy" onError={(e) => (e.target.src = "/fallback.png")}/>
                    <span className="label" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>3D Printer</span>
                  </Link>
                </div>
                <div className="mega-col mega-img-col">
                  <Link to="/products.html?category=Laser Engraver" className="mega-img-card laser-img" style={{ background: '#e2e8f0' }}>
                    <img src={getImageUrl("/images/product-resin-2-1774868383507.png")} alt="Laser Engraver" loading="lazy" onError={(e) => (e.target.src = "/fallback.png")}/>
                    <span className="label" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>Laser Engraver</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <MaterialsMenu />
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
                          <img src={getImageUrl("/images/refurbished-anycubic-kobra-3-combo-3d-printer.png")} alt="Refurbished Anycubic Kobra 3 Combo 3D Printer" loading="lazy" onError={(e) => (e.target.src = "/fallback.png")}/>
                        </div>
                        <div className="product-details">
                          <Link to="/products?condition=Refurbished&brand=anycubic" className="product-name">Refurbished Anycubic Kobra 3 Combo 3D Printer</Link>
                          <span className="product-price">₹36,999.00</span>
                        </div>
                      </div>
                      <div className="refurbished-product-item">
                        <div className="product-thumb">
                          <img src={getImageUrl("/images/refurbished-ender-3-s1-pro-3d-printer.png")} alt="Refurbished Ender-3 S1 Pro 3D Printer" loading="lazy" onError={(e) => (e.target.src = "/fallback.png")}/>
                        </div>
                        <div className="product-details">
                          <Link to="/products?condition=Refurbished&brand=creality" className="product-name">Refurbished Ender-3 S1 Pro 3D Printer</Link>
                          <span className="product-price">₹34,999.00</span>
                        </div>
                      </div>
                      <div className="refurbished-product-item">
                        <div className="product-thumb">
                          <img src={getImageUrl("/images/refurbished-anycubic-kobra-3-combo-3d-printer-with-4-color-3idea-pla-filaments-green-purple-sky-blue-skin-.png")} alt="Refurbished Anycubic Kobra 3 Combo 3D Printer with 4 Color 3Idea PLA Filaments" loading="lazy" onError={(e) => (e.target.src = "/fallback.png")}/>
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
          <div className="desktop-only">
            {user ? (
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Link to="/account" style={{ color: 'var(--text-dark)', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={20} />
                  <span style={{ fontSize: '0.85rem' }}>{user.firstName || user.name?.split(' ')[0] || 'User'}</span>
                </Link>
               </div>
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

    </header>
  );
};

export default Header;
