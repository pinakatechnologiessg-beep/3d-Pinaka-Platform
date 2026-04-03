const PRODUCTION_URL = "https://threed-pinaka-platform.onrender.com";
const LOCAL_URL = "http://localhost:10000";

export const getImageUrl = (img) => {
  if (!img) return "/placeholder.png";
  if (img.startsWith("http")) return img;
  if (img.startsWith("/images")) {
    // Determine the main URL based on where the browser is running
    const BASE_URL = window.location.hostname === "localhost" ? LOCAL_URL : PRODUCTION_URL;
    return `${BASE_URL}${img}`;
  }
  return "/placeholder.png";
};
