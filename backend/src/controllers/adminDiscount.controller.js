/**
 * Admin Discount Controller
 * Mengelola CRUD diskon untuk admin
 */

const { Op } = require("sequelize");
const { Discount, Product, ProductDiscount } = require("../models");

/**
 * GET /api/admin/discounts
 * Get all discounts with filters and pagination
 */
const getAllDiscounts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      discount_type = "",
      is_active = "",
      status = "", // active, expired, upcoming
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search by name
    if (search) {
      whereClause.discount_name = { [Op.like]: `%${search}%` };
    }

    // Filter by discount type
    if (discount_type) {
      whereClause.discount_type = discount_type;
    }

    // Filter by active status
    if (is_active !== "") {
      whereClause.is_active = is_active === "true";
    }

    // Filter by date status
    const currentDate = new Date().toISOString().split("T")[0];
    if (status === "active") {
      whereClause.start_date = { [Op.lte]: currentDate };
      whereClause.end_date = { [Op.gte]: currentDate };
      whereClause.is_active = true;
    } else if (status === "expired") {
      whereClause.end_date = { [Op.lt]: currentDate };
    } else if (status === "upcoming") {
      whereClause.start_date = { [Op.gt]: currentDate };
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get discounts with product count
    const { count, rows: discounts } = await Discount.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "products",
          through: {
            // where clause cleaned,
            attributes: ["original_price", "discounted_price"],
          },
          attributes: ["id", "name", "selling_price"],
          // where clause cleaned,
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order]],
      distinct: true,
    });

    // Format response
    const formattedDiscounts = discounts.map((discount) => {
      const today = new Date().toISOString().split("T")[0];
      let discountStatus = "upcoming";

      if (
        discount.start_date <= today &&
        discount.end_date >= today &&
        discount.is_active
      ) {
        discountStatus = "active";
      } else if (discount.end_date < today) {
        discountStatus = "expired";
      }

      return {
        id: discount.id,
        discount_name: discount.discount_name,
        discount_type: discount.discount_type,
        value: discount.value,
        start_date: discount.start_date,
        end_date: discount.end_date,
        is_active: discount.is_active,
        status: discountStatus,
        product_count: discount.products ? discount.products.length : 0,
        products: discount.products || [],
        created_at: discount.created_at,
        updated_at: discount.updated_at,
      };
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      success: true,
      message: "Diskon berhasil diambil",
      data: {
        discounts: formattedDiscounts,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting discounts:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil diskon",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/discounts/:id
 * Get discount detail by ID
 */
const getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findOne({
      where: { id },
      include: [
        {
          model: Product,
          as: "products",
          through: {
            // where clause cleaned,
            attributes: ["original_price", "discounted_price", "created_at"],
          },
          attributes: [
            "id",
            "name",
            "selling_price",
            "total_stock",
            "is_active",
          ],
          // where clause cleaned,
          required: false,
        },
      ],
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    // Calculate status
    const today = new Date().toISOString().split("T")[0];
    let status = "upcoming";

    if (
      discount.start_date <= today &&
      discount.end_date >= today &&
      discount.is_active
    ) {
      status = "active";
    } else if (discount.end_date < today) {
      status = "expired";
    }

    res.status(200).json({
      success: true,
      message: "Detail diskon berhasil diambil",
      data: {
        id: discount.id,
        discount_name: discount.discount_name,
        discount_type: discount.discount_type,
        value: discount.value,
        start_date: discount.start_date,
        end_date: discount.end_date,
        is_active: discount.is_active,
        status: status,
        product_count: discount.products ? discount.products.length : 0,
        products: discount.products || [],
        created_at: discount.created_at,
        updated_at: discount.updated_at,
      },
    });
  } catch (error) {
    console.error("Error getting discount detail:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail diskon",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/discounts
 * Create new discount
 */
const createDiscount = async (req, res) => {
  try {
    const {
      discount_name,
      discount_type,
      value,
      max_discount, // Max potongan untuk percentage
      start_date,
      end_date,
      is_active = true,
      product_ids = [],
    } = req.body;

    // Validation
    if (
      !discount_name ||
      !discount_type ||
      !value ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Semua field wajib diisi (discount_name, discount_type, value, start_date, end_date)",
      });
    }

    // Validate discount type
    if (!["percentage", "fixed_amount"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Tipe diskon harus 'percentage' atau 'fixed_amount'",
      });
    }

    // Validate percentage value
    if (discount_type === "percentage" && (value < 0 || value > 100)) {
      return res.status(400).json({
        success: false,
        message: "Nilai persentase harus antara 0-100",
      });
    }

    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Tanggal mulai tidak boleh lebih besar dari tanggal berakhir",
      });
    }

    // Create discount
    const newDiscount = await Discount.create({
      discount_name,
      discount_type,
      value,
      max_discount: max_discount || null,
      start_date,
      end_date,
      is_active,
    });

    // Add products to discount if provided
    if (product_ids && product_ids.length > 0) {
      // Get products to calculate prices
      const products = await Product.findAll({
        where: { id: product_ids },
        attributes: ["id", "selling_price"],
      });

      const productDiscounts = products.map((product) => {
        const originalPrice = parseFloat(product.selling_price);
        let discountedPrice = originalPrice;

        // Calculate discounted price
        if (discount_type === "percentage") {
          const discountAmount = (originalPrice * value) / 100;
          discountedPrice = originalPrice - discountAmount;
        } else if (discount_type === "fixed_amount") {
          discountedPrice = originalPrice - value;
        }

        // Ensure discounted price is not negative
        discountedPrice = Math.max(0, discountedPrice);

        return {
          product_id: product.id,
          discount_id: newDiscount.id,
          original_price: originalPrice,
          discounted_price: discountedPrice,
        };
      });

      await ProductDiscount.bulkCreate(productDiscounts);
    }

    // Fetch created discount with products
    const discountWithProducts = await Discount.findByPk(newDiscount.id, {
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: [] },
          attributes: ["id", "name", "selling_price"],
        },
      ],
    });

    // ========================================
    // CACHE INVALIDATION
    // ========================================
    // Hapus cache featured products (karena ada discount baru)
    // Hapus cache products (karena harga produk berubah dengan discount)
    // Hapus cache discounts (karena ada discount baru di list)
    cacheService.delPattern(PATTERNS.CUSTOMER_FEATURED);
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);
    cacheService.delPattern(PATTERNS.CUSTOMER_DISCOUNTS);
    console.log("[CACHE CLEAR] 🗑️ Featured, Products & Discounts cache - Discount created");

    res.status(201).json({
      success: true,
      message: "Diskon berhasil dibuat",
      data: discountWithProducts,
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat diskon",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/discounts/:id
 * Update discount
 */
const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      discount_name,
      discount_type,
      value,
      max_discount,
      start_date,
      end_date,
      is_active,
      product_ids,
    } = req.body;

    // Find discount
    const discount = await Discount.findOne({
      where: { id },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    // Validate discount type if provided
    if (
      discount_type &&
      !["percentage", "fixed_amount"].includes(discount_type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Tipe diskon harus 'percentage' atau 'fixed_amount'",
      });
    }

    // Validate percentage value if provided
    if (
      discount_type === "percentage" &&
      value !== undefined &&
      (value < 0 || value > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Nilai persentase harus antara 0-100",
      });
    }

    // Validate dates if both provided
    const newStartDate = start_date || discount.start_date;
    const newEndDate = end_date || discount.end_date;
    if (new Date(newStartDate) > new Date(newEndDate)) {
      return res.status(400).json({
        success: false,
        message: "Tanggal mulai tidak boleh lebih besar dari tanggal berakhir",
      });
    }

    // Update discount
    const updateData = {};
    if (discount_name !== undefined) updateData.discount_name = discount_name;
    if (discount_type !== undefined) updateData.discount_type = discount_type;
    if (value !== undefined) updateData.value = value;
    if (max_discount !== undefined) updateData.max_discount = max_discount;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date();

    await discount.update(updateData);

    // Update products if provided
    if (product_ids !== undefined) {
      // Remove all existing product associations
      await ProductDiscount.update(
        { deleted_at: new Date() },
        { where: { discount_id: id } }
      );

      // Add new product associations with calculated prices
      if (product_ids.length > 0) {
        // Get products to calculate prices
        const products = await Product.findAll({
          where: { id: product_ids },
          attributes: ["id", "selling_price"],
        });

        const productDiscounts = products.map((product) => {
          const originalPrice = parseFloat(product.selling_price);
          let discountedPrice = originalPrice;

          // Calculate discounted price based on updated discount values
          const discountType =
            updateData.discount_type || discount.discount_type;
          const discountValue = updateData.value || discount.value;

          if (discountType === "percentage") {
            const discountAmount = (originalPrice * discountValue) / 100;
            discountedPrice = originalPrice - discountAmount;
          } else if (discountType === "fixed_amount") {
            discountedPrice = originalPrice - discountValue;
          }

          // Ensure discounted price is not negative
          discountedPrice = Math.max(0, discountedPrice);

          return {
            product_id: product.id,
            discount_id: id,
            original_price: originalPrice,
            discounted_price: discountedPrice,
          };
        });

        await ProductDiscount.bulkCreate(productDiscounts);
      }
    }

    // Fetch updated discount with products
    const updatedDiscount = await Discount.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
          through: {
            // where clause cleaned,
            attributes: ["original_price", "discounted_price"],
          },
          attributes: ["id", "name", "selling_price"],
          // where clause cleaned,
          required: false,
        },
      ],
    });

    // ========================================
    // CACHE INVALIDATION
    // ========================================
    // Hapus cache featured products, products, dan discounts (karena discount berubah)
    cacheService.delPattern(PATTERNS.CUSTOMER_FEATURED);
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);
    cacheService.delPattern(PATTERNS.CUSTOMER_DISCOUNTS);
    console.log("[CACHE CLEAR] 🗑️ Featured, Products & Discounts cache - Discount updated");

    res.status(200).json({
      success: true,
      message: "Diskon berhasil diupdate",
      data: updatedDiscount,
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate diskon",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/discounts/:id
 * Hard delete discount
 */
const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    // Find discount
    const discount = await Discount.findOne({
      where: { id },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    // Delete all product associations first
    await ProductDiscount.destroy({
      where: {
        discount_id: id,
      },
    });

    // Hard delete discount
    await discount.destroy();

    // ========================================
    // CACHE INVALIDATION
    // ========================================
    // Hapus cache featured products, products, dan discounts (karena discount dihapus)
    cacheService.delPattern(PATTERNS.CUSTOMER_FEATURED);
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);
    cacheService.delPattern(PATTERNS.CUSTOMER_DISCOUNTS);
    console.log("[CACHE CLEAR] 🗑️ Featured, Products & Discounts cache - Discount deleted");

    res.status(200).json({
      success: true,
      message: "Diskon berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus diskon",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/discounts/:id/restore
 * Restore deleted discount (REMOVED - not needed with hard delete)
 */
// Function removed - hard delete doesn't support restore

/**
 * PATCH /api/admin/discounts/:id/toggle-status
 * Toggle discount active status
 */
const toggleDiscountStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findOne({
      where: { id },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    // Toggle status
    await discount.update({
      is_active: !discount.is_active,
      updated_at: new Date(),
    });

    // ========================================
    // CACHE INVALIDATION
    // ========================================
    // Hapus cache featured products, products, dan discounts (karena status discount berubah)
    cacheService.delPattern(PATTERNS.CUSTOMER_FEATURED);
    cacheService.delPattern(PATTERNS.CUSTOMER_PRODUCTS);
    cacheService.delPattern(PATTERNS.CUSTOMER_DISCOUNTS);
    console.log("[CACHE CLEAR] 🗑️ Featured, Products & Discounts cache - Discount status toggled");

    res.status(200).json({
      success: true,
      message: `Diskon berhasil ${
        discount.is_active ? "diaktifkan" : "dinonaktifkan"
      }`,
      data: {
        id: discount.id,
        discount_name: discount.discount_name,
        is_active: discount.is_active,
      },
    });
  } catch (error) {
    console.error("Error toggling discount status:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengubah status diskon",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/discounts/:id/products
 * Add products to discount
 */
const addProductsToDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_ids } = req.body;

    if (
      !product_ids ||
      !Array.isArray(product_ids) ||
      product_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "product_ids harus berupa array dan tidak boleh kosong",
      });
    }

    // Check if discount exists
    const discount = await Discount.findOne({
      where: { id },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    // Add products (skip if already exists)
    // Get products to calculate prices
    const products = await Product.findAll({
      where: { id: product_ids },
      attributes: ["id", "selling_price"],
    });

    const productDiscounts = products.map((product) => {
      const originalPrice = parseFloat(product.selling_price);
      let discountedPrice = originalPrice;

      // Calculate discounted price
      if (discount.discount_type === "percentage") {
        const discountAmount = (originalPrice * discount.value) / 100;
        discountedPrice = originalPrice - discountAmount;
      } else if (discount.discount_type === "fixed_amount") {
        discountedPrice = originalPrice - discount.value;
      }

      // Ensure discounted price is not negative
      discountedPrice = Math.max(0, discountedPrice);

      return {
        product_id: product.id,
        discount_id: id,
        original_price: originalPrice,
        discounted_price: discountedPrice,
      };
    });

    await ProductDiscount.bulkCreate(productDiscounts, {
      ignoreDuplicates: true,
    });

    // Get updated discount with products
    const updatedDiscount = await Discount.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
          through: {
            // where clause cleaned,
            attributes: ["original_price", "discounted_price"],
          },
          attributes: ["id", "name", "selling_price"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Produk berhasil ditambahkan ke diskon",
      data: updatedDiscount,
    });
  } catch (error) {
    console.error("Error adding products to discount:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan produk ke diskon",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/discounts/:id/products/:productId
 * Remove product from discount
 */
const removeProductFromDiscount = async (req, res) => {
  try {
    const { id, productId } = req.params;
    const adminId = req.user.id; // Fix: req.user.id bukan req.user.userId

    // Find product discount association
    const productDiscount = await ProductDiscount.findOne({
      where: {
        discount_id: id,
        product_id: productId,
      },
    });

    if (!productDiscount) {
      return res.status(404).json({
        success: false,
        message: "Asosiasi produk-diskon tidak ditemukan",
      });
    }

    // Soft delete association
    await productDiscount.update({
      deleted_at: new Date(),
      deleted_by: adminId,
    });

    res.status(200).json({
      success: true,
      message: "Produk berhasil dihapus dari diskon",
    });
  } catch (error) {
    console.error("Error removing product from discount:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus produk dari diskon",
      error: error.message,
    });
  }
};

module.exports = {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus,
  addProductsToDiscount,
  removeProductFromDiscount,
};
