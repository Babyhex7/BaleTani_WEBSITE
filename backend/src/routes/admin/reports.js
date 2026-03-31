const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../../middlewares/auth.middleware");
const reportController = require("../../controllers/adminReport.controller");
const stockMovementController = require("../../controllers/stockMovement.controller");

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

/**
 * GET /api/admin/reports/stock-movements
 * Get stock movements report with advanced filtering
 * Supports: product_id, movement_type, reference_type, date range filters
 */
router.get("/stock-movements", stockMovementController.getAllMovements);

module.exports = router;
