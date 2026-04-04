const PRODUCTION_BACKEND_URL = "https://threed-pinaka-platform.onrender.com";
const LOCAL_BACKEND_URL = "http://localhost:10000";

export const getImageUrl = (img) => {
  if (!img) return "/fallback.png";
  if (img.startsWith("http")) return img;
  
  // Local project assets (in public/images) should be served relatively by the frontend (Vercel)
  if (img.startsWith("/images/")) {
    return img; 
  }
  
  // Dynamic uploaded assets should be served from the backend (Render)
  if (img.startsWith("/uploads/")) {
    const BACKEND_URL = window.location.hostname === "localhost" ? LOCAL_BACKEND_URL : PRODUCTION_BACKEND_URL;
    return `${BACKEND_URL}${img}`;
  }
  
  // Default fallback for any other broken paths
  return img.startsWith("/") ? img : "/fallback.png";
};
