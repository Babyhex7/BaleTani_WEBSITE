const express = require("express");
const router = express.Router();

/**
 * ============================================
 * CUSTOMER ROUTES
 * Base path: /api/customer
 * ============================================
 * Routes for customer operations
 */

// Import sub-routes
const authRoutes = require("../customerAuth.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");
const profileRoutes = require("./profile.routes");

/**
 * PUBLIC CUSTOMER ROUTES (No auth required)
 * - Register
 * - Login
 */
router.use("/auth", authRoutes);

/**
 * PROTECTED CUSTOMER ROUTES (Auth required)
 * Authentication handled in each route file
 */
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/profile", profileRoutes);

module.exports = router;
