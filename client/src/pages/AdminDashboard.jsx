import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  House, Package, ShoppingCart, Users, Gear, 
  Bell, MagnifyingGlass, List, CurrencyDollar, TrendUp, Clock, ArrowLeft, Heart, X, UploadSimple, Trash, PencilSimple, Plus
} from '@phosphor-icons/react';
import { getImageUrl } from '../utils/imageUtils';
import './AdminDashboard.css';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, "");

const parsePriceLocal = (p) => {
    if (typeof p === 'number') return p;
    return parseInt(String(p).replace(/[^0-9]/g, '')) || 0;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { name: 'Dashboard', icon: <House size={24} /> },
    { name: 'Products', icon: <Package size={24} /> },
    { name: 'Orders', icon: <ShoppingCart size={24} /> },
    { name: 'Users', icon: <Users size={24} /> },
    { name: 'Support', icon: <Bell size={24} /> },
    { name: 'Settings', icon: <Gear size={24} /> }
  ];

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
    recentOrders: []
  });
  const [adminProducts, setAdminProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newProduct, setNewProduct] = useState({
      name: '', category: 'FDM', price: '', mrp: '', discount: 0,
      inStock: true, stockQuantity: 0, image: '', rating: 5.0, tags: 'None', badgeStyle: null, description: '',
      brand: 'Anycubic', otherBrand: '', otherCategory: '', condition: 'New',
      specifications: [{ key: '', value: '' }]
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductState, setEditProductState] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('All Status');
  const [additionalSelectedFiles, setAdditionalSelectedFiles] = useState([null, null, null, null, null]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([null, null, null, null, null]);
  const [editAdditionalSelectedFiles, setEditAdditionalSelectedFiles] = useState([null, null, null, null, null]);
  const [editAdditionalImagePreviews, setEditAdditionalImagePreviews] = useState([null, null, null, null, null]);

  // --- Orders State ---
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('All Orders');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [statusConfirmState, setStatusConfirmState] = useState(null);
  
  // --- Admin Settings State ---
  const [adminProfile, setAdminProfile] = useState(null);
  const [isAdminEditMode, setIsAdminEditMode] = useState(false);
  const [adminEditForm, setAdminEditForm] = useState({ name: '', phone: '' });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- Support State ---
  const [supportQueries, setSupportQueries] = useState([]);
  const [supportFilter, setSupportFilter] = useState('All');
  const [selectedSupportQuery, setSelectedSupportQuery] = useState(null);

  const showToast = (message, type = 'success') => {
      setToast({ show: true, message, type });
      setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
        const res = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrderDetails && selectedOrderDetails.orderId === orderId) {
                setSelectedOrderDetails(prev => ({ ...prev, status: newStatus }));
            }
            
            // Refresh stats to ensure Total Sales, Pending Orders instantly reflect changes without page reload.
            try {
                const statsRes = await fetch(`${BASE_URL}/api/stats`);
                if (statsRes.ok) setStats(await statsRes.json());
            } catch (statsErr) {
                console.error("Failed to silently refresh DB stats map", statsErr);
            }
        } else {
            console.error('Failed to update order status');
        }
    } catch (e) {
        console.error('Error updating status', e);
    }
  };

  const filteredOrders = orderFilter === 'All Orders' ? orders : orders.filter(o => o.status === orderFilter);

  const getOrderBadgeStyle = (status) => {
    switch(status) {
        case 'Pending': return { background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
        case 'Confirmed': return { background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' };
        case 'Printing': return { background: '#f3e8ff', color: '#9333ea', border: '1px solid #e9d5ff' };
        case 'Delivered': return { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' };
        default: return { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };
  // --------------------
  
  // --- Users State ---
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('All Users');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
        const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
        console.log('Sending update for user', userId, 'to', newStatus);
        
        const res = await fetch(`${BASE_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Type-Content': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
            const updatedStatus = data.status;
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: updatedStatus } : u));
            if(selectedUserDetails && selectedUserDetails.id === userId) {
                setSelectedUserDetails(prev => ({ ...prev, status: updatedStatus }));
            }
            showToast(`User ${updatedStatus === 'Blocked' ? 'blocked' : 'unblocked'} successfully`, 'success');
        } else {
            console.error('Failed to block user', data);
            showToast(data.message || 'Block action failed', 'error');
        }
    } catch(err) {
        console.error('Failed to change user status', err);
        showToast('Network error while blocking', 'error');
    }
  };

  const handleViewUserDetails = async (user) => {
    setSelectedUserDetails({ ...user, recentOrders: [] });
    try {
        const res = await fetch(`${BASE_URL}/api/users/${user.id}`);
        if(res.ok) {
            setSelectedUserDetails(await res.json());
        }
    } catch (err) {
        console.error('Failed to fetch user details', err);
    }
  };
  // --------------------

  const handleEditImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          setEditSelectedFile(file);
          setEditImagePreview(URL.createObjectURL(file));
      }
  };

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          setSelectedFile(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  const handleSlotImageUpload = (e, index, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
        if (isEdit) {
            const newFiles = [...editAdditionalSelectedFiles];
            const newPreviews = [...editAdditionalImagePreviews];
            newFiles[index] = file;
            newPreviews[index] = URL.createObjectURL(file);
            setEditAdditionalSelectedFiles(newFiles);
            setEditAdditionalImagePreviews(newPreviews);
        } else {
            const newFiles = [...additionalSelectedFiles];
            const newPreviews = [...additionalImagePreviews];
            newFiles[index] = file;
            newPreviews[index] = URL.createObjectURL(file);
            setAdditionalSelectedFiles(newFiles);
            setAdditionalImagePreviews(newPreviews);
        }
    }
  };

  const handleRemoveSlotImage = (index, isEdit = false) => {
    if (isEdit) {
        const newFiles = [...editAdditionalSelectedFiles];
        const newPreviews = [...editAdditionalImagePreviews];
        newFiles[index] = null;
        newPreviews[index] = null;
        setEditAdditionalSelectedFiles(newFiles);
        setEditAdditionalImagePreviews(newPreviews);
    } else {
        const newFiles = [...additionalSelectedFiles];
        const newPreviews = [...additionalImagePreviews];
        newFiles[index] = null;
        newPreviews[index] = null;
        setAdditionalSelectedFiles(newFiles);
        setAdditionalImagePreviews(newPreviews);
    }
  };

  const handleAddSpec = (isEdit = false) => {
    if (isEdit) {
      setEditProductState({
        ...editProductState,
        specifications: [...(editProductState.specifications || []), { key: '', value: '' }]
      });
    } else {
      setNewProduct({
        ...newProduct,
        specifications: [...newProduct.specifications, { key: '', value: '' }]
      });
    }
  };

  const handleUpdateSpec = (index, field, value, isEdit = false) => {
    if (isEdit) {
      const newSpecs = [...(editProductState.specifications || [])];
      newSpecs[index][field] = value;
      setEditProductState({ ...editProductState, specifications: newSpecs });
    } else {
      const newSpecs = [...newProduct.specifications];
      newSpecs[index][field] = value;
      setNewProduct({ ...newProduct, specifications: newSpecs });
    }
  };

  const handleRemoveSpec = (index, isEdit = false) => {
    if (isEdit) {
      const newSpecs = editProductState.specifications.filter((_, i) => i !== index);
      setEditProductState({ ...editProductState, specifications: newSpecs });
    } else {
      const newSpecs = newProduct.specifications.filter((_, i) => i !== index);
      setNewProduct({ ...newProduct, specifications: newSpecs });
    }
  };

  const handleSaveAdminProfile = async () => {
    try {
        const res = await fetch(`${BASE_URL}/api/admin`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminEditForm)
        });
        if (res.ok) {
            const updatedProfile = await res.json();
            setAdminProfile(updatedProfile);
            setIsAdminEditMode(false);
        } else {
            alert('Failed to update admin profile');
        }
    } catch (err) {
        console.error('Error saving admin details', err);
    }
  };

  useEffect(() => {
    const fetchDashData = async () => {
      try {
        const statsRes = await fetch(`${BASE_URL}/api/stats`);
        if (statsRes.ok) setStats(await statsRes.json());
        
        const prodsRes = await fetch(`${BASE_URL}/api/products`);
        if (prodsRes.ok) setAdminProducts(await prodsRes.json());

        const ordersRes = await fetch(`${BASE_URL}/api/orders`);
        if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            console.log("Fetched orders:", ordersData);
            setOrders(ordersData);
        }

        const usersRes = await fetch(`${BASE_URL}/api/users`);
        if (usersRes.ok) {
            setUsers(await usersRes.json());
        }

        const adminRes = await fetch(`${BASE_URL}/api/admin`);
        if (adminRes.ok) {
            setAdminProfile(await adminRes.json());
        }
        const supportRes = await fetch(`${BASE_URL}/api/support`);
        if (supportRes.ok) setSupportQueries(await supportRes.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashData();
  }, []);

  const handleUpdateSupportStatus = async (queryId, newStatus) => {
    try {
        const res = await fetch(`${BASE_URL}/api/support/${queryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            setSupportQueries(prev => prev.map(q => q._id === queryId ? { ...q, status: newStatus } : q));
            if (selectedSupportQuery && selectedSupportQuery._id === queryId) {
                setSelectedSupportQuery(prev => ({ ...prev, status: newStatus }));
            }
            showToast('Support status updated', 'success');
        }
    } catch (err) {
        showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteSupport = async (queryId) => {
    if (!window.confirm('Are you sure you want to delete this query?')) return;
    try {
        const res = await fetch(`${BASE_URL}/api/support/${queryId}`, { method: 'DELETE' });
        if (res.ok) {
            setSupportQueries(prev => prev.filter(q => q._id !== queryId));
            setSelectedSupportQuery(null);
            showToast('Support query deleted', 'success');
        }
    } catch (err) {
        showToast('Failed to delete query', 'error');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered': return 'status-delivered';
      case 'Pending': return 'status-pending';
      case 'Shipped': return 'status-shipped';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
          <h2>Admin<span>Pro</span></h2>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-main)' }}>
             <span className="desktop-icon"><List size={24} /></span>
             <span className="mobile-icon"><X size={24} /></span>
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button 
              key={item.name}
              className={`adm-nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => {
                  if (item.name === 'Support') {
                      navigate('/admin/support');
                  } else {
                      setActiveTab(item.name);
                  }
                  if(window.innerWidth <= 1024) toggleSidebar();
              }}
            >
              <span className="adm-nav-icon">{item.icon}</span>
              <span className="adm-nav-text">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button className="menu-toggle mobile-only-toggle" onClick={toggleSidebar}>
              <List size={28} />
            </button>
            <div className="search-bar" style={{ opacity: 0, pointerEvents: 'none' }}>
              <MagnifyingGlass size={20} className="search-icon" />
              <input type="text" placeholder="Search..." disabled />
            </div>
          </div>
          <div className="header-right" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <button 
              className="back-home-btn-admin" 
              onClick={() => navigate('/')} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid var(--admin-border-color)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: 'var(--admin-text-main)', fontWeight: 500, transition: 'all 0.2s' }}
            >
              <ArrowLeft size={18} />
              <span className="hide-mobile">Back to Home</span>
            </button>
            <button className="notification-btn">
              <Bell size={24} />
              <span className="badge">3</span>
            </button>
            <div className="admin-profile">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="Admin" />
              <div className="profile-info hide-mobile">
                <span className="profile-name">Admin User</span>
                <span className="profile-role">Superadmin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        {activeTab === 'Dashboard' && (
          <div className="dashboard-content">
          <div className="welcome-banner">
            <h1>Welcome back, Admin! 👋</h1>
            <p>Here's what's happening with your store today.</p>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: '1.2rem', fontWeight: 500 }}>
              Fetching real-time data...
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <Package size={28} weight="fill" />
                  </div>
                  <div className="stat-details">
                    <h3>Total Products</h3>
                    <p className="stat-value">{stats.totalProducts}</p>
                    <span className="stat-trend positive"><TrendUp size={16} weight="bold"/> Live data</span>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon blue">
                    <ShoppingCart size={28} weight="fill" />
                  </div>
                  <div className="stat-details">
                    <h3>Total Orders</h3>
                    <p className="stat-value">{stats.totalOrders}</p>
                    <span className="stat-trend positive"><TrendUp size={16} weight="bold"/> Live data</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">
                    <Clock size={28} weight="fill" />
                  </div>
                  <div className="stat-details">
                    <h3>Pending Orders</h3>
                    <p className="stat-value">{stats.pendingOrders}</p>
                    <span className="stat-trend neutral">Needs attention</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <CurrencyDollar size={28} weight="fill" />
                  </div>
                  <div className="stat-details">
                    <h3>Total Sales</h3>
                    <p className="stat-value">₹{Number(stats.totalSales || 0).toLocaleString('en-IN')}</p>
                    <span className="stat-trend positive"><TrendUp size={16} weight="bold"/> Live data</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="recent-orders-section">
                <div className="section-header">
                  <h2>Recent Orders</h2>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).length > 0 ? orders.slice(0, 5).map((order, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fefce8'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <td className="adm-order-id" style={{ padding: '16px', fontWeight: 500, color: '#3b82f6' }}>{order.orderId}</td>
                          <td style={{ padding: '16px', color: '#334155', fontWeight: 500 }}>{order.customerName}</td>
                          <td className="adm-order-amount" style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{order.totalPrice ? `₹${order.totalPrice.toLocaleString('en-IN')}` : '₹0'}</td>
                          <td style={{ padding: '16px' }}>
                            <select 
                              value={order.status}
                              onChange={(e) => {
                                 setStatusConfirmState({ orderId: order.orderId, newStatus: e.target.value });
                              }}
                              style={{ 
                                padding: '6px 16px 6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, 
                                ...getOrderBadgeStyle(order.status), 
                                transition: 'all 0.3s ease', display: 'inline-block',
                                cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center'
                              }}
                            >
                              <option value="Pending" style={{ background: 'white', color: '#d97706' }}>Pending</option>
                              <option value="Confirmed" style={{ background: 'white', color: '#2563eb' }}>Confirmed</option>
                              <option value="Printing" style={{ background: 'white', color: '#9333ea' }}>Printing</option>
                              <option value="Delivered" style={{ background: 'white', color: '#16a34a' }}>Delivered</option>
                            </select>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <button 
                              className="action-btn"
                              onClick={() => setSelectedOrderDetails(order)}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#3b82f6', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                              onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                              onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-text-muted)' }}>
                            No orders found in the database yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          </div>
        )}

        {activeTab === 'Products' && (
          <div className="dashboard-content" style={{ padding: '24px' }}>
            <div className="products-mgmt-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
              <h2 className="products-mgmt-title">Products Management ({adminProducts.length} items)</h2>
              
              <div className="search-bar-wrapper">
                <MagnifyingGlass size={20} style={{ color: 'var(--admin-text-muted)', marginRight: '10px' }} />
                <input 
                  type="text" 
                  placeholder="Search by product name..." 
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', background: 'transparent' }} 
                />
                {productSearchQuery && <X size={18} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setProductSearchQuery('')} />}
              </div>

              <div className="filter-dropdown-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '0 15px', borderRadius: '8px', border: '1px solid var(--admin-border-color)', height: '100%', minWidth: '150px' }}>
                <List size={18} style={{ color: 'var(--admin-text-muted)', marginRight: '8px' }} />
                <select 
                  value={stockFilter} 
                  onChange={(e) => setStockFilter(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: '#475569', cursor: 'pointer', width: '100%', height: '40px' }}
                >
                  <option value="All Status">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <button 
                onClick={() => {
                    setAdditionalSelectedFiles([null, null, null, null, null]);
                    setAdditionalImagePreviews([null, null, null, null, null]);
                    setIsAddModalOpen(true);
                }}
                className="add-product-btn-admin"
              >
                <Plus size={20} weight="bold" /> Add New Product
              </button>
            </div>
            {adminProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>Loading products...</div>
            ) : (
                <div className="products-grid admin-products-grid">
                    {adminProducts.filter(p => {
                        const matchesSearch = (p.name || p.title || "").toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                              (p.brand || "").toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                              (p.category || "").toLowerCase().includes(productSearchQuery.toLowerCase());
                        
                        const matchesStock = stockFilter === 'All Status' || 
                                             (stockFilter === 'In Stock' && (p.inStock && (p.stockQuantity == null || p.stockQuantity > 0))) || 
                                             (stockFilter === 'Out of Stock' && (!p.inStock || (p.stockQuantity != null && p.stockQuantity <= 0)));
                                             
                        return matchesSearch && matchesStock;
                    }).map(product => (
                        <div key={product._id || Math.random()} className={`product-card ${!product.inStock ? 'sold-out' : ''}`}>
                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                                <button 
                                    className="action-btn-custom"
                                    title="Edit Product Details"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const predefinedBrands = ['Anycubic', 'Bambu Lab', 'Creality', 'Snapmaker', 'Rotrics', 'Flashforge', 'Skriware', 'Magforms', 'Zmorph', 'Sunlu', 'Elegoo'];
                                        const isPredefinedBrand = product.brand && predefinedBrands.includes(product.brand);
                                        const predefinedCategories = ['FDM', 'Resin', 'Filament', 'Accessory', 'Spare Parts', '3D Pen', '3D Scanner', 'Laser Engraver', 'CNC Router', 'Food Printer', 'Robotics'];
                                        const isPredefinedCategory = product.category && predefinedCategories.includes(product.category);

                                        setEditProductState({
                                            ...product, 
                                            discount: product.discount || 0, 
                                            stockQuantity: (typeof product.stockQuantity === 'number') ? product.stockQuantity : (parseInt(product.stockQuantity) || 0),
                                            brand: isPredefinedBrand ? product.brand : 'Other',
                                            otherBrand: isPredefinedBrand ? '' : product.brand,
                                            category: isPredefinedCategory ? product.category : 'Other',
                                            otherCategory: isPredefinedCategory ? '' : product.category
                                        });
                                        setEditImagePreview(product.image?.startsWith('/uploads') ? `${BASE_URL}${product.image}` : product.image);
                                        setEditSelectedFile(null);
                                        // Initialize additional images in the correct slots (max 5)
                                        const initialPreviews = [null, null, null, null, null];
                                        if (product.images) {
                                            product.images.slice(0, 5).forEach((img, i) => {
                                                initialPreviews[i] = img;
                                            });
                                        }
                                        setEditAdditionalImagePreviews(initialPreviews);
                                        setEditAdditionalSelectedFiles([null, null, null, null, null]);
                                        setIsEditModalOpen(true);
                                    }}
                                    style={{ background: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: '#3b82f6', transition: 'all 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                    onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
                                >
                                    <PencilSimple size={18} weight="bold" />
                                </button>
                                <button 
                                    className="action-btn-custom" 
                                    title="Delete Product Permanently"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmState(product);
                                }}
                                style={{ color: '#f43f5e', transition: 'all 0.2s' }}
                                onMouseOver={e => { e.currentTarget.style.background = '#ffe4e6'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                                onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'scale(1)'; }}
                            >
                                    <Trash size={18} weight="fill" />
                                </button>
                            </div>
                            <div className="product-img-wrapper" style={{ position: 'relative' }}>
                                <img 
                                    src={getImageUrl(product.image)} 
                                    alt={product.name || product.title} 
                                    className="product-img" 
                                    onError={(e) => (e.target.src = "/placeholder.png")}
                                />
                            </div>
                            <div className="product-info">
                                <div className="product-cat">{(product.category || 'Category')} {product.brand && `| ${product.brand}`}</div>
                                <div className="product-title" style={{ minHeight: '45px' }}>{product.name || product.title || "Unnamed Product"}</div>
                                <div className="stars">
                                    {typeof product.rating === 'number' ? 
                                        ('★'.repeat(Math.floor(product.rating)) + '☆'.repeat(5 - Math.floor(product.rating)) + ` (${product.rating.toFixed(1)})`) : 
                                        (product.stars || '★★★★★ (5.0)')
                                    }
                                </div>
                                <div className="product-price">
                                    ₹{Number(parsePriceLocal(product.price || 0)).toLocaleString('en-IN')}
                                    {product.mrp && <span className="old-price" style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: '#94a3b8', marginLeft: '8px' }}>₹{Number(parsePriceLocal(product.mrp)).toLocaleString('en-IN')}</span>}
                                    {!product.inStock || (product.stockQuantity == null || product.stockQuantity <= 0) ? (
                                        <span className="out-of-stock-label" style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>Out Of Stock</span>
                                    ) : (
                                        <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>Stock: {product.stockQuantity}</span>
                                    )}
                                </div>
                                {/* Admin specific action area */}
                                <div className="admin-product-actions" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--admin-border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button 
                                      className="btn btn-sm" 
                                      style={{ 
                                          background: product.featured ? '#f59e0b' : '#3b82f6', 
                                          color: 'white',
                                          fontSize: '0.8rem', padding: '8px 12px',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                          width: '100%', borderRadius: '6px', border: 'none', cursor: 'pointer'
                                      }}
                                      onClick={async (e) => {
                                          e.stopPropagation();
                                          const newFeatured = !product.featured;
                                          setAdminProducts(prev => prev.map(p => p._id === product._id ? { ...p, featured: newFeatured } : p));
                                          try {
                                              await fetch(`${BASE_URL}/api/products/${product._id}`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ featured: newFeatured })
                                              });
                                              showToast(newFeatured ? 'Added to Featured' : 'Removed from Featured');
                                          } catch(e) {
                                              showToast('Failed to update featured', 'error');
                                          }
                                      }}
                                    >
                                      {product.featured ? '★ Featured' : '☆ Feature'}
                                    </button>
                                    <button 
                                      className="btn btn-sm" 
                                      style={{ 
                                          background: product.inStock ? '#cbd5e1' : '#f43f5e', 
                                          color: product.inStock ? '#334155' : 'white',
                                          fontSize: '0.8rem', padding: '8px 12px',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                          width: '100%', borderRadius: '6px', border: 'none', cursor: 'pointer'
                                      }}
                                      onClick={async (e) => {
                                          e.stopPropagation();
                                          const newStatus = !product.inStock;
                                          setAdminProducts(prev => prev.map(p => p._id === product._id ? { ...p, inStock: newStatus } : p));
                                          try {
                                              await fetch(`${BASE_URL}/api/products/${product._id}`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ inStock: newStatus })
                                              });
                                          } catch(e) {}
                                      }}
                                    >
                                      {product.inStock ? 'Out of Stock' : 'Restock'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        )}

        {activeTab === 'Orders' && (
          <div className="dashboard-content" style={{ padding: '24px' }}>
            <div className="orders-mgmt-header">
              <h2 className="orders-mgmt-title">Orders Management</h2>
              <div className="status-filter-scroll">
                {['All Orders', 'Pending', 'Confirmed', 'Printing', 'Delivered'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setOrderFilter(status)}
                    className={`status-filter-btn ${orderFilter === status ? 'active' : ''}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-color)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border-color)' }}>
                    <tr>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Order ID</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Customer</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Phone</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Product</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Qty</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Price</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-text-muted)', fontSize: '1.1rem' }}>
                          No orders yet
                        </td>
                      </tr>
                    ) : filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fefce8'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px', fontWeight: 500, color: '#3b82f6' }}>{order.orderId}</td>
                        <td style={{ padding: '16px', color: '#334155', fontWeight: 500 }}>{order.customerName}</td>
                        <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>{order.phone}</td>
                        <td style={{ padding: '16px', color: '#334155', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.productName}</td>
                        <td style={{ padding: '16px', color: '#64748b' }}>{order.quantity}</td>
                        <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{order.totalPrice ? `₹${order.totalPrice.toLocaleString('en-IN')}` : '₹0'}</td>
                        <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>{order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : ''}</td>
                        <td style={{ padding: '16px' }}>
                          <select 
                            value={order.status}
                            onChange={(e) => {
                               setStatusConfirmState({ orderId: order.orderId, newStatus: e.target.value });
                            }}
                            style={{ 
                              padding: '6px 16px 6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, 
                              ...getOrderBadgeStyle(order.status), 
                              transition: 'all 0.3s ease', display: 'inline-block',
                              cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center'
                            }}
                          >
                            <option value="Pending" style={{ background: 'white', color: '#d97706' }}>Pending</option>
                            <option value="Confirmed" style={{ background: 'white', color: '#2563eb' }}>Confirmed</option>
                            <option value="Printing" style={{ background: 'white', color: '#9333ea' }}>Printing</option>
                            <option value="Delivered" style={{ background: 'white', color: '#16a34a' }}>Delivered</option>
                          </select>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button 
                            onClick={() => setSelectedOrderDetails(order)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#3b82f6', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-text-muted)' }}>
                          No orders found matching this status.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="dashboard-content" style={{ padding: '24px' }}>
            <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--admin-text-dark)', margin: 0 }}>Users Management</h2>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--admin-border-color)', borderRadius: '8px', padding: '6px 12px', minWidth: '220px' }}>
                   <MagnifyingGlass size={18} color="#64748b" style={{ marginRight: '8px' }} />
                   <input 
                     type="text" 
                     placeholder="Search by name or email..." 
                     value={userSearchQuery}
                     onChange={(e) => setUserSearchQuery(e.target.value)}
                     style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', width: '100%' }}
                   />
                </div>
                
                <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid var(--admin-border-color)', overflowX: 'auto' }}>
                  {['All Users', 'Active', 'Blocked'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setUserFilter(status)}
                      style={{ 
                        padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', fontSize: '0.85rem', whiteSpace: 'nowrap',
                        background: userFilter === status ? '#3b82f6' : 'transparent',
                        color: userFilter === status ? 'white' : 'var(--admin-text-main)'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-color)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--admin-border-color)' }}>
                    <tr>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>User ID</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Name</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Phone</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Orders</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Joined</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                        const filteredUsers = users
                          .filter(u => userFilter === 'All Users' ? true : u.status === userFilter)
                          .filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase()));
                          
                        if (filteredUsers.length === 0) {
                            return (
                              <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: 'var(--admin-text-muted)', fontSize: '1.1rem' }}>
                                  No users found
                                </td>
                              </tr>
                            );
                        }
                        
                        return filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                  <td style={{ padding: '16px', fontWeight: 500, color: '#3b82f6' }}>{user.id}</td>
                                  <td style={{ padding: '16px', color: '#334155', fontWeight: 600 }}>{user.name}</td>
                                  <td style={{ padding: '16px', color: '#64748b', fontSize: '0.95rem' }}>{user.email}</td>
                                  <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>{user.phone}</td>
                                  <td style={{ padding: '16px', color: '#334155', fontWeight: 500 }}>{user.totalOrders}</td>
                                  <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>{user.joinedDate}</td>
                                  <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                      padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, 
                                      background: user.status === 'Active' ? '#dcfce7' : '#fee2e2',
                                      color: user.status === 'Active' ? '#16a34a' : '#ef4444',
                                      border: `1px solid ${user.status === 'Active' ? '#bbf7d0' : '#fecaca'}`,
                                      transition: 'all 0.3s ease'
                                    }}>
                                      {user.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                      onClick={() => handleViewUserDetails(user)}
                                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#3b82f6', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                      onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                                      onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    >
                                      View Details
                                    </button>
                                    <button 
                                      onClick={() => toggleUserStatus(user.id, user.status)}
                                      style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: user.status === 'Active' ? '#fee2e2' : '#dcfce7', color: user.status === 'Active' ? '#ef4444' : '#16a34a', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                    >
                                      {user.status === 'Active' ? 'Block' : 'Unblock'}
                                    </button>
                                  </td>
                            </tr>
                        ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Support' && (
          <div className="dashboard-content" style={{ padding: '24px' }}>
            <div className="orders-mgmt-header">
                <h2 className="orders-mgmt-title">Support Queries</h2>
                <div className="status-filter-scroll">
                    {['All', 'new', 'pending', 'resolved'].map(status => (
                        <button 
                            key={status}
                            className={`status-filter-btn ${supportFilter === status ? 'active' : ''}`}
                            onClick={() => setSupportFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Subject</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(supportFilter === 'All' ? supportQueries : supportQueries.filter(q => q.status === supportFilter)).map((query) => (
                            <tr key={query._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px', color: '#64748b' }}>{new Date(query.createdAt).toLocaleDateString('en-GB')}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{query.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{query.email}</div>
                                </td>
                                <td style={{ padding: '16px', color: '#334155' }}><strong>{query.subject}</strong></td>
                                <td style={{ padding: '16px' }}>
                                    <select 
                                        value={query.status}
                                        onChange={(e) => handleUpdateSupportStatus(query._id, e.target.value)}
                                        style={{ 
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                            border: 'none', cursor: 'pointer', outline: 'none',
                                            background: query.status === 'new' ? '#fee2e2' : query.status === 'pending' ? '#fef3c7' : '#dcfce7',
                                            color: query.status === 'new' ? '#ef4444' : query.status === 'pending' ? '#d97706' : '#16a34a'
                                        }}
                                    >
                                        <option value="new">New</option>
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button 
                                        onClick={() => setSelectedSupportQuery(query)}
                                        style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginRight: '8px' }}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {supportQueries.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No support tickets found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="dashboard-content" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--admin-text-dark)' }}>Settings</h2>
            
            {adminProfile ? (
              <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid var(--admin-border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>Admin Profile</h3>
                  {!isAdminEditMode && (
                    <button 
                      onClick={() => { setAdminEditForm({ name: adminProfile.name || '', phone: adminProfile.phone || '' }); setIsAdminEditMode(true); }}
                      style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onMouseOver={e => e.currentTarget.style.background = '#2563eb'}
                      onMouseOut={e => e.currentTarget.style.background = '#3b82f6'}
                    >
                      <PencilSimple size={16} /> Edit Profile
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Name</label>
                    {isAdminEditMode ? (
                      <input 
                        type="text" 
                        value={adminEditForm.name} 
                        onChange={e => setAdminEditForm({...adminEditForm, name: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 500 }}>{adminProfile.name || 'Admin User'}</div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Email (Non-editable)</label>
                    <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 500 }}>{adminProfile.email}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Phone</label>
                    {isAdminEditMode ? (
                      <input 
                        type="text" 
                        value={adminEditForm.phone} 
                        onChange={e => setAdminEditForm({...adminEditForm, phone: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 500 }}>{adminProfile.phone || 'Not provided'}</div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Role</label>
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600 }}>{adminProfile.role}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Joined Date</label>
                      <div style={{ fontSize: '1rem', color: '#334155' }}>
                        {adminProfile.createdAt ? new Date(adminProfile.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {isAdminEditMode && (
                  <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                    <button 
                      onClick={() => setIsAdminEditMode(false)}
                      style={{ padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#334155', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.background = 'white'}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveAdminProfile}
                      style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#059669'}
                      onMouseOut={e => e.currentTarget.style.background = '#10b981'}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid var(--admin-border-color)', textAlign: 'center' }}>
                <Gear size={48} color="var(--admin-text-muted)" style={{ marginBottom: '16px', animation: 'spin 4s linear infinite' }} />
                <p style={{ color: 'var(--admin-text-muted)', fontSize: '1.1rem' }}>Loading Admin Profile...</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
             <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Add New Product</h2>
             
             <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Product Name</label>
                  <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="e.g. Anycubic Kobra 2" />
                </div>
                
                <div className="modal-grid-row">
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Brand</label>
                      <select value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                          {['Anycubic', 'Bambu Lab', 'Creality', 'Snapmaker', 'Rotrics', 'Flashforge', 'Skriware', 'Magforms', 'Zmorph', 'Sunlu', 'Elegoo'].map(b => (
                              <option key={b} value={b}>{b}</option>
                          ))}
                          <option value="Other">Other (Manually Input)</option>
                      </select>
                      {newProduct.brand === 'Other' && (
                          <input 
                              type="text" 
                              placeholder="Enter Custom Brand" 
                              value={newProduct.otherBrand || ''} 
                              onChange={e => setNewProduct({...newProduct, otherBrand: e.target.value})}
                              style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', marginTop: '0.5rem' }}
                          />
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Category</label>
                      <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                          {['FDM', 'Resin', 'Filament', 'Accessory', 'Spare Parts', '3D Pen', '3D Scanner', 'Laser Engraver', 'CNC Router', 'Food Printer', 'Robotics'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="Other">Other (Manually Input)</option>
                      </select>
                      {newProduct.category === 'Other' && (
                          <input 
                              type="text" 
                              placeholder="Enter Custom Category" 
                              value={newProduct.otherCategory || ''} 
                              onChange={e => setNewProduct({...newProduct, otherCategory: e.target.value})}
                              style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', marginTop: '0.5rem' }}
                          />
                      )}
                    </div>
                </div>
                
                <div className="modal-grid-row">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Product Condition</label>
                        <select value={newProduct.condition} onChange={e => setNewProduct({...newProduct, condition: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                            <option value="New">New</option>
                            <option value="Refurbished">Refurbished</option>
                        </select>
                    </div>
                </div>

                <div className="modal-grid-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Selling Price (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 25000" 
                        value={newProduct.price} 
                        onChange={e => {
                            const p = e.target.value;
                            const m = newProduct.mrp;
                            const d = (p && m && m > 0) ? Math.round(((m - p) / m) * 100) : 0;
                            setNewProduct({...newProduct, price: p, discount: d});
                        }} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>MRP (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 35000" 
                        value={newProduct.mrp} 
                        onChange={e => {
                            const m = e.target.value;
                            const p = newProduct.price;
                            const d = (p && m && m > 0) ? Math.round(((m - p) / m) * 100) : 0;
                            setNewProduct({...newProduct, mrp: m, discount: d});
                        }} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Discount (%)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 15"
                        value={newProduct.discount} 
                        onChange={e => {
                            const d = e.target.value;
                            const m = newProduct.mrp;
                            let p = newProduct.price;
                            if (m && d !== '') {
                                p = Math.round(m - (m * d / 100));
                            }
                            setNewProduct({...newProduct, discount: d, price: p});
                        }}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                      />
                    </div>
                </div>
                
                <div className="modal-grid-row">
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Rating (0-5)</label>
                      <input type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" value={newProduct.rating} onChange={e => setNewProduct({...newProduct, rating: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Featured Product</label>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '45px' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="checkbox" checked={newProduct.featured} onChange={e => setNewProduct({...newProduct, featured: e.target.checked})} style={{ width: '18px', height: '18px' }} /> Show on Home Page
                           </label>
                       </div>
                    </div>
                </div>

                <div className="modal-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Stock Status</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '45px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155', whiteSpace: 'nowrap' }}>
                              <input type="radio" name="stock" checked={newProduct.inStock} onChange={() => setNewProduct({...newProduct, inStock: true, stockQuantity: newProduct.stockQuantity === 0 ? 1 : newProduct.stockQuantity})} /> In Stock
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155', whiteSpace: 'nowrap' }}>
                              <input type="radio" name="stock" checked={!newProduct.inStock} onChange={() => setNewProduct({...newProduct, inStock: false, stockQuantity: 0})} /> Out of Stock
                          </label>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Stock Quantity</label>
                      <input 
                        type="number" 
                        min="0" 
                        placeholder="Available Units" 
                        value={newProduct.stockQuantity ?? ''} 
                        onChange={e => {
                          const val = e.target.value;
                          setNewProduct({
                            ...newProduct, 
                            stockQuantity: val, 
                            inStock: val !== '' && parseInt(val, 10) > 0
                          });
                        }} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                      />
                    </div>
                </div>

                <div>
                   <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Product Description</label>
                   <textarea 
                     value={newProduct.description} 
                     onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                     style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '100px', fontFamily: 'inherit' }} 
                     placeholder="Detailed description of the product..." 
                   />
                </div>

                <div>
                   <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Specifications
                      <button type="button" onClick={() => handleAddSpec(false)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}>+ Add More</button>
                   </label>
                   <div style={{ display: 'grid', gap: '8px' }}>
                      {newProduct.specifications.map((spec, idx) => (
                        <div key={idx} className="spec-row" style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="Key (e.g. Speed)" value={spec.key} onChange={e => handleUpdateSpec(idx, 'key', e.target.value, false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <input type="text" placeholder="Value (e.g. 500mm/s)" value={spec.value} onChange={e => handleUpdateSpec(idx, 'value', e.target.value, false)} style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <button type="button" onClick={() => handleRemoveSpec(idx, false)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                   </div>
                </div>

                <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>Product Image (Main)</label>
                   <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s' }}>
                       {imagePreview ? (
                           <img src={imagePreview} alt="Preview" style={{ height: '120px', objectFit: 'contain' }} />
                       ) : (
                           <>
                              <UploadSimple size={24} color="#64748b" style={{ marginBottom: '8px' }} />
                              <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Main Image</span>
                           </>
                       )}
                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                   </label>
                </div>

                <div style={{ marginTop: '1rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Product Gallery (Additional Images)</label>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                       {additionalImagePreviews.map((src, i) => (
                           <div key={i}>
                               <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', cursor: 'pointer', background: '#f8fafc', height: '100px', position: 'relative', transition: 'all 0.2s' }}>
                                   {src ? (
                                       <>
                                           <img src={getImageUrl(src)} alt={`Gallery ${i+1}`} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                           <button 
                                               type="button"
                                               onClick={(e) => { e.stopPropagation(); handleRemoveSlotImage(i, false); }} 
                                               style={{ position: 'absolute', top: '5px', right: '5px', background: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                               <X size={12} weight="bold" />
                                           </button>
                                       </>
                                   ) : (
                                       <>
                                          <UploadSimple size={20} color="#94a3b8" />
                                          <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Image {i+1}</span>
                                       </>
                                   )}
                                   <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleSlotImageUpload(e, i, false)} />
                               </label>
                           </div>
                       ))}
                   </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button 
                        onClick={() => setIsAddModalOpen(false)}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button 
                        disabled={isSubmitting}
                        onClick={async () => {
                            // Unified Validation Layer
                            if (!newProduct.name || !newProduct.price || !selectedFile) {
                                return showToast('Error: Name, Price, and Image are mandatory!', 'error');
                            }
                            
                            setIsSubmitting(true);
                            try {
                                const formData = new FormData();
                                formData.append('name', newProduct.name);
                                formData.append('category', newProduct.category === 'Other' ? newProduct.otherCategory : newProduct.category);
                                formData.append('featured', newProduct.featured || false);
                                formData.append('brand', newProduct.brand === 'Other' ? newProduct.otherBrand : newProduct.brand);
                                formData.append('price', newProduct.price);
                                formData.append('mrp', newProduct.mrp);
                                formData.append('discount', newProduct.discount || 0);
                                formData.append('inStock', newProduct.inStock);
                                formData.append('stockQuantity', newProduct.stockQuantity || 0);
                                formData.append('rating', newProduct.rating);
                                formData.append('tags', newProduct.tags);
                                if (newProduct.badgeStyle) formData.append('badgeStyle', JSON.stringify(newProduct.badgeStyle));
                                formData.append('condition', newProduct.condition);
                                formData.append('description', newProduct.description);
                                formData.append('specifications', JSON.stringify(newProduct.specifications.filter(s => s.key && s.value)));
                                formData.append('image', selectedFile);
                                additionalSelectedFiles.forEach(file => {
                                    if (file) formData.append('images', file);
                                });

                                const res = await fetch(`${BASE_URL}/api/products`, {
                                    method: 'POST',
                                    body: formData
                                });
                                
                                const data = await res.json();
                                
                                if(res.ok) {
                                    setAdminProducts([data, ...adminProducts]);
                                    setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 })); // Manual Instant Increment
                                    
                                    // Silent Background Refresh
                                    fetch(`${BASE_URL}/api/stats`).then(s => s.json()).then(newData => setStats(newData)).catch(() => {});
                                    window.dispatchEvent(new Event('META_UPDATED'));
                                    
                                    setIsAddModalOpen(false);
                                    setNewProduct({ name: '', category: 'FDM', price: '', mrp: '', inStock: true, stockQuantity: 0, image: '', rating: 5.0, featured: false, tags: 'None', badgeStyle: null, description: '', brand: 'Anycubic', otherCategory: '', condition: 'New', specifications: [{ key: '', value: '' }] });
                                    setImagePreview(null);
                                    setSelectedFile(null);
                                    setAdditionalSelectedFiles([null, null, null, null, null]);
                                    setAdditionalImagePreviews([null, null, null, null, null]);
                                    showToast('Success: Product added to catalog!', 'success');
                                } else {
                                    showToast(data.message || 'Server Error: Could not add product', 'error');
                                }
                            } catch(e) { 
                                console.error('Create product failed', e); 
                                showToast('Network Error: Connectivity issue', 'error');
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        style={{ 
                            padding: '0.8rem 1.5rem', 
                            borderRadius: '6px', 
                            border: 'none', 
                            background: isSubmitting ? '#94a3b8' : '#3b82f6', 
                            color: 'white', 
                            fontWeight: 600, 
                            cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                        {isSubmitting ? (
                            <>
                                <Clock size={20} className="spinner" /> Saving...
                            </>
                        ) : 'Add Product'}
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editProductState && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
             <button onClick={() => setIsEditModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Edit Product Attributes</h2>
             
             <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Product Name</label>
                  <input type="text" value={editProductState.name} onChange={e => setEditProductState({...editProductState, name: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} placeholder="e.g. Anycubic Kobra 2" />
                </div>
                
                <div className="modal-grid-row">
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Brand</label>
                      <select value={editProductState.brand} onChange={e => setEditProductState({...editProductState, brand: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                          {['Anycubic', 'Bambu Lab', 'Creality', 'Snapmaker', 'Rotrics', 'Flashforge', 'Skriware', 'Magforms', 'Zmorph', 'Sunlu', 'Elegoo'].map(b => (
                              <option key={b} value={b}>{b}</option>
                          ))}
                          <option value="Other">Other (Manually Input)</option>
                      </select>
                      {editProductState.brand === 'Other' && (
                          <input 
                              type="text" 
                              placeholder="Enter Custom Brand" 
                              value={editProductState.otherBrand || ''} 
                              onChange={e => setEditProductState({...editProductState, otherBrand: e.target.value})}
                              style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', marginTop: '0.5rem' }}
                          />
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Category</label>
                      <select value={editProductState.category} onChange={e => setEditProductState({...editProductState, category: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                          {['FDM', 'Resin', 'Filament', 'Accessory', 'Spare Parts', '3D Pen', '3D Scanner', 'Laser Engraver', 'CNC Router', 'Food Printer', 'Robotics'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="Other">Other (Manually Input)</option>
                      </select>
                      {editProductState.category === 'Other' && (
                          <input 
                              type="text" 
                              placeholder="Enter Custom Category" 
                              value={editProductState.otherCategory || ''} 
                              onChange={e => setEditProductState({...editProductState, otherCategory: e.target.value})}
                              style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', marginTop: '0.5rem' }}
                          />
                      )}
                    </div>
                </div>
                
                <div className="modal-grid-row">
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Product Condition</label>
                        <select value={editProductState.condition || 'New'} onChange={e => setEditProductState({...editProductState, condition: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                            <option value="New">New</option>
                            <option value="Refurbished">Refurbished</option>
                        </select>
                    </div>
                </div>

                <div className="modal-grid-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Selling Price (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 25000" 
                        value={editProductState.price} 
                        onChange={e => {
                            const p = e.target.value;
                            const m = editProductState.mrp;
                            const d = (p && m && m > 0) ? Math.round(((m - p) / m) * 100) : 0;
                            setEditProductState({...editProductState, price: p, discount: d});
                        }} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>MRP (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 35000" 
                        value={editProductState.mrp ?? ''} 
                        onChange={e => {
                            const m = e.target.value;
                            const p = editProductState.price;
                            const d = (p && m && m > 0) ? Math.round(((m - p) / m) * 100) : 0;
                            setEditProductState({...editProductState, mrp: m, discount: d});
                        }} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Discount (%)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 15"
                        value={editProductState.discount || 0} 
                        onChange={e => {
                            const d = e.target.value;
                            const m = editProductState.mrp;
                            let p = editProductState.price;
                            if (m && d !== '') {
                                p = Math.round(m - (m * d / 100));
                            }
                            setEditProductState({...editProductState, discount: d, price: p});
                        }}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                      />
                    </div>
                </div>
                
                <div className="modal-grid-row">
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Rating (0-5)</label>
                      <input type="number" step="0.1" min="0" max="5" placeholder="e.g. 4.5" value={editProductState.rating ?? ''} onChange={e => setEditProductState({...editProductState, rating: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Tags / Badge</label>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '45px' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="radio" name="editbadge" checked={editProductState.tags === 'Sale'} onChange={() => setEditProductState({...editProductState, tags: 'Sale', badgeStyle: { background: '#ef4444', color: 'white' }})} /> Sale
                           </label>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="radio" name="editbadge" checked={editProductState.tags === 'Best Seller'} onChange={() => setEditProductState({...editProductState, tags: 'Best Seller', badgeStyle: { background: '#10b981', color: 'white' }})} /> Best
                           </label>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="radio" name="editbadge" checked={editProductState.tags === 'None'} onChange={() => setEditProductState({...editProductState, tags: 'None', badgeStyle: null})} /> None
                           </label>
                       </div>
                    </div>
                </div>

                <div className="modal-grid-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Stock Status</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '45px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                              <input type="radio" name="editstock" checked={editProductState.inStock} onChange={() => setEditProductState({...editProductState, inStock: true, stockQuantity: editProductState.stockQuantity === 0 ? 1 : editProductState.stockQuantity})} /> In Stock
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                              <input type="radio" name="editstock" checked={!editProductState.inStock} onChange={() => setEditProductState({...editProductState, inStock: false, stockQuantity: 0})} /> Out of Stock
                          </label>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Stock Quantity</label>
                      <input 
                        type="number" 
                        min="0" 
                        value={editProductState.stockQuantity ?? ''} 
                        onChange={e => {
                          const val = e.target.value;
                          setEditProductState({
                            ...editProductState, 
                            stockQuantity: val, 
                            inStock: val !== '' && parseInt(val, 10) > 0
                          });
                        }} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} 
                      />
                    </div>
                </div>

                <div>
                   <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Product Description</label>
                   <textarea 
                     value={editProductState.description || ''} 
                     onChange={e => setEditProductState({...editProductState, description: e.target.value})} 
                     style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', minHeight: '100px', fontFamily: 'inherit' }} 
                     placeholder="Detailed description of the product..." 
                   />
                </div>

                <div>
                   <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Specifications
                      <button type="button" onClick={() => handleAddSpec(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}>+ Add More</button>
                   </label>
                   <div style={{ display: 'grid', gap: '8px' }}>
                      {(editProductState.specifications || []).map((spec, idx) => (
                        <div key={idx} className="spec-row" style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" placeholder="Key (e.g. Speed)" value={spec.key} onChange={e => handleUpdateSpec(idx, 'key', e.target.value, true)} style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <input type="text" placeholder="Value (e.g. 500mm/s)" value={spec.value} onChange={e => handleUpdateSpec(idx, 'value', e.target.value, true)} style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <button type="button" onClick={() => handleRemoveSpec(idx, true)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '4px', padding: '0 8px', cursor: 'pointer' }}>×</button>
                        </div>
                      ))}
                   </div>
                </div>

                <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>Product Image (Main)</label>
                   <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', background: '#f8fafc', transition: 'all 0.2s' }}>
                       {editImagePreview ? (
                           <img src={editImagePreview} alt="Preview" style={{ height: '120px', objectFit: 'contain' }} />
                       ) : (
                           <>
                              <UploadSimple size={24} color="#64748b" style={{ marginBottom: '8px' }} />
                              <span style={{ color: '#64748b', fontWeight: 500, fontSize: '0.9rem' }}>Main Image</span>
                           </>
                       )}
                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleEditImageUpload} />
                   </label>
                </div>

                <div style={{ marginTop: '1rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Product Gallery (Additional Images)</label>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                       {editAdditionalImagePreviews.map((src, i) => (
                           <div key={i}>
                               <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', cursor: 'pointer', background: '#f8fafc', height: '100px', position: 'relative', transition: 'all 0.2s' }}>
                                   {src ? (
                                       <>
                                           <img src={getImageUrl(src)} alt={`Gallery ${i+1}`} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                           <button 
                                               type="button"
                                               onClick={(e) => { e.stopPropagation(); handleRemoveSlotImage(i, true); }} 
                                               style={{ position: 'absolute', top: '5px', right: '5px', background: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                               <X size={12} weight="bold" />
                                           </button>
                                       </>
                                   ) : (
                                       <>
                                          <UploadSimple size={20} color="#94a3b8" />
                                          <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Image {i+1}</span>
                                       </>
                                   )}
                                   <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleSlotImageUpload(e, i, true)} />
                               </label>
                           </div>
                       ))}
                   </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button 
                        onClick={() => setIsEditModalOpen(false)}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button 
                        onClick={async () => {
                            if (!editProductState.name || !editProductState.price) return showToast('Please provide Name and Price!', 'error');
                            try {
                                const formData = new FormData();
                                formData.append('name', editProductState.name);
                                formData.append('category', editProductState.category === 'Other' ? editProductState.otherCategory : editProductState.category);
                                formData.append('brand', editProductState.brand === 'Other' ? editProductState.otherBrand : (editProductState.brand || 'Custom'));
                                formData.append('price', editProductState.price);
                                if (editProductState.mrp) formData.append('mrp', editProductState.mrp);
                                formData.append('discount', editProductState.discount || 0);
                                formData.append('inStock', editProductState.inStock);
                                formData.append('stockQuantity', editProductState.stockQuantity || 0);
                                if (editProductState.rating) formData.append('rating', editProductState.rating);
                                formData.append('tags', editProductState.tags || 'None');
                                formData.append('featured', editProductState.featured || false);
                                if (editProductState.badgeStyle) formData.append('badgeStyle', JSON.stringify(editProductState.badgeStyle));
                                formData.append('condition', editProductState.condition || 'New');
                                formData.append('description', editProductState.description || '');
                                formData.append('specifications', JSON.stringify((editProductState.specifications || []).filter(s => s.key && s.value)));
                                if (editSelectedFile) formData.append('image', editSelectedFile);
                                
                                // Existing images to keep (not blob URLs)
                                const existingToKeep = editAdditionalImagePreviews.filter(src => src && !src.startsWith('blob:'));
                                formData.append('existingImages', JSON.stringify(existingToKeep));

                                editAdditionalSelectedFiles.forEach(file => {
                                    if (file) formData.append('images', file);
                                });

                                const res = await fetch(`${BASE_URL}/api/products/${editProductState._id}`, {
                                    method: 'PUT',
                                    body: formData
                                });
                                if(res.ok) {
                                    const updatedProduct = await res.json();
                                    setAdminProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
                                    window.dispatchEvent(new Event('META_UPDATED'));
                                    setIsEditModalOpen(false);
                                    showToast('Successfully updated product!', 'success');
                                } else {
                                    const errorData = await res.json();
                                    showToast('Server Error: ' + (errorData.message || 'Could not update product.'), 'error');
                                }
                            } catch(e) { 
                                console.error('Failed to update product', e); 
                                showToast('Network Error: ' + e.message, 'error');
                            }
                        }}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#059669'}
                        onMouseOut={e => e.currentTarget.style.background = '#10b981'}>
                        Save Details
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmState && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '18px' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '15px' }}>Are you sure you want to permanently delete <strong>{deleteConfirmState.title}</strong>?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setDeleteConfirmState(null)} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                      const res = await fetch(`${BASE_URL}/api/products/${deleteConfirmState._id}`, { method: 'DELETE' });
                      if (res.ok || res.status === 404) {
                          setAdminProducts(prev => prev.filter(p => p._id !== deleteConfirmState._id));
                          setStats(prev => ({ ...prev, totalProducts: Math.max(0, prev.totalProducts - 1) })); // Manual Instant Decrement
                          
                           // Silent Background Refresh
                           fetch(`${BASE_URL}/api/stats`).then(s => s.json()).then(newData => setStats(newData)).catch(() => {});
                      } else {
                          const err = await res.json();
                          alert('Failed to delete product: ' + err.message);
                      }
                  } catch(err) {
                      alert('Network error while deleting.');
                  }
                  setDeleteConfirmState(null);
                }} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '540px', width: '90%', position: 'relative' }}>
             <button onClick={() => setSelectedOrderDetails(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#0f172a'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>Order Details</h2>
             
             <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Order ID</span>
                  <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>{selectedOrderDetails.orderId}</strong>
               </div>
               <div>
                 <select 
                   value={selectedOrderDetails.status} 
                   onChange={(e) => setStatusConfirmState({ orderId: selectedOrderDetails.orderId, newStatus: e.target.value })}
                   style={{ padding: '8px 12px', borderRadius: '20px', outline: 'none', fontWeight: 600, cursor: 'pointer', ...getOrderBadgeStyle(selectedOrderDetails.status), transition: 'all 0.3s ease', appearance: 'none', textAlign: 'center' }}
                 >
                    <option value="Pending" style={{ background: 'white', color: '#d97706' }}>Pending</option>
                    <option value="Confirmed" style={{ background: 'white', color: '#2563eb' }}>Confirmed</option>
                    <option value="Printing" style={{ background: 'white', color: '#9333ea' }}>Printing</option>
                    <option value="Delivered" style={{ background: 'white', color: '#16a34a' }}>Delivered</option>
                 </select>
               </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                   <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Customer Info</span>
                   <div style={{ color: '#1e293b', fontWeight: 500, marginTop: '4px' }}>{selectedOrderDetails.customerName}</div>
                   <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedOrderDetails.phone}</div>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Shipping Address</span>
                  <div style={{ color: '#334155', fontSize: '0.9rem', marginTop: '4px', lineHeight: '1.4' }}>{selectedOrderDetails.address}</div>
                </div>
             </div>

             <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Product Details</span>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                   <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Product Name:</span>
                   <span style={{ color: '#334155', fontWeight: 500 }}>{selectedOrderDetails.productName}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                   <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Quantity:</span>
                   <span style={{ color: '#334155', fontWeight: 500 }}>{selectedOrderDetails.quantity}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                   <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Price per item:</span>
                   <span style={{ color: '#334155', fontWeight: 500 }}>₹{(selectedOrderDetails.totalPrice / selectedOrderDetails.quantity).toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
                   <span style={{ color: '#334155', fontWeight: 600 }}>Total Amount:</span>
                   <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>₹{selectedOrderDetails.totalPrice.toLocaleString('en-IN')}</span>
                </div>
             </div>

             <div style={{ display: 'flex', gap: '2rem' }}>
                 <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Payment Method</span>
                    <div style={{ color: '#334155', fontWeight: 500, marginTop: '4px' }}>{selectedOrderDetails.paymentMethod}</div>
                 </div>
                 <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Payment Status</span>
                    <div style={{ color: selectedOrderDetails.paymentStatus === 'Paid' ? '#16a34a' : '#d97706', fontWeight: 600, marginTop: '4px' }}>{selectedOrderDetails.paymentStatus}</div>
                 </div>
             </div>
          </div>
        </div>
      )}

      {/* Custom Status Change Confirmation Modal */}
      {statusConfirmState && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: 'white', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '18px' }}>Confirm Status Change</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '15px' }}>
              Are you sure you want to change the status to <strong>{statusConfirmState.newStatus}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setStatusConfirmState(null)} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleUpdateOrderStatus(statusConfirmState.orderId, statusConfirmState.newStatus);
                  setStatusConfirmState(null);
                }} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '540px', width: '90%', position: 'relative' }}>
             <button onClick={() => setSelectedUserDetails(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#0f172a'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>User Details</h2>
             
             <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>User ID</span>
                  <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>{selectedUserDetails.id}</strong>
               </div>
               <div>
                    <span style={{ 
                      padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, 
                      background: selectedUserDetails.status === 'Active' ? '#dcfce7' : '#fee2e2',
                      color: selectedUserDetails.status === 'Active' ? '#16a34a' : '#ef4444',
                      border: `1px solid ${selectedUserDetails.status === 'Active' ? '#bbf7d0' : '#fecaca'}`,
                    }}>
                      {selectedUserDetails.status}
                    </span>
               </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                   <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Contact Info</span>
                   <div style={{ color: '#1e293b', fontWeight: 500, marginTop: '4px' }}>{selectedUserDetails.name}</div>
                   <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedUserDetails.email}</div>
                   <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{selectedUserDetails.phone}</div>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Address</span>
                  <div style={{ color: '#334155', fontSize: '0.9rem', marginTop: '4px', lineHeight: '1.4' }}>{selectedUserDetails.address}</div>
                </div>
             </div>

             <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Account Activity</span>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Total Orders:</span>
                   <span style={{ color: '#334155', fontWeight: 500 }}>{selectedUserDetails.totalOrders}</span>
                 </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                   <span style={{ color: '#334155', fontWeight: 600 }}>Total Spending:</span>
                   <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>₹{selectedUserDetails.totalSpending.toLocaleString('en-IN')}</span>
                </div>
             </div>

             <div>
                 <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Recent Orders</span>
                 <div style={{ display: 'grid', gap: '10px' }}>
                     {selectedUserDetails.recentOrders.length > 0 ? selectedUserDetails.recentOrders.map(order => (
                         <div 
                           key={order.orderId} 
                           onClick={() => setSelectedOrderDetails(order)}
                           style={{ 
                             background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', 
                             cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                           }}
                           onMouseOver={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                           onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fafafa'; }}
                         >
                           <div>
                             <strong style={{ display: 'block', color: '#1e293b', fontSize: '1rem', marginBottom: '4px' }}>{order.productName}</strong>
                             <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ color: '#0f172a', fontWeight: 600 }}>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                                <span>&bull;</span>
                                <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                             </div>
                           </div>
                           <span style={{ 
                               padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, 
                               ...getOrderBadgeStyle(order.status)
                             }}>
                               {order.status}
                           </span>
                         </div>
                     )) : (
                         <div style={{ color: '#94a3b8', fontSize: '0.95rem', padding: '16px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                           No recent orders
                         </div>
                     )}
                 </div>
             </div>
             
             <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => toggleUserStatus(selectedUserDetails.id, selectedUserDetails.status)}
                  style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: 'none', background: selectedUserDetails.status === 'Active' ? '#fee2e2' : '#dcfce7', color: selectedUserDetails.status === 'Active' ? '#ef4444' : '#16a34a', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
                >
                  {selectedUserDetails.status === 'Active' ? 'Block User Account' : 'Unblock User Account'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Support Query Detail Modal */}
      {selectedSupportQuery && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(3px)' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxWidth: '500px', width: '90%', position: 'relative' }}>
                <button onClick={() => setSelectedSupportQuery(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Support Ticket Detail</h2>
                    <span style={{ 
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                        background: selectedSupportQuery.status === 'new' ? '#fee2e2' : selectedSupportQuery.status === 'pending' ? '#fef3c7' : '#dcfce7',
                        color: selectedSupportQuery.status === 'new' ? '#ef4444' : selectedSupportQuery.status === 'pending' ? '#d97706' : '#16a34a'
                    }}>
                        {selectedSupportQuery.status.toUpperCase()}
                    </span>
                </div>

                <div style={{ display: 'grid', gap: '1.2rem', marginBottom: '1.5rem' }}>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>From</span>
                        <div style={{ color: '#1e293b', fontWeight: 600 }}>{selectedSupportQuery.name}</div>
                        <div style={{ color: '#3b82f6', fontSize: '0.9rem' }}>{selectedSupportQuery.email}</div>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Subject</span>
                        <div style={{ color: '#1e293b', fontWeight: 700 }}>{selectedSupportQuery.subject}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Message</span>
                        <div style={{ color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedSupportQuery.message}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Submitted on: {new Date(selectedSupportQuery.createdAt).toLocaleString()}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={() => handleDeleteSupport(selectedSupportQuery._id)}
                        style={{ padding: '0.8rem 1.2rem', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Delete
                    </button>
                    <select 
                        value={selectedSupportQuery.status}
                        onChange={(e) => handleUpdateSupportStatus(selectedSupportQuery._id, e.target.value)}
                        style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer' }}
                    >
                        <option value="new">Mark as New</option>
                        <option value="pending">Mark as Pending</option>
                        <option value="resolved">Mark as Resolved</option>
                    </select>
                    <button 
                        onClick={() => setSelectedSupportQuery(null)}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: toast.type === 'success' ? '#10b981' : '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 9999, animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '250px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '4px', display: 'flex' }}>
            <Bell size={20} weight="fill" />
          </div>
          <span style={{ fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .modal-grid-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        @media (max-width: 640px) {
            .modal-grid-row {
                grid-template-columns: 1fr !important;
            }
            .modal-grid-row > div {
                margin-bottom: 0.5rem;
            }
            .spec-row {
                flex-direction: column !important;
                gap: 5px !important;
            }
            .spec-row input {
                width: 100% !important;
            }
        }
        .orders-mgmt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            gap: 20px;
        }
        .orders-mgmt-title {
            font-size: 1.5rem;
            color: var(--admin-text-dark);
            margin: 0;
            flex-shrink: 0;
        }
        .status-filter-scroll {
            display: flex;
            gap: 8px;
            background: white;
            padding: 4px;
            border-radius: 8px;
            border: 1px solid var(--admin-border-color);
            overflow-x: auto;
            max-width: 100%;
            -webkit-overflow-scrolling: touch;
        }
        .status-filter-scroll::-webkit-scrollbar {
            display: none;
        }
        .status-filter-btn {
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
            background: transparent;
            color: var(--admin-text-main);
            white-space: nowrap;
        }
        .status-filter-btn.active {
            background: #3b82f6;
            color: white;
        }
        @media (max-width: 768px) {
            .orders-mgmt-header {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }
            .orders-mgmt-title {
                font-size: 1.25rem;
                text-align: center;
            }
            .status-filter-scroll {
                padding: 4px;
                justify-content: flex-start;
            }
        }
        .products-mgmt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            gap: 20px;
        }
        .products-mgmt-title {
            font-size: 1.5rem;
            color: var(--admin-text-dark);
            margin: 0;
            flex-shrink: 0;
        }
        .search-bar-wrapper {
            flex: 1;
            max-width: 400px;
            display: flex;
            align-items: center;
            background: white;
            border: 1px solid var(--admin-border-color);
            borderRadius: 8px;
            padding: 0 12px;
            height: 45px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .add-product-btn-admin {
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 0 20px; 
            border-radius: 8px; 
            font-weight: 600; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            gap: 8px; 
            cursor: pointer; 
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); 
            transition: all 0.2s; 
            white-space: nowrap; 
            height: 45px;
        }
        .add-product-btn-admin:hover {
            transform: translateY(-2px);
            background: #2563eb;
        }
        @media (max-width: 768px) {
            .products-mgmt-header {
                flex-direction: column;
                align-items: stretch;
                gap: 15px;
            }
            .products-mgmt-title {
                font-size: 1.25rem;
                text-align: center;
            }
            .search-bar-wrapper {
                max-width: 100%;
            }
            .add-product-btn-admin {
                width: 100%;
            }
        }
        .modal-grid-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        @media (max-width: 640px) {
            .modal-grid-row {
                grid-template-columns: 1fr !important;
            }
            .modal-grid-row > div {
                margin-bottom: 0.5rem;
            }
            .spec-row {
                flex-direction: column !important;
                gap: 5px !important;
            }
            .spec-row input {
                width: 100% !important;
            }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
