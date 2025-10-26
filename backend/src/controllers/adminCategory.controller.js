/**
 * Admin Category Controller
 * Mengelola CRUD kategori produk untuk admin
 */

const { Op } = require("sequelize");
const { Category, Product, SoftDeleteLog } = require("../models");

/**
 * GET /api/admin/categories
 * Get all categories with filters and pagination
 */
const getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      is_active = "",
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    // Build where clause
    const whereClause = {
      deleted_at: null,
    };

    // Search by name or description
    if (search) {
      whereClause[Op.or] = [
        { category_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by active status
    if (is_active !== "") {
      whereClause.is_active = is_active === "true";
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get categories with product count
    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id"],
          where: { deleted_at: null, is_active: true },
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order]],
      distinct: true,
    });

    // Format response with product count
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      category_name: category.category_name,
      description: category.description,
      is_active: category.is_active,
      product_count: category.products ? category.products.length : 0,
      created_at: category.created_at,
      updated_at: category.updated_at,
    }));

    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diambil",
      data: {
        categories: formattedCategories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil kategori",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/categories/:id
 * Get category detail by ID
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, deleted_at: null },
      include: [
        {
          model: Product,
          as: "products",
          where: { deleted_at: null },
          required: false,
          attributes: [
            "id",
            "name",
            "selling_price",
            "total_stock",
            "is_active",
          ],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detail kategori berhasil diambil",
      data: {
        id: category.id,
        category_name: category.category_name,
        description: category.description,
        is_active: category.is_active,
        product_count: category.products ? category.products.length : 0,
        products: category.products || [],
        created_at: category.created_at,
        updated_at: category.updated_at,
      },
    });
  } catch (error) {
    console.error("Error getting category detail:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail kategori",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/categories
 * Create new category
 */
const createCategory = async (req, res) => {
  try {
    const { category_name, description, is_active = true } = req.body;

    // Validation
    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({
      where: {
        category_name,
        deleted_at: null,
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori sudah digunakan",
      });
    }

    // Create category
    const newCategory = await Category.create({
      category_name,
      description,
      is_active,
    });

    res.status(201).json({
      success: true,
      message: "Kategori berhasil dibuat",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat kategori",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/categories/:id
 * Update category
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description, is_active } = req.body;

    // Find category
    const category = await Category.findOne({
      where: { id, deleted_at: null },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Check if new name already exists (exclude current category)
    if (category_name && category_name !== category.category_name) {
      const existingCategory = await Category.findOne({
        where: {
          category_name,
          deleted_at: null,
          id: { [Op.ne]: id },
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Nama kategori sudah digunakan",
        });
      }
    }

    // Update category
    const updateData = {};
    if (category_name !== undefined) updateData.category_name = category_name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date();

    await category.update(updateData);

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diupdate",
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate kategori",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/categories/:id
 * Soft delete category (Super Admin only)
 */
const softDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id; // Fix: req.user.id bukan req.user.userId

    // Find category
    const category = await Category.findOne({
      where: { id, deleted_at: null },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Check if category has active products
    const activeProductCount = await Product.count({
      where: {
        category_id: id,
        deleted_at: null,
        is_active: true,
      },
    });

    if (activeProductCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak dapat dihapus karena masih memiliki ${activeProductCount} produk aktif`,
      });
    }

    // Soft delete
    await category.update({
      deleted_at: new Date(),
      deleted_by: adminId,
    });

    // Log soft delete
    await SoftDeleteLog.create({
      table_name: "product_categories",
      record_id: id,
      deleted_by: adminId,
      deleted_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus kategori",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/categories/:id/restore
 * Restore soft deleted category (Super Admin only)
 */
const restoreCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find deleted category
    const category = await Category.findOne({
      where: {
        id,
        deleted_at: { [Op.ne]: null },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan atau belum dihapus",
      });
    }

    // Restore category
    await category.update({
      deleted_at: null,
      deleted_by: null,
    });

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dipulihkan",
      data: category,
    });
  } catch (error) {
    console.error("Error restoring category:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memulihkan kategori",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/admin/categories/:id/toggle-status
 * Toggle category active status
 */
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id, deleted_at: null },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Toggle status
    await category.update({
      is_active: !category.is_active,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Kategori berhasil ${
        category.is_active ? "diaktifkan" : "dinonaktifkan"
      }`,
      data: {
        id: category.id,
        category_name: category.category_name,
        is_active: category.is_active,
      },
    });
  } catch (error) {
    console.error("Error toggling category status:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengubah status kategori",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  softDeleteCategory,
  restoreCategory,
  toggleCategoryStatus,
};
