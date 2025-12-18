/**
 * Recommendation Service
 * HTTP client untuk communicate dengan FastAPI ML Service
 */

const axios = require("axios");
const logger = require("../utils/logger");

// Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const REQUEST_TIMEOUT = 5000; // 5 seconds
const CACHE_TTL = 900; // 15 minutes

// Axios instance dengan default config
const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Cache storage (in-memory - untuk production pakai Redis)
const cache = new Map();

/**
 * Cache helper functions
 */
const getCacheKey = (endpoint, params) => {
  return `${endpoint}:${JSON.stringify(params)}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() > cached.expiry;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

const setCache = (key, data, ttl = CACHE_TTL) => {
  cache.set(key, {
    data,
    expiry: Date.now() + ttl * 1000,
  });
};

/**
 * Get similar products
 *
 * @param {string} productId - UUID of the product
 * @param {number} topK - Number of recommendations (default: 10)
 * @returns {Promise<Object>} Recommendation response
 */
const getSimilarProducts = async (productId, topK = 10) => {
  try {
    const cacheKey = getCacheKey("similar", { productId, topK });
    const cached = getFromCache(cacheKey);

    if (cached) {
      logger.debug(`Cache HIT for similar products: ${productId}`);
      return { ...cached, from_cache: true };
    }

    logger.debug(
      `Calling ML service: GET /v1/recommendations/similar/${productId}`
    );

    const response = await mlClient.get(
      `/v1/recommendations/similar/${productId}`,
      {
        params: { top_k: topK },
      }
    );

    // Enrich recommendations dengan data lengkap dari database
    const enrichedData = await enrichRecommendations(response.data);

    setCache(cacheKey, enrichedData, CACHE_TTL);

    return { ...enrichedData, from_cache: false };
  } catch (error) {
    logger.error(`Error getting similar products: ${error.message}`);
    throw handleMLServiceError(error);
  }
};

/**
 * Enrich recommendations dengan data lengkap dari database
 */
const enrichRecommendations = async (mlResponse) => {
  try {
    const Product = require("../models/Product");
    const { Op } = require("sequelize");

    const recommendations =
      mlResponse.recommendations || mlResponse.bundle_recommendations || [];
    if (recommendations.length === 0) {
      return mlResponse;
    }

    // Extract product IDs
    const productIds = recommendations.map((rec) => rec.product_id);

    // Fetch full product data dari database
    const products = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        is_active: true,
      },
      include: [
        { association: "Category", attributes: ["id", "category_name"] },
        {
          association: "ProductImages",
          attributes: ["id", "image_url", "is_primary"],
        },
        {
          association: "ProductDiscount",
          attributes: ["id", "discount_id", "discounted_price"],
        },
      ],
    });

    // Create map untuk quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Enrich recommendations dengan data dari database
    const enriched = recommendations.map((rec) => {
      const product = productMap.get(rec.product_id);
      if (!product) {
        return rec; // Product not found, return original
      }

      return {
        ...rec,
        // Product info
        product_name: product.product_name,
        description: product.description,
        category_name: product.Category?.category_name || rec.category_name,
        // Pricing
        price: parseFloat(product.price) || 0,
        selling_price: parseFloat(product.price) || 0,
        final_price: product.ProductDiscount?.discounted_price || product.price,
        // Stock & quantity
        stock: product.stock || 0,
        total_stock: product.stock || 0,
        quantity_info: product.quantity_info || "1 unit",
        // Images
        images:
          product.ProductImages?.map((img) => ({
            id: img.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
          })) || [],
        // Other fields
        is_active: product.is_active,
        discount: product.ProductDiscount
          ? {
              discounted_price: product.ProductDiscount.discounted_price,
            }
          : null,
      };
    });

    return {
      ...mlResponse,
      recommendations: enriched,
      bundle_recommendations: enriched,
    };
  } catch (error) {
    logger.error(`Error enriching recommendations: ${error.message}`);
    // Return original data jika enrichment gagal
    return mlResponse;
  }
};

/**
 * Get bundle recommendations
 *
 * @param {string[]} productIds - Array of product UUIDs (max 10)
 * @param {number} topK - Number of recommendations (default: 8)
 * @returns {Promise<Object>} Recommendation response
 */
const getBundleRecommendations = async (productIds, topK = 8) => {
  try {
    const cacheKey = getCacheKey("bundle", { productIds, topK });
    const cached = getFromCache(cacheKey);

    if (cached) {
      logger.debug(`Cache HIT for bundle recommendations`);
      return { ...cached, from_cache: true };
    }

    logger.debug(`Calling ML service: POST /v1/recommendations/bundle`);

    const response = await mlClient.post(
      "/v1/recommendations/bundle",
      { product_ids: productIds },
      { params: { top_k: topK } }
    );

    // Enrich recommendations dengan data lengkap dari database
    const enrichedData = await enrichRecommendations(response.data);

    setCache(cacheKey, enrichedData, CACHE_TTL);

    return { ...enrichedData, from_cache: false };
  } catch (error) {
    logger.error(`Error getting bundle recommendations: ${error.message}`);
    throw handleMLServiceError(error);
  }
};

/**
 * Get trending products
 *
 * @param {string|null} categoryId - Optional category UUID filter
 * @param {number} topK - Number of products (default: 12)
 * @returns {Promise<Object>} Trending products response
 */
const getTrendingProducts = async (categoryId = null, topK = 12) => {
  try {
    const cacheKey = getCacheKey("trending", { categoryId, topK });
    const cached = getFromCache(cacheKey);

    if (cached) {
      logger.debug(`Cache HIT for trending products`);
      return { ...cached, from_cache: true };
    }

    logger.debug(`Calling ML service: GET /v1/recommendations/trending`);

    const params = { top_k: topK };
    if (categoryId) params.category_id = categoryId;

    const response = await mlClient.get("/v1/recommendations/trending", {
      params,
    });

    // Trending cache longer (2 hours)
    setCache(cacheKey, response.data, 7200);

    return { ...response.data, from_cache: false };
  } catch (error) {
    logger.error(`Error getting trending products: ${error.message}`);
    throw handleMLServiceError(error);
  }
};

/**
 * Get category top products
 *
 * @param {string} categoryId - Category UUID
 * @param {number} topK - Number of products (default: 10)
 * @returns {Promise<Object>} Top products response
 */
const getCategoryTopProducts = async (categoryId, topK = 10) => {
  try {
    const cacheKey = getCacheKey("category", { categoryId, topK });
    const cached = getFromCache(cacheKey);

    if (cached) {
      logger.debug(`Cache HIT for category top products: ${categoryId}`);
      return { ...cached, from_cache: true };
    }

    logger.debug(
      `Calling ML service: GET /v1/recommendations/category/${categoryId}`
    );

    const response = await mlClient.get(
      `/v1/recommendations/category/${categoryId}`,
      {
        params: { top_k: topK },
      }
    );

    // Category cache longer (1 hour)
    setCache(cacheKey, response.data, 3600);

    return { ...response.data, from_cache: false };
  } catch (error) {
    logger.error(`Error getting category top products: ${error.message}`);
    throw handleMLServiceError(error);
  }
};

/**
 * Check ML service health
 *
 * @returns {Promise<Object>} Health status
 */
const checkHealth = async () => {
  try {
    const response = await mlClient.get("/health");
    return response.data;
  } catch (error) {
    logger.error(`ML service health check failed: ${error.message}`);
    return {
      status: "unhealthy",
      error: error.message,
      model_loaded: false,
    };
  }
};

/**
 * Clear cache (manual atau scheduled)
 *
 * @param {string|null} pattern - Optional pattern untuk selective clear
 */
const clearCache = (pattern = null) => {
  if (!pattern) {
    cache.clear();
    logger.info("All recommendation cache cleared");
    return { cleared: "all" };
  }

  let cleared = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  }

  logger.info(`Cleared ${cleared} cache entries matching pattern: ${pattern}`);
  return { cleared, pattern };
};

/**
 * Error handler untuk ML service calls
 */
const handleMLServiceError = (error) => {
  if (error.response) {
    // ML service responded dengan error
    const { status, data } = error.response;

    if (status === 404) {
      return {
        status: 404,
        message: "Product not found",
        detail: data.detail || "Product not found in recommendation system",
      };
    }

    if (status === 503) {
      return {
        status: 503,
        message: "ML service unavailable",
        detail: "Recommendation model not loaded",
      };
    }

    return {
      status: status || 500,
      message: "ML service error",
      detail: data.detail || error.message,
    };
  }

  if (error.code === "ECONNREFUSED") {
    return {
      status: 503,
      message: "ML service unavailable",
      detail:
        "Cannot connect to ML service. Please check if the service is running.",
    };
  }

  if (error.code === "ETIMEDOUT") {
    return {
      status: 504,
      message: "ML service timeout",
      detail: "Request to ML service timed out",
    };
  }

  // Unknown error
  return {
    status: 500,
    message: "Internal server error",
    detail: error.message,
  };
};

module.exports = {
  getSimilarProducts,
  getBundleRecommendations,
  getTrendingProducts,
  getCategoryTopProducts,
  checkHealth,
  clearCache,
};
