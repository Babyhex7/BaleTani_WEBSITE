/**
 * Customer Profile Routes
 * Routes untuk kelola profile customer
 */

const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/customerProfile.controller");
const { authenticateCustomer } = require("../../middlewares/auth.middleware");

/**
 * GET /api/customer/profile
 * Ambil data profile customer + statistik
 */
router.get("/", authenticateCustomer, profileController.getProfile);

/**
 * PUT /api/customer/profile
 * Update profile customer (nama)
 */
router.put("/", authenticateCustomer, profileController.updateProfile);

/**
 * PUT /api/customer/profile/password
 * Ganti password customer
 */
router.put("/password", authenticateCustomer, profileController.changePassword);

module.exports = router;
