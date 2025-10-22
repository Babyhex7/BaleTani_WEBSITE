const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/order.controller");
const { authMiddleware, roleMiddleware } = require("../../middlewares/auth.middleware");

// Roles yang bisa akses orders
const ORDER_ROLES = [
  "super_admin",
  "super_whatsapp_admin",
  "super_cashier",
  "whatsapp_admin",
  "cashier",
  "finance_admin",
];

// Get all orders
router.get(
  "/",
  authMiddleware,
  roleMiddleware(ORDER_ROLES),
  orderController.getAllOrders
);

// Get order statistics
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(ORDER_ROLES),
  orderController.getOrderStats
);

// Get single order
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(ORDER_ROLES),
  orderController.getOrderById
);

// Create order
router.post(
  "/",
  authMiddleware,
  roleMiddleware([
    "super_admin",
    "super_whatsapp_admin",
    "super_cashier",
    "whatsapp_admin",
    "cashier",
  ]),
  orderController.createOrder
);

// Update order status
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware([
    "super_admin",
    "super_whatsapp_admin",
    "super_cashier",
    "whatsapp_admin",
    "cashier",
  ]),
  orderController.updateOrderStatus
);

// Cancel order
router.patch(
  "/:id/cancel",
  authMiddleware,
  roleMiddleware([
    "super_admin",
    "super_whatsapp_admin",
    "super_cashier",
  ]),
  orderController.cancelOrder
);

module.exports = router;
