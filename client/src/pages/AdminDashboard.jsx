import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  House, Package, ShoppingCart, Users, Gear, 
  Bell, MagnifyingGlass, List, CurrencyDollar, TrendUp, Clock, ArrowLeft, Heart, X, UploadSimple, Trash, PencilSimple, Plus, Sparkle, Eye, Funnel, Storefront, Bag, Article
} from '@phosphor-icons/react';
import { getImageUrl, PLACEHOLDER_SVG } from '../utils/imageUtils';
import './AdminDashboard.css';
import './AdminDashboardPartners.css';

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
    { name: 'Hero', icon: <Eye size={24} /> },
    { name: 'Products', icon: <Package size={24} /> },
    { name: 'Orders', icon: <ShoppingCart size={24} /> },
    { name: 'Users', icon: <Users size={24} /> },
    { name: 'Marketing', icon: <Sparkle size={24} /> },
      { name: 'Partners', icon: <TrendUp size={24} /> },
      { name: 'Marketplaces', icon: <Storefront size={24} /> },
      { name: 'Blogs', icon: <Article size={24} /> },
    { name: 'Support', icon: <Bell size={24} /> },
    { name: 'Settings', icon: <Gear size={24} /> }
  ];

  const [partnerProducts, setPartnerProducts] = useState([]);
    const [partnerFormData, setPartnerFormData] = useState({ name: '', image: '', externalLink: '', category: '', price: '' });
    const [partnerImageFile, setPartnerImageFile] = useState(null);
    const [editingPartnerProductId, setEditingPartnerProductId] = useState(null);
    const [deletePartnerConfirm, setDeletePartnerConfirm] = useState(null);

  const fetchPartnerProducts = async () => {
      try {
          const res = await fetch(`${BASE_URL}/api/partner-products`);
          if (res.ok) {
              const data = await res.json();
              setPartnerProducts(data);
          }
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => {
      fetchPartnerProducts();
      fetchPartnerPosters();
      fetchMarketplaceLinks();
      fetchBlogsAdmin();
  }, []);

  // --- BLOGS STATE ---
  const [blogs, setBlogs] = useState([]);
  const [blogFormData, setBlogFormData] = useState({ title: '', author: 'Admin', content: '', isActive: true });
  const [blogThumbnailFile, setBlogThumbnailFile] = useState(null);
  const [blogExtraFiles, setBlogExtraFiles] = useState([]);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [deleteBlogConfirm, setDeleteBlogConfirm] = useState(null);

  const fetchBlogsAdmin = async () => {
      try {
          const res = await fetch(`${BASE_URL}/api/blogs/admin`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
              const data = await res.json();
              setBlogs(data);
          }
      } catch (err) {
          console.error(err);
      }
  };

  const handleBlogSubmit = async (e) => {
      e.preventDefault();
      try {
          const formData = new FormData();
          formData.append('title', blogFormData.title);
          formData.append('author', blogFormData.author);
          formData.append('content', blogFormData.content);
          formData.append('isActive', blogFormData.isActive);
          
          if (blogThumbnailFile) {
              formData.append('thumbnailImage', blogThumbnailFile);
          }
          if (blogExtraFiles && blogExtraFiles.length > 0) {
              for (let i = 0; i < blogExtraFiles.length; i++) {
                  formData.append('extraImages', blogExtraFiles[i]);
              }
          }

          const url = editingBlogId ? `${BASE_URL}/api/blogs/${editingBlogId}` : `${BASE_URL}/api/blogs`;
          const method = editingBlogId ? 'PUT' : 'POST';

          const res = await fetch(url, {
              method,
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
              body: formData
          });

          if (res.ok) {
              showToast(editingBlogId ? 'Blog updated' : 'Blog created', 'success');
              fetchBlogsAdmin();
              setBlogFormData({ title: '', author: 'Admin', content: '', isActive: true });
              setBlogThumbnailFile(null);
              setBlogExtraFiles([]);
              setEditingBlogId(null);
          } else {
              const errText = await res.text();
              console.error("Backend Error Text:", errText);
              let errData;
              try { errData = JSON.parse(errText); } catch (e) { errData = { message: errText.substring(0, 100) }; }
              showToast(`Failed to save blog: ${errData.message || 'Unknown error'}`, 'error');
          }
      } catch (err) {
          showToast(`Network error: ${err.message}`, 'error');
      }
  };

  const handleEditBlogClick = (blog) => {
      setEditingBlogId(blog._id);
      setBlogFormData({ title: blog.title, author: blog.author, content: blog.content, isActive: blog.isActive });
      setBlogThumbnailFile(null);
      setBlogExtraFiles([]);
  };

  const confirmDeleteBlog = async () => {
      if(!deleteBlogConfirm) return;
      try {
          const res = await fetch(`${BASE_URL}/api/blogs/${deleteBlogConfirm}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
              fetchBlogsAdmin();
              showToast('Blog deleted', 'success');
          }
      } catch (err) {
          showToast('Error deleting blog', 'error');
      }
      setDeleteBlogConfirm(null);
  };
  // -------------------

  const [marketplaceLinks, setMarketplaceLinks] = useState({ amazon: '', flipkart: '', indiamart: '' });

  const fetchMarketplaceLinks = async () => {
      try {
          const res = await fetch(`${BASE_URL}/api/marketplaces`);
          if (res.ok) {
              const data = await res.json();
              if (data) {
                  setMarketplaceLinks({
                      amazon: data.amazon || '',
                      flipkart: data.flipkart || '',
                      indiamart: data.indiamart || ''
                  });
              }
          }
      } catch (err) {
          console.error(err);
      }
  };

  const saveMarketplaceLinks = async (e) => {
      e.preventDefault();
      try {
          const res = await fetch(`${BASE_URL}/api/marketplaces`, {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
              },
              body: JSON.stringify(marketplaceLinks)
          });
          if (res.ok) {
              showToast('Marketplace links updated successfully', 'success');
          } else {
              showToast('Failed to update links', 'error');
          }
      } catch (err) {
          showToast('Network error', 'error');
      }
  };

  const [partnerPosters, setPartnerPosters] = useState({ left: { imageUrl: '', link: '', isActive: true }, right: { imageUrl: '', link: '', isActive: true } });
  const [partnerPosterFiles, setPartnerPosterFiles] = useState({ left: null, right: null });
  
  const fetchPartnerPosters = async () => {
      try {
          const res = await fetch(`${BASE_URL}/api/partner-posters`);
          if (res.ok) {
              const data = await res.json();
              const posters = { left: { imageUrl: '', link: '', isActive: true }, right: { imageUrl: '', link: '', isActive: true } };
              data.forEach(p => {
                  posters[p.position] = p;
              });
              setPartnerPosters(posters);
          }
      } catch (err) {
          console.error(err);
      }
  };

  const savePartnerPoster = async (position) => {
      try {
          const formData = new FormData();
          formData.append('link', partnerPosters[position].link || '');
          formData.append('isActive', true);
          if (partnerPosters[position].imageUrl) {
              formData.append('imageUrl', partnerPosters[position].imageUrl);
          }
          if (partnerPosterFiles[position]) {
              formData.append('imageFile', partnerPosterFiles[position]);
          }

          const res = await fetch(`${BASE_URL}/api/partner-posters/${position}`, {
              method: 'PUT',
              headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}` 
              },
              body: formData
          });
          if (res.ok) {
              const data = await res.json();
              setPartnerPosters(prev => ({ ...prev, [position]: data }));
              setPartnerPosterFiles(prev => ({ ...prev, [position]: null }));
              showToast(`${position} poster updated successfully`, 'success');
          } else {
              showToast('Failed to update poster', 'error');
          }
      } catch (err) {
          showToast('Network error', 'error');
      }
  };

    const handleAddPartnerProduct = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', partnerFormData.name);
            formData.append('externalLink', partnerFormData.externalLink);
            formData.append('category', partnerFormData.category);
            formData.append('price', partnerFormData.price);
            if (partnerImageFile) {
                formData.append('imageFile', partnerImageFile);
            } else {
                formData.append('image', partnerFormData.image);
            }

            const url = editingPartnerProductId 
                ? `${BASE_URL}/api/partner-products/${editingPartnerProductId}` 
                : `${BASE_URL}/api/partner-products`;
                
            const res = await fetch(url, {
                method: editingPartnerProductId ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            if (res.ok) {
                showToast(`Partner product ${editingPartnerProductId ? 'updated' : 'added'}`, 'success');
                fetchPartnerProducts();
                setPartnerFormData({ name: '', image: '', externalLink: '', category: '', price: '' });
                setPartnerImageFile(null);
                setEditingPartnerProductId(null);
            } else {
                showToast('Failed to save product', 'error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditPartnerClick = (product) => {
        setEditingPartnerProductId(product._id);
        setPartnerFormData({
            name: product.name || '',
            image: product.image || '',
            externalLink: product.externalLink || '',
            category: product.category || '',
            price: product.price || ''
        });
        setPartnerImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  const handleDeletePartnerProduct = (id) => {
      setDeletePartnerConfirm(id);
  };

  const confirmDeletePartnerProduct = async () => {
      if(!deletePartnerConfirm) return;
      try {
          const res = await fetch(`${BASE_URL}/api/partner-products/${deletePartnerConfirm}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
          });
          if (res.ok) {
              fetchPartnerProducts();
              showToast('Partner product deleted', 'success');
          } else {
              showToast('Failed to delete product', 'error');
          }
      } catch (err) {
          console.error(err);
          showToast('Network error deleting product', 'error');
      }
      setDeletePartnerConfirm(null);
  };

  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSales: 0
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
      featured: false, newArrival: false,
      specifications: [{ key: '', value: '' }]
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductState, setEditProductState] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('All Status');
  const [meta, setMeta] = useState({ brands: [], categories: [] });
  const [adminFilters, setAdminFilters] = useState({
    brand: [],
    category: [],
    condition: 'All',
    minPrice: '',
    maxPrice: ''
  });
  const [showAdminFilters, setShowAdminFilters] = useState(false);
  const [additionalSelectedFiles, setAdditionalSelectedFiles] = useState([null, null, null, null, null]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([null, null, null, null, null]);
  const [editAdditionalSelectedFiles, setEditAdditionalSelectedFiles] = useState([null, null, null, null, null]);
  const [editAdditionalImagePreviews, setEditAdditionalImagePreviews] = useState([null, null, null, null, null]);
  const [descSelectedFiles, setDescSelectedFiles] = useState([null, null, null, null]);
  const [descImagePreviews, setDescImagePreviews] = useState([null, null, null, null]);
  const [editDescSelectedFiles, setEditDescSelectedFiles] = useState([null, null, null, null]);
  const [editDescImagePreviews, setEditDescImagePreviews] = useState([null, null, null, null]);

  // --- Hero Slides State ---
  const [heroSlides, setHeroSlides] = useState([]);
  const [isHeroAddOpen, setIsHeroAddOpen] = useState(false);
  const [isHeroEditOpen, setIsHeroEditOpen] = useState(false);
  const [newHeroSlide, setNewHeroSlide] = useState({ title: '', subtitle: '', brand: '', brandColor: 'var(--primary)', bgColor: 'var(--text-dark)', price: '', features: '', btnText: '', btnLink: '', order: 0, active: true });
  const [heroSelectedFile, setHeroSelectedFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState(null);
  const [editHeroSlide, setEditHeroSlide] = useState(null);
  const [editHeroSelectedFile, setEditHeroSelectedFile] = useState(null);
  const [editHeroImagePreview, setEditHeroImagePreview] = useState(null);
  const [heroDeleteConfirm, setHeroDeleteConfirm] = useState(null);

  // --- Orders State ---
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('All Orders');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [statusConfirmState, setStatusConfirmState] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  
  const handleInvoiceUpload = async (orderId) => {
    if (!invoiceFile) {
        showToast('Please select a file first', 'error');
        return;
    }
    const formData = new FormData();
    formData.append('invoiceImage', invoiceFile);
    try {
        const res = await fetch(`${BASE_URL}/api/orders/${orderId}/invoice`, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            const data = await res.json();
            setOrders(prev => prev.map(o => o.orderId === orderId ? data.order : o));
            setSelectedOrderDetails(data.order);
            setInvoiceFile(null);
            showToast('Invoice uploaded successfully', 'success');
        } else {
            showToast('Failed to upload invoice', 'error');
        }
    } catch (err) {
        showToast('Network error while uploading invoice', 'error');
    }
  };
  
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

  // --- Marketing Popup State ---
  const [popupConfig, setPopupConfig] = useState({
      title: '',
      link: '',
      isActive: false,
      showOnce: true,
      image: '',
      useTemplate: false,
      templateType: 'sale', // 'sale', 'arrival', 'clearance'
      templateData: {
          title: 'SUMMER SALE',
          subtitle: 'UP TO 50% OFF',
          code: 'FROM 15-30 APRIL 2026',
          color: '#ef4444',
          titleColor: '#ffffff',
          subtitleColor: '#ffffff',
          codeColor: '#ffffff',
          codeBgColor: 'var(--secondary)'
      }
  });
  const [popupImagePreview, setPopupImagePreview] = useState(null);
  const [popupSelectedFile, setPopupSelectedFile] = useState(null);
  const [templateImagePreview, setTemplateImagePreview] = useState(null);
  const [templateSelectedFile, setTemplateSelectedFile] = useState(null);
  const [marketingTab, setMarketingTab] = useState('popup'); // 'popup' or 'coupons'

  // --- Coupons State ---
  const [coupons, setCoupons] = useState([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [deleteCouponConfirm, setDeleteCouponConfirm] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderValue: 0,
      minItems: 1,
      expiryDate: '',
      description: '',
      isActive: true,
      usageLimit: null,
      isPublic: true
  });

  const colorOptions = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: 'var(--primary)' },
    { name: 'Gold', value: 'var(--warning)' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Pink', value: '#d946ef' },
    { name: 'Orange', value: 'var(--secondary)' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Silver', value: '#cbd5e1' },
    { name: 'Gray', value: 'var(--text-muted)' },
    { name: 'Brown', value: '#78350f' }
  ];

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
            const updatedData = await res.json();
            setOrders(prev => prev.map(o => o.orderId === orderId ? updatedData : o));
            if (selectedOrderDetails && selectedOrderDetails.orderId === orderId) {
                setSelectedOrderDetails(updatedData);
            }
            
            // Send WhatsApp notification
            if (updatedData.phone) {
                const cleanPhone = updatedData.phone.replace(/\D/g, '');
                const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                const msg = `Hello ${updatedData.firstName || updatedData.customerName || 'Customer'}, your order *${updatedData.orderId}* status has been updated to: *${updatedData.status}*.%0A%0ACheck details here: https://3dpinaka.in/account%0A%0AThank you for choosing 3D Pinaka!`;
                window.open(`https://wa.me/${finalPhone}?text=${msg}`, '_blank');
            }
            
            // Refresh stats
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

  const filteredProducts = useMemo(() => {
    return adminProducts.filter(p => {
      const name = (p.name || p.title || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      const search = productSearchQuery.toLowerCase();
      
      const matchesSearch = name.includes(search) || brand.includes(search) || category.includes(search);
      
      const matchesStock = stockFilter === 'All Status' || 
                           (stockFilter === 'In Stock' && (p.inStock && (p.stockQuantity == null || p.stockQuantity > 0))) || 
                           (stockFilter === 'Out of Stock' && (!p.inStock || (p.stockQuantity != null && p.stockQuantity <= 0)));
                           
      const matchesBrand = adminFilters.brand.length === 0 || 
                           adminFilters.brand.some(b => b.toLowerCase() === brand);
      
      const matchesCategory = adminFilters.category.length === 0 || 
                              adminFilters.category.some(c => c.toLowerCase() === category);
                              
      const matchesCondition = adminFilters.condition === 'All' || 
                               (p.condition && p.condition.toLowerCase() === adminFilters.condition.toLowerCase());
      
      const price = parsePriceLocal(p.price || 0);
      const matchesPrice = (!adminFilters.minPrice || price >= Number(adminFilters.minPrice)) &&
                           (!adminFilters.maxPrice || price <= Number(adminFilters.maxPrice));

      return matchesSearch && matchesStock && matchesBrand && matchesCategory && matchesCondition && matchesPrice;
    });
  }, [adminProducts, productSearchQuery, stockFilter, adminFilters]);

  const getOrderBadgeStyle = (status) => {
    switch(status) {
        case 'Pending': return { background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' };
        case 'Order Confirmed': 
        case 'Confirmed': return { background: '#dbeafe', color: 'var(--primary)', border: '1px solid #bfdbfe' };
        case 'Processing': 
        case 'Printing': return { background: '#e0f2fe', color: '#0ea5e9', border: '1px solid #bae6fd' };
        case 'Packed / Ready for Dispatch': return { background: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' };
        case 'Shipped / Dispatched': return { background: '#fae8ff', color: '#a21caf', border: '1px solid #f5d0fe' };
        case 'In Transit': return { background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' };
        case 'Out for Delivery': return { background: '#f0f9ff', color: '#0369a1', border: '1px solid #e0f2fe' };
        case 'Delivered': return { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' };
        case 'Attempted Delivery': return { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' };
        case 'Delayed': return { background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' };
        case 'Completed': return { background: 'var(--border-color)', color: 'var(--text-dark)', border: '1px solid var(--border-color)' };
        default: return { background: 'var(--light-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' };
    }
  };
  
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

  const handleDescImageUpload = (e, index, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
        if (isEdit) {
            const newFiles = [...editDescSelectedFiles];
            const newPreviews = [...editDescImagePreviews];
            newFiles[index] = file;
            newPreviews[index] = URL.createObjectURL(file);
            setEditDescSelectedFiles(newFiles);
            setEditDescImagePreviews(newPreviews);
        } else {
            const newFiles = [...descSelectedFiles];
            const newPreviews = [...descImagePreviews];
            newFiles[index] = file;
            newPreviews[index] = URL.createObjectURL(file);
            setDescSelectedFiles(newFiles);
            setDescImagePreviews(newPreviews);
        }
    }
  };

  const handleRemoveDescImage = (index, isEdit = false) => {
    if (isEdit) {
        const newFiles = [...editDescSelectedFiles];
        const newPreviews = [...editDescImagePreviews];
        newFiles[index] = null;
        newPreviews[index] = null;
        setEditDescSelectedFiles(newFiles);
        setEditDescImagePreviews(newPreviews);
    } else {
        const newFiles = [...descSelectedFiles];
        const newPreviews = [...descImagePreviews];
        newFiles[index] = null;
        newPreviews[index] = null;
        setDescSelectedFiles(newFiles);
        setDescImagePreviews(newPreviews);
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
      // Individual fetch helper to prevent cascading failures
      const safeFetch = async (url, setter, options = {}) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (options.transform) {
              setter(options.transform(data));
            } else {
              setter(data);
            }
          }
        } catch (err) {
          console.error(`Fetch failed for ${url}:`, err);
        }
      };

      try {
        await Promise.all([
          safeFetch(`${BASE_URL}/api/stats`, setStats),
          safeFetch(`${BASE_URL}/api/products`, setAdminProducts),
          safeFetch(`${BASE_URL}/api/orders`, setOrders),
          safeFetch(`${BASE_URL}/api/users`, setUsers),
          safeFetch(`${BASE_URL}/api/admin`, setAdminProfile),
          safeFetch(`${BASE_URL}/api/support`, setSupportQueries),
          safeFetch(`${BASE_URL}/api/coupons/admin`, setCoupons),
          safeFetch(`${BASE_URL}/api/hero/all`, setHeroSlides),
          safeFetch(`${BASE_URL}/api/products/meta`, setMeta),
          // Specialized fetch for popup
          (async () => {
            try {
              const res = await fetch(`${BASE_URL}/api/popup`);
              if (res.ok) {
                const data = await res.json();
                setPopupConfig(prev => ({
                    ...prev,
                    ...data,
                    templateData: data.templateData || prev.templateData
                }));
                if (data.image && !data.useTemplate) {
                    setPopupImagePreview(data.image.startsWith('http') ? data.image : `${BASE_URL}${data.image}`);
                }
                if (data.templateImage) {
                    setTemplateImagePreview(data.templateImage.startsWith('http') ? data.templateImage : `${BASE_URL}${data.templateImage}`);
                }
              }
            } catch(e) { console.error("Popup fetch failed", e); }
          })()
        ]);
      } catch (error) {
        console.error("Critical error during dashboard initialization", error);
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

  const handleSavePopup = async () => {
    setIsSubmitting(true);
    try {
        const formData = new FormData();
        formData.append('title', popupConfig.title || 'Promo');
        formData.append('link', popupConfig.link || '');
        formData.append('isActive', popupConfig.isActive);
        formData.append('showOnce', popupConfig.showOnce);
        formData.append('useTemplate', popupConfig.useTemplate);
        formData.append('templateType', popupConfig.templateType);
        formData.append('templateData', JSON.stringify(popupConfig.templateData));
        
        if (popupSelectedFile && !popupConfig.useTemplate) {
            formData.append('image', popupSelectedFile);
        }
        if (templateSelectedFile && popupConfig.useTemplate) {
            formData.append('templateImage', templateSelectedFile);
        }

        const res = await fetch(`${BASE_URL}/api/popup`, {
            method: 'PUT',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            setPopupConfig(data);
            if (data.image && !data.useTemplate) {
                setPopupImagePreview(data.image.startsWith('http') ? data.image : `${BASE_URL}${data.image}`);
            }
            if (data.templateImage) {
                setTemplateImagePreview(data.templateImage.startsWith('http') ? data.templateImage : `${BASE_URL}${data.templateImage}`);
            }
            setPopupSelectedFile(null);
            setTemplateSelectedFile(null);
            showToast('Popup settings saved successfully');
        } else {
            showToast('Failed to save popup settings', 'error');
        }
    } catch (err) {
        showToast('Error saving popup settings', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSaveCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discountValue || !newCoupon.expiryDate || !newCoupon.description) {
        showToast('Please fill all required coupon fields', 'error');
        return;
    }
    setIsSubmitting(true);
    try {
        const res = await fetch(`${BASE_URL}/api/coupons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCoupon)
        });
        if (res.ok) {
            const data = await res.json();
            setCoupons([data, ...coupons]);
            setIsCouponModalOpen(false);
            setNewCoupon({
                code: '',
                discountType: 'percentage',
                discountValue: '',
                minOrderValue: 0,
                minItems: 1,
                expiryDate: '',
                description: '',
                isActive: true,
                usageLimit: null,
                isPublic: true
            });
            showToast('Coupon created successfully');
        } else {
            const err = await res.json();
            showToast(err.message || 'Failed to create coupon', 'error');
        }
    } catch (err) {
        showToast('Network error saving coupon', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = (coupon) => {
    setDeleteCouponConfirm(coupon);
  };

  const confirmDeleteCoupon = async () => {
    if (!deleteCouponConfirm) return;
    try {
        const res = await fetch(`${BASE_URL}/api/coupons/${deleteCouponConfirm._id}`, { method: 'DELETE' });
        if (res.ok) {
            setCoupons(prev => prev.filter(c => c._id !== deleteCouponConfirm._id));
            showToast('Coupon deleted');
        }
    } catch (err) {
        showToast('Failed to delete coupon', 'error');
    }
    setDeleteCouponConfirm(null);
  };

  if (loading) {
      
  return (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--light-bg)', fontFamily: 'Inter, sans-serif' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Initializing Admin Dashboard...</p>
              <style>{`
                  @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
          </div>
      );
  }

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
                        <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fefce8'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                          <td className="adm-order-id" style={{ padding: '16px', fontWeight: 500, color: 'var(--primary)' }}>{order.orderId}</td>
                          <td style={{ padding: '16px', color: '#334155', fontWeight: 500 }}>{order.firstName ? `${order.firstName} ${order.lastName || ''}` : order.customerName}</td>
                          <td className="adm-order-amount" style={{ padding: '16px', fontWeight: 600, color: 'var(--text-dark)' }}>{order.totalPrice ? `₹${order.totalPrice.toLocaleString('en-IN')}` : '₹0'}</td>
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
                              <option value="Pending" style={{ background: 'var(--colorful-bg)', color: '#d97706' }}>Pending</option>
                              <option value="Order Confirmed" style={{ background: 'var(--colorful-bg)', color: 'var(--primary)' }}>Order Confirmed</option>
                              <option value="Processing" style={{ background: 'var(--colorful-bg)', color: '#0ea5e9' }}>Processing</option>
                              <option value="Packed / Ready for Dispatch" style={{ background: 'var(--colorful-bg)', color: '#a16207' }}>Packed / Ready for Dispatch</option>
                              <option value="Shipped / Dispatched" style={{ background: 'var(--colorful-bg)', color: '#a21caf' }}>Shipped / Dispatched</option>
                              <option value="In Transit" style={{ background: 'var(--colorful-bg)', color: '#4338ca' }}>In Transit</option>
                              <option value="Out for Delivery" style={{ background: 'var(--colorful-bg)', color: '#0369a1' }}>Out for Delivery</option>
                              <option value="Delivered" style={{ background: 'var(--colorful-bg)', color: '#16a34a' }}>Delivered</option>
                              <option value="Attempted Delivery" style={{ background: 'var(--colorful-bg)', color: '#dc2626' }}>Attempted Delivery</option>
                              <option value="Delayed" style={{ background: 'var(--colorful-bg)', color: '#c2410c' }}>Delayed</option>
                              <option value="Completed" style={{ background: 'var(--colorful-bg)', color: 'var(--text-dark)' }}>Completed</option>
                            </select>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <button 
                              className="action-btn"
                              onClick={() => setSelectedOrderDetails(order)}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                              onMouseOver={e => { e.currentTarget.style.background = 'var(--border-color)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
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

        {activeTab === 'Hero' && (
          <div className="dashboard-content" style={{ padding: '24px' }}>
            <div className="products-mgmt-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
              <h2 className="products-mgmt-title">Hero Slider ({heroSlides.length} slides)</h2>
              <button 
                onClick={() => {
                  setNewHeroSlide({ title: '', subtitle: '', brand: '', brandColor: 'var(--primary)', price: '', features: '', btnText: 'Explore Now', btnLink: '/products', order: 0, active: true });
                  setHeroSelectedFile(null);
                  setHeroImagePreview(null);
                  setIsHeroAddOpen(true);
                }}
                className="add-product-btn" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}
              >
                <Plus size={20} weight="bold" /> Add Slide
              </button>
            </div>
            
            <div className="products-grid admin-products-grid">
              {heroSlides.length > 0 ? heroSlides.map(slide => (
                <div key={slide._id} className="product-card">
                  <div className="product-image-container" style={{ position: 'relative', height: '180px', background: 'var(--light-bg)', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {slide.img ? (
                        <img src={getImageUrl(slide.img)} alt={slide.title} style={{ height: '100%', objectFit: 'cover', width: '100%' }} />
                    ) : (
                        <Sparkle size={48} color="#cbd5e1" />
                    )}
                    {!slide.active && <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Inactive</div>}
                  </div>
                  <div className="product-info">
                    <div className="product-title" style={{ minHeight: '45px' }}>{slide.title || 'Untitled Slide'}</div>
                    <div className="product-price-row">
                      <div className="product-brand">{slide.brand || 'No Brand'}</div>
                      <div className="product-price">{slide.price || 'No Price'}</div>
                    </div>
                    <div className="product-stock" style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '10px' }}>Order: {slide.order}</div>
                    
                    <div className="product-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '15px' }}>
                      <button 
                          className="action-btn-custom edit-btn"
                          onClick={() => {
                              setEditHeroSlide({
                                ...slide,
                                features: slide.features ? slide.features.join(', ') : ''
                              });
                              setEditHeroImagePreview(getImageUrl(slide.img));
                              setEditHeroSelectedFile(null);
                              setIsHeroEditOpen(true);
                          }}
                      >
                          <PencilSimple size={18} /> Edit
                      </button>
                      <button 
                          className="action-btn-custom delete-btn"
                          onClick={() => setHeroDeleteConfirm(slide)}
                      >
                          <Trash size={18} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '40px', textAlign: 'center', background: 'var(--colorful-bg)', borderRadius: '12px', color: 'var(--admin-text-muted)', border: '1px dashed var(--admin-border-color)' }}>
                  <Sparkle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>No hero slides found. Add some to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marketplaces Tab */}
        {activeTab === 'Marketplaces' && (
          <div className="dashboard-content fade-in" style={{ padding: '24px' }}>
            <div className="admin-section-header" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--admin-text-dark)', margin: 0 }}>Marketplace Links</h2>
            </div>
            
            <div style={{ background: 'var(--colorful-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Update the links for your global marketplace banner. Leave a link empty to hide that specific store button from the banner.</p>
              
              <form onSubmit={saveMarketplaceLinks} style={{ maxWidth: '600px' }}>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <ShoppingCart size={18} color="#FF9900" weight="fill" /> Amazon Link
                      </label>
                      <input 
                          type="url" 
                          value={marketplaceLinks.amazon} 
                          onChange={e => setMarketplaceLinks({...marketplaceLinks, amazon: e.target.value})} 
                          className="form-control" 
                          placeholder="https://www.amazon.in/..." 
                      />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <Bag size={18} color="#2874F0" weight="fill" /> Flipkart Link
                      </label>
                      <input 
                          type="url" 
                          value={marketplaceLinks.flipkart} 
                          onChange={e => setMarketplaceLinks({...marketplaceLinks, flipkart: e.target.value})} 
                          className="form-control" 
                          placeholder="https://www.flipkart.com/..." 
                      />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '25px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <Storefront size={18} color="#00A650" weight="fill" /> IndiaMART Link
                      </label>
                      <input 
                          type="url" 
                          value={marketplaceLinks.indiamart} 
                          onChange={e => setMarketplaceLinks({...marketplaceLinks, indiamart: e.target.value})} 
                          className="form-control" 
                          placeholder="https://www.indiamart.com/..." 
                      />
                  </div>
                  
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                      Save Marketplace Links
                  </button>
              </form>
            </div>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'Blogs' && (
            <div className="dashboard-content fade-in" style={{ padding: '24px' }}>
                <div className="admin-section-header" style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--admin-text-dark)', margin: 0 }}>Manage Blogs</h2>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 400px', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editingBlogId ? 'Edit Blog' : 'Add New Blog'}</h3>
                        <form onSubmit={handleBlogSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" className="form-control" required value={blogFormData.title} onChange={e => setBlogFormData({...blogFormData, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Author</label>
                                <input type="text" className="form-control" required value={blogFormData.author} onChange={e => setBlogFormData({...blogFormData, author: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Content</label>
                                <textarea className="form-control" rows="8" required value={blogFormData.content} onChange={e => setBlogFormData({...blogFormData, content: e.target.value})} placeholder="Write your blog content here..."></textarea>
                            </div>
                            
                            <div className="form-group">
                                <label>Thumbnail Image (Main Image)</label>
                                <input type="file" className="form-control" accept="image/*" onChange={e => setBlogThumbnailFile(e.target.files[0])} />
                                {editingBlogId && <small style={{ color: 'var(--text-muted)' }}>Leave empty to keep current thumbnail</small>}
                            </div>

                            <div className="form-group">
                                <label>Extra Images (Optional)</label>
                                <input type="file" className="form-control" multiple accept="image/*" onChange={e => setBlogExtraFiles(Array.from(e.target.files))} />
                                {editingBlogId && <small style={{ color: 'var(--text-muted)' }}>Any selected here will be added to the existing extra images</small>}
                            </div>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={blogFormData.isActive} onChange={e => setBlogFormData({...blogFormData, isActive: e.target.checked})} />
                                <span style={{ fontWeight: 600 }}>Active (Visible on Website)</span>
                            </label>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-primary">
                                    {editingBlogId ? 'Update Blog' : 'Publish Blog'}
                                </button>
                                {editingBlogId && (
                                    <button type="button" className="btn btn-dark" onClick={() => { setEditingBlogId(null); setBlogFormData({ title: '', author: 'Admin', content: '', isActive: true }); setBlogThumbnailFile(null); setBlogExtraFiles([]); }}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {blogs.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No blogs found. Create one to get started!</p>
                        ) : (
                            blogs.map(blog => (
                                <div key={blog._id} style={{ display: 'flex', gap: '15px', background: 'white', padding: '15px', borderRadius: '12px', border: `1px solid ${blog.isActive ? 'var(--border-color)' : '#fecaca'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', opacity: blog.isActive ? 1 : 0.6 }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', background: 'var(--light-bg)', flexShrink: 0 }}>
                                        <img src={getImageUrl(blog.thumbnailImage) || PLACEHOLDER_SVG} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{blog.title}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}</p>
                                        <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleEditBlogClick(blog)} className="action-btn-custom edit" style={{ padding: '6px 12px', fontSize: '0.85rem' }}><PencilSimple /> Edit</button>
                                            <button onClick={() => setDeleteBlogConfirm(blog._id)} className="action-btn-custom delete" style={{ padding: '6px 12px', fontSize: '0.85rem' }}><Trash /> Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'Products' && (
          <div className="dashboard-content" style={{ padding: '24px' }}>
            <div className="products-mgmt-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
              <h2 className="products-mgmt-title">Products Management ({filteredProducts.length} items)</h2>
              
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

              <div className="filter-dropdown-wrapper" style={{ display: 'flex', alignItems: 'center', background: 'var(--colorful-bg)', padding: '0 15px', borderRadius: '8px', border: '1px solid var(--admin-border-color)', height: '100%', minWidth: '150px' }}>
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
                onClick={() => setShowAdminFilters(!showAdminFilters)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '10px 15px', 
                  border: '1px solid var(--admin-border-color)', 
                  borderRadius: '8px', 
                  background: showAdminFilters ? 'var(--admin-primary-light)' : 'white', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  color: showAdminFilters ? 'var(--admin-primary)' : 'var(--text-dark)'
                }}
              >
                <Funnel size={18} weight="bold" />
                {showAdminFilters ? 'Hide Filters' : 'Filters'}
              </button>

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

            {/* Admin Filter Panel */}
            {showAdminFilters && (
              <div style={{ 
                background: 'var(--colorful-bg)', 
                padding: '20px', 
                borderRadius: '12px', 
                border: '1px solid var(--admin-border-color)', 
                marginBottom: '25px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                boxShadow: 'var(--admin-shadow-sm)'
              }}>
                {/* Categories */}
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Categories</h4>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(meta.categories || []).map(cat => (
                      <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input 
                          type="checkbox" 
                          checked={adminFilters.category.includes(cat)} 
                          onChange={() => {
                            const updated = adminFilters.category.includes(cat)
                              ? adminFilters.category.filter(v => v !== cat)
                              : [...adminFilters.category, cat];
                            setAdminFilters({ ...adminFilters, category: updated });
                          }}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Brands</h4>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(meta.brands || []).map(brand => (
                      <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input 
                          type="checkbox" 
                          checked={adminFilters.brand.includes(brand)} 
                          onChange={() => {
                            const updated = adminFilters.brand.includes(brand)
                              ? adminFilters.brand.filter(v => v !== brand)
                              : [...adminFilters.brand, brand];
                            setAdminFilters({ ...adminFilters, brand: updated });
                          }}
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Condition</h4>
                  <select 
                    value={adminFilters.condition}
                    onChange={(e) => setAdminFilters({ ...adminFilters, condition: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option value="All">All Conditions</option>
                    <option value="New">New</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Price Range</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={adminFilters.minPrice}
                      onChange={(e) => setAdminFilters({ ...adminFilters, minPrice: e.target.value })}
                      style={{ width: '50%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={adminFilters.maxPrice}
                      onChange={(e) => setAdminFilters({ ...adminFilters, maxPrice: e.target.value })}
                      style={{ width: '50%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                  </div>
                  <button 
                    onClick={() => setAdminFilters({ brand: [], category: [], condition: 'All', minPrice: '', maxPrice: '' })}
                    style={{ marginTop: '15px', width: '100%', padding: '8px', border: 'none', borderRadius: '6px', background: 'var(--border-color)', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
            {adminProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>Loading products...</div>
            ) : (
                <div className="products-grid admin-products-grid">
                    {filteredProducts.map(product => (
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

                                        const initialDescPreviews = [null, null, null, null];
                                        if (product.descriptionImages) {
                                            product.descriptionImages.slice(0, 4).forEach((img, i) => {
                                                initialDescPreviews[i] = img;
                                            });
                                        }
                                        setEditDescImagePreviews(initialDescPreviews);
                                        setEditDescSelectedFiles([null, null, null, null]);

                                        setIsEditModalOpen(true);
                                    }}
                                    style={{ background: 'var(--colorful-bg)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', color: 'var(--primary)', transition: 'all 0.2s' }}
                                    onMouseOver={e => { e.currentTarget.style.background = 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
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
                             <div className="product-img-wrapper" style={{ position: 'relative', height: '180px', background: 'var(--light-bg)', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                                 <img 
                                     src={getImageUrl(product.image)} 
                                     alt={product.name || product.title} 
                                     className="product-img" 
                                     style={{ height: '100%', width: '100%', objectFit: 'contain', padding: '10px' }} 
                                     onError={(e) => (e.target.src = PLACEHOLDER_SVG)}
                                 />
                             </div>
                            <div className="product-info">
                                <div className="product-cat">{(product.category || 'Category')} {product.brand && `| ${product.brand}`}</div>
                                <div className="product-title" style={{ minHeight: '45px' }}>{product.name || product.title || "Unnamed Product"}</div>
                                <div className="stars">
                                    {typeof product.rating === 'number' ? 
                                        ('★'.repeat(Math.max(0, Math.min(5, Math.floor(product.rating)))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(0, Math.floor(product.rating))))) + ` (${product.rating.toFixed(1)})`) : 
                                        (product.stars || '★★★★★ (5.0)')
                                    }
                                </div>
                                <div className="product-price">
                                    ₹{Number(parsePriceLocal(product.price || 0)).toLocaleString('en-IN')}
                                    {product.mrp && <span className="old-price" style={{ textDecoration: 'line-through', fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>₹{Number(parsePriceLocal(product.mrp)).toLocaleString('en-IN')}</span>}
                                    {!product.inStock || (product.stockQuantity == null || product.stockQuantity <= 0) ? (
                                        <span className="out-of-stock-label" style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>Out Of Stock</span>
                                    ) : (
                                        <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, marginLeft: '8px' }}>Stock: {product.stockQuantity}</span>
                                    )}
                                </div>
                                {/* Admin specific action area */}
                                <div className="admin-product-actions" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--admin-border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button 
                                      className="btn btn-sm" 
                                      style={{ 
                                          background: product.featured ? 'var(--warning)' : 'var(--primary)', 
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
                                          background: product.newArrival ? 'var(--success)' : 'var(--primary)', 
                                          color: 'white',
                                          fontSize: '0.8rem', padding: '8px 12px',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                          width: '100%', borderRadius: '6px', border: 'none', cursor: 'pointer'
                                      }}
                                      onClick={async (e) => {
                                          e.stopPropagation();
                                          const newArrivalStatus = !product.newArrival;
                                          setAdminProducts(prev => prev.map(p => p._id === product._id ? { ...p, newArrival: newArrivalStatus } : p));
                                          try {
                                              await fetch(`${BASE_URL}/api/products/${product._id}`, {
                                                  method: 'PUT',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({ newArrival: newArrivalStatus })
                                              });
                                              showToast(newArrivalStatus ? 'Added to New Arrivals' : 'Removed from New Arrivals');
                                          } catch(e) {
                                              showToast('Failed to update new arrival', 'error');
                                          }
                                      }}
                                    >
                                      {product.newArrival ? '✨ New Arrival' : '🆕 Mark New'}
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
                {[
                  'All Orders', 'Pending', 'Order Confirmed', 'Processing', 
                  'Packed / Ready for Dispatch', 'Shipped / Dispatched', 
                  'In Transit', 'Out for Delivery', 'Delivered', 
                  'Attempted Delivery', 'Delayed', 'Completed'
                ].map(status => (
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
            
            <div style={{ background: 'var(--colorful-bg)', borderRadius: '12px', border: '1px solid var(--admin-border-color)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                  <thead style={{ background: 'var(--light-bg)', borderBottom: '1px solid var(--admin-border-color)' }}>
                    <tr>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Order ID</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Customer</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Phone</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Product</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Qty</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Price</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
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
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fefce8'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px', fontWeight: 500, color: 'var(--primary)' }}>{order.orderId}</td>
                        <td style={{ padding: '16px', color: '#334155', fontWeight: 500 }}>{order.customerName}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.phone}</td>
                        <td style={{ padding: '16px', color: '#334155', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.productName}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{order.quantity}</td>
                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-dark)' }}>{order.totalPrice ? `₹${order.totalPrice.toLocaleString('en-IN')}` : '₹0'}</td>
                        <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : ''}</td>
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
                            <option value="Pending" style={{ background: 'var(--colorful-bg)', color: '#d97706' }}>Pending</option>
                            <option value="Order Confirmed" style={{ background: 'var(--colorful-bg)', color: 'var(--primary)' }}>Order Confirmed</option>
                            <option value="Processing" style={{ background: 'var(--colorful-bg)', color: '#0ea5e9' }}>Processing</option>
                            <option value="Packed / Ready for Dispatch" style={{ background: 'var(--colorful-bg)', color: '#a16207' }}>Packed / Ready for Dispatch</option>
                            <option value="Shipped / Dispatched" style={{ background: 'var(--colorful-bg)', color: '#a21caf' }}>Shipped / Dispatched</option>
                            <option value="In Transit" style={{ background: 'var(--colorful-bg)', color: '#4338ca' }}>In Transit</option>
                            <option value="Out for Delivery" style={{ background: 'var(--colorful-bg)', color: '#0369a1' }}>Out for Delivery</option>
                            <option value="Delivered" style={{ background: 'var(--colorful-bg)', color: '#16a34a' }}>Delivered</option>
                            <option value="Attempted Delivery" style={{ background: 'var(--colorful-bg)', color: '#dc2626' }}>Attempted Delivery</option>
                            <option value="Delayed" style={{ background: 'var(--colorful-bg)', color: '#c2410c' }}>Delayed</option>
                            <option value="Completed" style={{ background: 'var(--colorful-bg)', color: 'var(--text-dark)' }}>Completed</option>
                          </select>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button 
                            onClick={() => setSelectedOrderDetails(order)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'var(--border-color)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
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
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--colorful-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '8px', padding: '6px 12px', minWidth: '220px' }}>
                   <MagnifyingGlass size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                   <input 
                     type="text" 
                     placeholder="Search by name or email..." 
                     value={userSearchQuery}
                     onChange={(e) => setUserSearchQuery(e.target.value)}
                     style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', width: '100%' }}
                   />
                </div>
                
                <div style={{ display: 'flex', gap: '4px', background: 'var(--colorful-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--admin-border-color)', overflowX: 'auto' }}>
                  {['All Users', 'Active', 'Blocked'].map(status => (
                    <button 
                      key={status}
                      onClick={() => setUserFilter(status)}
                      style={{ 
                        padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', fontSize: '0.85rem', whiteSpace: 'nowrap',
                        background: userFilter === status ? 'var(--primary)' : 'transparent',
                        color: userFilter === status ? 'white' : 'var(--admin-text-main)'
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--colorful-bg)', borderRadius: '12px', border: '1px solid var(--admin-border-color)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                  <thead style={{ background: 'var(--light-bg)', borderBottom: '1px solid var(--admin-border-color)' }}>
                    <tr>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>User ID</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Name</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Email</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Phone</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Orders</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Joined</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                        const filteredUsers = (users || [])
                          .filter(u => userFilter === 'All Users' ? true : u.status === userFilter)
                          .filter(u => {
                              const search = userSearchQuery.toLowerCase();
                              const firstName = (u.firstName || '').toLowerCase();
                              const lastName = (u.lastName || '').toLowerCase();
                              const email = (u.email || '').toLowerCase();
                              return firstName.includes(search) || lastName.includes(search) || email.includes(search);
                          });
                          
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
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--light-bg)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                  <td style={{ padding: '16px', fontWeight: 500, color: 'var(--primary)' }}>{user.id}</td>
                                  <td style={{ padding: '16px', color: '#334155', fontWeight: 600 }}>{user.name}</td>
                                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>{user.email}</td>
                                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.phone}</td>
                                  <td style={{ padding: '16px', color: '#334155', fontWeight: 500 }}>{user.totalOrders}</td>
                                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.joinedDate}</td>
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
                                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                      onMouseOver={e => { e.currentTarget.style.background = 'var(--border-color)'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
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

        
        {activeTab === 'Partners' && (
          <div className="dashboard-content fade-in" style={{ padding: '24px' }}>
            <div className="admin-section-header" style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--admin-text-dark)', margin: 0 }}>Partner Products & Posters</h2>
            </div>
            
            <div style={{ background: 'var(--colorful-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Partner Posters (Left & Right)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Left Poster */}
                  <div style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>Left Poster</h4>
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label>Image Upload</label>
                          <input type="file" accept="image/*" onChange={e => setPartnerPosterFiles({...partnerPosterFiles, left: e.target.files[0]})} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label>Target Link</label>
                          <input type="text" value={partnerPosters.left.link} onChange={e => setPartnerPosters({...partnerPosters, left: {...partnerPosters.left, link: e.target.value}})} className="form-control" placeholder="https://..." />
                      </div>
                      {(partnerPosters.left.imageUrl || partnerPosterFiles.left) && (
                          <div style={{ marginBottom: '10px' }}>
                              <img src={partnerPosterFiles.left ? URL.createObjectURL(partnerPosterFiles.left) : getImageUrl(partnerPosters.left.imageUrl)} alt="Left Poster Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', background: '#f8fafc', borderRadius: '4px' }} />
                          </div>
                      )}
                      <button onClick={() => savePartnerPoster('left')} className="btn btn-primary" style={{ width: '100%' }}>Save Left Poster</button>
                  </div>

                  {/* Right Poster */}
                  <div style={{ padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>Right Poster</h4>
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label>Image Upload</label>
                          <input type="file" accept="image/*" onChange={e => setPartnerPosterFiles({...partnerPosterFiles, right: e.target.files[0]})} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label>Target Link</label>
                          <input type="text" value={partnerPosters.right.link} onChange={e => setPartnerPosters({...partnerPosters, right: {...partnerPosters.right, link: e.target.value}})} className="form-control" placeholder="https://..." />
                      </div>
                      {(partnerPosters.right.imageUrl || partnerPosterFiles.right) && (
                          <div style={{ marginBottom: '10px' }}>
                              <img src={partnerPosterFiles.right ? URL.createObjectURL(partnerPosterFiles.right) : getImageUrl(partnerPosters.right.imageUrl)} alt="Right Poster Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', background: '#f8fafc', borderRadius: '4px' }} />
                          </div>
                      )}
                      <button onClick={() => savePartnerPoster('right')} className="btn btn-primary" style={{ width: '100%' }}>Save Right Poster</button>
                  </div>

              </div>
            </div>

            

          </div>
        )}

        {activeTab === 'Marketing' && (
          <div className="dashboard-content" style={{ padding: '24px' }}>
            <div className="admin-section-header" style={{ marginBottom: '30px', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--border-color)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '10px' }}>MARKETING v1.2</div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', margin: 0, fontWeight: 800 }}>Marketing Center</h2>
            </div>


            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <button 
                    onClick={() => setMarketingTab('popup')}
                    style={{ 
                        padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                        background: marketingTab === 'popup' ? 'var(--primary)' : 'white',
                        color: marketingTab === 'popup' ? 'white' : 'var(--text-muted)',
                        border: marketingTab === 'popup' ? 'none' : '1px solid var(--border-color)',
                        boxShadow: marketingTab === 'popup' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
                    }}
                >
                    Popups & Banners
                </button>
                <button 
                    onClick={() => setMarketingTab('coupons')}
                    style={{ 
                        padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                        background: marketingTab === 'coupons' ? 'var(--primary)' : 'white',
                        color: marketingTab === 'coupons' ? 'white' : 'var(--text-muted)',
                        border: marketingTab === 'coupons' ? 'none' : '1px solid var(--border-color)',
                        boxShadow: marketingTab === 'coupons' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
                    }}
                >
                    Coupons & Offers
                </button>
            </div>

            {marketingTab === 'popup' ? (
                <>
                    {/* Simplified Status Toggle */}
                    <div style={{ 
                        maxWidth: '900px', margin: '0 auto 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                        background: popupConfig.isActive ? '#f0fdf4' : '#fff1f2', padding: '1.2rem 1.5rem', borderRadius: '20px', 
                        border: `1px solid ${popupConfig.isActive ? '#bbf7d0' : '#fecaca'}`,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                        flexWrap: 'wrap', gap: '15px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ 
                                width: '45px', height: '45px', borderRadius: '12px', background: popupConfig.isActive ? '#16a34a' : '#ef4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>
                                {popupConfig.isActive ? <Bell size={24} weight="fill" /> : <Bell size={24} weight="light" />}
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: popupConfig.isActive ? '#15803d' : '#991b1b' }}>
                                    {popupConfig.isActive ? 'POPUP IS ACTIVE' : 'POPUP IS INACTIVE'}
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: popupConfig.isActive ? '#16a34a' : '#ef4444', fontWeight: 500 }}>
                                    {popupConfig.isActive ? 'Currently visible to all website visitors.' : 'Hidden from website visitors.'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={async () => {
                                const newStatus = !popupConfig.isActive;
                                setIsSubmitting(true);
                                try {
                                    // Use JSON for simple status toggle
                                    const res = await fetch(`${BASE_URL}/api/popup/status`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ isActive: newStatus })
                                    });
                                    if (res.ok) {
                                        const updated = await res.json();
                                        setPopupConfig(prev => ({ ...prev, isActive: updated.isActive }));
                                        showToast(`Popup ${updated.isActive ? 'activated' : 'deactivated'} successfully`);
                                    } else {
                                        showToast('Failed to update status', 'error');
                                    }
                                } catch (e) {
                                    showToast('Network error', 'error');
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            disabled={isSubmitting || (!popupConfig.useTemplate && !popupConfig.image)}
                            style={{ 
                                padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
                                background: popupConfig.isActive ? '#ef4444' : '#16a34a', color: 'white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s',
                                opacity: isSubmitting || (!popupConfig.useTemplate && !popupConfig.image) ? 0.6 : 1
                            }}
                        >
                            {isSubmitting ? '...' : (popupConfig.isActive ? 'DEACTIVATE NOW' : 'ACTIVATE NOW')}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => setPopupConfig({ ...popupConfig, useTemplate: false })}
                            style={{ 
                                padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                                background: !popupConfig.useTemplate ? 'var(--primary)' : 'white',
                                color: !popupConfig.useTemplate ? 'white' : 'var(--text-muted)',
                                border: !popupConfig.useTemplate ? 'none' : '1px solid var(--border-color)',
                                boxShadow: !popupConfig.useTemplate ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
                            }}
                        >
                            Upload Poster
                        </button>
                        <button 
                            onClick={() => setPopupConfig({ ...popupConfig, useTemplate: true })}
                            style={{ 
                                padding: '12px 24px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                                background: popupConfig.useTemplate ? 'var(--primary)' : 'white',
                                color: popupConfig.useTemplate ? 'white' : 'var(--text-muted)',
                                border: popupConfig.useTemplate ? 'none' : '1px solid var(--border-color)',
                                boxShadow: popupConfig.useTemplate ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
                            }}
                        >
                            Create from Template
                        </button>
                    </div>

                    <div className={`marketing-template-grid ${popupConfig.useTemplate ? 'two-cols' : ''}`}>
                        {/* --- Input / Selection Side --- */}
                        <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--admin-border-color)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                            {!popupConfig.useTemplate ? (
                                <>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Custom Upload</h3>
                                    <div 
                                        style={{ 
                                            width: '100%', aspectRatio: '1', background: 'var(--light-bg)', borderRadius: '20px', border: '3px dashed #cbd5e1', 
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden', position: 'relative', cursor: 'pointer'
                                        }}
                                        onClick={() => document.getElementById('popup-image-upload').click()}
                                    >
                                        {popupImagePreview ? (
                                            <img src={popupImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <>
                                                <UploadSimple size={48} color="var(--primary)" weight="duotone" />
                                                <p style={{ fontSize: '1rem', color: 'var(--text-dark)', fontWeight: 700, marginTop: '10px' }}>Select Image</p>
                                            </>
                                        )}
                                        <input id="popup-image-upload" type="file" hidden accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setPopupSelectedFile(file);
                                                setPopupImagePreview(URL.createObjectURL(file));
                                                setPopupConfig(prev => ({ ...prev, isActive: true }));
                                            }
                                        }} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>Choose Template</h3>
                                    <div style={{ display: 'grid', gap: '10px', marginBottom: '25px' }}>
                                        {[
                                            { id: 'sale', name: 'Flash Sale', color: '#ef4444' },
                                            { id: 'arrival', name: 'New Arrival', color: 'var(--text-dark)' },
                                            { id: 'clearance', name: 'Clearance', color: 'var(--warning)' }
                                        ].map(t => (
                                            <div 
                                                key={t.id}
                                                onClick={() => setPopupConfig({ ...popupConfig, templateType: t.id, templateData: { ...popupConfig.templateData, color: t.color }, isActive: true })}
                                                style={{ 
                                                    padding: '12px 16px', borderRadius: '12px', border: `2px solid ${popupConfig.templateType === t.id ? 'var(--primary)' : 'var(--border-color)'}`,
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: popupConfig.templateType === t.id ? 'var(--border-color)' : 'white'
                                                }}
                                            >
                                                <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: t.color }}></div>
                                                <span style={{ fontWeight: 600 }}>{t.name}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '15px' }}>Edit Content</h3>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Main Title</label>
                                                <input 
                                                    type="text" 
                                                    value={popupConfig.templateData?.title || ''}
                                                    onChange={(e) => setPopupConfig({ ...popupConfig, templateData: { ...(popupConfig.templateData || {}), title: e.target.value.toUpperCase() }})}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                />
                                            </div>
                                            <select 
                                                value={popupConfig.templateData?.titleColor || '#ffffff'}
                                                onChange={(e) => setPopupConfig({ ...popupConfig, templateData: { ...(popupConfig.templateData || {}), titleColor: e.target.value }})}
                                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                            >
                                                {colorOptions.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Subtitle</label>
                                                <input 
                                                    type="text" 
                                                    value={popupConfig.templateData?.subtitle || ''}
                                                    onChange={(e) => setPopupConfig({ ...popupConfig, templateData: { ...(popupConfig.templateData || {}), subtitle: e.target.value }})}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                />
                                            </div>
                                            <select 
                                                value={popupConfig.templateData?.subtitleColor || '#ffffff'}
                                                onChange={(e) => setPopupConfig({ ...popupConfig, templateData: { ...(popupConfig.templateData || {}), subtitleColor: e.target.value }})}
                                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                                            >
                                                {colorOptions.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Event Dates / Info</label>
                                                <input 
                                                    type="text" 
                                                    value={popupConfig.templateData?.code || ''}
                                                    onChange={(e) => setPopupConfig({ ...popupConfig, templateData: { ...(popupConfig.templateData || {}), code: e.target.value.toUpperCase() }})}
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                                    placeholder="e.g. FROM 15-30 APRIL"
                                                />
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Text / Bg</label>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <select 
                                                        value={popupConfig.templateData?.codeColor || '#ffffff'}
                                                        onChange={(e) => setPopupConfig({ ...popupConfig, templateData: { ...(popupConfig.templateData || {}), codeColor: e.target.value }})}
                                                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        {colorOptions.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                                    </select>
                                                    <select 
                                                        value={popupConfig.templateData?.codeBgColor || 'var(--secondary)'}
                                                        onChange={(e) => setPopupConfig({ ...popupConfig, templateData: { ...(popupConfig.templateData || {}), codeBgColor: e.target.value }})}
                                                        style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        <option value="transparent">No Bg</option>
                                                        {colorOptions.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>Background Image (Optional)</label>
                                            <div 
                                                style={{ 
                                                    width: '100%', height: '80px', borderRadius: '12px', border: '2px dashed #cbd5e1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
                                                    background: templateImagePreview ? 'none' : 'var(--light-bg)'
                                                }}
                                                onClick={() => document.getElementById('template-image-upload').click()}
                                            >
                                                {templateImagePreview ? (
                                                    <img src={templateImagePreview} alt="Bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                                        <UploadSimple size={20} />
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to upload background</span>
                                                    </div>
                                                )}
                                                <input 
                                                    id="template-image-upload" type="file" hidden accept="image/*" 
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setTemplateSelectedFile(file);
                                                            setTemplateImagePreview(URL.createObjectURL(file));
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {templateImagePreview && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setTemplateSelectedFile(null);
                                                        setTemplateImagePreview(null);
                                                    }}
                                                    style={{ marginTop: '8px', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    Remove Background
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div style={{ marginTop: '2.5rem' }}>
                                <button 
                                    onClick={handleSavePopup}
                                    disabled={isSubmitting || (!popupConfig.useTemplate && !popupSelectedFile && !popupConfig.image)}
                                    className="btn btn-primary" 
                                    style={{ 
                                        width: '100%', padding: '18px', borderRadius: '15px', fontWeight: 800, fontSize: '1rem',
                                        background: 'var(--primary)', border: 'none', color: 'white', cursor: 'pointer',
                                        boxShadow: '0 10px 15px -3px rgba(37,99,235,0.4)', transition: 'all 0.2s'
                                    }}
                                >
                                    {isSubmitting ? 'Saving Changes...' : 'SAVE POPUP SETTINGS'}
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px', fontWeight: 500 }}>
                                    Your changes will take effect immediately after saving.
                                </p>
                            </div>
                        </div>

                        {/* --- Preview Side (Always shown if template) --- */}
                        {popupConfig.useTemplate && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Live Preview</h3>
                                <div style={{ 
                                    background: templateImagePreview ? 'transparent' : (popupConfig.templateData?.color || '#ef4444'), 
                                    backgroundImage: templateImagePreview ? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${templateImagePreview})` : 'none',
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                    color: 'white', padding: '3rem 2rem', borderRadius: '24px', textAlign: 'center',
                                    width: '100%', minHeight: '550px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', position: 'relative'
                                }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '4px', marginBottom: '15px', opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.3)', color: popupConfig.templateData?.subtitleColor || 'white' }}>{popupConfig.templateType === 'sale' ? 'FLASH SALE' : popupConfig.templateType === 'arrival' ? 'NEW IN' : 'CLEARANCE'}</div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.3)', color: popupConfig.templateData?.titleColor || 'white' }}>{popupConfig.templateData?.title || 'TITLE'}</h2>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '30px', opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.3)', color: popupConfig.templateData?.subtitleColor || 'white' }}>{popupConfig.templateData?.subtitle || 'Subtitle'}</p>
                                    {popupConfig.templateData?.code && (
                                        <div style={{ 
                                            padding: '8px 25px', 
                                            borderRadius: '4px', 
                                            fontSize: '1rem', 
                                            fontWeight: 800, 
                                            background: popupConfig.templateData?.codeBgColor || 'var(--secondary)', 
                                            color: popupConfig.templateData?.codeColor || 'white',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            letterSpacing: '1px'
                                        }}>
                                            {popupConfig.templateData?.code}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
                            Active Coupons ({coupons.filter(c => c.isActive && new Date(c.expiryDate) >= new Date()).length})
                        </h3>
                        <button 
                            onClick={() => setIsCouponModalOpen(true)}
                            className="add-product-btn-admin"
                        >
                            <Plus size={20} weight="bold" /> Create New Coupon
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {coupons.map(coupon => (
                            <div key={coupon._id} style={{ background: 'var(--colorful-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div style={{ background: 'var(--border-color)', padding: '6px 12px', borderRadius: '6px', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '1px' }}>{coupon.code}</div>
                                    <button 
                                        onClick={() => handleDeleteCoupon(coupon)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <Trash size={20} weight="fill" />
                                    </button>
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>
                                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '15px', fontWeight: 500 }}>{coupon.description}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <div>Min Order: ₹{coupon.minOrderValue}</div>
                                    <div>Min Items: {coupon.minItems || 1}</div>
                                    <div>Usage: {coupon.usageLimit ? `${coupon.usedCount}/${coupon.usageLimit}` : 'Unlimited'}</div>
                                    <div>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</div>
                                </div>
                                <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dotted var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        {(() => {
                                            const isExpired = new Date(coupon.expiryDate) < new Date();
                                            const isActive = coupon.isActive && !isExpired;
                                            return (
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isActive ? 'var(--success)' : '#ef4444' }}>
                                                    {isActive ? '● Active' : isExpired ? '○ Expired' : '○ Inactive'}
                                                </span>
                                            );
                                        })()}
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: coupon.isPublic !== false ? 'var(--primary)' : 'var(--text-muted)', background: coupon.isPublic !== false ? 'var(--border-color)' : 'var(--border-color)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                            {coupon.isPublic !== false ? 'Public' : 'Private'}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Used: {coupon.usedCount} times</span>
                                </div>
                            </div>
                        ))}
                        {coupons.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--colorful-bg)', borderRadius: '16px', border: '1px dashed #cbd5e1', color: 'var(--text-muted)' }}>
                                No active coupons. Create one to start an offer.
                            </div>
                        )}
                    </div>
                </div>
            )}
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
                            <tr key={query._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{new Date(query.createdAt).toLocaleDateString('en-GB')}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{query.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{query.email}</div>
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
                                        style={{ background: 'var(--border-color)', color: 'var(--primary)', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, marginRight: '8px' }}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {supportQueries.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No support tickets found</td></tr>
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
              <div style={{ background: 'var(--colorful-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--admin-border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)' }}>Admin Profile</h3>
                  {!isAdminEditMode && (
                    <button 
                      onClick={() => { setAdminEditForm({ name: adminProfile.name || '', phone: adminProfile.phone || '' }); setIsAdminEditMode(true); }}
                      style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--primary)'}
                      onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
                    >
                      <PencilSimple size={16} /> Edit Profile
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Name</label>
                    {isAdminEditMode ? (
                      <input 
                        type="text" 
                        value={adminEditForm.name} 
                        onChange={e => setAdminEditForm({...adminEditForm, name: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <div style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 500 }}>{adminProfile.name || 'Admin User'}</div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Email (Non-editable)</label>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 500 }}>{adminProfile.email}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Phone</label>
                    {isAdminEditMode ? (
                      <input 
                        type="text" 
                        value={adminEditForm.phone} 
                        onChange={e => setAdminEditForm({...adminEditForm, phone: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <div style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 500 }}>{adminProfile.phone || 'Not provided'}</div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Role</label>
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 600 }}>{adminProfile.role}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Joined Date</label>
                      <div style={{ fontSize: '1rem', color: '#334155' }}>
                        {adminProfile.createdAt ? new Date(adminProfile.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {isAdminEditMode && (
                  <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <button 
                      onClick={() => setIsAdminEditMode(false)}
                      style={{ padding: '8px 16px', background: 'var(--colorful-bg)', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#334155', transition: 'all 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--light-bg)'}
                      onMouseOut={e => e.currentTarget.style.background = 'white'}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveAdminProfile}
                      style={{ padding: '8px 16px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = '#059669'}
                      onMouseOut={e => e.currentTarget.style.background = 'var(--success)'}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'var(--colorful-bg)', padding: '40px', borderRadius: '12px', border: '1px solid var(--admin-border-color)', textAlign: 'center' }}>
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
          <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
             <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Add New Product</h2>
             
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
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Status</label>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '45px' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="checkbox" checked={newProduct.featured} onChange={e => setNewProduct({...newProduct, featured: e.target.checked})} style={{ width: '18px', height: '18px' }} /> Featured
                           </label>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="checkbox" checked={newProduct.newArrival} onChange={e => setNewProduct({...newProduct, newArrival: e.target.checked})} style={{ width: '18px', height: '18px' }} /> New Arrival
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

                <div style={{ marginTop: '0.5rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Description Images (Optional for Content)</label>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                       {descImagePreviews.map((src, i) => (
                           <div key={i}>
                               <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', cursor: 'pointer', background: 'var(--light-bg)', height: '100px', position: 'relative', transition: 'all 0.2s' }}>
                                   {src ? (
                                       <>
                                           <img src={getImageUrl(src)} alt={`Desc ${i+1}`} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                           <button 
                                               type="button"
                                               onClick={(e) => { e.stopPropagation(); handleRemoveDescImage(i, false); }} 
                                               style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--colorful-bg)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                               <X size={12} weight="bold" />
                                           </button>
                                       </>
                                   ) : (
                                       <>
                                          <UploadSimple size={20} color="var(--text-muted)" />
                                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Image {i+1}</span>
                                       </>
                                   )}
                                   <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDescImageUpload(e, i, false)} />
                               </label>
                           </div>
                       ))}
                   </div>
                </div>

                <div>
                   <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Specifications
                      <button type="button" onClick={() => handleAddSpec(false)} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}>+ Add More</button>
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
                   <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', background: 'var(--light-bg)', transition: 'all 0.2s' }}>
                       {imagePreview ? (
                           <img src={imagePreview} alt="Preview" style={{ height: '120px', objectFit: 'contain' }} />
                       ) : (
                           <>
                              <UploadSimple size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Main Image</span>
                           </>
                       )}
                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                   </label>
                </div>

                <div style={{ marginTop: '1rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Product Gallery (Additional Images)</label>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                       {additionalImagePreviews.map((src, i) => (
                           <div key={i}>
                               <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', cursor: 'pointer', background: 'var(--light-bg)', height: '100px', position: 'relative', transition: 'all 0.2s' }}>
                                   {src ? (
                                       <>
                                           <img src={getImageUrl(src)} alt={`Gallery ${i+1}`} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                           <button 
                                               type="button"
                                               onClick={(e) => { e.stopPropagation(); handleRemoveSlotImage(i, false); }} 
                                               style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--colorful-bg)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                               <X size={12} weight="bold" />
                                           </button>
                                       </>
                                   ) : (
                                       <>
                                          <UploadSimple size={20} color="var(--text-muted)" />
                                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Image {i+1}</span>
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
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
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
                                formData.append('newArrival', newProduct.newArrival || false);
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
                                descSelectedFiles.forEach(file => {
                                    if (file) formData.append('descriptionImages', file);
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
                                    setNewProduct({ name: '', category: 'FDM', price: '', mrp: '', inStock: true, stockQuantity: 0, image: '', rating: 5.0, featured: false, newArrival: false, tags: 'None', badgeStyle: null, description: '', brand: 'Anycubic', otherCategory: '', condition: 'New', specifications: [{ key: '', value: '' }] });
                                    setImagePreview(null);
                                    setSelectedFile(null);
                                    setAdditionalSelectedFiles([null, null, null, null, null]);
                                    setAdditionalImagePreviews([null, null, null, null, null]);
                                    setDescSelectedFiles([null, null, null, null]);
                                    setDescImagePreviews([null, null, null, null]);
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
                            background: isSubmitting ? 'var(--text-muted)' : 'var(--primary)', 
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
          <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
             <button onClick={() => setIsEditModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Edit Product Attributes</h2>
             
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
                      <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600, color: '#334155' }}>Status & Badge</label>
                       <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '10px' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="checkbox" checked={editProductState.featured} onChange={e => setEditProductState({...editProductState, featured: e.target.checked})} style={{ width: '18px', height: '18px' }} /> Featured
                           </label>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="checkbox" checked={editProductState.newArrival} onChange={e => setEditProductState({...editProductState, newArrival: e.target.checked})} style={{ width: '18px', height: '18px' }} /> New Arrival
                           </label>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '35px' }}>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="radio" name="editbadge" checked={editProductState.tags === 'Sale'} onChange={() => setEditProductState({...editProductState, tags: 'Sale', badgeStyle: { background: '#ef4444', color: 'white' }})} /> Sale
                           </label>
                           <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#334155' }}>
                               <input type="radio" name="editbadge" checked={editProductState.tags === 'Best Seller'} onChange={() => setEditProductState({...editProductState, tags: 'Best Seller', badgeStyle: { background: 'var(--success)', color: 'white' }})} /> Best
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

                <div style={{ marginTop: '0.5rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Description Images (Optional for Content)</label>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                       {editDescImagePreviews.map((src, i) => (
                           <div key={i}>
                               <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', cursor: 'pointer', background: 'var(--light-bg)', height: '100px', position: 'relative', transition: 'all 0.2s' }}>
                                   {src ? (
                                       <>
                                           <img src={getImageUrl(src)} alt={`Desc ${i+1}`} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                           <button 
                                               type="button"
                                               onClick={(e) => { e.stopPropagation(); handleRemoveDescImage(i, true); }} 
                                               style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--colorful-bg)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                               <X size={12} weight="bold" />
                                           </button>
                                       </>
                                   ) : (
                                       <>
                                          <UploadSimple size={20} color="var(--text-muted)" />
                                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Image {i+1}</span>
                                       </>
                                   )}
                                   <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleDescImageUpload(e, i, true)} />
                               </label>
                           </div>
                       ))}
                   </div>
                </div>

                <div>
                   <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: 600, color: '#334155' }}>
                      Specifications
                      <button type="button" onClick={() => handleAddSpec(true)} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '12px', cursor: 'pointer' }}>+ Add More</button>
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
                   <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', background: 'var(--light-bg)', transition: 'all 0.2s' }}>
                       {editImagePreview ? (
                           <img src={editImagePreview} alt="Preview" style={{ height: '120px', objectFit: 'contain' }} />
                       ) : (
                           <>
                              <UploadSimple size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                              <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Main Image</span>
                           </>
                       )}
                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleEditImageUpload} />
                   </label>
                </div>

                <div style={{ marginTop: '1rem' }}>
                   <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: '#334155', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Product Gallery (Additional Images)</label>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                       {editAdditionalImagePreviews.map((src, i) => (
                           <div key={i}>
                               <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', cursor: 'pointer', background: 'var(--light-bg)', height: '100px', position: 'relative', transition: 'all 0.2s' }}>
                                   {src ? (
                                       <>
                                           <img src={getImageUrl(src)} alt={`Gallery ${i+1}`} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
                                           <button 
                                               type="button"
                                               onClick={(e) => { e.stopPropagation(); handleRemoveSlotImage(i, true); }} 
                                               style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--colorful-bg)', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid #fee2e2', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                               <X size={12} weight="bold" />
                                           </button>
                                       </>
                                   ) : (
                                       <>
                                          <UploadSimple size={20} color="var(--text-muted)" />
                                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Image {i+1}</span>
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
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
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
                                formData.append('newArrival', editProductState.newArrival || false);
                                if (editProductState.badgeStyle) formData.append('badgeStyle', JSON.stringify(editProductState.badgeStyle));
                                formData.append('condition', editProductState.condition || 'New');
                                formData.append('description', editProductState.description || '');
                                formData.append('specifications', JSON.stringify((editProductState.specifications || []).filter(s => s.key && s.value)));
                                if (editSelectedFile) formData.append('image', editSelectedFile);
                                
                                // Existing images to keep (not blob URLs)
                                const existingToKeep = editAdditionalImagePreviews.filter(src => src && !src.startsWith('blob:'));
                                formData.append('existingImages', JSON.stringify(existingToKeep));

                                const existingDescToKeep = editDescImagePreviews.filter(src => src && !src.startsWith('blob:'));
                                formData.append('existingDescImages', JSON.stringify(existingDescToKeep));

                                editAdditionalSelectedFiles.forEach(file => {
                                    if (file) formData.append('images', file);
                                });

                                editDescSelectedFiles.forEach(file => {
                                    if (file) formData.append('descriptionImages', file);
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
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: 'none', background: 'var(--success)', color: 'white', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#059669'}
                        onMouseOut={e => e.currentTarget.style.background = 'var(--success)'}>
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
          <div style={{ background: 'var(--colorful-bg)', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-dark)', fontSize: '18px' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '15px' }}>Are you sure you want to permanently delete <strong>{deleteConfirmState.name || deleteConfirmState.title || "this item"}</strong>?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setDeleteConfirmState(null)} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
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

      {deleteCouponConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--colorful-bg)', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-dark)', fontSize: '18px' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '15px' }}>Are you sure you want to permanently delete coupon <strong>{deleteCouponConfirm.code}</strong>?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setDeleteCouponConfirm(null)} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteCoupon} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOrderDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
             <button onClick={() => setSelectedOrderDetails(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--border-color)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--border-color)'} onMouseOut={e => e.currentTarget.style.background = 'var(--border-color)'}><X size={20} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>Order Detail</h2>
             
             <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
               <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 800 }}>#{selectedOrderDetails.orderId}</strong>
               </div>
               <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Status</span>
                  <select 
                    value={selectedOrderDetails.status} 
                    onChange={(e) => setStatusConfirmState({ orderId: selectedOrderDetails.orderId, newStatus: e.target.value })}
                    style={{ padding: '6px 16px', borderRadius: '20px', outline: 'none', fontWeight: 700, cursor: 'pointer', ...getOrderBadgeStyle(selectedOrderDetails.status), transition: 'all 0.3s ease', appearance: 'none', textAlign: 'center', border: '1px solid transparent' }}
                  >
                     {[
                        'Pending', 'Order Confirmed', 'Processing', 'Packed / Ready for Dispatch', 
                        'Shipped / Dispatched', 'In Transit', 'Out for Delivery', 'Delivered', 
                        'Attempted Delivery', 'Delayed', 'Completed'
                     ].map(opt => (
                        <option key={opt} value={opt} style={{ background: 'var(--colorful-bg)', color: '#334155' }}>{opt}</option>
                     ))}
                  </select>
               </div>
             </div>

             {/* Customer & Shipping Info */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--light-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                   <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> Customer</h3>
                   <div style={{ color: 'var(--text-dark)', fontWeight: 700, marginBottom: '4px' }}>
                      {selectedOrderDetails.firstName ? `${selectedOrderDetails.firstName} ${selectedOrderDetails.lastName || ''}` : (selectedOrderDetails.customerName || 'N/A')}
                   </div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2px' }}>{selectedOrderDetails.email || selectedOrderDetails.customerEmail}</div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedOrderDetails.phone}</div>
                </div>
                <div style={{ background: 'var(--light-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                   <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><House size={16} /> Shipping</h3>
                   <div style={{ color: '#334155', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {selectedOrderDetails.streetAddress ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{selectedOrderDetails.streetAddress}</div>
                          {selectedOrderDetails.streetAddress2 && <div>{selectedOrderDetails.streetAddress2}</div>}
                          <div>{selectedOrderDetails.city}, {selectedOrderDetails.state} - {selectedOrderDetails.postcode}</div>
                          {selectedOrderDetails.companyName && <div style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Co: {selectedOrderDetails.companyName}</div>}
                        </>
                      ) : (
                        <div style={{ fontWeight: 600 }}>{selectedOrderDetails.address || 'No address provided'}</div>
                      )}
                   </div>
                </div>
             </div>

             {/* Items List */}
             <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}><Package size={18} /> Order Items</h3>
                <div style={{ background: 'var(--colorful-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  {(selectedOrderDetails.items || []).length > 0 ? (
                    selectedOrderDetails.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '12px 15px', borderBottom: idx !== selectedOrderDetails.items.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                         <div style={{ width: '50px', height: '50px', background: 'var(--light-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                           {item.image ? <img src={getImageUrl(item.image)} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : <Package size={20} color="#cbd5e1" />}
                         </div>
                         <div style={{ flex: 1 }}>
                           <strong style={{ display: 'block', color: 'var(--text-dark)', fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</strong>
                           <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × ₹{(item.price || 0).toLocaleString('en-IN')}</span>
                         </div>
                         <strong style={{ color: 'var(--text-dark)' }}>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</strong>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                       {selectedOrderDetails.productName ? (
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                               <strong style={{ display: 'block', color: 'var(--text-dark)' }}>{selectedOrderDetails.productName}</strong>
                               <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {selectedOrderDetails.quantity || 1}</span>
                            </div>
                            <strong style={{ color: 'var(--text-dark)' }}>₹{(selectedOrderDetails.totalPrice || 0).toLocaleString('en-IN')}</strong>
                         </div>
                       ) : 'No items found'}
                    </div>
                  )}
                </div>
             </div>

             {/* Payment Summary */}
             <div style={{ background: 'var(--light-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>₹{((selectedOrderDetails.totalPrice || 0) - (selectedOrderDetails.shippingCost || 0)).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span>Shipping</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{selectedOrderDetails.shippingCost ? `₹${selectedOrderDetails.shippingCost.toLocaleString('en-IN')}` : 'Free'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '2px solid var(--border-color)', marginBottom: '15px' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '1.1rem' }}>Total Amount</span>
                  <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '1.3rem' }}>₹{(selectedOrderDetails.totalPrice || 0).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <CurrencyDollar size={16} color="var(--text-muted)" />
                     <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{selectedOrderDetails.paymentMethod || 'Online'}</span>
                  </div>
                  <div style={{ 
                     background: selectedOrderDetails.paymentStatus === 'Paid' ? '#dcfce7' : '#fee2e2', 
                     color: selectedOrderDetails.paymentStatus === 'Paid' ? '#16a34a' : '#ef4444',
                     padding: '2px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase'
                  }}>
                     {selectedOrderDetails.paymentStatus || 'Unpaid'}
                  </div>
                </div>
             </div>

             {/* Tracking Details & Link */}
             <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Tracking Details & Link</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Enter tracking ID, carrier info..."
                    value={selectedOrderDetails.trackingDetails || ''}
                    onChange={(e) => setSelectedOrderDetails(prev => ({ ...prev, trackingDetails: e.target.value }))}
                    style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="url" 
                      placeholder="Enter tracking URL (e.g. https://track...)"
                      value={selectedOrderDetails.trackingLink || ''}
                      onChange={(e) => setSelectedOrderDetails(prev => ({ ...prev, trackingLink: e.target.value }))}
                      style={{ flex: 1, padding: '12px 15px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                    <button 
                      onClick={async () => {
                        try {
                          const res = await fetch(`${BASE_URL}/api/orders/${selectedOrderDetails.orderId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                trackingDetails: selectedOrderDetails.trackingDetails,
                                trackingLink: selectedOrderDetails.trackingLink
                            })
                          });
                          if (res.ok) {
                            setOrders(prev => prev.map(o => o.orderId === selectedOrderDetails.orderId ? { ...o, trackingDetails: selectedOrderDetails.trackingDetails, trackingLink: selectedOrderDetails.trackingLink } : o));
                            showToast('Tracking info updated successfully', 'success');
                          }
                        } catch (err) {
                          showToast('Failed to update tracking info', 'error');
                        }
                      }}
                      style={{ padding: '0 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                      onMouseOver={e => e.target.style.background = 'var(--primary)'}
                      onMouseOut={e => e.target.style.background = 'var(--primary)'}
                    >
                      Save
                    </button>
                  </div>
                </div>
             </div>

             {/* Invoice Upload */}
             <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Order Invoice Image</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setInvoiceFile(e.target.files[0])}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.9rem', background: 'var(--light-bg)' }}
                  />
                  <button 
                    onClick={() => handleInvoiceUpload(selectedOrderDetails.orderId)}
                    disabled={!invoiceFile}
                    style={{ padding: '12px 20px', background: invoiceFile ? 'var(--success)' : '#9ca3af', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: invoiceFile ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <UploadSimple size={18} /> Upload
                  </button>
                </div>
                {selectedOrderDetails.invoiceImage && (
                  <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle size={16} /> Invoice uploaded successfully
                    <a href={getImageUrl(selectedOrderDetails.invoiceImage)} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: 'var(--primary)', textDecoration: 'underline' }}>View</a>
                  </p>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Custom Status Change Confirmation Modal */}
      {statusConfirmState && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: 'var(--colorful-bg)', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-dark)', fontSize: '18px' }}>Confirm Status Change</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '15px' }}>
              Are you sure you want to change the status to <strong>{statusConfirmState.newStatus}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setStatusConfirmState(null)} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  handleUpdateOrderStatus(statusConfirmState.orderId, statusConfirmState.newStatus);
                  setStatusConfirmState(null);
                }} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
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
          <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '540px', width: '90%', position: 'relative' }}>
             <button onClick={() => setSelectedUserDetails(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-dark)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>User Details</h2>
             
             <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>User ID</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{selectedUserDetails.id}</strong>
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
                   <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Contact Info</span>
                   <div style={{ color: 'var(--text-dark)', fontWeight: 500, marginTop: '4px' }}>{selectedUserDetails.name}</div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedUserDetails.email}</div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedUserDetails.phone}</div>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Address</span>
                  <div style={{ color: '#334155', fontSize: '0.9rem', marginTop: '4px', lineHeight: '1.4' }}>{selectedUserDetails.address}</div>
                </div>
             </div>

             <div style={{ background: 'var(--light-bg)', padding: '1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Account Activity</span>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Orders:</span>
                   <span style={{ color: '#334155', fontWeight: 500 }}>{selectedUserDetails.totalOrders}</span>
                 </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '8px' }}>
                   <span style={{ color: '#334155', fontWeight: 600 }}>Total Spending:</span>
                   <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.1rem' }}>₹{(selectedUserDetails.totalSpending || 0).toLocaleString('en-IN')}</span>
                </div>
             </div>

             <div>
                 <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px' }}>Recent Orders</span>
                 <div style={{ display: 'grid', gap: '10px' }}>
                     {selectedUserDetails.recentOrders.length > 0 ? selectedUserDetails.recentOrders.map(order => (
                         <div 
                           key={order.orderId} 
                           onClick={() => setSelectedOrderDetails(order)}
                           style={{ 
                             background: 'var(--light-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', 
                             cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                           }}
                           onMouseOver={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'var(--light-bg)'; }}
                           onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--light-bg)'; }}
                         >
                           <div>
                             <strong style={{ display: 'block', color: 'var(--text-dark)', fontSize: '1rem', marginBottom: '4px' }}>{order.productName}</strong>
                             <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
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
                         <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', padding: '16px', textAlign: 'center', background: 'var(--light-bg)', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
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
            <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxWidth: '500px', width: '90%', position: 'relative' }}>
                <button onClick={() => setSelectedSupportQuery(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
                
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <h2 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Support Ticket Detail</h2>
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
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>From</span>
                        <div style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{selectedSupportQuery.name}</div>
                        <div style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{selectedSupportQuery.email}</div>
                    </div>
                    <div>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Subject</span>
                        <div style={{ color: 'var(--text-dark)', fontWeight: 700 }}>{selectedSupportQuery.subject}</div>
                    </div>
                    <div style={{ background: 'var(--light-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Message</span>
                        <div style={{ color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedSupportQuery.message}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Submitted on: {new Date(selectedSupportQuery.createdAt).toLocaleString()}</span>
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
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Hero Slide Add Modal */}
      {isHeroAddOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
             <button onClick={() => setIsHeroAddOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Add Hero Slide</h2>
             
             <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Link</label>
                    <input type="text" value={newHeroSlide.btnLink || ''} onChange={e => setNewHeroSlide({...newHeroSlide, btnLink: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="e.g. /product/123" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Order</label>
                    <input type="number" value={newHeroSlide.order} onChange={e => setNewHeroSlide({...newHeroSlide, order: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Active</label>
                    <div style={{ marginTop: '10px' }}>
                      <input type="checkbox" checked={newHeroSlide.active} onChange={e => setNewHeroSlide({...newHeroSlide, active: e.target.checked})} style={{ transform: 'scale(1.5)' }} />
                    </div>
                  </div>
                </div>
                <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Slide Image</label>
                   <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', background: 'var(--light-bg)' }}>
                       {heroImagePreview ? (
                           <img src={heroImagePreview} alt="Preview" style={{ height: '120px', objectFit: 'contain' }} />
                       ) : (
                           <>
                              <UploadSimple size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                              <span style={{ color: 'var(--text-muted)' }}>Upload Image</span>
                           </>
                       )}
                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                           if (e.target.files && e.target.files[0]) {
                               setHeroSelectedFile(e.target.files[0]);
                               setHeroImagePreview(URL.createObjectURL(e.target.files[0]));
                           }
                       }} />
                   </label>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={() => setIsHeroAddOpen(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button 
                        disabled={isSubmitting}
                        onClick={async () => {
                            if (!heroSelectedFile) return showToast('Image is required', 'error');
                            setIsSubmitting(true);
                            try {
                                const formData = new FormData();
                                formData.append('title', newHeroSlide.title || '');
                                formData.append('subtitle', newHeroSlide.subtitle);
                                formData.append('brand', newHeroSlide.brand);
                                formData.append('brandColor', newHeroSlide.brandColor);
                                 formData.append('bgColor', newHeroSlide.bgColor || 'var(--text-dark)');
                                 formData.append('textColor', newHeroSlide.textColor || '#ffffff');
                                formData.append('price', newHeroSlide.price);
                                formData.append('features', JSON.stringify((newHeroSlide.features || '').split(',').map(s => s.trim()).filter(Boolean)));
                                formData.append('btnText', newHeroSlide.btnText || '');
                                formData.append('btnLink', newHeroSlide.btnLink || '');
                                formData.append('order', newHeroSlide.order);
                                formData.append('active', newHeroSlide.active);
                                formData.append('img', heroSelectedFile);

                                const res = await fetch(`${BASE_URL}/api/hero`, { method: 'POST', body: formData });
                                if (res.ok) {
                                    const data = await res.json();
                                    setHeroSlides([data, ...heroSlides]);
                                    setIsHeroAddOpen(false);
                                    showToast('Slide added successfully');
                                } else {
                                    showToast('Failed to add slide', 'error');
                                }
                            } catch (e) {
                                showToast('Network Error', 'error');
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                        {isSubmitting ? 'Saving...' : 'Save Slide'}
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Hero Slide Edit Modal */}
      {isHeroEditOpen && editHeroSlide && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
             <button onClick={() => setIsHeroEditOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Edit Hero Slide</h2>
             
             <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Title</label>
                  <input type="text" value={editHeroSlide.title} onChange={e => setEditHeroSlide({...editHeroSlide, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Subtitle</label>
                  <input type="text" value={editHeroSlide.subtitle} onChange={e => setEditHeroSlide({...editHeroSlide, subtitle: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Brand</label>
                    <input type="text" value={editHeroSlide.brand} onChange={e => setEditHeroSlide({...editHeroSlide, brand: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Brand Color</label>
                    <input type="color" value={editHeroSlide.brandColor} onChange={e => setEditHeroSlide({...editHeroSlide, brandColor: e.target.value})} style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', height: '42px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Background Color</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['var(--text-dark)', 'var(--text-dark)', '#1e3a8a', '#450a0a', '#14532d', 'var(--primary)', '#8b5cf6', '#ec4899', '#ef4444', 'var(--secondary)', 'var(--warning)', '#eab308', 'var(--success)', '#06b6d4', '#ffffff'].map(color => (
                        <div
                          key={color}
                          onClick={() => setEditHeroSlide({...editHeroSlide, bgColor: color})}
                          style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: color, cursor: 'pointer',
                            border: editHeroSlide.bgColor === color ? '2px solid white' : '1px solid #cbd5e1',
                            boxShadow: editHeroSlide.bgColor === color ? '0 0 0 2px var(--primary)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ width: '100%', background: editHeroSlide.bgColor || 'var(--text-dark)', borderRadius: '6px', height: '42px', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                      <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Preview: {editHeroSlide.bgColor || 'var(--text-dark)'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Text Color</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    <div onClick={() => setEditHeroSlide({...editHeroSlide, textColor: '#ffffff'})} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: 'var(--text-dark)', color: '#ffffff', cursor: 'pointer', border: editHeroSlide.textColor !== 'var(--text-dark)' ? '2px solid var(--primary)' : '1px solid #cbd5e1', fontWeight: 600 }}>Light Text</div>
                    <div onClick={() => setEditHeroSlide({...editHeroSlide, textColor: 'var(--text-dark)'})} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: 'var(--light-bg)', color: 'var(--text-dark)', cursor: 'pointer', border: editHeroSlide.textColor === 'var(--text-dark)' ? '2px solid var(--primary)' : '1px solid #cbd5e1', fontWeight: 600 }}>Dark Text</div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Price</label>
                  <input type="text" value={editHeroSlide.price} onChange={e => setEditHeroSlide({...editHeroSlide, price: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Features (comma separated)</label>
                  <textarea value={editHeroSlide.features} onChange={e => setEditHeroSlide({...editHeroSlide, features: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '60px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Button Text</label>
                    <input type="text" value={editHeroSlide.btnText || ''} onChange={e => setEditHeroSlide({...editHeroSlide, btnText: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="e.g. Shop Now" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Button Link</label>
                    <input type="text" value={editHeroSlide.btnLink || ''} onChange={e => setEditHeroSlide({...editHeroSlide, btnLink: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="e.g. /product/123" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Order</label>
                    <input type="number" value={editHeroSlide.order} onChange={e => setEditHeroSlide({...editHeroSlide, order: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Active</label>
                    <div style={{ marginTop: '10px' }}>
                      <input type="checkbox" checked={editHeroSlide.active} onChange={e => setEditHeroSlide({...editHeroSlide, active: e.target.checked})} style={{ transform: 'scale(1.5)' }} />
                    </div>
                  </div>
                </div>
                <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Slide Image</label>
                   <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '1.5rem', cursor: 'pointer', background: 'var(--light-bg)' }}>
                       {editHeroImagePreview ? (
                           <img src={editHeroImagePreview} alt="Preview" style={{ height: '120px', objectFit: 'contain' }} />
                       ) : (
                           <UploadSimple size={24} color="var(--text-muted)" />
                       )}
                       <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                           if (e.target.files && e.target.files[0]) {
                               setEditHeroSelectedFile(e.target.files[0]);
                               setEditHeroImagePreview(URL.createObjectURL(e.target.files[0]));
                           }
                       }} />
                   </label>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={() => setIsHeroEditOpen(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button 
                        disabled={isSubmitting}
                        onClick={async () => {
                            setIsSubmitting(true);
                            try {
                                const formData = new FormData();
                                formData.append('title', editHeroSlide.title || '');
                                formData.append('subtitle', editHeroSlide.subtitle);
                                formData.append('brand', editHeroSlide.brand);
                                formData.append('brandColor', editHeroSlide.brandColor);
                                 formData.append('bgColor', editHeroSlide.bgColor || 'var(--text-dark)');
                                 formData.append('textColor', editHeroSlide.textColor || '#ffffff');
                                formData.append('price', editHeroSlide.price);
                                formData.append('features', JSON.stringify((editHeroSlide.features || '').split(',').map(s => s.trim()).filter(Boolean)));
                                formData.append('btnText', editHeroSlide.btnText || '');
                                formData.append('btnLink', editHeroSlide.btnLink || '');
                                formData.append('order', editHeroSlide.order);
                                formData.append('active', editHeroSlide.active);
                                if (editHeroSelectedFile) formData.append('img', editHeroSelectedFile);

                                const res = await fetch(`${BASE_URL}/api/hero/${editHeroSlide._id}`, { method: 'PUT', body: formData });
                                if (res.ok) {
                                    const data = await res.json();
                                    setHeroSlides(prev => prev.map(s => s._id === data._id ? data : s));
                                    setIsHeroEditOpen(false);
                                    showToast('Slide updated successfully');
                                } else {
                                    showToast('Failed to update slide', 'error');
                                }
                            } catch (e) {
                                showToast('Network Error', 'error');
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '6px', border: 'none', background: 'var(--success)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                        {isSubmitting ? 'Saving...' : 'Save Details'}
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Delete Hero Slide Modal */}
      {heroDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--colorful-bg)', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-dark)', fontSize: '18px' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '15px' }}>Are you sure you want to permanently delete slide <strong>{heroDeleteConfirm.title}</strong>?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setHeroDeleteConfirm(null)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button 
                onClick={async () => {
                  try {
                      const res = await fetch(`${BASE_URL}/api/hero/${heroDeleteConfirm._id}`, { method: 'DELETE' });
                      if (res.ok || res.status === 404) {
                          setHeroSlides(prev => prev.filter(s => s._id !== heroDeleteConfirm._id));
                          showToast('Slide deleted', 'success');
                      } else {
                          showToast('Failed to delete slide', 'error');
                      }
                  } catch(err) {
                      showToast('Network error while deleting.', 'error');
                  }
                  setHeroDeleteConfirm(null);
                }} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: toast.type === 'success' ? 'var(--success)' : '#ef4444', color: 'white', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 9999, animation: 'slideIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '250px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '4px', display: 'flex' }}>
            <Bell size={20} weight="fill" />
          </div>
          <span style={{ fontWeight: 600 }}>{toast.message}</span>
        </div>
      )}

      {/* Coupon Creation Modal */}
      {isCouponModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: 'var(--colorful-bg)', padding: '2.5rem', borderRadius: '24px', width: '90%', maxWidth: '500px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <button onClick={() => setIsCouponModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--border-color)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
             <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)', fontWeight: 800 }}>Create New Coupon</h2>
             
             <div style={{ display: 'grid', gap: '1.2rem' }}>
                <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Coupon Code*</label>
                   <input 
                        type="text" 
                        placeholder="e.g. FESTIVE20" 
                        value={newCoupon.code} 
                        onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none', fontWeight: 600 }} 
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Discount Type*</label>
                        <select 
                            value={newCoupon.discountType} 
                            onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }}
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="flat">Flat Amount (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Value*</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 10 or 500" 
                            value={newCoupon.discountValue} 
                            onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} 
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Min Order (₹)</label>
                        <input 
                            type="number" 
                            value={newCoupon.minOrderValue} 
                            onChange={e => setNewCoupon({...newCoupon, minOrderValue: e.target.value})} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} 
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Min Items</label>
                        <input 
                            type="number" 
                            value={newCoupon.minItems} 
                            onChange={e => setNewCoupon({...newCoupon, minItems: e.target.value})} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} 
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Usage Limit</label>
                        <input 
                            type="number" 
                            placeholder="Unlimited"
                            value={newCoupon.usageLimit || ''} 
                            onChange={e => setNewCoupon({...newCoupon, usageLimit: e.target.value ? parseInt(e.target.value) : null})} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} 
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Expiry Date*</label>
                        <input 
                            type="date" 
                            value={newCoupon.expiryDate} 
                            onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})} 
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} 
                        />
                    </div>
                </div>

                <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>Short Description*</label>
                   <input 
                        type="text" 
                        placeholder="e.g. Get 20% off on your first order" 
                        value={newCoupon.description} 
                        onChange={e => setNewCoupon({...newCoupon, description: e.target.value})} 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', outline: 'none' }} 
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--light-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <input 
                        type="checkbox" 
                        id="isPublic"
                        checked={newCoupon.isPublic !== false}
                        onChange={e => setNewCoupon({...newCoupon, isPublic: e.target.checked})} 
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                    />
                    <label htmlFor="isPublic" style={{ fontWeight: 600, color: '#334155', cursor: 'pointer', fontSize: '0.9rem' }}>
                        Show this coupon to all users (Public)
                    </label>
                </div>

                <button 
                    onClick={handleSaveCoupon}
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, cursor: 'pointer', marginTop: '1rem', boxShadow: '0 10px 15px -3px rgba(59,130,246,0.3)' }}
                >
                    {isSubmitting ? 'Creating...' : 'CREATE COUPON'}
                </button>
             </div>
          </div>
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
            background: var(--primary);
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
            background: var(--primary); 
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
            background: var(--primary);
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
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .product-card {
            background: white;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .product-image-container {
            height: 200px;
            background: var(--light-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .product-info {
            padding: 1.25rem;
        }
        .product-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text-dark);
            margin-bottom: 0.5rem;
        }
        .product-price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .product-brand {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 500;
        }
        .product-price {
            font-weight: 700;
            color: var(--primary);
        }
        .action-btn-custom {
            padding: 8px 12px;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .edit-btn {
            background: #f0f9ff;
            color: #0369a1;
            border-color: #bae6fd;
        }
        .edit-btn:hover {
            background: #e0f2fe;
        }
        .delete-btn {
            background: #fef2f2;
            color: #b91c1c;
            border-color: #fecaca;
        }
        .delete-btn:hover {
            background: #fee2e2;
        }
        @media (max-width: 768px) {
            .product-price-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }
            .product-title {
                font-size: 0.9rem;
                min-height: auto !important;
            }
            .product-info {
                padding: 0.75rem;
            }
            .action-btn-custom {
                padding: 6px 8px;
                font-size: 0.75rem;
                gap: 4px;
            }
            .products-mgmt-header {
                flex-direction: column;
                align-items: flex-start !important;
                gap: 12px;
            }
            .products-mgmt-title {
                font-size: 1.2rem !important;
            }
        }
      `}</style>

      {/* Delete Partner Confirm Modal */}
      {deletePartnerConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--colorful-bg)', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-dark)', fontSize: '18px' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '15px' }}>Are you sure you want to permanently delete this partner product?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setDeletePartnerConfirm(null)} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'var(--colorful-bg)', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeletePartnerProduct} 
                style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
