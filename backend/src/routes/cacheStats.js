/**
 * CACHE STATS ROUTES
 * Endpoint untuk monitoring cache performance
 * Hanya untuk development/debugging
 */

const express = require("express");
const router = express.Router();
const cacheService = require("../cache/cacheService");
const cache = require("../cache/nodeCacheClient");

/**
 * GET /api/cache/stats
 * Mendapatkan statistik cache
 */
router.get("/stats", (req, res) => {
  try {
    const stats = cacheService.getStats();

    // Hitung hit ratio
    const totalRequests = stats.hits + stats.misses;
    const hitRatio =
      totalRequests > 0 ? ((stats.hits / totalRequests) * 100).toFixed(2) : 0;

    // Get all cache keys
    const keys = cache.keys();

    res.json({
      success: true,
      message: "Cache statistics",
      data: {
        summary: {
          totalKeys: stats.keys,
          totalHits: stats.hits,
          totalMisses: stats.misses,
          hitRatio: `${hitRatio}%`,
          totalRequests,
        },
        performance: {
          hits: stats.hits,
          misses: stats.misses,
          hitRate: hitRatio,
        },
        keys: {
          count: keys.length,
          list: keys,
        },
        memory: {
          keysSize: stats.ksize,
          valuesSize: stats.vsize,
        },
      },
    });
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cache stats",
      error: error.message,
    });
  }
});

/**
 * GET /api/cache/keys
 * Mendapatkan semua cache keys yang aktif
 */
router.get("/keys", (req, res) => {
  try {
    const keys = cache.keys();

    // Get TTL untuk setiap key
    const keysWithTTL = keys.map((key) => {
      const ttl = cache.getTtl(key);
      const remainingSeconds = ttl
        ? Math.floor((ttl - Date.now()) / 1000)
        : null;

      return {
        key,
        ttl: remainingSeconds
          ? `${remainingSeconds}s (${Math.floor(remainingSeconds / 60)} menit)`
          : "No TTL",
        expiresAt: ttl ? new Date(ttl).toLocaleString("id-ID") : null,
      };
    });

    res.json({
      success: true,
      message: "Cache keys retrieved",
      data: {
        totalKeys: keys.length,
        keys: keysWithTTL,
      },
    });
  } catch (error) {
    console.error("Error getting cache keys:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cache keys",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/cache/flush
 * Hapus semua cache (HATI-HATI!)
 */
router.delete("/flush", (req, res) => {
  try {
    const keysBefore = cache.keys().length;

    cacheService.flush();

    res.json({
      success: true,
      message: "All cache flushed successfully",
      data: {
        keysDeleted: keysBefore,
      },
    });
  } catch (error) {
    console.error("Error flushing cache:", error);
    res.status(500).json({
      success: false,
      message: "Failed to flush cache",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/cache/key/:key
 * Hapus cache tertentu
 */
router.delete("/key/:key", (req, res) => {
  try {
    const { key } = req.params;

    const deleted = cacheService.del(key);

    if (deleted > 0) {
      res.json({
        success: true,
        message: `Cache key "${key}" deleted successfully`,
        data: { key },
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Cache key "${key}" not found`,
      });
    }
  } catch (error) {
    console.error("Error deleting cache key:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete cache key",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/cache/pattern
 * Hapus cache dengan pattern tertentu
 * Body: { pattern: "customer:products:" }
 */
router.delete("/pattern", (req, res) => {
  try {
    const { pattern } = req.body;

    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: "Pattern is required",
      });
    }

    const deleted = cacheService.delPattern(pattern);

    res.json({
      success: true,
      message: `${deleted} cache keys deleted with pattern "${pattern}"`,
      data: {
        pattern,
        keysDeleted: deleted,
      },
    });
  } catch (error) {
    console.error("Error deleting cache pattern:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete cache pattern",
      error: error.message,
    });
  }
});

module.exports = router;
