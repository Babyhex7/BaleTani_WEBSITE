import apiClient from "../services_customer/apiClient";

/**
 * Service untuk API Dashboard Admin
 * Mengambil statistik dan data dashboard
 */

// Mendapatkan statistik dashboard
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil statistik dashboard" }
    );
  }
};

// Mendapatkan pesanan terbaru
export const getRecentOrders = async (limit = 5) => {
  try {
    const response = await apiClient.get(`/admin/dashboard/recent-orders?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil pesanan terbaru" }
    );
  }
};

// Mendapatkan produk dengan stok menipis
export const getLowStockProducts = async (limit = 10) => {
  try {
    const response = await apiClient.get(
      `/admin/dashboard/low-stock?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Gagal mengambil data stok menipis" }
    );
  }
};

// Mendapatkan notifikasi admin
export const getAdminNotifications = async () => {
  try {
    const response = await apiClient.get("/admin/notifications");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal mengambil notifikasi" };
  }
};

// Menandai notifikasi sebagai dibaca
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(
      `/admin/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gagal menandai notifikasi" };
  }
};
