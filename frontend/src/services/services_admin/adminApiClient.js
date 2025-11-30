import axios from "axios";
import useAdminStore from "../../store/store_admin/useAdminStore";

/**
 * Admin API Client - Khusus untuk request admin
 * Menggunakan token dari useAdminStore
 */
const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // ✅ 15 second timeout (standardized)
});

// Request interceptor - tambahkan token admin
adminApiClient.interceptors.request.use(
  (config) => {
    const { token } = useAdminStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Admin API request
    } else {
      console.warn("[AdminAPI] Request without admin token:", config.url);
    }

    return config;
  },
  (error) => {
    console.error("[AdminAPI] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors with retry
adminApiClient.interceptors.response.use(
  (response) => {
    // Response received
    return response;
  },
  async (error) => {
    const { response, code, config } = error;

    // Enhanced error logging
    console.error("[AdminAPI] Response error:", {
      url: config?.url,
      status: response?.status,
      message: response?.data?.message || error.message,
      code,
      fullError: response?.data,
    });

    // ========================================
    // NO RETRY for auth endpoints
    // ========================================
    const isAuthEndpoint =
      config?.url?.includes("/auth/login") ||
      config?.url?.includes("/auth/register");

    // ✅ Retry logic ONLY for non-auth network errors (max 3 retries)
    if (!response && !isAuthEndpoint) {
      if (!config.__retryCount) {
        config.__retryCount = 0;
      }

      const shouldRetry =
        config.__retryCount < 3 &&
        (code === "ECONNABORTED" ||
          code === "ERR_NETWORK" ||
          code === "ETIMEDOUT");

      if (shouldRetry) {
        config.__retryCount++;
        console.log(`[AdminAPI] 🔄 Retrying (${config.__retryCount}/3)...`);

        // Exponential backoff: 1s, 2s, 3s
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * config.__retryCount)
        );

        return adminApiClient(config);
      }
    }

    // Handle 401 - Unauthorized (token expired atau invalid)
    if (response?.status === 401) {
      console.warn("[AdminAPI] Unauthorized - 401 error");

      // Don't auto-redirect if on login page (let the page handle it)
      const isOnLoginPage = window.location.pathname === "/admin/login";

      if (!isOnLoginPage) {
        console.warn("[AdminAPI] Auto logout - redirecting to login");
        const { logout } = useAdminStore.getState();
        logout();
        window.location.href = "/admin/login";
      }
    }

    // Handle 403 - Forbidden (tidak punya akses)
    if (response?.status === 403) {
      console.warn("[AdminAPI] Forbidden - insufficient permissions");
    }

    // ALWAYS reject the error so catch blocks can handle it
    return Promise.reject(error);
  }
);

export default adminApiClient;
