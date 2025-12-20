/**
 * CUSTOMER ORDER SERVICE
 * API calls for customer order operations
 */

import apiClient from "../../utils/apiClient";

const customerOrderService = {
  /**
   * Create order from checkout
   */
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post(
        "/customer/orders/create",
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("Create order error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Gagal membuat order",
        }
      );
    }
  },

  /**
   * Get customer's orders
   */
  getMyOrders: async (params = {}) => {
    try {
      const response = await apiClient.get("/customer/orders", { params });
      return response.data;
    } catch (error) {
      console.error("Get my orders error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Gagal mengambil data orders",
        }
      );
    }
  },

  /**
   * Get order detail
   */
  getOrderDetail: async (orderId) => {
    try {
      const response = await apiClient.get(`/customer/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Get order detail error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Gagal mengambil detail order",
        }
      );
    }
  },

  /**
   * Get order status (for polling in Order Success Page)
   */
  getOrderStatus: async (orderId) => {
    try {
      const response = await apiClient.get(
        `/customer/orders/${orderId}/status`
      );
      return response.data;
    } catch (error) {
      console.error("Get order status error:", error);
      throw (
        error.response?.data || {
          success: false,
          message: "Gagal mengambil status order",
        }
      );
    }
  },
};

export default customerOrderService;
