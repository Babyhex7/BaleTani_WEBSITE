/**
 * ============================================
 * ADMIN FAQ ROUTES
 * ============================================
 * Routes untuk FAQ management (admin only)
 *
 * @module admin/faqs.routes
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const express = require("express");
const router = express.Router();
const adminFaqController = require("../../controllers/adminFaq.controller");
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Allowed roles: super_admin, super_inventory_admin (bisa customize sesuai kebutuhan)
const allowedRoles = ["super_admin", "super_inventory_admin"];

/**
 * GET /api/admin/faqs
 * Get all FAQs with filters
 */
router.get("/", roleMiddleware(allowedRoles), adminFaqController.getAllFAQs);

/**
 * GET /api/admin/faqs/categories/stats
 * Get FAQ category statistics
 */
router.get(
  "/categories/stats",
  roleMiddleware(allowedRoles),
  adminFaqController.getCategoryStats
);

/**
 * GET /api/admin/faqs/:id
 * Get single FAQ by ID
 */
router.get("/:id", roleMiddleware(allowedRoles), adminFaqController.getFAQById);

/**
 * POST /api/admin/faqs
 * Create new FAQ
 */
router.post("/", roleMiddleware(allowedRoles), adminFaqController.createFAQ);

/**
 * PUT /api/admin/faqs/bulk-order
 * Bulk update FAQ order
 */
router.put(
  "/bulk-order",
  roleMiddleware(allowedRoles),
  adminFaqController.bulkUpdateOrder
);

/**
 * PUT /api/admin/faqs/:id
 * Update FAQ
 */
router.put("/:id", roleMiddleware(allowedRoles), adminFaqController.updateFAQ);

/**
 * DELETE /api/admin/faqs/:id
 * Delete FAQ
 */
router.delete(
  "/:id",
  roleMiddleware(allowedRoles),
  adminFaqController.deleteFAQ
);

module.exports = router;
