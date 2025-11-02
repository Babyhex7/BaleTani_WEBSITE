/**
 * Order Service
 * Handle semua API calls untuk order management
 */

import api from "./services_admin/adminApiClient";

const orderService = {
  /**
   * Get all orders with filters and pagination
   */
  getAllOrders: async (params = {}) => {
    const {
      page = 1,
      limit = 10,
      order_status,
      payment_status,
      order_type,
      payment_method,
      delivery_method,
      date_from,
      date_to,
      search,
      sort_by = "created_at",
      sort_order = "DESC",
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by,
      sort_order,
    });

    if (order_status) queryParams.append("order_status", order_status);
    if (payment_status) queryParams.append("payment_status", payment_status);
    if (order_type) queryParams.append("order_type", order_type);
    if (payment_method) queryParams.append("payment_method", payment_method);
    if (delivery_method) queryParams.append("delivery_method", delivery_method);
    if (date_from) queryParams.append("date_from", date_from);
    if (date_to) queryParams.append("date_to", date_to);
    if (search) queryParams.append("search", search);

    const response = await api.get(`/admin/orders?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get order by ID
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId, data) => {
    const response = await api.put(`/admin/orders/${orderId}/status`, data);
    return response.data;
  },

  /**
   * Update admin notes
   */
  updateAdminNotes: async (orderId, notes) => {
    const response = await api.put(`/admin/orders/${orderId}/notes`, {
      admin_notes: notes,
    });
    return response.data;
  },

  /**
   * Cancel order
   */
  cancelOrder: async (orderId, reason) => {
    const response = await api.put(`/admin/orders/${orderId}/cancel`, {
      cancelled_reason: reason,
    });
    return response.data;
  },

  /**
   * Get order statistics
   */
  getStatistics: async (params = {}) => {
    const { date_from, date_to } = params;

    const queryParams = new URLSearchParams();
    if (date_from) queryParams.append("date_from", date_from);
    if (date_to) queryParams.append("date_to", date_to);

    const response = await api.get(
      `/admin/orders/statistics?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Create offline order (manual input by admin)
   */
  createOfflineOrder: async (orderData) => {
    const response = await api.post("/admin/orders/create-offline", orderData);
    return response.data;
  },
};

export default orderService;
