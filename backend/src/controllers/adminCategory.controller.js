const { Category } = require("../models");
const { Op } = require("sequelize");

/**
 * Admin Category Controller
 * Handle CRUD operations for categories
 */

// Get all categories with filters
exports.getAllCategories = async (req, res) => {
  try {
    const {
      search,
      is_active,
      include_deleted = "false",
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search filter
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    // Active/Inactive filter
    if (is_active !== undefined) {
      whereClause.is_active = is_active === "true";
    }

    // Include deleted or not
    if (include_deleted === "false") {
      whereClause.deleted_at = null;
    }

    const { count, rows } = await Category.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
      paranoid: include_deleted === "false", // Soft delete filter
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data kategori",
      error: error.message,
    });
  }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      paranoid: false, // Include soft deleted
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data kategori",
      error: error.message,
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon, is_active = true } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori harus diisi",
      });
    }

    // Check duplicate name
    const existingCategory = await Category.findOne({
      where: { name },
      paranoid: false,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Kategori dengan nama ini sudah ada",
      });
    }

    // Create category
    const category = await Category.create({
      name,
      description,
      icon,
      is_active,
    });

    res.status(201).json({
      success: true,
      message: "Kategori berhasil dibuat",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat kategori",
      error: error.message,
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    const { name, description, icon, is_active } = req.body;

    // Check duplicate name (exclude current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          id: { [Op.ne]: req.params.id },
        },
        paranoid: false,
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Kategori dengan nama ini sudah ada",
        });
      }
    }

    // Update category
    await category.update({
      name: name || category.name,
      description:
        description !== undefined ? description : category.description,
      icon: icon !== undefined ? icon : category.icon,
      is_active: is_active !== undefined ? is_active : category.is_active,
    });

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diupdate",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal update kategori",
      error: error.message,
    });
  }
};

// Soft delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Soft delete
    await category.destroy();

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori",
      error: error.message,
    });
  }
};

// Restore soft deleted category
exports.restoreCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      paranoid: false,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    if (!category.deleted_at) {
      return res.status(400).json({
        success: false,
        message: "Kategori tidak dalam status terhapus",
      });
    }

    // Restore category
    await category.restore();

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dipulihkan",
      data: category,
    });
  } catch (error) {
    console.error("Restore category error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memulihkan kategori",
      error: error.message,
    });
  }
};

module.exports = exports;
