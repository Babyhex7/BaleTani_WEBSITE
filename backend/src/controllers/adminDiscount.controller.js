const { Discount, Product, ProductDiscount } = require("../models");
const { Op } = require("sequelize");

/**
 * Create a new discount campaign
 * POST /api/admin/discounts
 */
exports.createDiscount = async (req, res) => {
  try {
    const {
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      is_active,
    } = req.body;

    // Validation
    if (
      !name ||
      !discount_type ||
      !discount_value ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Nama, tipe, nilai, tanggal mulai, dan tanggal selesai wajib diisi",
      });
    }

    // Validate discount type
    if (!["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Tipe diskon harus percentage atau fixed",
      });
    }

    // Validate discount value
    if (
      discount_type === "percentage" &&
      (discount_value < 0 || discount_value > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Nilai diskon persentase harus antara 0-100",
      });
    }

    if (discount_type === "fixed" && discount_value <= 0) {
      return res.status(400).json({
        success: false,
        message: "Nilai diskon fixed harus lebih dari 0",
      });
    }

    // Validate dates
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        success: false,
        message: "Tanggal mulai harus lebih awal dari tanggal selesai",
      });
    }

    const discount = await Discount.create({
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      is_active: is_active !== undefined ? is_active : true,
      created_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Diskon berhasil dibuat",
      data: discount,
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat diskon",
      error: error.message,
    });
  }
};

/**
 * Get all discounts with filters
 * GET /api/admin/discounts
 */
exports.getAllDiscounts = async (req, res) => {
  try {
    const {
      search,
      discount_type,
      status, // active, expired, upcoming
      is_active,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};

    // Search filter
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Discount type filter
    if (discount_type) {
      where.discount_type = discount_type;
    }

    // Active status filter
    if (is_active !== undefined) {
      where.is_active = is_active === "true";
    }

    // Date-based status filter
    const now = new Date();
    if (status === "active") {
      where.start_date = { [Op.lte]: now };
      where.end_date = { [Op.gte]: now };
      where.is_active = true;
    } else if (status === "expired") {
      where.end_date = { [Op.lt]: now };
    } else if (status === "upcoming") {
      where.start_date = { [Op.gt]: now };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Discount.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: [] },
          attributes: ["id", "name", "selling_price"],
        },
      ],
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
    console.error("Error getting discounts:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data diskon",
      error: error.message,
    });
  }
};

/**
 * Get discount by ID with assigned products
 * GET /api/admin/discounts/:id
 */
exports.getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findByPk(id, {
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: [] },
          attributes: [
            "id",
            "name",
            "selling_price",
            "category_id",
            "is_active",
          ],
        },
      ],
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: discount,
    });
  } catch (error) {
    console.error("Error getting discount:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data diskon",
      error: error.message,
    });
  }
};

/**
 * Update discount
 * PUT /api/admin/discounts/:id
 */
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      is_active,
    } = req.body;

    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    // Validate discount type if provided
    if (discount_type && !["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Tipe diskon harus percentage atau fixed",
      });
    }

    // Validate discount value if provided
    const finalType = discount_type || discount.discount_type;
    const finalValue =
      discount_value !== undefined ? discount_value : discount.discount_value;

    if (finalType === "percentage" && (finalValue < 0 || finalValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Nilai diskon persentase harus antara 0-100",
      });
    }

    if (finalType === "fixed" && finalValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Nilai diskon fixed harus lebih dari 0",
      });
    }

    // Validate dates if both provided
    const finalStartDate = start_date
      ? new Date(start_date)
      : discount.start_date;
    const finalEndDate = end_date ? new Date(end_date) : discount.end_date;

    if (finalStartDate >= finalEndDate) {
      return res.status(400).json({
        success: false,
        message: "Tanggal mulai harus lebih awal dari tanggal selesai",
      });
    }

    // Update fields
    if (name !== undefined) discount.name = name;
    if (description !== undefined) discount.description = description;
    if (discount_type !== undefined) discount.discount_type = discount_type;
    if (discount_value !== undefined) discount.discount_value = discount_value;
    if (start_date !== undefined) discount.start_date = start_date;
    if (end_date !== undefined) discount.end_date = end_date;
    if (is_active !== undefined) discount.is_active = is_active;

    await discount.save();

    res.status(200).json({
      success: true,
      message: "Diskon berhasil diupdate",
      data: discount,
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengupdate diskon",
      error: error.message,
    });
  }
};

/**
 * Soft delete discount
 * DELETE /api/admin/discounts/:id
 */
exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    discount.is_active = false;
    await discount.save();

    res.status(200).json({
      success: true,
      message: "Diskon berhasil dinonaktifkan",
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus diskon",
      error: error.message,
    });
  }
};

/**
 * Assign products to discount
 * POST /api/admin/discounts/:id/products
 */
exports.assignProductsToDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_ids } = req.body; // Array of product IDs

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs harus berupa array dan tidak boleh kosong",
      });
    }

    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    // Verify all products exist
    const products = await Product.findAll({
      where: { id: { [Op.in]: product_ids } },
    });

    if (products.length !== product_ids.length) {
      return res.status(400).json({
        success: false,
        message: "Beberapa produk tidak ditemukan",
      });
    }

    // Create product-discount associations
    const associations = product_ids.map((product_id) => ({
      discount_id: id,
      product_id,
    }));

    await ProductDiscount.bulkCreate(associations, {
      ignoreDuplicates: true, // Avoid errors if already assigned
    });

    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan ke diskon",
      data: {
        discount_id: id,
        products_count: product_ids.length,
      },
    });
  } catch (error) {
    console.error("Error assigning products to discount:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan produk ke diskon",
      error: error.message,
    });
  }
};

/**
 * Remove product from discount
 * DELETE /api/admin/discounts/:id/products/:productId
 */
exports.removeProductFromDiscount = async (req, res) => {
  try {
    const { id, productId } = req.params;

    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Diskon tidak ditemukan",
      });
    }

    const deleted = await ProductDiscount.destroy({
      where: {
        discount_id: id,
        product_id: productId,
      },
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan dalam diskon ini",
      });
    }

    res.status(200).json({
      success: true,
      message: "Produk berhasil dihapus dari diskon",
    });
  } catch (error) {
    console.error("Error removing product from discount:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus produk dari diskon",
      error: error.message,
    });
  }
};
