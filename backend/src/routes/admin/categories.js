const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/adminCategory.controller");
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");

// All routes require authentication and appropriate roles
router.use(authenticateAdmin);

// GET all categories
router.get(
  "/",
  roleMiddleware([
    "super_admin",
    "super_inventory_admin",
    "inventory_admin",
    "finance_admin",
  ]),
  categoryController.getAllCategories
);

// GET single category
router.get(
  "/:id",
  roleMiddleware([
    "super_admin",
    "super_inventory_admin",
    "inventory_admin",
    "finance_admin",
  ]),
  categoryController.getCategoryById
);

// CREATE category
router.post(
  "/",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.createCategory
);

// UPDATE category
router.put(
  "/:id",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.updateCategory
);

// SOFT DELETE category
router.delete(
  "/:id",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.deleteCategory
);

// RESTORE category
router.post(
  "/:id/restore",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  categoryController.restoreCategory
);

module.exports = router;
