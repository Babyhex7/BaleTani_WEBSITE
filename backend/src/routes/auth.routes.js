const express = require("express");
const { body } = require("express-validator");
const {
  loginAdmin,
  getAdminProfile,
} = require("../controllers/auth.controller");
const { authenticateAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Validation rules for admin login
const adminLoginValidation = [
  body("phone_number").notEmpty().withMessage("Nomor telepon wajib diisi"),
  body("password").notEmpty().withMessage("Password wajib diisi"),
];

// Admin auth routes - hanya login, tidak ada register (admin dibuat oleh super admin)
router.post("/login", adminLoginValidation, loginAdmin);
router.get("/profile", authenticateAdmin, getAdminProfile);

module.exports = router;
