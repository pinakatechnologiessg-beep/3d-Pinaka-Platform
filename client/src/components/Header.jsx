import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, List, X, CaretDown, MagnifyingGlass, Package, Shield } from '@phosphor-icons/react';
import { cartService } from '../services/cartService';
import { getImageUrl, PLACEHOLDER_SVG } from '../utils/imageUtils';
import { API_BASE_URL } from '../api/config';
import Logo from './Logo';
import MaterialsMenu from './MaterialsMenu';

const Header = ({ user, cartCount, wishlistCount, toggleMobileMenu }) => {
  const [showAdminAlert, setShowAdminAlert] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredRefurbished, setFeaturedRefurbished] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedRefurbished = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products?condition=Refurbished&featured=true`);
        if (res.ok) {
          const data = await res.json();
          setFeaturedRefurbished(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching featured refurbished:", err);
      }
    };
    fetchFeaturedRefurbished();
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) return null;

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header>
      {isSearchOpen && (
        <div className="search-overlay">
          <div className="container search-container">
            <form onSubmit={handleSearch} className="search-form">
              <MagnifyingGlass size={22} />
              <input 
                autoFocus
                type="text" 
                placeholder="Search products, brands..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-global"
              />
            </form>
            <X size={24} onClick={() => setIsSearchOpen(false)} style={{ cursor: 'pointer' }} />
          </div>
        </div>
      )}
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
                    <img src={getImageUrl("/images/product-fdm-1-1774868367269.png")} alt="3D Printer" loading="lazy" onError={(e) => (e.target.src = PLACEHOLDER_SVG)}/>
                    <span className="label" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>3D Printer</span>
                  </Link>
                </div>
                <div className="mega-col mega-img-col">
                  <Link to="/products.html?category=Laser Engraver" className="mega-img-card laser-img" style={{ background: '#e2e8f0' }}>
                    <img src={getImageUrl("/images/product-resin-2-1774868383507.png")} alt="Laser Engraver" loading="lazy" onError={(e) => (e.target.src = PLACEHOLDER_SVG)}/>
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
                      {featuredRefurbished.length > 0 ? (
                        featuredRefurbished.map((item) => (
                          <div key={item._id} className="refurbished-product-item">
                            <div className="product-thumb">
                              <img 
                                src={getImageUrl(item.image)} 
                                alt={item.name} 
                                loading="lazy" 
                                onError={(e) => (e.target.src = PLACEHOLDER_SVG)}
                              />
                            </div>
                            <div className="product-details">
                              <Link to={`/product/${item._id}`} className="product-name">{item.name}</Link>
                              <span className="product-price">₹{item.price?.toLocaleString('en-IN') || '0.00'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '10px', color: '#64748b', fontSize: '0.85rem' }}>No featured items yet</div>
                      )}
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
          
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="search-icon-mobile" 
            style={{ color: 'var(--text-dark)', textDecoration: 'none', cursor: 'pointer' }}
          >
            <MagnifyingGlass size={22} />
          </div>

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
