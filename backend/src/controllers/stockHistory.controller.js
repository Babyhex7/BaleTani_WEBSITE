const { StockHistory, Product } = require("../models");

/**
 * GET /admin/stock-history
 * Get stock history for a product
 */
const getByProduct = async (req, res) => {
  try {
    const { product_id, page = 1, limit = 20 } = req.query;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "product_id diperlukan",
      });
    }

    // Verify product exists
    const product = await Product.findOne({
      where: { id: product_id },
      attributes: ["id", "name"],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: history } = await StockHistory.findAndCountAll({
      where: { product_id },
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        product: product,
        history: history,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: count,
          total_pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get stock history error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil history stok",
    });
  }
};

/**
 * POST /admin/stock-history
 * Create manual stock history entry
 */
const createManual = async (req, res) => {
  try {
    const { product_id, quantity_change, reason } = req.body;

    if (!product_id || !quantity_change) {
      return res.status(400).json({
        success: false,
        message: "product_id dan quantity_change diperlukan",
      });
    }

    // Verify product exists
    const product = await Product.findOne({
      where: { id: product_id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // Create history entry
    const history = await StockHistory.create({
      product_id,
      change_type: "manual",
      quantity_change: parseFloat(quantity_change),
      reason: reason || "Manual adjustment",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Update product stock
    const newStock = product.total_stock + parseFloat(quantity_change);
    await product.update({
      total_stock: Math.max(0, newStock), // Prevent negative stock
      updated_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "History stok berhasil dibuat",
      data: history,
    });
  } catch (error) {
    console.error("Create manual stock history error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat membuat history stok",
    });
  }
};

module.exports = {
  getByProduct,
  createManual,
};