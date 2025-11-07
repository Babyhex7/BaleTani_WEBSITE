/**
 * Image Utility Functions
 * Handle image URLs and fallback placeholders
 */

// Inline SVG placeholder (no external request needed)
export const PLACEHOLDER_IMAGES = {
  product:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="18" dy="10.5" font-weight="600" x="50%25" y="50%25" text-anchor="middle"%3ETidak Ada Gambar%3C/text%3E%3C/svg%3E',

  small:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="12" dy="3.5" font-weight="600" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E',

  large:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="500" height="500"%3E%3Crect fill="%23f3f4f6" width="500" height="500"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="24" dy="10" font-weight="600" x="50%25" y="50%25" text-anchor="middle"%3ETidak Ada Gambar%3C/text%3E%3C/svg%3E',

  thumbnail:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23f3f4f6" width="64" height="64"/%3E%3Ctext fill="%239ca3af" font-family="system-ui" font-size="10" dy="3" font-weight="600" x="50%25" y="50%25" text-anchor="middle"%3E--%3C/text%3E%3C/svg%3E',
};

/**
 * Get full image URL from path
 * @param {string} imagePath - Image path from database
 * @param {string} size - Size variant: 'small', 'large', 'thumbnail', or 'product' (default)
 * @returns {string} Full image URL or placeholder
 */
export const getImageUrl = (imagePath, size = "product") => {
  // Return placeholder if no image
  if (!imagePath || imagePath === "" || imagePath === "null") {
    return PLACEHOLDER_IMAGES[size] || PLACEHOLDER_IMAGES.product;
  }

  // If already a full URL, return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If starts with data:image (base64 or SVG), return as-is
  if (imagePath.startsWith("data:image")) {
    return imagePath;
  }

  // Construct full URL for uploads
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  return `${baseURL}${cleanPath}`;
};

/**
 * Get fallback placeholder for onError event
 * @param {string} size - Size variant
 * @returns {string} Placeholder image URL
 */
export const getPlaceholder = (size = "product") => {
  return PLACEHOLDER_IMAGES[size] || PLACEHOLDER_IMAGES.product;
};

/**
 * Handle image load error
 * @param {Event} e - Error event
 * @param {string} size - Size variant
 */
export const handleImageError = (e, size = "product") => {
  if (e.target.src !== PLACEHOLDER_IMAGES[size]) {
    e.target.src = PLACEHOLDER_IMAGES[size] || PLACEHOLDER_IMAGES.product;
  }
};

export default {
  getImageUrl,
  getPlaceholder,
  handleImageError,
  PLACEHOLDER_IMAGES,
};
