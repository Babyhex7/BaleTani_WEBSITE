/**
 * ============================================
 * FAQ SERVICE (CUSTOMER/PUBLIC)
 * ============================================
 * API service untuk FAQ (customer view)
 *
 * @module services_customer/faqService
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

import apiClient from "../../utils/apiClient";

const BASE_URL = "/public/faqs";

/**
 * Get all active FAQs
 */
export const getActiveFAQs = async (params = {}) => {
  const response = await apiClient.get(BASE_URL, { params });
  return response.data;
};

/**
 * Get single FAQ by ID
 */
export const getFAQById = async (id) => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Get FAQ categories
 */
export const getCategories = async () => {
  const response = await apiClient.get(`${BASE_URL}/categories`);
  return response.data;
};

export default {
  getActiveFAQs,
  getFAQById,
  getCategories,
};
