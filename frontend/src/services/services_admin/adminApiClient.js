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
  timeout: 10000,
});

// Request interceptor - tambahkan token admin
adminApiClient.interceptors.request.use(
  (config) => {
    const { token } = useAdminStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[AdminAPI] Request with admin token:", {
        url: config.url,
        method: config.method,
        hasToken: !!token,
      });
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

// Response interceptor - handle errors
adminApiClient.interceptors.response.use(
  (response) => {
    console.log("[AdminAPI] Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[AdminAPI] Response error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Handle 401 - Unauthorized (token expired atau invalid)
    if (error.response?.status === 401) {
      console.warn("[AdminAPI] Unauthorized - logging out admin");
      const { logout } = useAdminStore.getState();
      logout();

      // Redirect ke admin login
      window.location.href = "/admin/login";
    }

    // Handle 403 - Forbidden (tidak punya akses)
    if (error.response?.status === 403) {
      console.warn("[AdminAPI] Forbidden - insufficient permissions");
    }

    return Promise.reject(error);
  }
);

export default adminApiClient;
