const express = require("express");
const { body } = require("express-validator");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const adminUserController = require("../../controllers/adminUser.controller");

const router = express.Router();

/**
 * Routes untuk Admin User Management
 * Semua routes memerlukan authentication dan role admin
 */

// Middleware untuk memastikan user adalah admin
const requireAdminRole = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required.",
    });
  }
  next();
};

// Validation rules
const userValidationRules = [
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("role")
    .optional()
    .isIn(["customer", "staff", "admin"])
    .withMessage("Role must be customer, staff, or admin"),
];

const createUserValidationRules = [
  ...userValidationRules,
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const updateUserValidationRules = [
  body("full_name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["customer", "staff", "admin"])
    .withMessage("Role must be customer, staff, or admin"),
];

// GET /admin/users - Get all users with pagination and filters
router.get("/", authMiddleware, requireAdminRole, adminUserController.getUsers);

// GET /admin/users/stats - Get user statistics
router.get(
  "/stats",
  authMiddleware,
  requireAdminRole,
  adminUserController.getUserStats
);

// GET /admin/users/:id - Get user by ID
router.get(
  "/:id",
  authMiddleware,
  requireAdminRole,
  adminUserController.getUserById
);

// POST /admin/users - Create new user
router.post(
  "/",
  authMiddleware,
  requireAdminRole,
  createUserValidationRules,
  adminUserController.createUser
);

// PUT /admin/users/:id - Update user
router.put(
  "/:id",
  authMiddleware,
  requireAdminRole,
  updateUserValidationRules,
  adminUserController.updateUser
);

// DELETE /admin/users/:id - Delete user
router.delete(
  "/:id",
  authMiddleware,
  requireAdminRole,
  adminUserController.deleteUser
);

// PATCH /admin/users/:id/role - Update user role
router.patch(
  "/:id/role",
  authMiddleware,
  requireAdminRole,
  [
    body("role")
      .isIn(["customer", "staff", "admin"])
      .withMessage("Role must be customer, staff, or admin"),
  ],
  adminUserController.updateUserRole
);

// PATCH /admin/users/:id/reset-password - Reset user password
router.patch(
  "/:id/reset-password",
  authMiddleware,
  requireAdminRole,
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  adminUserController.resetUserPassword
);

module.exports = router;
