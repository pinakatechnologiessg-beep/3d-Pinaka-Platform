import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, CaretDown, House, Storefront, Flask, ChatTeardropText, User, Users, ShoppingCart, Heart, MagnifyingGlass, Plus, Minus, SquaresFour, ShoppingBag, Gear, Package, Bell } from '@phosphor-icons/react';

const MobileNav = ({ user, isOpen, onClose, activeDropdowns, toggleDropdown, cartCount, wishlistCount }) => {
  const location = useLocation();
  return (
    <>
      {/* Overlay */}
      <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>

      {/* Offcanvas Menu */}
      <div className={`mobile-offcanvas ${isOpen ? 'open' : ''}`}>
        <div className={`mobile-menu-header ${(user?.role === 'admin' && location.pathname.startsWith('/admin')) ? 'admin-header' : ''}`}>
          {user?.role === 'admin' && location.pathname.startsWith('/admin') ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', fontFamily: "'Inter', sans-serif" }}>Admin<span style={{ color: '#6366f1' }}>Pro</span></div>
              <div className="close-menu-btn" onClick={onClose} style={{ cursor: 'pointer' }}>
                <X size={24} weight="bold" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: '10px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>
                    PINAKA<span style={{ color: 'var(--primary)', fontSize: '0.9rem', verticalAlign: 'middle', marginLeft: '4px' }}>SHOP</span>
                </div>
                <div className="close-menu-btn" onClick={onClose}>
                    <X size={24} weight="bold" />
                </div>
            </div>
          )}
        </div>

        <div className="mobile-menu-actions">
          {user ? (
            <div style={{ padding: '0 1rem 1.5rem', width: '100%', borderBottom: '1px solid var(--border-color)' }}>
                <Link to="/account" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {(user.firstName ? user.firstName.charAt(0) : user.name?.charAt(0))?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-dark)', fontSize: '1rem' }}>{user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.name || 'User'}</div>
                    </div>
                </Link>
            </div>
          ) : (
            <Link to="/login" className="menu-action-btn" onClick={onClose}>
                <User size={18} /> Sign In / Create Account
            </Link>
          )}
        </div>

        <ul className="admin-special-list">
          {user?.role === 'admin' && location.pathname.startsWith('/admin') ? (
            /* EXCLUSIVE ADMIN MENU - ONLY ON ADMIN ROUTES */
            <>
              <Link to="/admin" onClick={onClose} className={`admin-nav-item ${location.pathname === '/admin' ? 'active-admin' : ''}`}>
                <House size={22} weight={location.pathname === '/admin' ? "fill" : "bold"} />
                <span>Dashboard</span>
              </Link>
              <Link to="/admin" onClick={onClose} className="admin-nav-item">
                <Package size={22} weight="bold" />
                <span>Products</span>
              </Link>
              <Link to="/admin" onClick={onClose} className="admin-nav-item">
                <ShoppingCart size={22} weight="bold" />
                <span>Orders</span>
              </Link>
              <Link to="/admin" onClick={onClose} className="admin-nav-item">
                <Users size={22} weight="bold" />
                <span>Users</span>
              </Link>
              <Link to="/admin/support" onClick={onClose} className={`admin-nav-item ${location.pathname === '/admin/support' ? 'active-admin' : ''}`}>
                <Bell size={22} weight={location.pathname === '/admin/support' ? "fill" : "bold"} />
                <span>Support</span>
              </Link>
              <Link to="/admin" onClick={onClose} className="admin-nav-item">
                <Gear size={22} weight="bold" />
                <span>Settings</span>
              </Link>
            </>
          ) : (
            /* REGULAR USER MENU - SHOWN ON PUBLIC ROUTES EVEN FOR ADMINS */
            <>
              <li>
                <Link to="/" onClick={onClose} className="menu-dropdown-toggle">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <House size={20} weight="bold" />
                    <span>Home</span>
                  </div>
                  <div style={{ width: '14px' }}></div> {/* Spacer for parity with +/- icons */}
                </Link>
              </li>
              {[
                { key: 'brands', label: 'Brands', icon: <Storefront size={20} weight="bold" /> },
                { key: 'categories', label: 'Categories', icon: <SquaresFour size={20} weight="bold" /> },
                { key: 'exclusive', label: '3 Idea Exclusive', icon: <Flask size={20} weight="bold" /> },
                { key: 'material', label: 'Material', icon: <Package size={20} weight="bold" /> },
                { key: 'bulk', label: 'Bulk Enquiry', icon: <ShoppingCart size={20} weight="bold" /> },
                { key: 'refurbished', label: 'Refurbished Store', icon: <Gear size={20} weight="bold" /> }
              ].map((item) => (
                <li key={item.key} className={`has-dropdown ${activeDropdowns[item.key] ? 'active' : ''}`}>
                  <div className="menu-dropdown-toggle" onClick={() => toggleDropdown(item.key)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                    {activeDropdowns[item.key] ? <Minus size={14} /> : <Plus size={14} />}
                  </div>
                  <ul className="menu-dropdown-items">
                    {/* ... nested items ... */}
                    {item.key === 'brands' ? (
                      <>
                        <li><Link to="/products?brand=Anycubic" onClick={onClose}>Anycubic</Link></li>
                        <li><Link to="/products?brand=Creality" onClick={onClose}>Creality</Link></li>
                        <li><Link to="/products?brand=Snapmaker" onClick={onClose}>Snapmaker</Link></li>
                        <li><Link to="/products?brand=Rotrics" onClick={onClose}>Rotrics</Link></li>
                        <li><Link to="/products?brand=Elegoo" onClick={onClose}>Elegoo</Link></li>
                      </>
                    ) : item.key === 'categories' ? (
                      <>
                        <li><Link to="/products?category=3D Printer" onClick={onClose}>3D Printer</Link></li>
                        <li><Link to="/products?category=Laser Engraver" onClick={onClose}>Laser Engraver</Link></li>
                        <li><Link to="/products?category=Food Printer" onClick={onClose}>Food Printer</Link></li>
                        <li><Link to="/products?category=3D Scanner" onClick={onClose}>3D Scanner</Link></li>
                        <li><Link to="/products?category=CNC Router" onClick={onClose}>CNC Router</Link></li>
                        <li><Link to="/products?category=Robotics" onClick={onClose}>Robotics</Link></li>
                        <li><Link to="/products?category=3D Pen" onClick={onClose}>3D Pen</Link></li>
                        <li><Link to="/products?category=Filament" onClick={onClose}>Filament</Link></li>
                        <li><Link to="/products?category=Resin" onClick={onClose}>Resin</Link></li>
                        <li><Link to="/products?category=Spare Parts" onClick={onClose}>Spare Parts</Link></li>
                        <li><Link to="/products?category=Accessory" onClick={onClose}>Accessory</Link></li>
                      </>
                    ) : item.key === 'exclusive' ? (
                      <>
                        <li><Link to="/products?brand=Anycubic" onClick={onClose}>Anycubic Kobra 2 Neo 3D Printer</Link></li>
                        <li><Link to="/products?brand=Anycubic" onClick={onClose}>Anycubic Photon Mono 4 3D Printer</Link></li>
                        <li><Link to="/products?brand=Anycubic" onClick={onClose}>Anycubic Kobra 3 3D Printer</Link></li>
                        <li><Link to="/products?brand=Snapmaker" onClick={onClose}>Snapmaker Artisan 3-In-1 3D Printer</Link></li>
                        <li><Link to="/products?brand=Rotrics" onClick={onClose}>Rotrics DexArm Hyper Luxury Kit</Link></li>
                      </>
                    ) : item.key === 'material' ? (
                      <>
                        <li><Link to="/products?category=Filament" onClick={onClose}><span className="bullet">•</span> Filaments</Link></li>
                        <li><Link to="/products?category=Resin" onClick={onClose}><span className="bullet">•</span> Resins</Link></li>
                        <li><Link to="/products?category=Accessory" onClick={onClose}><span className="bullet">•</span> Accessories</Link></li>
                        <li><Link to="/products?category=Spare Parts" onClick={onClose}><span className="bullet">•</span> Spare Parts</Link></li>
                      </>
                    ) : item.key === 'bulk' ? (
                      <li><Link to="/support" onClick={onClose}>Contact Form</Link></li>
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
                            <li><Link to="/products?condition=Refurbished&category=3D Printer" onClick={onClose}><span className="bullet">•</span> 3D Printer</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=Laser Engraver" onClick={onClose}><span className="bullet">•</span> Laser Engraver</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=Food Printer" onClick={onClose}><span className="bullet">•</span> Food Printer</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=3D Scanner" onClick={onClose}><span className="bullet">•</span> 3D Scanner</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=CNC Router" onClick={onClose}><span className="bullet">•</span> CNC Router</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=3D Pen" onClick={onClose}><span className="bullet">•</span> 3D Pen</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=Filament" onClick={onClose}><span className="bullet">•</span> Filament</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=Resin" onClick={onClose}><span className="bullet">•</span> Resin</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=Spare Parts" onClick={onClose}><span className="bullet">•</span> Spare Parts</Link></li>
                            <li><Link to="/products?condition=Refurbished&category=Accessory" onClick={onClose}><span className="bullet">•</span> Accessory</Link></li>
                        </ul>
                        )}
                      </div>
                    ) : (
                      <li><Link to="/products" onClick={onClose}>View All {item.label}</Link></li>
                    )}
                  </ul>
                </li>
              ))}
              
              <li>
                <Link to="/printing-services" onClick={onClose} className="menu-dropdown-toggle">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Plus size={20} weight="bold" />
                    <span>Printing Services</span>
                  </div>
                  <div style={{ width: '14px' }}></div>
                </Link>
              </li>
              <li>
                <Link to="/support" onClick={onClose} className="menu-dropdown-toggle">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ChatTeardropText size={20} weight="bold" />
                    <span>Support</span>
                  </div>
                  <div style={{ width: '14px' }}></div>
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={onClose} className="menu-dropdown-toggle">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Bell size={20} weight="bold" />
                    <span>About Us</span>
                  </div>
                  <div style={{ width: '14px' }}></div>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed) */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className="mobile-nav-item active" onClick={onClose}>
            <SquaresFour size={20} />
            <span>Home</span>
        </Link>
        <Link to="/account" className="mobile-nav-item" onClick={onClose}>
            {user ? (
                <div className="user-initial-circle">
                    {(user.firstName ? user.firstName.charAt(0) : user.name?.charAt(0))?.toUpperCase() || 'U'}
                </div>
            ) : (
                <User size={20} />
            )}
            <span>Account</span>
        </Link>
        <Link to="/products" className="mobile-nav-item" onClick={onClose}>
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
      </nav>
    </>
  );
};

export default MobileNav;
