/**
 * CUSTOMER CART ROUTES
 * Routes for cart operations
 */

const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/customerCart.controller");
const { authenticateCustomer } = require("../../middlewares/auth.middleware");

// All cart routes require customer authentication
router.use(authenticateCustomer);

/**
 * @route   GET /api/customer/cart
 * @desc    Get customer's cart with all items
 * @access  Private (Customer)
 */
router.get("/", cartController.getCart);

/**
 * @route   POST /api/customer/cart
 * @desc    Add item to cart
 * @access  Private (Customer)
 */
router.post("/", cartController.addToCart);

/**
 * @route   PUT /api/customer/cart/:id
 * @desc    Update cart item quantity
 * @access  Private (Customer)
 */
router.put("/:id", cartController.updateCartItem);

/**
 * @route   DELETE /api/customer/cart/:id
 * @desc    Remove item from cart
 * @access  Private (Customer)
 */
router.delete("/:id", cartController.removeFromCart);

/**
 * @route   DELETE /api/customer/cart
 * @desc    Clear entire cart
 * @access  Private (Customer)
 */
router.delete("/", cartController.clearCart);

module.exports = router;
