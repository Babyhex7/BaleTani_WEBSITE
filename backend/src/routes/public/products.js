const express = require("express");
const router = express.Router();
const publicProductController = require("../../controllers/publicProduct.controller");

/**
 * ============================================
 * PUBLIC PRODUCT ROUTES
 * Base: /api/public/products
 * ============================================
 * No authentication required
 * For displaying products to customers/visitors
 */

/**
 * @route   GET /api/public/products
 * @desc    Get all products with search, filter, pagination
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 12)
 * @query   {string} search - Search by product name
 * @query   {string} category - Filter by category ID
 * @query   {number} minPrice - Minimum price filter
 * @query   {number} maxPrice - Maximum price filter
 * @query   {string} sortBy - Sort by: newest, name_asc, name_desc, price_asc, price_desc
 */
router.get("/", publicProductController.getAllProducts);

/**
 * @route   GET /api/public/products/featured/promo
 * @desc    Get featured/promo products (products with active discount)
 * @access  Public
 * @query   {number} limit - Number of items (default: 8)
 */
router.get("/featured/promo", publicProductController.getFeaturedProducts);

/**
 * @route   GET /api/public/products/:id
 * @desc    Get product detail by ID
 * @access  Public
 */
router.get("/:id", publicProductController.getProductById);

module.exports = router;
