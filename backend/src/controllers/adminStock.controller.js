const { Product, Category, StockMovement, sequelize } = require("../models");
const { Op } = require("sequelize");

/**
 * Get stock overview summary statistics
 * GET /api/admin/stock/overview
 */
exports.getStockOverview = async (req, res) => {
  try {
    // Total products count
    const totalProducts = await Product.count({
      where: { is_active: true },
    });

    // Products in stock (total_stock > 0)
    const inStockCount = await Product.count({
      where: {
        is_active: true,
        total_stock: { [Op.gt]: 0 },
      },
    });

    // Low stock products (total_stock > 0 AND total_stock <= min_stock)
    const lowStockCount = await Product.count({
      where: {
        is_active: true,
        total_stock: { [Op.gt]: 0 },
        [Op.and]: [
          sequelize.where(
            sequelize.col("total_stock"),
            Op.lte,
            sequelize.col("min_stock")
          ),
        ],
      },
    });

    // Out of stock products (total_stock = 0)
    const outOfStockCount = await Product.count({
      where: {
        is_active: true,
        total_stock: 0,
      },
    });

    // Total inventory value (SUM(selling_price * total_stock))
    const inventoryValue =
      (await Product.sum(sequelize.literal("selling_price * total_stock"), {
        where: { is_active: true },
      })) || 0;

    // Get top 5 products by stock value
    const topProducts = await Product.findAll({
      where: { is_active: true },
      attributes: [
        "id",
        "name",
        "selling_price",
        "total_stock",
        [sequelize.literal("selling_price * total_stock"), "stock_value"],
      ],
      order: [[sequelize.literal("selling_price * total_stock"), "DESC"]],
      limit: 5,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total_products: totalProducts,
          in_stock: inStockCount,
          low_stock: lowStockCount,
          out_of_stock: outOfStockCount,
          inventory_value: Math.round(inventoryValue),
        },
        top_products: topProducts,
      },
    });
  } catch (error) {
    console.error("Error getting stock overview:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil ringkasan stok",
      error: error.message,
    });
  }
};

/**
 * Get products with low stock
 * GET /api/admin/stock/low-stock
 */
exports.getLowStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: {
        is_active: true,
        total_stock: { [Op.gt]: 0 },
        [Op.and]: [
          sequelize.where(
            sequelize.col("total_stock"),
            Op.lte,
            sequelize.col("min_stock")
          ),
        ],
      },
      attributes: [
        "id",
        "name",
        "sku",
        "selling_price",
        "total_stock",
        "min_stock",
        [sequelize.literal("min_stock - total_stock"), "stock_needed"],
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [
        [sequelize.literal("total_stock - min_stock"), "ASC"], // Most critical first
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
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
    console.error("Error getting low stock products:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil produk stok rendah",
      error: error.message,
    });
  }
};

/**
 * Get out of stock products
 * GET /api/admin/stock/out-of-stock
 */
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: {
        is_active: true,
        total_stock: 0,
      },
      attributes: [
        "id",
        "name",
        "sku",
        "selling_price",
        "min_stock",
        "updated_at",
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["updated_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
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
    console.error("Error getting out of stock products:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil produk stok habis",
      error: error.message,
    });
  }
};

/**
 * Get stock movement history
 * GET /api/admin/stock/movements
 */
exports.getStockMovements = async (req, res) => {
  try {
    const {
      product_id,
      movement_type, // in, out, adjustment
      start_date,
      end_date,
      page = 1,
      limit = 20,
    } = req.query;

    const where = {};

    // Filter by product
    if (product_id) {
      where.product_id = product_id;
    }

    // Filter by movement type
    if (movement_type) {
      where.movement_type = movement_type;
    }

    // Filter by date range
    if (start_date && end_date) {
      where.movement_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    } else if (start_date) {
      where.movement_date = { [Op.gte]: new Date(start_date) };
    } else if (end_date) {
      where.movement_date = { [Op.lte]: new Date(end_date) };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await StockMovement.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "sku"],
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["movement_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
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
    console.error("Error getting stock movements:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil riwayat pergerakan stok",
      error: error.message,
    });
  }
};
