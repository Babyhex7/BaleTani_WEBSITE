const express = require("express");
const dashboardRoutes = require("./dashboard");
const userRoutes = require("./users");
const inventoryRoutes = require("./inventory");
const adminProductRoutes = require("./adminProducts"); // NEW

const router = express.Router();

/**
 * Main Admin Routes
 * Base path: /api/admin
 */

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

// User management routes
router.use("/users", userRoutes);

// Product Management routes (NEW - dedicated for product CRUD + images)
router.use("/products", adminProductRoutes);

// Inventory management routes (categories and stock overview)
router.use("/inventory", inventoryRoutes);

// Shortcut routes for better API structure
router.use("/orders", require("./dashboard")); // For recent orders endpoint

module.exports = router;
