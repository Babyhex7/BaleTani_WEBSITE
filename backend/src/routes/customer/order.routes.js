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
const { authenticateCustomer } = require("../../middlewares/auth.middleware");

/**
 * @route   POST /api/customer/orders/create
 * @desc    Create new order (requires login)
 * @access  Private (Customer only)
 */
router.post("/create", authenticateCustomer, createOrder);

/**
 * @route   GET /api/customer/orders
 * @desc    Get customer's order history
 * @access  Private (Customer only)
 */
router.get("/", authenticateCustomer, getMyOrders);

/**
 * @route   GET /api/customer/orders/:id
 * @desc    Get order detail by ID
 * @access  Private (Customer only - own orders)
 */
router.get("/:id", authenticateCustomer, getOrderDetail);

module.exports = router;
