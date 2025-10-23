const express = require("express");
const dashboardRoutes = require("./dashboard");
const userRoutes = require("./users");
const inventoryRoutes = require("./inventory");
const adminProductRoutes = require("./adminProducts");
const categoryRoutes = require("./categories"); // NEW - Category Management
const discountRoutes = require("./discounts"); // NEW - Discount Management

const router = express.Router();

/**
 * Main Admin Routes
 * Base path: /api/admin
 */

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

// User management routes
router.use("/users", userRoutes);

// Product Management routes (dedicated for product CRUD + images)
router.use("/products", adminProductRoutes);

// Category Management routes (NEW)
router.use("/categories", categoryRoutes);

// Discount Management routes (NEW)
router.use("/discounts", discountRoutes);

// Inventory management routes (stock overview & movements)
router.use("/inventory", inventoryRoutes);

// Shortcut routes for better API structure
router.use("/orders", require("./dashboard")); // For recent orders endpoint

module.exports = router;
