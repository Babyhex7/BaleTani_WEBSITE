/**
 * STOCK MOVEMENT ROUTES
 * Routes untuk mengakses stock movement history dan summary
 */

const express = require("express");
const router = express.Router();
const stockMovementController = require("../../controllers/stockMovement.controller");
const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/rbac");

/**
 * ADMIN ROUTES
 */

// Get stock history untuk suatu produk
router.get(
  "/admin/products/:product_id/stock-history",
  authenticate,
  authorize(["super_admin", "super_inventory_admin", "inventory_admin"]),
  stockMovementController.getStockHistory
);

// Get stock summary untuk suatu produk
router.get(
  "/admin/products/:product_id/stock-summary",
  authenticate,
  authorize(["super_admin", "super_inventory_admin", "inventory_admin"]),
  stockMovementController.getStockSummary
);

// Get all stock movements (advanced filtering)
router.get(
  "/admin/stock-movements",
  authenticate,
  authorize(["super_admin", "super_inventory_admin", "inventory_admin", "finance_admin"]),
  stockMovementController.getAllMovements
);

/**
 * PUBLIC ROUTES
 */

// Get public stock status (customers can see)
router.get(
  "/public/products/:product_id/stock-status",
  stockMovementController.getPublicStockStatus
);

module.exports = router;
