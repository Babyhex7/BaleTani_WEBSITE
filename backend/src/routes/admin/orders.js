/**
 * Admin Order Routes
 * Routes for managing orders (admin only)
 */

const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateAdminNotes,
  cancelOrder,
  getOrderStatistics,
  createOfflineOrder,
} = require("../../controllers/adminOrder.controller");
const { authenticateAdmin } = require("../../middlewares/auth.middleware");

// All routes require admin authentication
router.use(authenticateAdmin);

// Statistics - Must be before /:id route
router.get("/statistics", getOrderStatistics);

// CRUD Operations
router.get("/", getAllOrders);
router.post("/create-offline", createOfflineOrder);
router.get("/:id", getOrderById);
router.put("/:id/status", updateOrderStatus);
router.put("/:id/notes", updateAdminNotes);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
