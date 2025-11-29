import apiClient from "./apiClient";

const authService = {
  // Register new customer
  register: async (userData) => {
    try {
      const response = await apiClient.post(
        "/customer/auth/register",
        userData
      );
      // Backend returns: { success: true, message: '...', data: { customer: {...}, token: '...' } }
      return response.data;
    } catch (error) {
      // Throw error dengan format yang konsisten
      throw (
        error.response?.data || { message: error.message || "Registrasi gagal" }
      );
    }
  },

  // Login user (mendukung semua role: customer, admin, staff)
  login: async (credentials) => {
    try {
      const response = await apiClient.post(
        "/customer/auth/login",
        credentials
      );

      // Debug: log raw response structure
      if (import.meta.env.VITE_DEBUG_AUTH === "true") {
        console.log("[AuthService] Login response:", response.data);
      }

      // Backend returns: { success: true, message: '...', data: { customer: {...}, token: '...' } }
      if (
        response.data &&
        response.data.success &&
        response.data.data &&
        response.data.data.customer &&
        response.data.data.token
      ) {
        const { customer, token } = response.data.data;

        return {
          customer,
          token,
          message: response.data.message || "Login berhasil",
        };
      } else {
        console.error("Invalid response structure:", response.data);
        throw new Error("Response login tidak valid");
      }
    } catch (error) {
      // Throw error dengan format yang konsisten
      // Jika error dari backend, gunakan error.response.data
      // Jika network error, gunakan error.message
      throw error.response?.data || { message: error.message || "Login gagal" };
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
