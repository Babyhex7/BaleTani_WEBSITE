/**
 * Recommendation Controller
 * Handle HTTP requests dan response untuk recommendation endpoints
 */

const recommendationService = require("../services/recommendation.service");
const logger = require("../utils/logger");

/**
 * GET /api/recommendations/similar/:productId
 * Get similar products
 */
const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const topK = parseInt(req.query.top_k) || 10;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
        error: "Product ID must be a valid UUID",
      });
    }

    // Validate top_k range
    if (topK < 1 || topK > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid top_k parameter",
        error: "top_k must be between 1 and 50",
      });
    }

    const result = await recommendationService.getSimilarProducts(
      productId,
      topK
    );

    console.log(
      "🔍 [SIMILAR API] Result from service:",
      JSON.stringify(result, null, 2)
    );
    console.log(
      "🔍 [SIMILAR API] Recommendations count:",
      result.recommendations?.length || 0
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error in getSimilarProducts controller: ${error.message}`);

    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to get similar products",
      error: error.detail || error.message,
    });
  }
};

/**
 * POST /api/recommendations/bundle
 * Get bundle recommendations
 */
const getBundleRecommendations = async (req, res) => {
  try {
    // Support both camelCase (productIds) and snake_case (product_ids)
    const product_ids = req.body.product_ids || req.body.productIds;
    const topK = parseInt(req.query.top_k) || parseInt(req.query.limit) || 8;

    // Validate request body
    if (!product_ids || !Array.isArray(product_ids)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        error: "product_ids or productIds must be an array of UUIDs",
      });
    }

    if (product_ids.length === 0 || product_ids.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid product_ids array length",
        error: "product_ids must contain 1-10 items",
      });
    }

    // Validate UUID format untuk setiap ID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const id of product_ids) {
      if (!uuidRegex.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format",
          error: `Product ID ${id} is not a valid UUID`,
        });
      }
    }

    // Validate top_k range
    if (topK < 1 || topK > 30) {
      return res.status(400).json({
        success: false,
        message: "Invalid top_k parameter",
        error: "top_k must be between 1 and 30",
      });
    }

    const result = await recommendationService.getBundleRecommendations(
      product_ids,
      topK
    );

    console.log(
      "📦 [BUNDLE API] Result from service:",
      JSON.stringify(result, null, 2)
    );
    console.log(
      "📦 [BUNDLE API] Recommendations count:",
      result.recommendations?.length || 0
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(
      `Error in getBundleRecommendations controller: ${error.message}`
    );

    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to get bundle recommendations",
      error: error.detail || error.message,
    });
  }
};

/**
 * GET /api/recommendations/trending
 * Get trending products
 */
const getTrendingProducts = async (req, res) => {
  try {
    console.log("🔥 [TRENDING API] Request received");
    console.log("🔥 [TRENDING API] Query params:", req.query);
    const { category_id } = req.query;
    const topK = parseInt(req.query.top_k) || 12;

    // Validate category_id if provided
    if (category_id) {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(category_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID format",
          error: "Category ID must be a valid UUID",
        });
      }
    }

    // Validate top_k range
    if (topK < 1 || topK > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid top_k parameter",
        error: "top_k must be between 1 and 50",
      });
    }

    const result = await recommendationService.getTrendingProducts(
      category_id,
      topK
    );

    console.log(
      "🔥 [TRENDING API] Result from service:",
      JSON.stringify(result, null, 2)
    );
    console.log(
      "🔥 [TRENDING API] Trending products count:",
      result.trending_products?.length || 0
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(`Error in getTrendingProducts controller: ${error.message}`);

    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to get trending products",
      error: error.detail || error.message,
    });
  }
};

/**
 * GET /api/recommendations/category/:categoryId
 * Get category top products
 */
const getCategoryTopProducts = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const topK = parseInt(req.query.top_k) || 10;

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
        error: "Category ID must be a valid UUID",
      });
    }

    // Validate top_k range
    if (topK < 1 || topK > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid top_k parameter",
        error: "top_k must be between 1 and 50",
      });
    }

    const result = await recommendationService.getCategoryTopProducts(
      categoryId,
      topK
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error(
      `Error in getCategoryTopProducts controller: ${error.message}`
    );

    const status = error.status || 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to get category top products",
      error: error.detail || error.message,
    });
  }
};

/**
 * GET /api/recommendations/health
 * Check ML service health (Admin only)
 */
const checkMLServiceHealth = async (req, res) => {
  try {
    const healthStatus = await recommendationService.checkHealth();

    const httpStatus = healthStatus.status === "healthy" ? 200 : 503;

    return res.status(httpStatus).json({
      success: healthStatus.status === "healthy",
      data: healthStatus,
    });
  } catch (error) {
    logger.error(`Error in checkMLServiceHealth controller: ${error.message}`);

    return res.status(503).json({
      success: false,
      message: "ML service health check failed",
      error: error.message,
    });
  }
};

/**
 * POST /api/recommendations/track
 * Track recommendation analytics
 */
const trackRecommendation = async (req, res) => {
  try {
    const { product_id, recommendation_id, action } = req.body;
    const userId = req.user?.id; // Dari auth middleware

    // Validate required fields
    if (!product_id || !recommendation_id || !action) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        error: "product_id, recommendation_id, and action are required",
      });
    }

    // Validate action type
    const validActions = ["impression", "click", "purchase"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action type",
        error: `action must be one of: ${validActions.join(", ")}`,
      });
    }

    // TODO: Save to analytics database
    // const analytics = await RecommendationAnalytics.create({
    //   user_id: userId,
    //   product_id,
    //   recommendation_id,
    //   action,
    //   timestamp: new Date(),
    // });

    logger.info(
      `Recommendation tracked: ${action} - Product ${product_id} -> ${recommendation_id}`
    );

    return res.status(201).json({
      success: true,
      message: "Recommendation tracked successfully",
      data: {
        product_id,
        recommendation_id,
        action,
        tracked_at: new Date(),
      },
    });
  } catch (error) {
    logger.error(`Error in trackRecommendation controller: ${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Failed to track recommendation",
      error: error.message,
    });
  }
};

module.exports = {
  getSimilarProducts,
  getBundleRecommendations,
  getTrendingProducts,
  getCategoryTopProducts,
  checkMLServiceHealth,
  trackRecommendation,
};
