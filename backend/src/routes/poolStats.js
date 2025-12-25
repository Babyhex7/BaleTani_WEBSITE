const express = require("express");
const router = express.Router();
const { getPoolStats } = require("../config/database");

/**
 * @route   GET /api/pool-stats
 * @desc    Get database connection pool statistics (untuk monitoring load test)
 * @access  Public (disable di production)
 */
router.get("/", (req, res) => {
  // Only enable in development/test environment
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      success: false,
      message: "Pool stats endpoint disabled in production",
    });
  }

  try {
    const stats = getPoolStats();

    // Hitung utilization percentage
    const utilization =
      stats.max > 0 ? ((stats.borrowed / stats.max) * 100).toFixed(2) : 0;

    return res.json({
      success: true,
      message: "Database connection pool statistics",
      data: {
        pool: stats,
        utilization: `${utilization}%`,
        status:
          stats.borrowed > stats.max * 0.8
            ? "⚠️ HIGH - Pool hampir penuh"
            : stats.borrowed > stats.max * 0.5
            ? "⚡ MODERATE - Pool usage sedang"
            : "✅ LOW - Pool healthy",
        recommendations:
          stats.borrowed > stats.max * 0.8
            ? [
                "Consider increasing pool max connections",
                "Check for connection leaks",
                "Optimize slow queries",
              ]
            : [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get pool stats",
      error: error.message,
    });
  }
});

module.exports = router;
