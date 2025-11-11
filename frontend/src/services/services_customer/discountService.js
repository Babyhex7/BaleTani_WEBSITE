/**
 * DISCOUNT SERVICE
 * API calls untuk public discount endpoints
 */

import apiClient from "./apiClient";

const discountService = {
  /**
   * Get all active discounts
   * Endpoint: GET /api/public/discounts
   */
  getAllDiscounts: async () => {
    try {
      const response = await apiClient.get('/public/discounts');
      return response.data;
    } catch (error) {
      console.error('Error fetching discounts:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get discount detail by ID
   * Endpoint: GET /api/public/discounts/:id
   */
  getDiscountById: async (id) => {
    try {
      const response = await apiClient.get(`/public/discounts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching discount detail:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get products in a discount
   * Endpoint: GET /api/public/discounts/:id/products
   */
  getDiscountProducts: async (id, page = 1, limit = 12) => {
    try {
      const response = await apiClient.get(`/public/discounts/${id}/products`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching discount products:', error);
      throw error.response?.data || error;
    }
  },
};

export default discountService;
