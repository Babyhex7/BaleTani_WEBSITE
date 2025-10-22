import apiClient from "../services_customer/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Procurement Service for Admin
 */

// Get all procurements
export const getAllProcurements = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/procurements${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single procurement
export const getProcurementById = async (procurementId) => {
  try {
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/procurements/${procurementId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create new procurement
export const createProcurement = async (procurementData) => {
  try {
    const response = await apiClient.post(
      `${API_BASE_URL}/admin/procurements`,
      procurementData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Approve procurement
export const approveProcurement = async (procurementId) => {
  try {
    const response = await apiClient.patch(
      `${API_BASE_URL}/admin/procurements/${procurementId}/approve`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reject procurement
export const rejectProcurement = async (procurementId, rejectionData) => {
  try {
    const response = await apiClient.patch(
      `${API_BASE_URL}/admin/procurements/${procurementId}/reject`,
      rejectionData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get procurement statistics
export const getProcurementStats = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(
      `${API_BASE_URL}/admin/procurements/stats${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const procurementService = {
  getAllProcurements,
  getProcurementById,
  createProcurement,
  approveProcurement,
  rejectProcurement,
  getProcurementStats,
};

export default procurementService;
