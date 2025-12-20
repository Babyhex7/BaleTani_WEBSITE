/**
 * PRODUCT SERVICE FOR CUSTOMER
 * Handles all product-related API calls for customer side
 */

import apiClient from "../../utils/apiClient";

const productService = {
  /**
   * Get all products with filters and pagination
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @param {string} params.category - Category ID
   * @param {number} params.minPrice - Minimum price
   * @param {number} params.maxPrice - Maximum price
   * @param {string} params.sortBy - Sort option
   */
  getAllProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.category) queryParams.append("category", params.category);
      if (params.minPrice !== undefined)
        queryParams.append("minPrice", params.minPrice);
      if (params.maxPrice !== undefined)
        queryParams.append("maxPrice", params.maxPrice);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);

      // Build query params

      const response = await apiClient.get(
        `/public/products?${queryParams.toString()}`
      );

      // Map snake_case pagination to camelCase for internal use
      const data = response.data;
      if (data.success && data.data.pagination) {
        data.data.pagination = {
          currentPage: data.data.pagination.current_page || 1,
          totalPages: data.data.pagination.total_pages || 1,
          totalItems: data.data.pagination.total_items || 0,
          itemsPerPage: data.data.pagination.items_per_page || 12,
          hasNextPage: data.data.pagination.has_next_page || false,
          hasPrevPage: data.data.pagination.has_prev_page || false,
        };
      }

      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get product detail by ID
   * @param {string} productId - Product ID
   */
  getProductDetail: async (productId) => {
    try {
      const response = await apiClient.get(`/public/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * ❌ DEPRECATED - getFeaturedProducts dihapus
   * ✅ Sekarang pakai: discountService.getAllDiscounts()
   * Alasan: Endpoint /api/public/discounts lebih spesifik untuk promo
   */

  /**
   * Get all categories
   */
  getCategories: async () => {
    try {
      const response = await apiClient.get("/public/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error.response?.data || error;
    }
  },
};

export default productService;
