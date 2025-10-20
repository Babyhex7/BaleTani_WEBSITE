const express = require("express");
const router = express.Router();
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");
const {
  upload,
  handleMulterError,
} = require("../../middlewares/upload.middleware");
const productController = require("../../controllers/adminProduct.controller");
const productImageController = require("../../controllers/adminProductImage.controller");

/**
 * Product Management Routes
 * Base path: /api/admin/products
 *
 * Roles yang dapat akses:
 * - super_admin: Full access (CRUD + restore)
 * - super_inventory_admin: Create, Read, Update, Upload images
 */

// ============================================
// PRODUCT CRUD ROUTES
// ============================================

/**
 * GET /api/admin/products
 * Get all products with filters and pagination
 * Access: super_admin, super_inventory_admin
 */
router.get(
  "/",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productController.getAll
);

/**
 * GET /api/admin/products/:id
 * Get product detail by ID
 * Access: super_admin, super_inventory_admin
 */
router.get(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productController.getById
);

/**
 * POST /api/admin/products
 * Create new product
 * Access: super_admin, super_inventory_admin
 */
router.post(
  "/",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productController.create
);

/**
 * PUT /api/admin/products/:id
 * Update product
 * Access: super_admin, super_inventory_admin
 */
router.put(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productController.update
);

/**
 * DELETE /api/admin/products/:id
 * Soft delete product (Super Admin only)
 * Access: super_admin only
 */
router.delete(
  "/:id",
  authenticateAdmin,
  roleMiddleware(["super_admin"]),
  productController.softDelete
);

/**
 * POST /api/admin/products/:id/restore
 * Restore soft deleted product (Super Admin only)
 * Access: super_admin only
 */
router.post(
  "/:id/restore",
  authenticateAdmin,
  roleMiddleware(["super_admin"]),
  productController.restore
);

// ============================================
// PRODUCT IMAGE ROUTES
// ============================================

/**
 * GET /api/admin/products/:id/images
 * Get all images for a product
 * Access: super_admin, super_inventory_admin
 */
router.get(
  "/:id/images",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productImageController.getByProduct
);

/**
 * POST /api/admin/products/:id/images
 * Upload product images (max 5 files)
 * Access: super_admin, super_inventory_admin
 */
router.post(
  "/:id/images",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  upload.array("images", 5), // Accept max 5 files with field name 'images'
  handleMulterError, // Handle multer errors
  productImageController.upload
);

/**
 * PUT /api/admin/products/:id/images/reorder
 * Reorder product images
 * Access: super_admin, super_inventory_admin
 */
router.put(
  "/:id/images/reorder",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productImageController.reorder
);

/**
 * DELETE /api/admin/products/images/:imageId
 * Delete product image (soft delete)
 * Access: super_admin, super_inventory_admin
 */
router.delete(
  "/images/:imageId",
  authenticateAdmin,
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  productImageController.deleteImage
);

module.exports = router;
