import axios from "axios";
import useAuthStore from "../../store/store_customer/useAuthStore";
import { debugLog } from "../../utils/debugLogger";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { token, user, isAuthenticated } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    debugLog('API:REQ', `${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      isAuthenticated,
      userRole: user?.role,
      hasToken: !!token,
    });
    return config;
  },
  (error) => {
    debugLog('API:REQ', 'Request error', { message: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    debugLog('API:RES', `${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      ok: true,
    });
    return response;
  },
  (error) => {
    const { response, message, code, config } = error;
    debugLog('API:RES', `Error for ${config?.method?.toUpperCase()} ${config?.url}`, {
      status: response?.status,
      code,
      message,
      data: response?.data,
    });

    if (response?.status === 401) {
      useAuthStore.getState().logout();
      // Hindari infinite redirect loop jika sudah di /login
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    } else if (response?.status === 403) {
      console.error("Access denied: Insufficient permissions");
    } else if (response?.status >= 500) {
      console.error(
        "Server error:",
        response?.data?.message || "Internal server error"
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
