/**
 * Recommendation Routes untuk BaleTani Backend
 * Integration dengan FastAPI ML Service
 */

const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendation.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

/**
 * @route   GET /api/recommendations/similar/:productId
 * @desc    Get similar products berdasarkan product ID
 * @access  Public
 * @query   top_k (optional) - Number of recommendations (default: 10, max: 50)
 */
router.get("/similar/:productId", recommendationController.getSimilarProducts);

/**
 * @route   POST /api/recommendations/bundle
 * @desc    Get bundle recommendations untuk multiple products (cart)
 * @access  Public (bisa juga Private jika perlu auth)
 * @body    { product_ids: string[] } - Array of UUIDs (max 10)
 * @query   top_k (optional) - Number of recommendations (default: 8, max: 30)
 */
router.post("/bundle", recommendationController.getBundleRecommendations);

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending products
 * @access  Public
 * @query   category_id (optional) - Filter by category UUID
 * @query   top_k (optional) - Number of products (default: 12, max: 50)
 */
router.get("/trending", recommendationController.getTrendingProducts);

/**
 * @route   GET /api/recommendations/category/:categoryId
 * @desc    Get top products dari specific category
 * @access  Public
 * @query   top_k (optional) - Number of products (default: 10, max: 50)
 */
router.get(
  "/category/:categoryId",
  recommendationController.getCategoryTopProducts
);

/**
 * @route   GET /api/recommendations/health
 * @desc    Health check untuk ML service
 * @access  Private (Admin only)
 */
router.get(
  "/health",
  authMiddleware,
  recommendationController.checkMLServiceHealth
);

/**
 * @route   POST /api/recommendations/track
 * @desc    Track recommendation click/impression untuk analytics
 * @access  Private (authenticated users)
 * @body    { product_id, recommendation_id, action: 'impression' | 'click' | 'purchase' }
 */
router.post(
  "/track",
  authMiddleware,
  recommendationController.trackRecommendation
);

module.exports = router;
