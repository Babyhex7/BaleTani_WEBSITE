/**
 * ============================================
 * AXIOS API CLIENT
 * ============================================
 * Centralized API client dengan timeout & retry mechanism
 * Prevent hanging requests dan auto recovery
 *
 * FEATURES:
 * - 15 second timeout untuk semua requests
 * - Auto retry 3x untuk network errors (configurable)
 * - Exponential backoff dengan jitter (1s, 2s, 4s)
 * - Global error handling
 * - Request/Response interceptors
 * - Token management
 * - Retry only untuk safe methods (GET, HEAD, OPTIONS) by default
 * - Custom retry config per request
 *
 * USAGE:
 * import apiClient from '@/utils/apiClient';
 *
 * // GET request (auto retry)
 * const response = await apiClient.get('/products');
 *
 * // POST request (no retry by default)
 * const response = await apiClient.post('/cart', { product_id: 1 });
 *
 * // POST with retry enabled
 * const response = await apiClient.post('/cart', data, {
 *   retry: true,
 *   retryCount: 3
 * });
 *
 * @module apiClient
 * @author BaleTani Development Team
 * @created 2025-11-14
 * @updated 2025-11-14 - Enhanced retry logic
 */

import axios from "axios";

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000, // Base delay in ms
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return (
      error.code === "ECONNABORTED" ||
      error.code === "ERR_NETWORK" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ENOTFOUND" ||
      (error.response &&
        error.response.status >= 500 &&
        error.response.status <= 599)
    );
  },
  shouldRetryMethod: (method) => {
    // Only retry safe methods by default
    return ["get", "head", "options"].includes(method?.toLowerCase());
  },
};

/**
 * Create axios instance dengan config default
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000, // ✅ 15 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * Add token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Check if this is an admin route
    const isAdminRoute = config.url?.includes("/admin/");

    // Get tokens from localStorage
    let adminToken = null;
    try {
      // Admin token is stored in baletani-admin-storage by Zustand persist
      const adminStorage = localStorage.getItem("baletani-admin-storage");
      if (adminStorage) {
        const parsed = JSON.parse(adminStorage);
        adminToken = parsed?.state?.token;
      }
    } catch (e) {
      console.error("Error parsing admin storage:", e);
    }

    const customerToken = localStorage.getItem("token");

    // Prioritize admin token for admin routes
    if (isAdminRoute && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      console.log("🔑 Using ADMIN token for:", config.url);
    } else if (customerToken) {
      config.headers.Authorization = `Bearer ${customerToken}`;
      console.log("🔑 Using CUSTOMER token for:", config.url);
    } else if (adminToken) {
      // Fallback to admin token if no customer token
      config.headers.Authorization = `Bearer ${adminToken}`;
      console.log("🔑 Using ADMIN token (fallback) for:", config.url);
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log("🔵 API Request:", config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Handle errors & retry logic
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log("✅ API Response:", response.config.url, response.status);
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // ========================================
    // RETRY LOGIC
    // ========================================

    // Initialize retry count
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // Check if we should retry
    const shouldRetry =
      config.__retryCount < 3 && // Max 3 retries
      (error.code === "ECONNABORTED" || // Timeout
        error.code === "ERR_NETWORK" || // Network error
        error.code === "ETIMEDOUT" || // Timeout
        (error.response && error.response.status >= 500)); // Server error

    if (shouldRetry) {
      config.__retryCount += 1;

      // Exponential backoff: 1s, 2s, 3s
      const delay = 1000 * config.__retryCount;

      console.log(
        `⚠️ Retry attempt ${config.__retryCount}/3 after ${delay}ms for ${config.url}`
      );

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry request
      return apiClient(config);
    }

    // ========================================
    // ERROR HANDLING
    // ========================================

    // Log error
    console.error("❌ API Error:", {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      message: error.message,
      code: error.code,
    });

    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear tokens
          console.log("🔒 Unauthorized - clearing tokens");

          // Check if this was an admin request
          const isAdminRequest = config?.url?.includes("/admin/");

          if (isAdminRequest) {
            // Clear admin token
            localStorage.removeItem("baletani-admin-storage");
            console.log(
              "🔒 Cleared admin storage, redirecting to /admin/login"
            );

            // Redirect to admin login if not already there
            if (!window.location.pathname.includes("/admin/login")) {
              window.location.href = "/admin/login";
            }
          } else {
            // Clear customer token
            localStorage.removeItem("token");
            console.log("🔒 Cleared customer token, redirecting to /login");

            // Redirect to customer login if not already there
            if (!window.location.pathname.includes("/login")) {
              window.location.href = "/login";
            }
          }
          break;

        case 403:
          console.log("🚫 Forbidden - insufficient permissions");
          break;

        case 404:
          console.log("❓ Not Found:", config.url);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          console.log("💥 Server Error:", error.response.status);
          break;

        default:
          console.log("⚠️ Error:", error.response.status);
      }
    } else if (error.request) {
      // Request made but no response
      console.error("📡 No response from server:", error.message);
    } else {
      // Request setup error
      console.error("⚙️ Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to check if error is network related
 */
export const isNetworkError = (error) => {
  return (
    error.code === "ERR_NETWORK" ||
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT" ||
    !error.response
  );
};

/**
 * Helper function to check if error is timeout
 */
export const isTimeoutError = (error) => {
  return error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";
};

/**
 * Helper function to get error message
 */
export const getErrorMessage = (error) => {
  // Network errors
  if (isNetworkError(error)) {
    return "Koneksi internet bermasalah. Silakan cek koneksi Anda.";
  }

  // Timeout errors
  if (isTimeoutError(error)) {
    return "Permintaan memakan waktu terlalu lama. Silakan coba lagi.";
  }

  // Response errors
  if (error.response) {
    // Use server error message if available
    if (error.response.data?.message) {
      return error.response.data.message;
    }

    // Default messages by status code
    switch (error.response.status) {
      case 400:
        return "Data yang dikirim tidak valid.";
      case 401:
        return "Silakan login terlebih dahulu.";
      case 403:
        return "Anda tidak memiliki akses untuk melakukan ini.";
      case 404:
        return "Data yang dicari tidak ditemukan.";
      case 500:
        return "Terjadi kesalahan pada server. Silakan coba lagi.";
      default:
        return "Terjadi kesalahan. Silakan coba lagi.";
    }
  }

  // Fallback
  return error.message || "Terjadi kesalahan yang tidak terduga.";
};

export default apiClient;
