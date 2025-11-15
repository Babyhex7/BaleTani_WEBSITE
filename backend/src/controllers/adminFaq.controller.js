/**
 * ============================================
 * ADMIN FAQ CONTROLLER
 * ============================================
 * Handle CRUD operations untuk FAQ management
 * - Create FAQ
 * - Get All FAQs (with filters)
 * - Get Single FAQ
 * - Update FAQ
 * - Delete FAQ
 * - Bulk Update Order
 *
 * @module adminFaq.controller
 * @author BaleTani Development Team
 * @created 2025-11-14
 */

const { FAQ, Admin } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");

/**
 * Get all FAQs with filters
 * GET /api/admin/faqs
 */
exports.getAllFAQs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      is_active = "",
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search filter (question or answer)
    if (search) {
      whereClause[Op.or] = [
        { question: { [Op.like]: `%${search}%` } },
        { answer: { [Op.like]: `%${search}%` } },
      ];
    }

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Active status filter
    if (is_active !== "") {
      whereClause.is_active = is_active === "true";
    }

    const { count, rows: faqs } = await FAQ.findAndCountAll({
      where: whereClause,
      order: [
        ["order_number", "ASC"],
        ["created_at", "DESC"],
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Format data untuk frontend
    const formattedFaqs = faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      display_order: faq.order_number,
      order_number: faq.order_number,
      is_active: faq.is_active,
      created_at: faq.created_at,
      updated_at: faq.updated_at,
    }));

    res.status(200).json({
      success: true,
      message: "FAQs retrieved successfully",
      data: formattedFaqs,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single FAQ by ID
 * GET /api/admin/faqs/:id
 */
exports.getFAQById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByPk(id);

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
 * Create new FAQ
 * POST /api/admin/faqs
 */
exports.createFAQ = async (req, res, next) => {
  try {
    const { question, answer, category, order_number, is_active } = req.body;
    const adminId = req.user.id;

    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Pertanyaan dan jawaban wajib diisi",
      });
    }

    // Create FAQ
    const faq = await FAQ.create({
      question,
      answer,
      category: category || "umum",
      order_number: order_number || 0,
      is_active: is_active !== undefined ? is_active : true,
      created_by: adminId,
      updated_by: adminId,
    });

    res.status(201).json({
      success: true,
      message: "FAQ berhasil dibuat",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update FAQ
 * PUT /api/admin/faqs/:id
 */
exports.updateFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order_number, is_active } = req.body;
    const adminId = req.user.id;

    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ tidak ditemukan",
      });
    }

    // Update fields
    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;
    if (order_number !== undefined) faq.order_number = order_number;
    if (is_active !== undefined) faq.is_active = is_active;
    faq.updated_by = adminId;

    await faq.save();

    res.status(200).json({
      success: true,
      message: "FAQ berhasil diupdate",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete FAQ
 * DELETE /api/admin/faqs/:id
 */
exports.deleteFAQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByPk(id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ tidak ditemukan",
      });
    }

    await faq.destroy();

    res.status(200).json({
      success: true,
      message: "FAQ berhasil dihapus",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk update FAQ order
 * PUT /api/admin/faqs/bulk-order
 */
exports.bulkUpdateOrder = async (req, res, next) => {
  try {
    const { faqs } = req.body; // Array of { id, order_number }

    if (!Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data FAQs tidak valid",
      });
    }

    // Update each FAQ order
    const updatePromises = faqs.map((item) =>
      FAQ.update(
        { order_number: item.order_number },
        { where: { id: item.id } }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Urutan FAQ berhasil diupdate",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get FAQ categories with count
 * GET /api/admin/faqs/categories/stats
 */
exports.getCategoryStats = async (req, res, next) => {
  try {
    const stats = await FAQ.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["category"],
    });

    res.status(200).json({
      success: true,
      message: "Category stats retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
