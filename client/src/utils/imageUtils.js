const BASE_URL = "https://threed-pinaka-platform.onrender.com";

export const getImageUrl = (img) => {
  if (!img) return "/placeholder.png";
  if (img.startsWith("http")) return img;
  if (img.startsWith("/images")) {
    return `${BASE_URL}${img}`;
  }
  return "/placeholder.png";
};
