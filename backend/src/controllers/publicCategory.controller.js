/**
 * Public Category Controller
 * Handle category operations for public/customer access
 */

const { Op } = require("sequelize");
const { Category, Product, ProductImage } = require("../models");

/**
 * GET /api/public/categories
 * Get all active categories with product count
 */
const getAllCategories = async (req, res) => {
  try {
    const {
      search = "",
      sort_by = "category_name",
      sort_order = "ASC",
    } = req.query;

    // Build where clause
    const whereClause = {
      is_active: true,
    };

    // Search by name
    if (search) {
      whereClause.category_name = { [Op.like]: `%${search}%` };
    }

    // Get active categories with product count
    const categories = await Category.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id"],
          where: { is_active: true },
          required: false,
        },
      ],
      order: [[sort_by, sort_order]],
      attributes: ["id", "category_name", "description", "created_at"],
    });

    // Format response with product count
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      category_name: category.category_name,
      description: category.description,
      product_count: category.products ? category.products.length : 0,
      created_at: category.created_at,
    }));

    res.status(200).json({
      success: true,
      message: "Kategori berhasil diambil",
      data: formattedCategories,
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
 * GET /api/public/categories/:id
 * Get category detail with its products
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 12,
      search = "",
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    // Find category
    const category = await Category.findOne({
      where: { id, is_active: true },
      attributes: ["id", "category_name", "description"],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    // Build where clause for products
    const productWhereClause = {
      category_id: id,
      is_active: true,
    };

    // Search products
    if (search) {
      productWhereClause.name = { [Op.like]: `%${search}%` };
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get products in this category
    const { count, rows: products } = await Product.findAndCountAll({
      where: productWhereClause,
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["image_url", "is_primary"],
          where: { is_primary: true },
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order]],
      attributes: [
        "id",
        "name",
        "description",
        "selling_price",
        "quantity_info",
        "total_stock",
        "created_at",
      ],
    });

    // Format products
    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.selling_price,
      stock: product.total_stock,
      image:
        product.images && product.images.length > 0
          ? product.images[0].image_url
          : null,
      created_at: product.created_at,
    }));

    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Detail kategori berhasil diambil",
      data: {
        category: {
          id: category.id,
          category_name: category.category_name,
          description: category.description,
          product_count: count,
        },
        products: formattedProducts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
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

module.exports = {
  getAllCategories,
  getCategoryById,
};
