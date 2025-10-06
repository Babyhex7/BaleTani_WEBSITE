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

  // Login user (mendukung semua role: customer, admin, staff)
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);

      // Debug: log raw response structure
      if (import.meta.env.VITE_DEBUG_AUTH === 'true') {
        console.log('[DEBUG] Raw login response:', response.data);
      }

      // Backend returns: { success: true, message: '...', data: { user: {...}, token: '...' } }
      // So we need to access response.data.data.user and response.data.data.token
      if (response.data && response.data.success && response.data.data && response.data.data.user && response.data.data.token) {
        const { user, token } = response.data.data;

        // Validasi role yang valid
        const validRoles = ["customer", "admin", "staff"];
        if (!validRoles.includes(user.role)) {
          throw new Error("Role pengguna tidak valid");
        }

        return {
          user,
          token,
          message: response.data.message || "Login berhasil",
        };
      } else {
        console.error('Invalid response structure:', response.data);
        throw new Error("Response login tidak valid");
      }
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

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await apiClient.post("/auth/refresh");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiClient.patch(
        "/auth/change-password",
        passwordData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout (client-side only, bisa diperluas untuk server-side logout)
  logout: () => {
    // Bisa ditambahkan call ke endpoint logout jika diperlukan
    return Promise.resolve();
  },

  // Verify user role (helper function)
  verifyRole: (user, requiredRole) => {
    if (!user || !user.role) return false;

    // Admin bisa akses semua area kecuali yang spesifik customer
    if (user.role === "admin" && requiredRole !== "customer") {
      return true;
    }

    // Staff bisa akses area admin tertentu
    if (
      user.role === "staff" &&
      (requiredRole === "admin" || requiredRole === "staff")
    ) {
      return true;
    }

    // Customer hanya bisa akses area customer
    if (user.role === "customer" && requiredRole === "customer") {
      return true;
    }

    return user.role === requiredRole;
  },
};

export default authService;
