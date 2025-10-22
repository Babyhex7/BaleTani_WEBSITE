const express = require("express");
const router = express.Router();
const stockController = require("../../controllers/adminStock.controller");
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");

// All routes require authentication and inventory roles
router.use(authenticateAdmin);
router.use(
  roleMiddleware([
    "super_admin",
    "super_inventory_admin",
    "inventory_admin",
    "finance_admin",
  ])
);

// GET stock overview summary
router.get("/overview", stockController.getStockOverview);

// GET low stock products
router.get("/low-stock", stockController.getLowStockProducts);

// GET out of stock products
router.get("/out-of-stock", stockController.getOutOfStockProducts);

// GET stock movement history
router.get("/movements", stockController.getStockMovements);

module.exports = router;
