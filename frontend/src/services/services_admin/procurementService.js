import adminApiClient from "./adminApiClient";

const procurementService = {
  /**
   * Get all procurements with filters
   */
  getAllProcurements: async (params = {}) => {
    const response = await adminApiClient.get("/admin/procurements", { params });
    return response.data;
  },

  /**
   * Get procurement by ID
   */
  getProcurementById: async (id) => {
    const response = await adminApiClient.get(`/admin/procurements/${id}`);
    return response.data;
  },

  /**
   * Create new procurement
   */
  createProcurement: async (data) => {
    const response = await adminApiClient.post("/admin/procurements", data);
    return response.data;
  },

  /**
   * Update procurement (pending only)
   */
  updateProcurement: async (id, data) => {
    const response = await adminApiClient.put(`/admin/procurements/${id}`, data);
    return response.data;
  },

  /**
   * Approve procurement
   */
  approveProcurement: async (id, data = {}) => {
    const response = await adminApiClient.put(
      `/admin/procurements/${id}/approve`,
      data
    );
    return response.data;
  },

  /**
   * Reject procurement
   */
  rejectProcurement: async (id, data) => {
    const response = await adminApiClient.put(
      `/admin/procurements/${id}/reject`,
      data
    );
    return response.data;
  },

  /**
   * Soft delete procurement
   */
  deleteProcurement: async (id, data = {}) => {
    const response = await adminApiClient.delete(`/admin/procurements/${id}`, {
      data,
    });
    return response.data;
  },

  /**
   * Restore soft deleted procurement
   */
  restoreProcurement: async (id) => {
    const response = await adminApiClient.post(`/admin/procurements/${id}/restore`);
    return response.data;
  },
};

export default procurementService;
