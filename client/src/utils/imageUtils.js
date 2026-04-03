const PRODUCTION_URL = "https://threed-pinaka-platform.onrender.com";
const LOCAL_URL = "http://localhost:10000";

const BASE_URL = window.location.hostname === "localhost" ? LOCAL_URL : PRODUCTION_URL;

export const getImageUrl = (img) => {
  if (!img) return "/placeholder.png";
  if (img.startsWith("http")) return img;
  if (img.startsWith("/images")) {
    return `${BASE_URL}${img}`;
  }
  return "/placeholder.png";
};
