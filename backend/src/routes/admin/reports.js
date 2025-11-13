const express = require("express");
const router = express.Router();
const {
  getSalesReport,
  getProcurementReport,
  getStockMovementReport,
  getFinanceReport
} = require("../../controllers/adminReport.controller");
const { authenticateAdmin } = require("../../middlewares/auth.middleware");

/**
 * Admin Report Routes
 * Base path: /api/admin/reports
 * All routes require admin authentication
 */

// Sales Report
router.get("/sales", authenticateAdmin, getSalesReport);

// Procurement Report
router.get("/procurement", authenticateAdmin, getProcurementReport);

// Stock Movement Report
router.get("/stock-movement", authenticateAdmin, getStockMovementReport);

// Finance Report
router.get("/finance", authenticateAdmin, getFinanceReport);

module.exports = router;
