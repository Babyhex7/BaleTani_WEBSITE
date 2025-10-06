const express = require("express");
const dashboardRoutes = require("./dashboard");
const userRoutes = require("./users");
const inventoryRoutes = require("./inventory");

const router = express.Router();

/**
 * Main Admin Routes
 * Base path: /api/admin
 */

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

// User management routes
router.use("/users", userRoutes);

// Inventory management routes (products dan categories)
router.use("/products", inventoryRoutes);
router.use("/inventory", inventoryRoutes);

// Shortcut routes for better API structure
router.use("/orders", require("./dashboard")); // For recent orders endpoint

module.exports = router;
