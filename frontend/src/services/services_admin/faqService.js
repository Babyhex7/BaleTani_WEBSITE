/**
 * ============================================
 * FAQ SERVICE (ADMIN)
 * ============================================
 * API service untuk FAQ management (admin)
 *
 * @module services_admin/faqService
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

import apiClient from "../../utils/apiClient";

const BASE_URL = "/admin/faqs";

/**
 * Get all FAQs with filters
 */
export const getAllFAQs = async (params = {}) => {
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
 * Create new FAQ
 */
export const createFAQ = async (data) => {
  const response = await apiClient.post(BASE_URL, data);
  return response.data;
};

/**
 * Update FAQ
 */
export const updateFAQ = async (id, data) => {
  const response = await apiClient.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

/**
 * Delete FAQ
 */
export const deleteFAQ = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Bulk update FAQ order
 */
export const bulkUpdateOrder = async (faqs) => {
  const response = await apiClient.put(`${BASE_URL}/bulk-order`, { faqs });
  return response.data;
};

/**
 * Get FAQ category statistics
 */
export const getCategoryStats = async () => {
  const response = await apiClient.get(`${BASE_URL}/categories/stats`);
  return response.data;
};

export default {
  getAllFAQs,
  getFAQById,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  bulkUpdateOrder,
  getCategoryStats,
};
