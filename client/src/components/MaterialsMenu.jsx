import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CaretDown, CaretRight } from '@phosphor-icons/react';
import { getImageUrl } from '../utils/imageUtils';
import { API_BASE_URL } from '../api/config';

const MaterialsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Filament');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'Filament', label: 'Filaments' },
    { id: 'Resin', label: 'Resins' },
    { id: 'Accessory', label: 'Accessories' },
    { id: 'Spare Parts', label: 'Spare Parts' }
  ];

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/products?category=${activeTab}&featured=true`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.slice(0, 6)); // Show 6 products (2 rows of 3)
        }
      } catch (err) {
        console.error("Fetch menu materials error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [activeTab, isOpen]);

  return (
    <div 
      className="dropdown nav-materials-dropdown-refined"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span className="dropbtn" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
        Materials <CaretDown size={14} weight="bold" />
      </span>
      
      {isOpen && (
        <div className="materials-mega-dropdown">
          <div className="mega-menu-content">
            <aside className="mega-sidebar">
              <ul className="mega-tabs">
                {categories.map((cat) => (
                  <li 
                    key={cat.id} 
                    className={`mega-tab-item ${activeTab === cat.id ? 'active' : ''}`}
                    onMouseEnter={() => setActiveTab(cat.id)}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab(cat.id);
                    }}
                  >
                    <div className="mega-tab-link">
                      <span>{cat.label}</span>
                      <CaretRight size={14} weight="bold" />
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="mega-main">
              <div className="mega-header">
                <h3>TOP PRODUCTS</h3>
                <Link to={`/products?category=${activeTab}`} className="mega-browse-all" onClick={() => setIsOpen(false)}>
                  BROWSE ALL
                </Link>
              </div>

              <div className="mega-grid-container">
                {loading ? (
                  <div className="mega-grid">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="mega-shimmer">
                        <div className="mega-shimmer-img"></div>
                        <div className="mega-shimmer-line"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="mega-grid">
                    {products.map((product) => (
                      <Link 
                        key={product._id} 
                        to={`/product/${product._id}`} 
                        className="mega-product-card"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="mega-img-wrap">
                          <img src={getImageUrl(product.image)} alt={product.name} onError={(e) => (e.target.src = "/placeholder.png")} />
                        </div>
                        <div className="mega-info">
                          <div className="mega-brand">{product.brand}</div>
                          <div className="mega-name">{product.name}</div>
                          <div className="mega-price">₹{Number(product.price).toLocaleString('en-IN')}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mega-empty">
                    <p>No featured products found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nav-materials-dropdown-refined {
          /* Inherits .dropdown styles from global CSS */
        }
        
        .materials-mega-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          width: 1000px; /* Increased width to accommodate larger cards */
          box-shadow: 0 25px 70px rgba(0,0,0,0.18);
          z-index: 9999;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          animation: megaFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: 5px;
        }

        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(15px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .mega-menu-content {
          display: flex;
          min-height: 480px;
        }

        .mega-sidebar {
          width: 220px;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          flex-shrink: 0;
          padding: 1rem 0;
        }

        .mega-tabs {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .mega-tab-item {
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .mega-tab-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          text-decoration: none;
          color: #334155;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .mega-tab-item:hover {
          background: #f1f5f9;
        }
        
        .mega-tab-item:hover .mega-tab-link {
          color: #2563eb;
        }

        .mega-tab-item.active {
          background: #2563eb;
        }

        .mega-tab-item.active .mega-tab-link {
          color: white !important;
        }

        .mega-main {
          flex: 1;
          padding: 1.8rem;
          background: #fff;
          overflow: hidden; /* Prevent horizontal overflow from content */
        }

        .mega-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 0.8rem;
          border-bottom: 1.5px solid #f1f5f9;
        }

        .mega-header h3 {
          font-size: 0.8rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.12em;
          margin: 0;
          text-transform: uppercase;
        }

        .mega-browse-all {
          font-size: 0.75rem;
          font-weight: 700;
          color: #2563eb;
          text-decoration: none;
          padding: 4px 12px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        
        .mega-browse-all:hover {
          background: #eff6ff;
        }

        .mega-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* Changed to 3 columns as requested */
          gap: 1.5rem;
          width: 100%;
        }

        .mega-product-card {
          text-decoration: none;
          color: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 10px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: #fff;
          display: block;
        }

        .mega-product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
          border-color: #f1f5f9;
        }

        .mega-img-wrap {
          background: #f8fafc;
          border-radius: 10px;
          height: 180px; /* Slightly increased for better focus */
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          padding: 1rem;
          overflow: hidden;
        }

        .mega-img-wrap img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        
        .mega-product-card:hover .mega-img-wrap img {
          transform: scale(1.05);
        }

        .mega-brand {
          font-size: 0.7rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .mega-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1e293b;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0.3rem 0;
          line-height: 1.4;
          height: 2.8em;
        }

        .mega-price {
          font-size: 1rem;
          font-weight: 700;
          color: #2563eb;
          margin-top: 6px;
        }

        .mega-shimmer {
          padding: 10px;
        }
        .mega-shimmer-img { height: 180px; background: #f1f5f9; border-radius: 10px; margin-bottom: 10px; }
        .mega-shimmer-line { height: 12px; background: #f1f5f9; width: 80%; border-radius: 4px; margin-bottom: 6px; }

        .mega-empty {
          text-align: center;
          padding: 4rem 0;
          color: #94a3b8;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default MaterialsMenu;
