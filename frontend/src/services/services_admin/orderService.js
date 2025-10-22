import apiClient from "../services_customer/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Order Service for Admin
 */

// Get all orders
export const getAllOrders = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/orders${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single order
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/orders/${orderId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/admin/orders`,
      orderData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await apiClient.patch(
      `${API_BASE_URL}/admin/orders/${orderId}/status`,
      statusData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel order
export const cancelOrder = async (orderId, cancellationData) => {
  try {
    const response = await apiClient.patch(
      `${API_BASE_URL}/admin/orders/${orderId}/cancel`,
      cancellationData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get order statistics
export const getOrderStats = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/orders/stats${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const orderService = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
};

export default orderService;
