import adminApiClient from "./adminApiClient";

const reportService = {
  /**
   * Get sales report
   */
  getSalesReport: async (params = {}) => {
    const response = await adminApiClient.get("/admin/reports/sales", { params });
    return response.data;
  },

  /**
   * Get procurement report
   */
  getProcurementReport: async (params = {}) => {
    const response = await adminApiClient.get("/admin/reports/procurement", {
      params,
    });
    return response.data;
  },

  /**
   * Get inventory report
   */
  getInventoryReport: async (params = {}) => {
    const response = await adminApiClient.get("/admin/reports/inventory", {
      params,
    });
    return response.data;
  },
};

export default reportService;
