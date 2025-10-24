const express = require("express");
const { body } = require("express-validator");
// Destructure to get the actual middleware function (module exports an object)
const { authMiddleware } = require("../../middlewares/auth.middleware");
// Fixed: wrong import (was pointing to a non-existent .test file)
const adminDashboardController = require("../../controllers/adminDashboard.controller");

const router = express.Router();

/**
 * Routes untuk Admin Dashboard
 * Semua routes memerlukan authentication dan role admin/staff
 */

// Middleware untuk memastikan user adalah admin atau staff
const requireAdminRole = (req, res, next) => {
  const roleName = req.user.role.role_name;
  if (
    roleName !== "admin" &&
    roleName !== "staff" &&
    roleName !== "super_admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin or staff role required.",
    });
  }
  next();
};

// GET /admin/dashboard/stats - Get dashboard statistics
router.get(
  "/stats",
  authMiddleware,
  requireAdminRole,
  adminDashboardController.getDashboardStats
);

// GET /admin/dashboard/recent-orders - Get recent orders
router.get(
  "/recent-orders",
  authMiddleware,
  requireAdminRole,
  adminDashboardController.getRecentOrders
);

// GET /admin/dashboard/low-stock - Get low stock products
router.get(
  "/low-stock",
  authMiddleware,
  requireAdminRole,
  adminDashboardController.getLowStockProducts
);

// GET /admin/dashboard/notifications - Get notifications
router.get(
  "/notifications",
  authMiddleware,
  requireAdminRole,
  adminDashboardController.getNotifications
);

module.exports = router;
