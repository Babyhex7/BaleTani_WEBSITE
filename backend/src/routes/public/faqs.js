/**
 * ============================================
 * PUBLIC FAQ ROUTES
 * ============================================
 * Routes untuk FAQ (public, no auth required)
 *
 * @module public/faqs.routes
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const express = require("express");
const router = express.Router();
const publicFaqController = require("../../controllers/publicFaq.controller");

/**
 * GET /api/public/faqs
 * Get all active FAQs
 */
router.get("/", publicFaqController.getActiveFAQs);

/**
 * GET /api/public/faqs/categories
 * Get FAQ categories with count
 */
router.get("/categories", publicFaqController.getCategories);

/**
 * GET /api/public/faqs/:id
 * Get single FAQ by ID
 */
router.get("/:id", publicFaqController.getFAQById);

module.exports = router;
