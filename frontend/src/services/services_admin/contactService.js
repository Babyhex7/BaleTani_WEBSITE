/**
 * ============================================
 * CONTACT MESSAGE SERVICE (ADMIN)
 * ============================================
 * API service untuk contact message management (admin)
 *
 * @module services_admin/contactService
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

import apiClient from "../../utils/apiClient";

const BASE_URL = "/admin/contacts";

/**
 * Get all contact messages with filters
 */
export const getAllMessages = async (params = {}) => {
  const response = await apiClient.get(BASE_URL, { params });
  return response.data;
};

/**
 * Get single contact message by ID
 */
export const getMessageById = async (id) => {
  const response = await apiClient.get(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Update message status
 */
export const updateStatus = async (id, data) => {
  const response = await apiClient.put(`${BASE_URL}/${id}/status`, data);
  return response.data;
};

/**
 * Update admin notes
 */
export const updateNotes = async (id, admin_notes) => {
  const response = await apiClient.put(`${BASE_URL}/${id}/notes`, {
    admin_notes,
  });
  return response.data;
};

/**
 * Delete contact message
 */
export const deleteMessage = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};

/**
 * Get contact statistics
 */
export const getStatistics = async () => {
  const response = await apiClient.get(`${BASE_URL}/stats`);
  return response.data;
};

export default {
  getAllMessages,
  getMessageById,
  updateStatus,
  updateNotes,
  deleteMessage,
  getStatistics,
};
