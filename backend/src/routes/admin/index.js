const express = require("express");
const dashboardRoutes = require("./dashboard");
const userRoutes = require("./users");
const inventoryRoutes = require("./inventory");
<<<<<<< Updated upstream
=======
const adminProductRoutes = require("./adminProducts");
const productImagesRoutes = require("./productImages");
const categoryRoutes = require("./categories");
const discountRoutes = require("./discounts");
const stockRoutes = require("./stock");
>>>>>>> Stashed changes

const router = express.Router();

/**
 * Main Admin Routes
 * Base path: /api/admin
 */

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

// User management routes
router.use("/users", userRoutes);

<<<<<<< Updated upstream
// Inventory management routes (products dan categories)
router.use("/products", inventoryRoutes);
=======
// Product Management routes (product CRUD)
router.use("/products", adminProductRoutes);

// Product Images routes (extends products routes)
router.use("/products", productImagesRoutes);

// Category Management routes
router.use("/categories", categoryRoutes);

// Discount Management routes
router.use("/discounts", discountRoutes);

// Stock Overview routes
router.use("/stock", stockRoutes);

// Inventory management routes (legacy)
>>>>>>> Stashed changes
router.use("/inventory", inventoryRoutes);

// Shortcut routes for better API structure
router.use("/orders", require("./dashboard")); // For recent orders endpoint

module.exports = router;
