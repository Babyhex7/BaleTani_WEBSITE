import apiClient from "../../utils/apiClient";

/**
 * Order History Service
 * Service untuk mengelola order history customer
 */

/**
 * Get customer orders with filters and pagination
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search by order number or product name
 * @param {string} params.status - Filter by status (all, pending_payment, paid, processing, completed, cancelled)
 * @param {string} params.date_range - Filter by date (7, 30, 90 days)
 * @param {string} params.sort - Sort by (newest, oldest, highest, lowest)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await apiClient.get("/customer/orders/history", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error.response?.data || { message: "Failed to fetch orders" };
  }
};

/**
 * Get order detail by ID
 * @param {string} orderId - Order ID
 */
export const getOrderDetail = async (orderId) => {
  try {
    const response = await apiClient.get(`/customer/orders/history/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order detail:", error);
    throw error.response?.data || { message: "Failed to fetch order detail" };
  }
};

/**
 * Reorder - Add all items from order to cart
 * @param {string} orderId - Order ID
 */
export const reorderItems = async (orderId) => {
  try {
    const response = await apiClient.post(
      `/customer/orders/${orderId}/reorder`
    );
    return response.data;
  } catch (error) {
    console.error("Error reordering items:", error);
    throw error.response?.data || { message: "Failed to reorder items" };
  }
};

/**
 * Cancel order
 * @param {string} orderId - Order ID
 * @param {string} reason - Cancellation reason
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await apiClient.put(`/customer/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error.response?.data || { message: "Failed to cancel order" };
  }
};

/**
 * Get order statistics
 * @param {string} customerId - Customer ID
 */
export const getOrderStats = async () => {
  try {
    // Stats are included in getOrders response
    const response = await getOrders({ limit: 1 });
    return response.data.stats;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      total_orders: 0,
      total_spending: 0,
      completed_orders: 0,
      pending_orders: 0,
    };
  }
};

/**
 * Format order status to Indonesian
 */
export const formatOrderStatus = (status) => {
  const statusMap = {
    pending_payment: "Menunggu Pembayaran",
    paid: "Dibayar",
    processing: "Diproses",
    ready_for_pickup: "Siap Diambil",
    out_for_delivery: "Dalam Pengiriman",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return statusMap[status] || status;
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colorMap = {
    pending_payment: "bg-orange-100 text-orange-700 border-orange-300",
    paid: "bg-blue-100 text-blue-700 border-blue-300",
    processing: "bg-purple-100 text-purple-700 border-purple-300",
    ready_for_pickup: "bg-indigo-100 text-indigo-700 border-indigo-300",
    out_for_delivery: "bg-cyan-100 text-cyan-700 border-cyan-300",
    completed: "bg-green-100 text-green-700 border-green-300",
    cancelled: "bg-red-100 text-red-700 border-red-300",
  };
  return colorMap[status] || "bg-gray-100 text-gray-700 border-gray-300";
};

/**
 * Format payment method to Indonesian
 */
export const formatPaymentMethod = (method) => {
  const methodMap = {
    bank_transfer: "Transfer Bank",
    cod: "Bayar di Tempat",
    e_wallet: "E-Wallet",
    cash: "Tunai",
    transfer: "Transfer",
    qris: "QRIS",
  };
  return methodMap[method] || method;
};

/**
 * Get WhatsApp contact link
 */
export const getWhatsAppLink = (orderNumber) => {
  const phone = "6281234567890"; // Ganti dengan nomor admin
  const message = encodeURIComponent(
    `Halo Admin BaleTani,\n\nSaya ingin bertanya tentang pesanan saya:\nNomor Order: ${orderNumber}\n\nTerima kasih.`
  );
  return `https://wa.me/${phone}?text=${message}`;
};

export default {
  getOrders,
  getOrderDetail,
  reorderItems,
  cancelOrder,
  getOrderStats,
  formatOrderStatus,
  getStatusColor,
  formatPaymentMethod,
  getWhatsAppLink,
};
