const express = require("express");
const { body } = require("express-validator");
const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
} = require("../controllers/customerAuth.controller");
const { logout } = require("../controllers/customerProfile.controller");
const { authenticateCustomer } = require("../middlewares/auth.middleware");

const router = express.Router();

// Validation middleware for customer registration
const validateCustomerRegister = [
  body("phone_number")
    .notEmpty()
    .withMessage("Nomor telepon wajib diisi")
    .isLength({ min: 10, max: 15 })
    .withMessage("Nomor telepon harus 10-15 digit"),
  body("full_name")
    .notEmpty()
    .withMessage("Nama lengkap wajib diisi")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama lengkap harus 2-100 karakter"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
];

// Validation middleware for customer login
const validateCustomerLogin = [
  body("phone_number").notEmpty().withMessage("Nomor telepon wajib diisi"),
  body("password").notEmpty().withMessage("Password wajib diisi"),
];

// Customer auth routes
router.post("/register", validateCustomerRegister, registerCustomer);
router.post("/login", validateCustomerLogin, loginCustomer);
router.get("/profile", authenticateCustomer, getCustomerProfile);
router.post("/logout", authenticateCustomer, logout);

module.exports = router;
