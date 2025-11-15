/**
 * ============================================
 * PUBLIC FAQ CONTROLLER
 * ============================================
 * Handle FAQ queries untuk customer (public endpoint)
 * Hanya return active FAQs
 *
 * @module publicFaq.controller
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const { FAQ } = require("../models");
const { Op } = require("sequelize");
const cacheService = require("../cache/cacheService");

/**
 * Get all active FAQs (public)
 * GET /api/public/faqs
 */
exports.getActiveFAQs = async (req, res, next) => {
  try {
    console.log("🔍 [PUBLIC FAQ] getActiveFAQs called");
    const { category = "", search = "" } = req.query;
    const cacheKey = `public_faqs_${category}_${search}`;
    console.log("📋 [PUBLIC FAQ] Query params:", { category, search });

    // Check cache
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log("✅ [PUBLIC FAQ] Returning cached data");
      return res.status(200).json({
        success: true,
        message: "FAQs retrieved successfully (from cache)",
        data: cachedData,
        cached: true,
      });
    }

    const whereClause = {
      is_active: true,
    };
    console.log("🔍 [PUBLIC FAQ] Building where clause...");

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { answer: { [Op.like]: `%${search}%` } },
      ];
    }

    console.log("🔍 [PUBLIC FAQ] Where clause:", whereClause);
    const faqs = await FAQ.findAll({
      where: whereClause,
      attributes: ["id", "question", "answer", "category", "order_number"],
      order: [
        ["order_number", "ASC"],
        ["created_at", "DESC"],
      ],
    });
    console.log(`✅ [PUBLIC FAQ] Found ${faqs.length} FAQs`);

    // Group by category
    const groupedFAQs = faqs.reduce((acc, faq) => {
      const category = faq.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {});

    const result = {
      all: faqs,
      by_category: groupedFAQs,
    };

    // Cache for 1 hour
    cacheService.set(cacheKey, result, 3600);

    console.log("📤 [PUBLIC FAQ] Sending response with", faqs.length, "FAQs");
    res.status(200).json({
      success: true,
      message: "FAQs retrieved successfully",
      data: result,
      cached: false,
    });
  } catch (error) {
    console.error("❌ [PUBLIC FAQ] Error:", error.message);
    console.error("❌ [PUBLIC FAQ] Stack:", error.stack);
    next(error);
  }
};

/**
 * Get single FAQ by ID (public)
 * GET /api/public/faqs/:id
 */
exports.getFAQById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findOne({
      where: {
        id,
        is_active: true,
      },
      attributes: ["id", "question", "answer", "category"],
    });

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "FAQ retrieved successfully",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get FAQ categories (public)
 * GET /api/public/faqs/categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const cacheKey = "faq_categories";

    // Check cache
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        message: "Categories retrieved successfully (from cache)",
        data: cachedData,
        cached: true,
      });
    }

    const categories = [
      { value: "umum", label: "Umum" },
      { value: "pembayaran", label: "Pembayaran" },
      { value: "pengiriman", label: "Pengiriman" },
      { value: "produk", label: "Produk" },
    ];

    // Get count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await FAQ.count({
          where: {
            category: cat.value,
            is_active: true,
          },
        });
        return { ...cat, count };
      })
    );

    // Cache for 1 hour
    cacheService.set(cacheKey, categoriesWithCount, 3600);

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categoriesWithCount,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};
