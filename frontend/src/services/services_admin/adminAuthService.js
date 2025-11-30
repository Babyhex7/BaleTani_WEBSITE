import adminApiClient from "./adminApiClient";

/**
 * Admin Authentication Service
 * Handle login, logout, dan auth-related operations untuk admin
 */
const adminAuthService = {
  /**
   * Login admin
   * @param {Object} credentials - { phone_number, password }
   * @returns {Promise} Response dengan admin data dan token
   */
  login: async (credentials) => {
    try {
      console.log("[AdminAuthService] Login attempt:", {
        phone_number: credentials.phone_number,
      });

      const response = await adminApiClient.post(
        "/admin/auth/login",
        credentials
      );

      if (response.data && response.data.success) {
        const { user, token } = response.data.data;

        // Normalize role ke string untuk memudahkan checking
        const normalizedAdmin = {
          ...user,
          role:
            typeof user.role === "string"
              ? user.role
              : user.role?.name || user.role?.role_name || "admin",
          // Simpan permissions array dari backend RBAC
          permissions: user.permissions || [],
        };

        console.log("[AdminAuthService] Login success:", {
          admin: normalizedAdmin,
          hasToken: !!token,
          permissions: normalizedAdmin.permissions.length,
        });

        return {
          admin: normalizedAdmin,
          token,
          permissions: normalizedAdmin.permissions,
          message: response.data.message || "Login berhasil",
        };
      } else {
        throw new Error("Response login tidak valid");
      }
    } catch (error) {
      console.error("[AdminAuthService] Login error:", error);
      console.error("[AdminAuthService] Error response:", error.response?.data);
      console.error("[AdminAuthService] Error status:", error.response?.status);

      // Enhanced error handling with specific messages
      if (error.response) {
        // Server responded with error
        const errorData = error.response.data;
        const errorObj = {
          message: errorData?.message || "Login gagal. Silakan coba lagi.",
          status: error.response.status,
          code: errorData?.code || "SERVER_ERROR",
        };
        console.log("[AdminAuthService] Throwing error:", errorObj);
        throw errorObj;
      } else if (error.request) {
        // Request made but no response
        const errorObj = {
          message:
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
          code: "NETWORK_ERROR",
        };
        console.log("[AdminAuthService] Throwing network error:", errorObj);
        throw errorObj;
      } else {
        // Something else happened
        const errorObj = {
          message: error.message || "Login gagal",
          code: "UNKNOWN_ERROR",
        };
        console.log("[AdminAuthService] Throwing unknown error:", errorObj);
        throw errorObj;
      }
    }
  },

  /**
   * Logout admin
   * Note: Ini hanya client-side logout, bisa ditambahkan server-side jika perlu
   */
  logout: async () => {
    try {
      // Logout
      // Bisa tambahkan call ke backend untuk invalidate token jika perlu
      // await adminApiClient.post('/admin/auth/logout');
      return { success: true };
    } catch (error) {
      console.error("[AdminAuthService] Logout error:", error);
      // Tetap return success karena logout client-side harus berhasil
      return { success: true };
    }
  },

  /**
   * Get admin profile
   */
  getProfile: async () => {
    try {
      const response = await adminApiClient.get("/admin/auth/profile");
      return response.data;
    } catch (error) {
      console.error("[AdminAuthService] Get profile error:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    try {
      const response = await adminApiClient.post("/admin/auth/refresh");
      return response.data;
    } catch (error) {
      console.error("[AdminAuthService] Refresh token error:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    try {
      const response = await adminApiClient.patch(
        "/admin/auth/change-password",
        passwordData
      );
      return response.data;
    } catch (error) {
      console.error("[AdminAuthService] Change password error:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Verify if user is admin
   */
  verifyAdminRole: (admin) => {
    if (!admin || !admin.role) return false;

    const adminRoles = [
      "admin",
      "staff",
      "super_admin",
      "super_whatsapp_admin",
      "super_cashier",
      "whatsapp_admin",
      "cashier",
      "finance_admin",
      "inventory_admin",
      "super_inventory_admin",
    ];

    const role =
      typeof admin.role === "string" ? admin.role : admin.role?.role_name;
    return adminRoles.includes(role);
  },
};

export default adminAuthService;
