const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../../middlewares/auth.middleware");
const reportController = require("../../controllers/adminReport.controller");

/**
 * ============================================
 * REPORT ROUTES
 * Base path: /api/admin/reports
 * ============================================
 */

// Apply admin authentication to all routes
router.use(authenticateAdmin);

/**
 * GET /api/admin/reports/sales
 * Get sales report with filters
 */
router.get("/sales", reportController.getSalesReport);

/**
 * GET /api/admin/reports/procurement
 * Get procurement report
 */
router.get("/procurement", reportController.getProcurementReport);

/**
 * GET /api/admin/reports/inventory
 * Get inventory report with stock info
 */
router.get("/inventory", reportController.getInventoryReport);

module.exports = router;
