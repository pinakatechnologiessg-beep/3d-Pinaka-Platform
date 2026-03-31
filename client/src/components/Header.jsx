import React from 'react';
import { Link } from 'react-router-dom';
import { CaretDown, MagnifyingGlass, User, Heart, ShoppingCart, List } from '@phosphor-icons/react';

const Header = ({ cartCount, wishlistCount, toggleMobileMenu }) => {
  return (
    <header>
      <div className="container navbar">
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
                    <li><Link to="/products.html?category=3D Printer">3D Printer <span className="hot-badge">Hot</span></Link></li>
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
          <Link to="/products.html">Refurbished Store</Link>
          <Link to="/support.html">Support</Link>
          <Link to="/support.html">Printing Services</Link>
        </nav>

        <div className="nav-icons">
          <MagnifyingGlass size={20} />
          <Link to="/login.html" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}><User size={20} /></Link>
          <Link to="/wishlist.html" className="heart-icon-wrap" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
            <Heart size={20} />
            {wishlistCount > 0 && <span className="heart-badge">{wishlistCount}</span>}
          </Link>
          <Link to="/cart.html" className="cart-icon-wrap" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>
            <ShoppingCart size={20} />
            <span className="cart-badge">{cartCount}</span>
          </Link>
          <List size={20} className="menu-btn" onClick={toggleMobileMenu} />
        </div>
      </div>
    </header>
  );
};

export default Header;
