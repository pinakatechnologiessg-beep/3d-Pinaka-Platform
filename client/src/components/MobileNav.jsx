import React from 'react';
import { Link } from 'react-router-dom';
import { X, CaretDown, House, Storefront, Flask, ChatTeardropText, User, ShoppingCart, Heart, MagnifyingGlass, Plus, Minus, SquaresFour, ShoppingBag } from '@phosphor-icons/react';

const MobileNav = ({ user, isOpen, onClose, activeDropdowns, toggleDropdown, cartCount, wishlistCount }) => {
  return (
    <>
      {/* Overlay */}
      <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>

      {/* Offcanvas Menu */}
      <div className={`mobile-offcanvas ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="close-menu-btn" onClick={onClose}>
            <X size={24} weight="bold" />
          </div>
        </div>

        <div className="mobile-menu-actions">
          {user ? (
            <div className="menu-user-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 1rem 1.5rem', borderBottom: '1px solid var(--border-color)', width: '100%' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
            </div>
          ) : (
            <Link to="/login.html" className="menu-action-btn" onClick={onClose}>
                <User size={18} /> Login / Register
            </Link>
          )}
          <Link to="/wishlist.html" className="menu-action-btn" style={{ border: user ? '1px solid #e2e8f0' : undefined, flex: user ? 'none' : '1' }} onClick={onClose}>
            <Heart size={18} /> Wishlist
          </Link>
        </div>

        <ul className="mobile-menu-list">
          <li><Link to="/index.html" onClick={onClose}>Home</Link></li>
          <li><Link to="/products.html" onClick={onClose}>Brands</Link></li>
          
          {[
            { key: 'categories', label: 'Categories' },
            { key: 'exclusive', label: '3 Idea Exclusive' },
            { key: 'material', label: 'Material' },
            { key: 'bulk', label: 'Bulk Enquiry' },
            { key: 'refurbished', label: 'Refurbished Store' }
          ].map((item) => (
            <li key={item.key} className={`has-dropdown ${activeDropdowns[item.key] ? 'active' : ''}`}>
              <div className="menu-dropdown-toggle" onClick={() => toggleDropdown(item.key)}>
                {item.label} {activeDropdowns[item.key] ? <Minus size={14} /> : <Plus size={14} />}
              </div>
              <ul className="menu-dropdown-items">
                {item.key === 'categories' ? (
                  <>
                    <li><Link to="/products.html?category=3D Printer" onClick={onClose}>3D Printer</Link></li>
                    <li><Link to="/products.html?category=Laser Engraver" onClick={onClose}>Laser Engraver</Link></li>
                    <li><Link to="/products.html?category=Food Printer" onClick={onClose}>Food Printer</Link></li>
                    <li><Link to="/products.html?category=3D Scanner" onClick={onClose}>3D Scanner</Link></li>
                    <li><Link to="/products.html?category=CNC Router" onClick={onClose}>CNC Router</Link></li>
                    <li><Link to="/products.html?category=Robotics" onClick={onClose}>Robotics</Link></li>
                    <li><Link to="/products.html?category=3D Pens" onClick={onClose}>3D Pens</Link></li>
                    <li><Link to="/products.html?category=Filaments" onClick={onClose}>Filaments</Link></li>
                    <li><Link to="/products.html?category=Resins" onClick={onClose}>Resins</Link></li>
                    <li><Link to="/products.html?category=Spare Parts" onClick={onClose}>Spare Parts</Link></li>
                    <li><Link to="/products.html?category=Accessories" onClick={onClose}>Accessories</Link></li>
                  </>
                ) : item.key === 'exclusive' ? (
                  <>
                    <li><Link to="/anycubic.html" onClick={onClose}>Anycubic Kobra 2 Neo 3D Printer</Link></li>
                    <li><Link to="/anycubic.html" onClick={onClose}>Anycubic Photon Mono 4 3D Printer</Link></li>
                    <li><Link to="/anycubic.html" onClick={onClose}>Anycubic Kobra 3 3D Printer</Link></li>
                    <li><Link to="/snapmaker.html" onClick={onClose}>Snapmaker Artisan 3-In-1 3D Printer</Link></li>
                    <li><Link to="/rotrics.html" onClick={onClose}>Rotrics DexArm Hyper Luxury Kit</Link></li>
                  </>
                ) : item.key === 'material' ? (
                  <li><Link to="/materials.html" onClick={onClose}>All Materials</Link></li>
                ) : item.key === 'bulk' ? (
                  <li><Link to="/support.html" onClick={onClose}>Contact Form</Link></li>
                ) : item.key === 'refurbished' ? (
                  <div className="nested-dropdown">
                    <div className="menu-dropdown-toggle nested" onClick={() => toggleDropdown('refurbishedCategories')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="bullet">•</span> Categories
                      </div>
                      {activeDropdowns.refurbishedCategories ? <Minus size={14} /> : <Plus size={14} />}
                    </div>
                    {activeDropdowns.refurbishedCategories && (
                      <ul className="menu-dropdown-items nested-items" style={{ display: 'block', background: 'transparent' }}>
                        <li><Link to="/products.html?q=Refurbished&category=3D Printer" onClick={onClose}><span className="bullet">•</span> 3D Printer</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=Laser Engraver" onClick={onClose}><span className="bullet">•</span> Lasaer Engraver</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=Food Printer" onClick={onClose}><span className="bullet">•</span> Food Printer</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=3D Scanner" onClick={onClose}><span className="bullet">•</span> 3D Scanner</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=CNC Router" onClick={onClose}><span className="bullet">•</span> CNC Router</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=3D Pens" onClick={onClose}><span className="bullet">•</span> 3D Pens</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=Filaments" onClick={onClose}><span className="bullet">•</span> Filaments</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=Resins" onClick={onClose}><span className="bullet">•</span> Resins</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=Spare Parts" onClick={onClose}><span className="bullet">•</span> Spare Parts</Link></li>
                        <li><Link to="/products.html?q=Refurbished&category=Accessories" onClick={onClose}><span className="bullet">•</span> Accessories</Link></li>
                      </ul>
                    )}
                  </div>
                ) : (
                  <li><Link to="/products.html" onClick={onClose}>View All {item.label}</Link></li>
                )}
              </ul>
            </li>
          ))}
          
          <li><Link to="/printing-services" onClick={onClose}>Printing Services</Link></li>
          <li><Link to="/support.html" onClick={onClose}>Support</Link></li>
          <li><Link to="/about-us.html" onClick={onClose}>About Us</Link></li>
        </ul>

        <div className="mobile-menu-footer">
          <h5>Need Help?</h5>
          <p className="address-text">
            10th Floor, Times Tower, Kamala City,<br />
            Senapati Bapat Marg, Lower Parel West,<br />
            Mumbai, Maharashtra 400013
          </p>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed) */}
      <nav className="mobile-bottom-nav">
        <Link to="/index.html" className="mobile-nav-item active" onClick={onClose}>
            <SquaresFour size={20} />
            <span>Home</span>
        </Link>
        <Link to="/login.html" className="mobile-nav-item" onClick={onClose}>
            {user ? (
                <div className="user-initial-circle">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            ) : (
                <User size={20} />
            )}
            <span>Account</span>
        </Link>
        <Link to="/products.html" className="mobile-nav-item" onClick={onClose}>
            <Storefront size={20} />
            <span>Products</span>
        </Link>
        <Link to="/wishlist.html" className="mobile-nav-item" onClick={onClose}>
            <div className="mobile-nav-icon-wrap">
                <Heart size={20} />
                <span className="mobile-nav-badge">{wishlistCount}</span>
            </div>
            <span>Wishlist</span>
        </Link>
        <Link to="/cart.html" className="mobile-nav-item" onClick={onClose}>
            <div className="mobile-nav-icon-wrap">
                <ShoppingBag size={20} />
                <span className="mobile-nav-badge">{cartCount}</span>
            </div>
            <span>Cart</span>
        </Link>
      </nav>
    </>
  );
};

export default MobileNav;
