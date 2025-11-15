/**
 * ============================================
 * CUSTOMER CONTACT ROUTES
 * ============================================
 * Routes untuk contact form submission (customer)
 *
 * @module customer/contact.routes
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const express = require("express");
const router = express.Router();
const customerContactController = require("../../controllers/customerContact.controller");
const {
  authenticateCustomer,
  optionalAuth,
} = require("../../middlewares/auth.middleware");
const { rateLimiter } = require("../../middlewares/rateLimiter.middleware");

/**
 * POST /api/customer/contact
 * Submit contact form (no auth required, but can track if logged in)
 * Rate limited to prevent spam
 */
router.post(
  "/",
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  optionalAuth, // Track customer if logged in
  customerContactController.submitContactForm
);

/**
 * GET /api/customer/contact/my-messages
 * Get my contact messages (auth required)
 */
router.get(
  "/my-messages",
  authenticateCustomer,
  customerContactController.getMyMessages
);

/**
 * GET /api/customer/contact/my-messages/:id
 * Get single message detail (auth required)
 */
router.get(
  "/my-messages/:id",
  authenticateCustomer,
  customerContactController.getMyMessageById
);

module.exports = router;
