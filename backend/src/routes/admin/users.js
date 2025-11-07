const express = require("express");
const { body } = require("express-validator");
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");
const adminUserController = require("../../controllers/adminUser.controller");

const router = express.Router();

/**
 * Routes untuk Admin User Management
 * Hanya super_admin yang bisa manage admin users
 */

// Middleware untuk memastikan user adalah super_admin
const requireSuperAdmin = roleMiddleware(["super_admin"]);

// Validation rules
const userValidationRules = [
  body("full_name")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("phone_number")
    .optional()
    .matches(/^(08|628)[0-9]{8,12}$/)
    .withMessage("Phone number must be valid Indonesian format"),

  body("role_id").optional().isUUID().withMessage("Role ID must be valid UUID"),
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

  body("phone_number")
    .optional()
    .matches(/^(08|628)[0-9]{8,12}$/)
    .withMessage("Phone number must be valid Indonesian format"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role_id").optional().isUUID().withMessage("Role ID must be valid UUID"),
];

// GET /admin/users - Get all users with pagination and filters
router.get(
  "/",
  authenticateAdmin,
  requireSuperAdmin,
  adminUserController.getUsers
);

// GET /admin/users/roles - Get all roles
router.get(
  "/roles",
  authenticateAdmin,
  requireSuperAdmin,
  adminUserController.getRoles
);

// GET /admin/users/stats - Get user statistics
router.get(
  "/stats",
  authenticateAdmin,
  requireSuperAdmin,
  adminUserController.getUserStats
);

// GET /admin/users/:id - Get user by ID
router.get(
  "/:id",
  authenticateAdmin,
  requireSuperAdmin,
  adminUserController.getUserById
);

// POST /admin/users - Create new user
router.post(
  "/",
  authenticateAdmin,
  requireSuperAdmin,
  createUserValidationRules,
  adminUserController.createUser
);

// PUT /admin/users/:id - Update user
router.put(
  "/:id",
  authenticateAdmin,
  requireSuperAdmin,
  updateUserValidationRules,
  adminUserController.updateUser
);

// DELETE /admin/users/:id - Delete user
router.delete(
  "/:id",
  authenticateAdmin,
  requireSuperAdmin,
  adminUserController.deleteUser
);

// PATCH /admin/users/:id/role - Update user role
router.patch(
  "/:id/role",
  authenticateAdmin,
  requireSuperAdmin,
  [body("role_id").isUUID().withMessage("Role ID must be valid UUID")],
  adminUserController.updateUserRole
);

// PATCH /admin/users/:id/reset-password - Reset user password
router.patch(
  "/:id/reset-password",
  authenticateAdmin,
  requireSuperAdmin,
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  adminUserController.resetUserPassword
);

module.exports = router;
