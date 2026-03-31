const express = require("express");
const router = express.Router();
const publicProductController = require("../../controllers/publicProduct.controller");
const stockMovementController = require("../../controllers/stockMovement.controller");

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
 * ❌ DEPRECATED - Route featured/promo dihapus
 * ✅ Sekarang pakai: GET /api/public/discounts (dengan cache 30 menit)
 * Alasan: Lebih spesifik untuk discount/promo, cache terpisah
 */

/**
 * @route   GET /api/public/products/:id
 * @desc    Get product detail by ID
 * @access  Public
 */
router.get("/:id", publicProductController.getProductById);

/**
 * @route   GET /api/public/products/:id/stock-status
 * @desc    Get public stock status and recent sales for a product
 * @access  Public
 * @note    Shows only non-sensitive data (recent sales count, current stock)
 */
router.get("/:id/stock-status", stockMovementController.getPublicStockStatus);

module.exports = router;
