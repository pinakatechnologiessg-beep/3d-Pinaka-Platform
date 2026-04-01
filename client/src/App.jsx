import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import Home from './pages/Home';
import Support from './pages/Support';
import Materials from './pages/Materials';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Wishlist from './pages/Wishlist';
import BrandPage from './pages/BrandPage';
import About from './pages/About';
import { cartService, CART_UPDATED, WISHLIST_UPDATED, SHOW_TOAST } from './services/cartService';
import './index.css';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [activeDropdowns, setActiveDropdowns] = useState({
    categories: false,
    exclusive: false,
    material: false,
    bulk: false,
    refurbished: false
  });

  const updateCartCount = () => {
    setCartCount(cartService.getCartCount());
  };

  const updateWishlistCount = () => {
    setWishlistCount(cartService.getWishlistCount());
  };

  const updateUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch(e) { setUser(null); }
    } else {
      setUser(null);
    }
  };

  const showToast = (e) => {
    setToast({ show: true, message: e.detail.message, type: e.detail.type || 'success' });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    updateCartCount();
    updateWishlistCount();
    updateUser();

    const handleStorage = () => {
        updateCartCount();
        updateWishlistCount();
        updateUser();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(CART_UPDATED, updateCartCount);
    window.addEventListener(WISHLIST_UPDATED, updateWishlistCount);
    window.addEventListener(SHOW_TOAST, showToast);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CART_UPDATED, updateCartCount);
      window.removeEventListener(WISHLIST_UPDATED, updateWishlistCount);
      window.removeEventListener(SHOW_TOAST, showToast);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleDropdown = (key) => {
    setActiveDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <Header 
          user={user}
          cartCount={cartCount} 
          wishlistCount={wishlistCount}
          toggleMobileMenu={toggleMobileMenu} 
        />

        {toast.show && (
          <div className={`toast-notification ${toast.type}`}>
            <div className="toast-content">
              <span>{toast.message}</span>
            </div>
          </div>
        )}
        
        <MobileNav 
          user={user}
          isOpen={isMobileMenuOpen} 
          onClose={closeMobileMenu} 
          activeDropdowns={activeDropdowns}
          toggleDropdown={toggleDropdown}
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/index.html" element={<Home />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support.html" element={<Support />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/materials.html" element={<Materials />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products.html" element={<Products />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/cart.html" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login.html" element={<Login />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/wishlist.html" element={<Wishlist />} />
          
          {/* Brand Routes */}
          <Route path="/brand/:brandName" element={<BrandPage />} />
          <Route path="/anycubic.html" element={<BrandPage />} />
          <Route path="/bambu.html" element={<BrandPage />} />
          <Route path="/creality.html" element={<BrandPage />} />
          <Route path="/snapmaker.html" element={<BrandPage />} />
          <Route path="/rotrics.html" element={<BrandPage />} />
          <Route path="/3dmakerpro.html" element={<BrandPage />} />
          <Route path="/flsun.html" element={<BrandPage />} />
          <Route path="/sunlu.html" element={<BrandPage />} />
          <Route path="/zortrax.html" element={<BrandPage />} />
          <Route path="/esun.html" element={<BrandPage />} />
          <Route path="/zmorph.html" element={<BrandPage />} />
          <Route path="/flashforge.html" element={<BrandPage />} />
          <Route path="/magforms.html" element={<BrandPage />} />
          <Route path="/elegoo.html" element={<BrandPage />} />
          <Route path="/skriware.html" element={<BrandPage />} />
          <Route path="/hotrios.html" element={<BrandPage />} />
          <Route path="/modix.html" element={<BrandPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/about-us.html" element={<About />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
