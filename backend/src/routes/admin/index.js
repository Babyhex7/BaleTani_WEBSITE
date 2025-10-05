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

// Inventory management routes
router.use("/inventory", inventoryRoutes);

module.exports = router;
