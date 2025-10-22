const express = require("express");
const router = express.Router();
const discountController = require("../../controllers/adminDiscount.controller");
const {
  authenticateAdmin,
  roleMiddleware,
} = require("../../middlewares/auth.middleware");

// All routes require authentication
router.use(authenticateAdmin);

// GET all discounts with filters
router.get(
  "/",
  roleMiddleware([
    "super_admin",
    "super_inventory_admin",
    "inventory_admin",
    "finance_admin",
  ]),
  discountController.getAllDiscounts
);

// GET single discount with products
router.get(
  "/:id",
  roleMiddleware([
    "super_admin",
    "super_inventory_admin",
    "inventory_admin",
    "finance_admin",
  ]),
  discountController.getDiscountById
);

// CREATE discount
router.post(
  "/",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.createDiscount
);

// UPDATE discount
router.put(
  "/:id",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.updateDiscount
);

// SOFT DELETE discount
router.delete(
  "/:id",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.deleteDiscount
);

// ASSIGN products to discount
router.post(
  "/:id/products",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.assignProductsToDiscount
);

// REMOVE product from discount
router.delete(
  "/:id/products/:productId",
  roleMiddleware(["super_admin", "super_inventory_admin"]),
  discountController.removeProductFromDiscount
);

module.exports = router;
