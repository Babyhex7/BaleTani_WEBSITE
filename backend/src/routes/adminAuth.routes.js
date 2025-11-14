const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuth.controller");
const { authenticateAdmin } = require("../middlewares/auth.middleware");
const { loginLimiter } = require("../middlewares/rateLimiter.middleware");
const { sanitizeInput } = require("../middlewares/sanitize.middleware");

/**
 * Admin Authentication Routes
 * Base path: /api/admin/auth
 * 
 * Security: Rate limiting + input sanitization applied
 */

// POST /api/admin/auth/login - Login admin (with rate limiting)
router.post("/login", loginLimiter, sanitizeInput, adminAuthController.loginAdmin);

// GET /api/admin/auth/profile - Get admin profile (requires authentication)
router.get("/profile", authenticateAdmin, adminAuthController.getAdminProfile);

module.exports = router;
