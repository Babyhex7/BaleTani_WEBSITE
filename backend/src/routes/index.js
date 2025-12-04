const express = require("express");
const router = express.Router();

/**
 * ============================================
 * MAIN API ROUTER
 * ============================================
 * All routes are prefixed with /api
 *
 * Structure:
 * /api/admin/*     - Admin panel routes (require admin auth)
 * /api/customer/*  - Customer routes (require customer auth)
 * /api/public/*    - Public routes (no auth required)
 */

// Import main route groups
const adminRoutes = require("./admin");
const customerRoutes = require("./customer");
const publicRoutes = require("./public");
const recommendationRoutes = require("./recommendation.routes");

/**
 * ROUTE REGISTRATION
 */

// Health check - /api/health (no auth required)
const healthRoutes = require("./health");
router.use("/health", healthRoutes);

// Admin routes - /api/admin/*
router.use("/admin", adminRoutes);

// Customer routes - /api/customer/*
router.use("/customer", customerRoutes);

// Public routes - /api/public/*
router.use("/public", publicRoutes);

// AI Recommendation routes - /api/recommendations/*
router.use("/recommendations", recommendationRoutes);

/**
 * HEALTH CHECK
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "BaleTani Fresh Market API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

/**
 * API INFO
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to BaleTani API",
    version: "1.0.0",
    endpoints: {
      admin: "/api/admin/*",
      customer: "/api/customer/*",
      public: "/api/public/*",
      health: "/api/health",
    },
    documentation: "Coming soon",
  });
});

module.exports = router;
