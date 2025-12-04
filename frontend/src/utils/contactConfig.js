/**
 * ============================================
 * CONTACT CONFIGURATION
 * ============================================
 * Hardcoded contact information & operational hours
 * Bisa di-override dengan environment variables
 *
 * @module utils/contactConfig
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

/**
 * Store Contact Information
 */
export const CONTACT_INFO = {
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || "6281234567890",
  email: import.meta.env.VITE_EMAIL_SUPPORT || "baletaniinfo@gmail.com",
  phone: import.meta.env.VITE_PHONE_NUMBER || "021-12345678",
  address: {
    street:
      import.meta.env.VITE_STORE_ADDRESS || "Jl. Raya Jakarta Selatan No. 123",
    city: import.meta.env.VITE_STORE_CITY || "Jakarta Selatan",
    province: import.meta.env.VITE_STORE_PROVINCE || "DKI Jakarta",
    postalCode: import.meta.env.VITE_STORE_POSTAL_CODE || "12360",
    full: function () {
      return `${this.street}, ${this.city}, ${this.province} ${this.postalCode}`;
    },
  },
};

/**
 * Operational Hours
 */
export const OPERATIONAL_HOURS = [
  {
    day: "Senin - Jumat",
    hours: "08.00 - 21.00 WIB",
    isOpen: true,
  },
  {
    day: "Sabtu",
    hours: "08.00 - 22.00 WIB",
    isOpen: true,
  },
  {
    day: "Minggu",
    hours: "09.00 - 20.00 WIB",
    isOpen: true,
  },
];

/**
 * Social Media Links
 */
export const SOCIAL_MEDIA = {
  facebook:
    import.meta.env.VITE_FACEBOOK_URL || "https://facebook.com/baletani",
  instagram:
    import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com/baletani",
  twitter: import.meta.env.VITE_TWITTER_URL || "https://twitter.com/baletani",
  youtube: import.meta.env.VITE_YOUTUBE_URL || "https://youtube.com/@baletani",
};

/**
 * Google Maps Configuration
 */
export const MAPS_CONFIG = {
  embedUrl:
    import.meta.env.VITE_MAPS_EMBED_URL ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d106.8!3d-6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMDAuMCJTIDEwNsKwNDgnMDAuMCJF!5e0!3m2!1sen!2sid!4v1234567890!5m2!1sen!2sid",
  latitude: import.meta.env.VITE_MAPS_LATITUDE || "-6.2",
  longitude: import.meta.env.VITE_MAPS_LONGITUDE || "106.8",
  zoom: import.meta.env.VITE_MAPS_ZOOM || "15",
};

/**
 * Get formatted WhatsApp URL
 */
export const getWhatsAppURL = (message = "") => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${CONTACT_INFO.whatsapp}${
    message ? `?text=${encodedMessage}` : ""
  }`;
};

/**
 * Get formatted email mailto link
 */
export const getEmailLink = (subject = "", body = "") => {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const queryString = params.length ? `?${params.join("&")}` : "";
  return `mailto:${CONTACT_INFO.email}${queryString}`;
};

/**
 * Get Google Maps direction URL
 */
export const getDirectionURL = () => {
  return `https://www.google.com/maps/dir/?api=1&destination=${MAPS_CONFIG.latitude},${MAPS_CONFIG.longitude}`;
};

/**
 * Check if currently open (based on current time)
 * This is a simple check, bisa dikembangkan lebih complex
 */
export const isCurrentlyOpen = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();

  // Minggu (Sunday)
  if (day === 0) {
    return hour >= 7 && hour < 20;
  }
  // Sabtu (Saturday)
  if (day === 6) {
    return hour >= 8 && hour < 22;
  }
  // Senin - Jumat (Monday - Friday)
  return hour >= 8 && hour < 21;
};

/**
 * Get current operational status
 */
export const getOperationalStatus = () => {
  const isOpen = isCurrentlyOpen();
  return {
    isOpen,
    status: isOpen ? "Buka" : "Tutup",
    message: isOpen
      ? "Kami sedang melayani Anda"
      : "Maaf, saat ini kami sedang tutup",
  };
};

export default {
  CONTACT_INFO,
  OPERATIONAL_HOURS,
  SOCIAL_MEDIA,
  MAPS_CONFIG,
  getWhatsAppURL,
  getEmailLink,
  getDirectionURL,
  isCurrentlyOpen,
  getOperationalStatus,
};
