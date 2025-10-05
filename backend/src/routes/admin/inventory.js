const express = require("express");
const { body } = require("express-validator");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const adminInventoryController = require("../../controllers/adminInventory.controller");

const router = express.Router();

/**
 * Routes untuk Admin Inventory Management
 * Semua routes memerlukan authentication dan role admin/staff
 */

// Middleware untuk memastikan user adalah admin atau staff
const requireAdminRole = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "staff") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin or staff role required.",
    });
  }
  next();
};

// Validation rules untuk produk
const productValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Product name must be between 2 and 150 characters"),

  body("base_price")
    .isFloat({ min: 0 })
    .withMessage("Base price must be a positive number"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a valid integer"),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
];

const updateProductValidationRules = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage("Product name must be between 2 and 150 characters"),

  body("base_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Base price must be a positive number"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("category_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Category ID must be a valid integer"),

  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
];

// Validation rules untuk kategori
const categoryValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

// === PRODUCT ROUTES ===

// GET /admin/inventory/products - Get all products with pagination and filters
router.get(
  "/products",
  authMiddleware,
  requireAdminRole,
  adminInventoryController.getProducts
);

// GET /admin/inventory/products/:id - Get product by ID
router.get(
  "/products/:id",
  authMiddleware,
  requireAdminRole,
  adminInventoryController.getProductById
);

// POST /admin/inventory/products - Create new product
router.post(
  "/products",
  authMiddleware,
  requireAdminRole,
  productValidationRules,
  adminInventoryController.createProduct
);

// PUT /admin/inventory/products/:id - Update product
router.put(
  "/products/:id",
  authMiddleware,
  requireAdminRole,
  updateProductValidationRules,
  adminInventoryController.updateProduct
);

// DELETE /admin/inventory/products/:id - Delete product
router.delete(
  "/products/:id",
  authMiddleware,
  requireAdminRole,
  adminInventoryController.deleteProduct
);

// PATCH /admin/inventory/products/:id/stock - Update product stock
router.patch(
  "/products/:id/stock",
  authMiddleware,
  requireAdminRole,
  [
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
    body("type")
      .optional()
      .isIn(["set", "add", "subtract"])
      .withMessage("Type must be 'set', 'add', or 'subtract'"),
  ],
  adminInventoryController.updateProductStock
);

// === CATEGORY ROUTES ===

// GET /admin/inventory/categories - Get all categories
router.get(
  "/categories",
  authMiddleware,
  requireAdminRole,
  adminInventoryController.getCategories
);

// POST /admin/inventory/categories - Create new category
router.post(
  "/categories",
  authMiddleware,
  requireAdminRole,
  categoryValidationRules,
  adminInventoryController.createCategory
);

// PUT /admin/inventory/categories/:id - Update category
router.put(
  "/categories/:id",
  authMiddleware,
  requireAdminRole,
  [
    body("name")
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage("Category name must be between 2 and 100 characters"),

    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description must not exceed 500 characters"),
  ],
  adminInventoryController.updateCategory
);

// DELETE /admin/inventory/categories/:id - Delete category
router.delete(
  "/categories/:id",
  authMiddleware,
  requireAdminRole,
  adminInventoryController.deleteCategory
);

module.exports = router;
