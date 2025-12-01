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

// Import public sub-routes
const productRoutes = require("./products");
const discountRoutes = require("./discounts");
const faqRoutes = require("./faqs");

/**
 * PUBLIC ROUTES (No authentication required)
 * Anyone can view products and categories
 */

// View products (public access - no auth)
router.use("/products", productRoutes); // /api/public/products/*

// View discounts/promos (public access - no auth)
router.use("/discounts", discountRoutes); // /api/public/discounts/*

// View FAQs (public access - no auth)
router.use("/faqs", faqRoutes); // /api/public/faqs/*

module.exports = router;
