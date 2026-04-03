import { API_BASE_URL } from '../api/config';

/**
 * Universal Image URL Helper
 * Handles: 
 * 1. Full Cloudinary URLs (starting with http)
 * 2. Local backend paths (/images/ or /uploads/)
 * 3. Fallback to a high-quality placeholder for invalid paths
 */
export const getImageUrl = (imagePath) => {
    // 1. Placeholder for missing paths
    if (!imagePath) return 'https://res.cloudinary.com/dbv5unrxu/image/upload/v1712160000/placeholder_3d_m0h6uv.png';
    
    // 2. If it's already an absolute URL (Cloudinary/External), return it
    if (imagePath.startsWith('http')) return imagePath;

    // 3. Centralized API Base (Render URL)
    const base = API_BASE_URL.replace(/\/$/, "");
    
    // 4. Ensure path starts with leading slash
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    // 5. Build full production URL
    return `${base}${cleanPath}`;
};
