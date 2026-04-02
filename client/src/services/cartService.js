/**
 * Centralized Service for Managing Cart and Wishlist
 * Handles persistence via localStorage and dispatches global events for UI syncing.
 */

// Custom Events Names
export const CART_UPDATED = 'cartUpdated';
export const WISHLIST_UPDATED = 'wishlistUpdated';
export const SHOW_TOAST = 'showToast';

const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const cartService = {
  // --- Cart Operations ---
  getCartItems: () => getFromStorage('cart'),
  
  getCartCount: () => getFromStorage('cart').length,
  
  addToCart: (product) => {
    const cart = getFromStorage('cart');
    const title = product.name || product.title;
    cart.push({
      id: Date.now() + Math.random(), // Unique ID for removals
      productId: product._id || product.id, // Original ID from data
      title: title,
      price: product.price,
      image: product.image || product.img
    });
    saveToStorage('cart', cart);
    window.dispatchEvent(new Event(CART_UPDATED));
    window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
      detail: { message: `${title} added to cart!`, type: 'success' } 
    }));
  },
  
  removeFromCartById: (id) => {
    const cart = getFromStorage('cart');
    const filtered = cart.filter(item => item.id !== id);
    saveToStorage('cart', filtered);
    window.dispatchEvent(new Event(CART_UPDATED));
    window.dispatchEvent(new Event('storage'));
  },
  
  clearCart: () => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event(CART_UPDATED));
    window.dispatchEvent(new Event('storage'));
  },

  // --- Wishlist Operations ---
  getWishlistItems: () => getFromStorage('wishlist'),
  
  getWishlistCount: () => getFromStorage('wishlist').length,
  
  toggleWishlist: (product) => {
    const wishlist = getFromStorage('wishlist');
    const title = product.name || product.title;
    const index = wishlist.findIndex(item => item.title === title);
    
    if (index === -1) {
      // Add
      wishlist.push({
        id: Date.now() + Math.random(),
        productId: product._id || product.id,
        title: title,
        price: product.price,
        image: product.image || product.img
      });
      saveToStorage('wishlist', wishlist);
      window.dispatchEvent(new Event(WISHLIST_UPDATED));
      window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
        detail: { message: `${title} added to wishlist!`, type: 'success' } 
      }));
    } else {
      // Remove
      wishlist.splice(index, 1);
      saveToStorage('wishlist', wishlist);
      window.dispatchEvent(new Event(WISHLIST_UPDATED));
      window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
        detail: { message: `${title} removed from wishlist!`, type: 'info' } 
      }));
    }
  },
  
  removeFromWishlistById: (id) => {
    const wishlist = getFromStorage('wishlist');
    const filtered = wishlist.filter(item => item.id !== id);
    saveToStorage('wishlist', filtered);
    window.dispatchEvent(new Event(WISHLIST_UPDATED));
    window.dispatchEvent(new Event('storage'));
  },

  clearWishlist: () => {
    localStorage.removeItem('wishlist');
    window.dispatchEvent(new Event(WISHLIST_UPDATED));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(SHOW_TOAST, { 
      detail: { message: `Wishlist cleared!`, type: 'info' } 
    }));
  },

  isInWishlist: (productTitle) => {
    const items = getFromStorage('wishlist');
    return items.some(item => item.title === productTitle);
  },

  // --- Initial Sync ---
  notifyAll: () => {
    window.dispatchEvent(new Event(CART_UPDATED));
    window.dispatchEvent(new Event(WISHLIST_UPDATED));
  }
};
