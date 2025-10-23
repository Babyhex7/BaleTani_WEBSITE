const express = require("express");
const router = express.Router();
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");
const discountController = require("../../controllers/adminDiscount.controller");

/**
 * Discount Management Routes
 * Base path: /api/admin/discounts
 *
 * Roles yang dapat akses:
 * - super_admin: Full access (CRUD + restore)
 * - super_inventory_admin: Create, Read, Update
 */

// ============================================
// DISCOUNT CRUD ROUTES
// ============================================

/**
 * GET /api/admin/discounts
 * Get all discounts with filters and pagination
 * Query params:
 * - page, limit, search, discount_type, is_active, status (active/expired/upcoming)
 * Access: super_admin, super_inventory_admin
 */
router.get(
  "/",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.getAllDiscounts
);

/**
 * GET /api/admin/discounts/:id
 * Get discount detail by ID
 * Access: super_admin, super_inventory_admin
 */
router.get(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.getDiscountById
);

/**
 * POST /api/admin/discounts
 * Create new discount
 * Body: { discount_name, discount_type, value, start_date, end_date, is_active, product_ids }
 * Access: super_admin, super_inventory_admin
 */
router.post(
  "/",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.createDiscount
);

/**
 * PUT /api/admin/discounts/:id
 * Update discount
 * Body: { discount_name, discount_type, value, start_date, end_date, is_active, product_ids }
 * Access: super_admin, super_inventory_admin
 */
router.put(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.updateDiscount
);

/**
 * DELETE /api/admin/discounts/:id
 * Soft delete discount (Super Admin only)
 * Access: super_admin only
 */
router.delete(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin"]),
  discountController.softDeleteDiscount
);

/**
 * POST /api/admin/discounts/:id/restore
 * Restore soft deleted discount (Super Admin only)
 * Access: super_admin only
 */
router.post(
  "/:id/restore",
  authenticateAdmin,
  roleMiddleware(["super_admin"]),
  discountController.restoreDiscount
);

/**
 * PATCH /api/admin/discounts/:id/toggle-status
 * Toggle discount active status
 * Access: super_admin, super_inventory_admin
 */
router.patch(
  "/:id/toggle-status",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.toggleDiscountStatus
);

// ============================================
// DISCOUNT-PRODUCT ASSOCIATION ROUTES
// ============================================

/**
 * POST /api/admin/discounts/:id/products
 * Add products to discount
 * Body: { product_ids: [uuid1, uuid2, ...] }
 * Access: super_admin, super_inventory_admin
 */
router.post(
  "/:id/products",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.addProductsToDiscount
);

/**
 * DELETE /api/admin/discounts/:id/products/:productId
 * Remove product from discount
 * Access: super_admin, super_inventory_admin
 */
router.delete(
  "/:id/products/:productId",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.removeProductFromDiscount
);

module.exports = router;
