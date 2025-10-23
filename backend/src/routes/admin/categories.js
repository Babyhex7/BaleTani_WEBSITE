const express = require("express");
const router = express.Router();
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");
const categoryController = require("../../controllers/adminCategory.controller");

/**
 * Category Management Routes
 * Base path: /api/admin/categories
 *
 * Roles yang dapat akses:
 * - super_admin: Full access (CRUD + restore)
 * - super_inventory_admin: Create, Read, Update
 */

// ============================================
// CATEGORY CRUD ROUTES
// ============================================

/**
 * GET /api/admin/categories
 * Get all categories with filters and pagination
 * Access: super_admin, super_inventory_admin
 */
router.get(
  "/",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.getAllCategories
);

/**
 * GET /api/admin/categories/:id
 * Get category detail by ID
 * Access: super_admin, super_inventory_admin
 */
router.get(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.getCategoryById
);

/**
 * POST /api/admin/categories
 * Create new category
 * Access: super_admin, super_inventory_admin
 */
router.post(
  "/",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.createCategory
);

/**
 * PUT /api/admin/categories/:id
 * Update category
 * Access: super_admin, super_inventory_admin
 */
router.put(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.updateCategory
);

/**
 * DELETE /api/admin/categories/:id
 * Soft delete category (Super Admin only)
 * Access: super_admin only
 */
router.delete(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin"]),
  categoryController.softDeleteCategory
);

/**
 * POST /api/admin/categories/:id/restore
 * Restore soft deleted category (Super Admin only)
 * Access: super_admin only
 */
router.post(
  "/:id/restore",
  authenticateAdmin,
  roleMiddleware(["super_admin"]),
  categoryController.restoreCategory
);

/**
 * PATCH /api/admin/categories/:id/toggle-status
 * Toggle category active status
 * Access: super_admin, super_inventory_admin
 */
router.patch(
  "/:id/toggle-status",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.toggleCategoryStatus
);

module.exports = router;
