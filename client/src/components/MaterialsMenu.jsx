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
          setProducts(data.slice(0, 4)); // Only show top 4 in menu
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
      className="nav-materials-dropdown"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span className="dropbtn materials-label">
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
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to={`/products?category=${cat.id}`} className="mega-tab-link">
                      <span>{cat.label}</span>
                      <CaretRight size={14} weight="bold" />
                    </Link>
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
                    {[1, 2, 3, 4].map(i => (
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
        .nav-materials-dropdown {
          position: relative;
          display: inline-block;
        }

        .materials-label {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-dark);
          font-size: 0.85rem;
          font-weight: 600;
          padding: 20px 0;
        }
        
        .materials-mega-dropdown {
          position: absolute;
          top: 100%;
          left: -150px;
          background: white;
          width: 850px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
          z-index: 9999;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          animation: megaFadeIn 0.2s ease-out;
        }

        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mega-menu-content {
          display: flex;
        }

        .mega-sidebar {
          width: 200px;
          background: #f8fafc;
          border-right: 1px solid #f1f5f9;
          flex-shrink: 0;
        }

        .mega-tabs {
          list-style: none;
          padding: 0.5rem 0;
          margin: 0;
        }

        .mega-tab-item {
          transition: all 0.2s;
        }

        .mega-tab-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 1.2rem;
          text-decoration: none;
          color: #475569;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .mega-tab-item:hover .mega-tab-link {
          background: #f1f5f9;
          color: #2563eb;
        }

        .mega-tab-item.active {
          background: #2563eb;
        }

        .mega-tab-item.active .mega-tab-link {
          color: white;
        }

        .mega-main {
          flex: 1;
          padding: 1.5rem;
        }

        .mega-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .mega-header h3 {
          font-size: 0.75rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.1em;
          margin: 0;
        }

        .mega-browse-all {
          font-size: 0.75rem;
          font-weight: 700;
          color: #2563eb;
          text-decoration: none;
        }

        .mega-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .mega-product-card {
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s;
        }

        .mega-product-card:hover {
          transform: translateY(-3px);
        }

        .mega-img-wrap {
          background: #f8fafc;
          border-radius: 6px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
        }

        .mega-img-wrap img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }

        .mega-brand {
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        .mega-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0.1rem 0;
        }

        .mega-price {
          font-size: 0.85rem;
          font-weight: 700;
          color: #2563eb;
        }

        .mega-shimmer {
          padding: 5px;
        }
        .mega-shimmer-img { height: 100px; background: #f1f5f9; border-radius: 6px; margin-bottom: 5px; }
        .mega-shimmer-line { height: 8px; background: #f1f5f9; width: 80%; border-radius: 4px; }

        .mega-empty {
          text-align: center;
          padding: 2rem 0;
          color: #94a3b8;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default MaterialsMenu;
