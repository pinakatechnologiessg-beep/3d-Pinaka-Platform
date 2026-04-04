const PRODUCTION_BACKEND_URL = "https://threed-pinaka-platform.onrender.com";
const LOCAL_BACKEND_URL = "http://localhost:10000";

export const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'%3E%3C/path%3E%3Cpolyline points='3.27 6.96 12 12.01 20.73 6.96'%3E%3C/polyline%3E%3Cline x1='12' y1='22.08' x2='12' y2='12'%3E%3C/line%3E%3C/svg%3E";

export const getImageUrl = (img) => {
  if (!img) return PLACEHOLDER_SVG;
  if (img.startsWith("http")) return img;
  
  let processedPath = img;
  
  // Normalization for local assets to match standard file naming convention (lowercase-with-dashes)
  if (img.startsWith("/images/")) {
    const filename = img.replace("/images/", "");
    // If it's a known product-style filename, normalize it to lowercase and dashes
    if (!filename.includes("-17748")) { // Don't normalize hashed names (they are already exact)
        processedPath = "/images/" + filename
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/_/g, "-")
            .replace(/-+/g, "-");
    }
    return processedPath; 
  }
  
  // Dynamic uploaded assets should be served from the backend (Render)
  if (img.startsWith("/uploads/")) {
    const BACKEND_URL = window.location.hostname === "localhost" ? LOCAL_BACKEND_URL : PRODUCTION_BACKEND_URL;
    return `${BACKEND_URL}${img}`;
  }
  
  // Default to processed path if it exists, otherwise use bulletproof placeholder
  return processedPath || PLACEHOLDER_SVG;
};
