const express = require("express");
const dashboardRoutes = require("./dashboard");
const userRoutes = require("./users");
const inventoryRoutes = require("./inventory");
const orderRoutes = require("./orders");
const procurementRoutes = require("./procurements");

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

// Order management routes
router.use("/orders", orderRoutes);

// Procurement management routes
router.use("/procurements", procurementRoutes);

module.exports = router;
