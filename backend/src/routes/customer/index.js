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

/**
 * PUBLIC CUSTOMER ROUTES (No auth required)
 * - Register
 * - Login
 */
router.use("/auth", authRoutes);

/**
 * PROTECTED CUSTOMER ROUTES (Auth required)
 * Authentication handled in each route file
 *
 * TODO: Add these routes when needed:
 * - /profile - Customer profile management
 * - /orders - Customer order history
 * - /cart - Shopping cart management
 * - /addresses - Delivery addresses
 */

module.exports = router;
