const express = require("express");
const router = express.Router();

/**
 * ============================================
 * PUBLIC ROUTES
 * Base path: /api/public
 * ============================================
 * Routes accessible without authentication
 * For displaying products, categories to all visitors
 */

// Import sub-routes
const productRoutes = require("../products");
const categoryRoutes = require("../categories");

/**
 * PUBLIC ROUTES (No authentication required)
 * Anyone can view products and categories
 */

// View products
router.use("/products", productRoutes); // /api/public/products/*

// View categories
router.use("/categories", categoryRoutes); // /api/public/categories/*

module.exports = router;
