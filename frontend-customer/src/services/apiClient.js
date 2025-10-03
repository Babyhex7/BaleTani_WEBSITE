import axios from "axios";
import useAuthStore from "../store/useAuthStore";

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
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle different error status codes
    if (response?.status === 401) {
      // Unauthorized - clear auth data
      useAuthStore.getState().logout();
      window.location.href = "/login";
    } else if (response?.status === 403) {
      // Forbidden - insufficient permissions
      console.error("Access denied: Insufficient permissions");
    } else if (response?.status >= 500) {
      // Server error
      console.error(
        "Server error:",
        response?.data?.message || "Internal server error"
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
