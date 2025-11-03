const express = require("express");
const router = express.Router();

/**
 * ============================================
 * ADMIN ROUTES
 * Base path: /api/admin
 * ============================================
 * All routes require admin authentication
 */

// Import sub-routes
const authRoutes = require("../adminAuth.routes");
const dashboardRoutes = require("./dashboard");
const productRoutes = require("./adminProducts");
const categoryRoutes = require("./categories");
const discountRoutes = require("./discounts");
const userRoutes = require("./users");
const orderRoutes = require("./orders");
const customerRoutes = require("./customers");

/**
 * PUBLIC ADMIN ROUTES (No auth required)
 * - Login
 */
router.use("/auth", authRoutes);

/**
 * PROTECTED ADMIN ROUTES (Auth required)
 * Authentication & authorization handled in each route file
 */

// Dashboard & Statistics
router.use("/dashboard", dashboardRoutes); // /api/admin/dashboard/*

// Product Management (CRUD + Images)
router.use("/products", productRoutes); // /api/admin/products/*

// Category Management
router.use("/categories", categoryRoutes); // /api/admin/categories/*

// Discount Management
router.use("/discounts", discountRoutes); // /api/admin/discounts/*

// Order Management
router.use("/orders", orderRoutes); // /api/admin/orders/*

// User & Admin Management
router.use("/users", userRoutes); // /api/admin/users/*

// Customer Management
router.use("/customers", customerRoutes); // /api/admin/customers/*

module.exports = router;
