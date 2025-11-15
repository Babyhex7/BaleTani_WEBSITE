/**
 * ============================================
 * CONTACT SERVICE (CUSTOMER)
 * ============================================
 * API service untuk contact form submission (customer)
 *
 * @module services_customer/contactService
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

import apiClient from "../../utils/apiClient";

const BASE_URL = "/customer/contact";

/**
 * Submit contact form
 */
export const submitContactForm = async (data) => {
  const response = await apiClient.post(BASE_URL, data);
  return response.data;
};

/**
 * Get my contact messages (for logged in user)
 */
export const getMyMessages = async (params = {}) => {
  const response = await apiClient.get(`${BASE_URL}/my-messages`, { params });
  return response.data;
};

/**
 * Get single message detail
 */
export const getMyMessageById = async (id) => {
  const response = await apiClient.get(`${BASE_URL}/my-messages/${id}`);
  return response.data;
};

export default {
  submitContactForm,
  getMyMessages,
  getMyMessageById,
};
