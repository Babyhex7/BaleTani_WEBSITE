const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/database");

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Untuk monitoring apakah server dan database berjalan dengan baik
 */
router.get("/", async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();

    // Get memory usage
    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      message: "BaleTani API is healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(), // in seconds
      database: "connected",
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(503).json({
      success: false,
      message: "Server is unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message,
    });
  }
});

module.exports = router;
