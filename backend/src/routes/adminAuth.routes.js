const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuth.controller");
const { authenticateAdmin } = require("../middlewares/auth.middleware");

/**
 * Admin Authentication Routes
 * Base path: /api/admin/auth
 */

// POST /api/admin/auth/login - Login admin
router.post("/login", adminAuthController.loginAdmin);

// GET /api/admin/auth/profile - Get admin profile (requires authentication)
router.get("/profile", authenticateAdmin, adminAuthController.getAdminProfile);

module.exports = router;
