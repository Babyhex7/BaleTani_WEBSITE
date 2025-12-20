/**
 * CATEGORY SERVICE FOR CUSTOMER
 * Handles all category-related API calls for customer side
 */

import apiClient from "../../utils/apiClient";

const categoryService = {
  /**
   * Get all categories
   * @returns {Promise} Category list
   */
  getAllCategories: async () => {
    try {
      const response = await apiClient.get("/public/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get category detail with products
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @param {string} params.sort_by - Sort field
   * @param {string} params.sort_order - Sort order (ASC/DESC)
   */
  getCategoryDetail: async (categoryId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.search) queryParams.append("search", params.search);
      if (params.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params.sort_order)
        queryParams.append("sort_order", params.sort_order);

      const response = await apiClient.get(
        `/public/categories/${categoryId}?${queryParams.toString()}`
      );

      // Map snake_case pagination to camelCase for internal use
      const data = response.data;
      if (data.success && data.data.pagination) {
        data.data.pagination = {
          currentPage: data.data.pagination.current_page || 1,
          totalPages: data.data.pagination.total_pages || 1,
          totalItems: data.data.pagination.total_items || 0,
          itemsPerPage: data.data.pagination.items_per_page || 12,
        };
      }

      return data;
    } catch (error) {
      console.error("Error fetching category detail:", error);
      throw error.response?.data || error;
    }
  },
};

export default categoryService;
