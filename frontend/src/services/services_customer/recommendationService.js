/**
 * Recommendation Service - Frontend
 * Service untuk call recommendation API dari backend
 */

import apiClient from "../../utils/apiClient";

/**
 * Get similar products recommendations
 * @param {string} productId - UUID produk
 * @param {number} topK - Jumlah recommendations (default: 5)
 * @returns {Promise<Object>} Recommendation results
 */
export const getSimilarProducts = async (productId, topK = 5) => {
  try {
    const response = await apiClient.get(
      `/recommendations/similar/${productId}`,
      {
        params: { top_k: topK },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error getting similar products:", error);
    throw error;
  }
};

/**
 * Get bundle recommendations (for cart/multiple products)
 * @param {Array<string>} productIds - Array of product UUIDs
 * @param {number} topK - Jumlah recommendations (default: 5)
 * @returns {Promise<Object>} Bundle recommendation results
 */
export const getBundleRecommendations = async (productIds, topK = 5) => {
  try {
    const response = await apiClient.post(
      `/recommendations/bundle`,
      {
        productIds: productIds,
      },
      {
        params: { top_k: topK },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error getting bundle recommendations:", error);
    throw error;
  }
};

/**
 * Get trending products (popular items)
 * @param {number} topK - Jumlah products (default: 10)
 * @param {string} categoryId - Optional category UUID filter
 * @returns {Promise<Object>} Trending products
 */
export const getTrendingProducts = async (topK = 10, categoryId = null) => {
  try {
    const params = { top_k: topK };
    if (categoryId) {
      params.category_id = categoryId;
    }

    const response = await apiClient.get(`/recommendations/trending`, {
      params,
    });

    console.log("📊 Trending API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting trending products:", error);
    throw error;
  }
};

/**
 * Reload ML model (admin only)
 * @returns {Promise<Object>} Reload status
 */
export const reloadMLModel = async () => {
  try {
    const response = await apiClient.post(`/recommendations/admin/reload`);
    return response.data;
  } catch (error) {
    console.error("Error reloading ML model:", error);
    throw error;
  }
};

/**
 * Get ML model status (admin only)
 * @returns {Promise<Object>} Model status
 */
export const getMLModelStatus = async () => {
  try {
    const response = await apiClient.get(`/recommendations/admin/model-status`);
    return response.data;
  } catch (error) {
    console.error("Error getting ML model status:", error);
    throw error;
  }
};

export default {
  getSimilarProducts,
  getBundleRecommendations,
  getTrendingProducts,
  reloadMLModel,
  getMLModelStatus,
};
