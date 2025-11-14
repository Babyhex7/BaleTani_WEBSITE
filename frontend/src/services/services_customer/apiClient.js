import axios from "axios";
import useAuthStore from "../../store/store_customer/useAuthStore";
import { debugLog } from "../../utils/debugLogger";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance with improved configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // ✅ 15 second timeout (standardized)
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Allow cookies untuk CORS
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { token, user, isAuthenticated } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    debugLog("API:REQ", `${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      isAuthenticated,
      userRole: user?.role,
      hasToken: !!token,
    });
    return config;
  },
  (error) => {
    debugLog("API:REQ", "Request error", { message: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors with retry logic
apiClient.interceptors.response.use(
  (response) => {
    debugLog(
      "API:RES",
      `${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        status: response.status,
        ok: true,
      }
    );
    return response;
  },
  async (error) => {
    const { response, message, code, config } = error;

    // Initialize retry count per request (not global)
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // ========================================
    // Handle Network Errors (Backend Down/CORS)
    // ========================================
    if (!response) {
      console.error("❌ Network Error:", {
        message: message || "Backend tidak merespon",
        code,
        url: config?.url,
      });

      // ✅ Retry logic untuk network errors (max 3 retries)
      const shouldRetry =
        config.__retryCount < 3 &&
        (code === "ECONNABORTED" ||
          code === "ERR_NETWORK" ||
          code === "ETIMEDOUT");

      if (shouldRetry) {
        config.__retryCount++;

        console.log(`🔄 Retrying request (${config.__retryCount}/3)...`);

        // Exponential backoff: 1s, 2s, 3s
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * config.__retryCount)
        );

        return apiClient(config);
      }

      // Tampilkan error yang user-friendly
      debugLog("API:RES", `Network Error after ${retryCount} retries`, {
        message:
          "Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000",
        url: config?.url,
      });

      return Promise.reject({
        message: "Tidak dapat terhubung ke server. Silakan coba lagi.",
        type: "NETWORK_ERROR",
        originalError: error,
      });
    }

    // Reset retry count jika dapat response
    retryCount = 0;

    debugLog(
      "API:RES",
      `Error for ${config?.method?.toUpperCase()} ${config?.url}`,
      {
        status: response?.status,
        code,
        message,
        data: response?.data,
      }
    );

    // ========================================
    // Handle HTTP Status Errors
    // ========================================
    if (response?.status === 401) {
      console.warn("⚠️ Unauthorized: Token expired atau tidak valid");
      useAuthStore.getState().logout();
      // Hindari infinite redirect loop jika sudah di /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (response?.status === 403) {
      console.error("❌ Access denied: Insufficient permissions");
    } else if (response?.status >= 500) {
      console.error(
        "❌ Server error:",
        response?.data?.message || "Internal server error"
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
