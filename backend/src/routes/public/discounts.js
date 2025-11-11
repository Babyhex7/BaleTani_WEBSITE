/**
 * PUBLIC DISCOUNT ROUTES
 * Routes untuk customer/public lihat promo/discount
 * Base path: /api/public/discounts
 */

const express = require("express");
const router = express.Router();
const publicDiscountController = require("../../controllers/publicDiscount.controller");

/**
 * @route   GET /api/public/discounts
 * @desc    Get all active discounts
 * @access  Public (no auth required)
 * @cache   30 menit (1800 detik)
 */
router.get("/", publicDiscountController.getAllDiscounts);

/**
 * @route   GET /api/public/discounts/:id
 * @desc    Get discount detail by ID (hanya yang aktif)
 * @access  Public (no auth required)
 * @cache   30 menit (1800 detik)
 */
router.get("/:id", publicDiscountController.getDiscountById);

/**
 * @route   GET /api/public/discounts/:id/products
 * @desc    Get products by discount ID dengan pagination
 * @access  Public (no auth required)
 * @cache   30 menit (1800 detik)
 * @query   page, limit
 */
router.get("/:id/products", publicDiscountController.getDiscountProducts);

module.exports = router;
