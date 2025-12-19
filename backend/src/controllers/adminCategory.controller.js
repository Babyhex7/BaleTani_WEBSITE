/**
 * Admin Category Controller
 * Mengelola CRUD kategori produk untuk admin
 *
 * CACHE INVALIDATION:
 * - Setiap CRUD category → Clear cache categories & products
 */

const { Op } = require("sequelize");
const { Category, Product } = require("../models");
const fs = require("fs");
const path = require("path");

const cacheService = require("../cache/cacheService");
const { PATTERNS } = require("../cache/cacheKeys");

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
    const whereClause = {};

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

    // Get categories
    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order]],
    });

    // Get product counts separately for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.count({
          where: {
            category_id: category.id,
            is_active: true,
          },
        });

        return {
          id: category.id,
          category_name: category.category_name,
          description: category.description,
          category_image: category.category_image,
          is_active: category.is_active,
          product_count: productCount,
          created_at: category.created_at,
          updated_at: category.updated_at,
        };
      })
    );

    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diambil",
      data: {
        categories: categoriesWithCount,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
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

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
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
        category_image: category.category_image,
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

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori wajib diisi",
      });
    }

    const existingCategory = await Category.findOne({
      where: {
        category_name,
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Nama kategori sudah digunakan",
      });
    }

    // Handle image upload
    const categoryData = {
      category_name,
      description,
      is_active,
    };

    if (req.file) {
      categoryData.category_image = `/uploads/categories/${req.file.filename}`;
    }

    const newCategory = await Category.create(categoryData);

    cacheService.delPattern(PATTERNS.CUSTOMER_CATEGORIES);
    cacheService.delPattern(PATTERNS.ADMIN_CATEGORIES);

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

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    if (category_name && category_name !== category.category_name) {
      const existingCategory = await Category.findOne({
        where: {
          category_name,
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

    const updateData = {};
    if (category_name !== undefined) updateData.category_name = category_name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (category.category_image) {
        const oldImagePath = path.join(__dirname, "../../public", category.category_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.category_image = `/uploads/categories/${req.file.filename}`;
    }

    await category.update(updateData);

    cacheService.delPattern(PATTERNS.CUSTOMER_CATEGORIES);
    cacheService.delPattern(PATTERNS.ADMIN_CATEGORIES);
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);
    cacheService.delPattern(PATTERNS.ADMIN_PRODUCTS);

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
 * Hard delete category (Super Admin only)
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    const productCount = await Product.count({
      where: {
        category_id: id,
      },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Kategori tidak dapat dihapus karena masih memiliki ${productCount} produk`,
      });
    }

    // Delete image file if exists
    if (category.category_image) {
      const imagePath = path.join(__dirname, "../../public", category.category_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const categoryName = category.category_name;

    await category.destroy();

    cacheService.delPattern(PATTERNS.CUSTOMER_CATEGORIES);
    cacheService.delPattern(PATTERNS.ADMIN_CATEGORIES);

    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus",
      data: {
        id: id,
        category_name: categoryName,
      },
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
 * PATCH /api/admin/categories/:id/toggle-status
 * Toggle category active status
 */
const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id },
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

/**
 * GET /api/admin/categories/all
 * Get all active categories (no pagination) - lightweight fields
 */
const getActiveCategoriesAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      attributes: ["id", "category_name"],
      order: [["category_name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: "Active categories retrieved",
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching active categories:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil kategori aktif",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/categories/:id/image
 * Delete category image only
 */
const deleteCategoryImage = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    if (!category.category_image) {
      return res.status(400).json({
        success: false,
        message: "Kategori tidak memiliki gambar",
      });
    }

    // Delete image file
    const imagePath = path.join(__dirname, "../../public", category.category_image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Update category to remove image reference
    await category.update({
      category_image: null,
      updated_at: new Date(),
    });

    cacheService.delPattern(PATTERNS.CUSTOMER_CATEGORIES);
    cacheService.delPattern(PATTERNS.ADMIN_CATEGORIES);
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);
    cacheService.delPattern(PATTERNS.ADMIN_PRODUCTS);

    res.status(200).json({
      success: true,
      message: "Gambar kategori berhasil dihapus",
      data: category,
    });
  } catch (error) {
    console.error("Error deleting category image:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus gambar kategori",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  deleteCategoryImage,
  toggleCategoryStatus,
  getActiveCategoriesAll,
};
