import apiClient from "./apiClient";

// Helper untuk normalisasi bentuk response API agar fleksibel
// Backend saat ini mengembalikan: { success, message, data: { user, token } }
// Tapi kita buat robust jika nanti diubah jadi { user, token }
const extractAuthPayload = (raw) => {
  if (!raw) return {};
  // Coba bentuk baru lebih datar
  if (raw.user && raw.token) {
    return { user: raw.user, token: raw.token, message: raw.message };
  }
  // Bentuk saat ini (dengan nesting data)
  if (raw.data && raw.data.user && raw.data.token) {
    return {
      user: raw.data.user,
      token: raw.data.token,
      message: raw.message,
    };
  }
  return {};
};

const validRoles = ["customer", "admin", "staff"];

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      const payload = extractAuthPayload(response.data);
      if (payload.user && payload.token) return payload;
      // Fallback: mungkin hanya mengembalikan data user di dalam data
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login user (mendukung semua role: customer, admin, staff)
  login: async (credentials) => {
    try {
      const response = await apiClient.post("/auth/login", credentials);
      const payload = extractAuthPayload(response.data);

      if (!payload.user || !payload.token) {
        throw new Error("Response login tidak valid");
      }

      if (!validRoles.includes(payload.user.role)) {
        throw new Error("Role pengguna tidak valid");
      }

      return {
        user: payload.user,
        token: payload.token,
        message: payload.message || "Login berhasil",
      };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get("/auth/profile");
      // Backend: { success, data: { user } }
      const user = response.data?.user || response.data?.data?.user;
      if (!user) return response.data;
      return { user };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Refresh token (jika nanti ditambahkan di backend)
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

  // Logout (client-side only)
  logout: () => Promise.resolve(),

  // Verify user role (helper function)
  verifyRole: (user, requiredRole) => {
    if (!user || !user.role) return false;

    if (user.role === "admin" && requiredRole !== "customer") return true;
    if (
      user.role === "staff" &&
      (requiredRole === "admin" || requiredRole === "staff")
    )
      return true;
    if (user.role === "customer" && requiredRole === "customer") return true;
    return user.role === requiredRole;
  },
};

export default authService;
