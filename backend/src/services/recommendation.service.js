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

    console.log('📥 [SIMILAR] ML Service response:', JSON.stringify(response.data, null, 2));

    // Enrich recommendations dengan data lengkap dari database
    const enrichedData = await enrichRecommendations(response.data);

    console.log('📤 [SIMILAR] Enriched data:', JSON.stringify(enrichedData, null, 2));

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
    const { Product } = require("../models");
    const { Op } = require("sequelize");

    const recommendations =
      mlResponse.recommendations || mlResponse.bundle_recommendations || [];
    
    console.log('🔍 [ENRICH] Starting enrichment for', recommendations.length, 'recommendations');
    
    if (recommendations.length === 0) {
      console.log('⚠️ [ENRICH] No recommendations to enrich');
      return mlResponse;
    }

    // Extract product IDs
    const productIds = recommendations.map((rec) => rec.product_id);
    console.log('🔍 [ENRICH] Product IDs to fetch:', productIds);

    // Fetch full product data dari database
    const products = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        is_active: true,
      },
      attributes: [
        'id', 
        'name', 
        'description', 
        'selling_price', 
        'quantity_info', 
        'total_stock', 
        'is_active',
        'category_id'
      ],
      include: [
        { 
          association: "category",  // Lowercase sesuai definition di models/index.js
          attributes: ["id", "category_name"],
          required: false
        },
        {
          association: "images",  // Lowercase sesuai definition di models/index.js
          attributes: ["id", "image_url", "is_primary"],
          required: false
        },
        {
          association: "productDiscounts",  // Plural sesuai definition
          attributes: ["id", "discount_id", "discounted_price"],
          required: false,
          include: [{
            association: "discount",
            attributes: ["id", "discount_name", "is_active", "start_date", "end_date"],
            required: false
          }]
        },
      ],
    });

    console.log('✅ [ENRICH] Found', products.length, 'products from database');
    if (products.length > 0) {
      const sampleProduct = products[0].toJSON();
      console.log('📦 [ENRICH] Sample raw product from DB:');
      console.log('  - name:', sampleProduct.name);
      console.log('  - selling_price:', sampleProduct.selling_price);
      console.log('  - total_stock:', sampleProduct.total_stock);
      console.log('  - category:', sampleProduct.category?.category_name);
      console.log('  - images count:', sampleProduct.images?.length || 0);
      console.log('  - discounts count:', sampleProduct.productDiscounts?.length || 0);
    }

    // Create map untuk quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Enrich recommendations dengan data dari database
    const enriched = recommendations.map((rec, index) => {
      const product = productMap.get(rec.product_id);
      if (!product) {
        console.warn(`⚠️ [ENRICH] Product not found in DB: ${rec.product_id}`);
        return rec; // Product not found, return original
      }

      // Get active discount if exists
      const activeDiscount = product.productDiscounts?.find(pd => {
        const discount = pd.discount;
        if (!discount) return false;
        const now = new Date();
        return discount.is_active && 
               new Date(discount.start_date) <= now && 
               new Date(discount.end_date) >= now;
      });

      const enrichedProduct = {
        ...rec,
        // Product info (field name di DB adalah 'name', bukan 'product_name')
        product_name: product.name || product.product_name,
        description: product.description,
        category_name: product.category?.category_name || rec.category_name,
        // Pricing (field di DB adalah 'selling_price', bukan 'price')
        price: parseFloat(product.selling_price) || 0,
        selling_price: parseFloat(product.selling_price) || 0,
        final_price: activeDiscount?.discounted_price || product.selling_price,
        // Stock & quantity (field di DB adalah 'total_stock', bukan 'stock')
        stock: product.total_stock || 0,
        total_stock: product.total_stock || 0,
        quantity_info: product.quantity_info || "1 unit",
        // Images
        images:
          product.images?.map((img) => ({
            id: img.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
          })) || [],
        // Other fields
        is_active: product.is_active,
        discount: activeDiscount
          ? {
              discounted_price: activeDiscount.discounted_price,
            }
          : null,
      };

      if (index === 0) {
        console.log('📦 [ENRICH] Sample enriched product:', JSON.stringify(enrichedProduct, null, 2));
      }

      return enrichedProduct;
    });

    console.log('✅ [ENRICH] Successfully enriched', enriched.length, 'products');

    // Return consistent structure - always use 'recommendations' as the main field
    return {
      ...mlResponse,
      recommendations: enriched,
    };
  } catch (error) {
    logger.error(`Error enriching recommendations: ${error.message}`);
    console.error('❌ [ENRICH] Error details:', error);
    console.error('❌ [ENRICH] Stack:', error.stack);
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
