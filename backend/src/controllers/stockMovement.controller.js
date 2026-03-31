/**
 * STOCK MOVEMENT CONTROLLER
 * API endpoints untuk mengakses stock movement history dan summary
 */

const { StockMovement, Product, Admin } = require("../models");
const stockMovementService = require("../services/stockMovementService");

/**
 * GET /api/admin/products/:product_id/stock-history
 * Get stock movement history untuk suatu produk
 */
exports.getStockHistory = async (req, res) => {
  try {
    const { product_id } = req.params;
    const {
      movement_type = null,
      reference_type = null,
      limit = 50,
      page = 1,
      date_from = null,
      date_to = null,
    } = req.query;

    // Validate product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get history
    const result = await stockMovementService.getMovementHistory(product_id, {
      movement_type,
      reference_type,
      limit: parseInt(limit),
      offset,
      date_from,
      date_to,
    });

    return res.json({
      success: true,
      message: "Stock history retrieved successfully",
      data: {
        product: {
          id: product.id,
          name: product.name,
          current_stock: product.total_stock,
        },
        ...result,
      },
    });
  } catch (error) {
    console.error("Get Stock History Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve stock history",
    });
  }
};

/**
 * GET /api/admin/products/:product_id/stock-summary
 * Get stock movement summary untuk suatu produk
 */
exports.getStockSummary = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Validate product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get summary
    const result = await stockMovementService.getMovementSummary(product_id);

    return res.json({
      success: true,
      message: "Stock summary retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Get Stock Summary Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve stock summary",
    });
  }
};

/**
 * GET /api/public/products/:product_id/stock-history
 * Public endpoint untuk customer melihat stock movement history (read-only)
 * Hanya menampilkan summary, bukan detail pribadi admin
 */
exports.getPublicStockStatus = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Validate product exists dan online
    const product = await Product.findByPk(product_id);
    if (!product || product.product_type !== "online") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get last 10 stock movements
    const result = await stockMovementService.getMovementHistory(product_id, {
      movement_type: "sale_out", // Hanya tampilkan penjualan
      limit: 10,
      offset: 0,
    });

    // Transform untuk public consumption
    const stock_status = {
      product: {
        id: product.id,
        name: product.name,
        current_stock: product.total_stock,
        status: product.total_stock > 0 ? "available" : "out_of_stock",
      },
      recent_sales: result.movements.length,
      // Jangan expose detail pribadi untuk public endpoint
    };

    return res.json({
      success: true,
      message: "Stock status retrieved",
      data: stock_status,
    });
  } catch (error) {
    console.error("Get Public Stock Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve stock status",
    });
  }
};

/**
 * GET /api/admin/stock-movements
 * Get all stock movements (with advanced filtering)
 * Admin only - untuk reporting dan analytics
 */
exports.getAllMovements = async (req, res) => {
  try {
    const {
      product_id = null,
      movement_type = null,
      reference_type = null,
      limit = 50,
      page = 1,
      date_from = null,
      date_to = null,
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};

    // Build where clause
    if (product_id) whereClause.product_id = product_id;
    if (movement_type) whereClause.movement_type = movement_type;
    if (reference_type) whereClause.reference_type = reference_type;

    // Date range filter
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[require("sequelize").Op.gte] = new Date(
          date_from,
        );
      }
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59, 999);
        whereClause.created_at[require("sequelize").Op.lte] = endDate;
      }
    }

    // Query
    const { count, rows: movements } = await StockMovement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "selling_price"],
          required: false,
        },
        {
          model: Admin,
          as: "createdBy",
          attributes: ["id", "full_name"],
          required: false,
        },
      ],
      order: [[sort_by, sort_order]],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      message: "Stock movements retrieved",
      data: {
        movements,
        total: count,
        pagination: {
          current_page: Math.floor(offset / limit) + 1,
          total_pages: Math.ceil(count / limit),
          limit,
          offset,
          total: count,
        },
      },
    });
  } catch (error) {
    console.error("Get All Movements Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve movements",
    });
  }
};
