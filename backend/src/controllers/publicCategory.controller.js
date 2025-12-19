/**
 * Public Category Controller
 * Handle category operations for public/customer access
 *
 * CACHING STRATEGY:
 * - Categories list: Cache 1 jam (3600 detik) - Karena jarang berubah
 * - Category detail: Cache 1 jam (3600 detik)
 * - Cache invalidation: Saat admin CRUD category
 */

const { Op } = require("sequelize");
const {
  Category,
  Product,
  ProductImage,
  ProductDiscount,
  Discount,
} = require("../models");

// Import cache service dan cache keys
const cacheService = require("../cache/cacheService");
const { CUSTOMER } = require("../cache/cacheKeys");

/**
 * GET /api/public/categories
 * Get all active categories with product count
 *
 * CACHING:
 * - Cache key: customer:categories:list
 * - TTL: 3600 detik (1 jam) - Categories jarang berubah
 * - Invalidation: Saat admin CRUD category
 */
const getAllCategories = async (req, res) => {
  try {
    const {
      search = "",
      sort_by = "category_name",
      sort_order = "ASC",
    } = req.query;

    // ========================================
    // STEP 1: Check Cache
    // ========================================
    // Skip cache jika ada search (karena terlalu banyak kombinasi)
    const useCache = !search;

    if (useCache) {
      const cacheKey = CUSTOMER.CATEGORIES;
      const cachedData = cacheService.get(cacheKey);

      if (cachedData) {
        return res.json({
          success: true,
          message: "Kategori berhasil diambil dari cache",
          data: cachedData,
          cached: true, // Flag untuk debugging
        });
      }
    }

    // ========================================
    // STEP 2: Cache MISS - Query Database
    // ========================================
    console.log("[DB QUERY] Categories - Cache miss, querying database...");

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
          where: {
            is_active: true,
            product_type: "online", // Only count online products
          },
          required: false,
        },
      ],
      order: [[sort_by, sort_order]],
      attributes: ["id", "category_name", "description", "category_image", "created_at"],
    });

    // Format response with product count
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      category_name: category.category_name,
      description: category.description,
      category_image: category.category_image,
      product_count: category.products ? category.products.length : 0,
      created_at: category.created_at,
    }));

    // ========================================
    // STEP 3: Save to Cache (jika tidak ada search)
    // ========================================
    if (useCache) {
      const cacheKey = CUSTOMER.CATEGORIES;
      // TTL: 3600 detik (1 jam) - Categories jarang berubah
      cacheService.set(cacheKey, formattedCategories, 3600);
    }

    // ========================================
    // STEP 4: Return Response
    // ========================================
    res.status(200).json({
      success: true,
      message: "Kategori berhasil diambil",
      data: formattedCategories,
      cached: false, // Flag untuk debugging
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
      product_type: "online", // Only show online products to customers
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
          // ✅ FIX: Don't filter by is_primary, get all images and pick first one
          // where: { is_primary: true },
          required: false,
        },
        {
          model: ProductDiscount,
          as: "productDiscounts",
          attributes: ["id", "product_id", "discount_id", "discounted_price"],
          required: false,
          include: [
            {
              model: Discount,
              as: "discount",
              attributes: [
                "id",
                "discount_name",
                "discount_type",
                "value",
                "max_discount",
                "start_date",
                "end_date",
                "is_active",
              ],
              where: {
                is_active: true,
                start_date: { [Op.lte]: new Date() },
                end_date: { [Op.gte]: new Date() },
              },
              required: false,
            },
          ],
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
    const formattedProducts = products.map((product) => {
      const productData = product.toJSON();

      // Get active discount - Use pre-calculated discounted_price from table
      const activeDiscount = productData.productDiscounts?.[0];
      const discount = activeDiscount?.discount;

      let discountInfo = null;
      if (discount && activeDiscount.discounted_price) {
        const finalPrice = parseFloat(activeDiscount.discounted_price);
        const originalPrice = parseFloat(productData.selling_price);
        const savingsAmount = originalPrice - finalPrice;

        discountInfo = {
          id: discount.id,
          name: discount.discount_name,
          type: discount.discount_type,
          value: parseFloat(discount.value),
          maxDiscount: discount.max_discount
            ? parseFloat(discount.max_discount)
            : null,
          finalPrice: finalPrice,
          savings: Math.round(savingsAmount * 100) / 100,
          validUntil: discount.end_date,
        };
      }

      return {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.selling_price),
        finalPrice: discountInfo
          ? discountInfo.finalPrice
          : parseFloat(productData.selling_price),
        stock: productData.total_stock,
        unit: productData.quantity_info || "unit", // ✅ Added for consistency with publicProduct
        image:
          productData.images && productData.images.length > 0
            ? productData.images[0].image_url
            : null,
        discount: discountInfo,
        created_at: productData.created_at,
      };
    });

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
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
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
