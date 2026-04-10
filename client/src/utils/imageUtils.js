const PRODUCTION_BACKEND_URL = "https://threed-pinaka-platform.onrender.com";
const LOCAL_BACKEND_URL = "http://localhost:10000";

// Ultra-stable cloud-based placeholder (Unsplash transparent/icon)
export const PLACEHOLDER_SVG = "https://images.unsplash.com/photo-1627389811802-1407e3832d20?auto=format&fit=crop&w=500&q=60";

export const getImageUrl = (img) => {
  if (!img) return PLACEHOLDER_SVG;
  if (img.startsWith("http")) return img;
  
  // Cache buster to force Vercel to bypass Edge delivery stale assets
  const bust = "?v=" + new Date().getTime().toString().slice(-4);
  
  // Local project assets (in public/images)
  if (img.startsWith("/images/")) {
    const filename = img.replace("/images/", "");
    // Normalize path to match the actual renamed files on disk
    let normalized = filename.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-').replace(/-+/g, '-');
    // Ensure extension is preserved (strip double .png if accidental)
    if (!normalized.endsWith(".png")) normalized += ".png";
    
    return `/images/${normalized}${bust}`; 
  }
  
  // Dynamic uploaded assets (served from Render)
  if (img.startsWith("/uploads/")) {
    const BACKEND_URL = window.location.hostname === "localhost" ? LOCAL_BACKEND_URL : PRODUCTION_BACKEND_URL;
    return `${BACKEND_URL}${img}${bust}`;
  }
  
  return PLACEHOLDER_SVG;
};

export const parsePriceLocal = (price) => {
  if (!price) return 0;
  if (typeof price === 'number') return price;
  return parseInt(String(price).replace(/[^0-9]/g, '')) || 0;
};

export default getImageUrl;
