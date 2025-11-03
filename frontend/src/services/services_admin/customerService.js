/**
 * Customer Service - Admin API
 * Service untuk kelola customer di admin panel
 * Catatan: gunakan adminApiClient agar token admin otomatis terikut
 */

import adminApiClient from "./adminApiClient";

/**
 * Ambil semua customer dengan pagination dan filter
 */
export const getCustomers = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await adminApiClient.get(
      `/admin/customers${queryString ? `?${queryString}` : ""}`
    );
    return response.data;
  } catch (error) {
    console.error("Get customers error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Ambil detail customer by ID
 */
export const getCustomerById = async (id) => {
  try {
    const response = await adminApiClient.get(`/admin/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get customer by id error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Update data customer
 */
export const updateCustomer = async (id, data) => {
  try {
    const response = await adminApiClient.put(`/admin/customers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update customer error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Toggle status aktif customer
 */
export const toggleCustomerStatus = async (id) => {
  try {
    const response = await adminApiClient.patch(
      `/admin/customers/${id}/status`,
      {}
    );
    return response.data;
  } catch (error) {
    console.error("Toggle customer status error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete customer
 */
export const deleteCustomer = async (id) => {
  try {
    const response = await adminApiClient.delete(`/admin/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete customer error:", error);
    throw error.response?.data || error;
  }
};
