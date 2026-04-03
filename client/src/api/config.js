/**
 * Centralized API configuration for production deployment.
 * Defaults to localhost:5000 if VITE_API_URL is not set in environment.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, "");

// Helper for standard API paths
export const API_URLS = {
    auth: `${API_BASE_URL}/api/auth`,
    products: `${API_BASE_URL}/api/products`,
    users: `${API_BASE_URL}/api/users`,
    support: `${API_BASE_URL}/api/support`,
    orders: `${API_BASE_URL}/api/orders`,
    stats: `${API_BASE_URL}/api/stats`,
    calculate: `${API_BASE_URL}/api/calculate`,
};

export default API_BASE_URL;
