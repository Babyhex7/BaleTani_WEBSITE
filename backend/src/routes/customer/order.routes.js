/**
 * CUSTOMER ORDER ROUTES
 * Routes for customer order management
 */

const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderDetail,
} = require("../../controllers/customerOrder.controller");
const {
  getCustomerOrders,
  getOrderDetail: getOrderHistoryDetail,
  reorderItems,
  cancelOrder,
  triggerManualCancel,
} = require("../../controllers/customerOrderHistory.controller");
const { authenticateCustomer } = require("../../middlewares/auth.middleware");

/**
 * @route   POST /api/customer/orders/create
 * @desc    Create new order (requires login)
 * @access  Private (Customer only)
 */
router.post("/create", authenticateCustomer, createOrder);

/**
 * @route   GET /api/customer/orders/history
 * @desc    Get customer's order history with filters & pagination
 * @access  Private (Customer only)
 */
router.get("/history", authenticateCustomer, getCustomerOrders);

/**
 * @route   GET /api/customer/orders/history/:id
 * @desc    Get order history detail with timeline
 * @access  Private (Customer only)
 */
router.get("/history/:id", authenticateCustomer, getOrderHistoryDetail);

/**
 * @route   POST /api/customer/orders/:id/reorder
 * @desc    Reorder - add all items from order to cart
 * @access  Private (Customer only)
 */
router.post("/:id/reorder", authenticateCustomer, reorderItems);

/**
 * @route   PUT /api/customer/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (Customer only)
 */
router.put("/:id/cancel", authenticateCustomer, cancelOrder);

/**
 * @route   POST /api/customer/orders/:orderId/manual-cancel
 * @desc    Manual trigger auto-cancel (saat countdown habis)
 * @access  Private (Customer only)
 */
router.post(
  "/:orderId/manual-cancel",
  authenticateCustomer,
  triggerManualCancel
);

/**
 * @route   GET /api/customer/orders
 * @desc    Get customer's order history (legacy)
 * @access  Private (Customer only)
 */
router.get("/", authenticateCustomer, getMyOrders);

/**
 * @route   GET /api/customer/orders/:id
 * @desc    Get order detail by ID (legacy)
 * @access  Private (Customer only - own orders)
 */
router.get("/:id", authenticateCustomer, getOrderDetail);

module.exports = router;
