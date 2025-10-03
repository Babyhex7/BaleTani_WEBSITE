import apiClient from "./apiClient";

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout (client-side only)
  logout: () => {
    // This could be extended to call a logout endpoint if needed
    return Promise.resolve();
  },
};

export default authService;
