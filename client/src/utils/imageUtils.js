const PRODUCTION_URL = "https://threed-pinaka-platform.onrender.com";

export const getImageUrl = (img) => {
  if (!img) return "/placeholder.png";
  if (img.startsWith("http")) return img;
  if (img.startsWith("/images")) {
    // For Production: Always use the Render URL for image assets
    return `${PRODUCTION_URL}${img}`;
  }
  return "/placeholder.png";
};
