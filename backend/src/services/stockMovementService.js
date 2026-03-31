/**
 * STOCK MOVEMENT SERVICE
 * Service untuk mencatat dan mengelola history pengurangan dan penambahan stok
 * 
 * Features:
 * - Log procurement in (penambahan stok)
 * - Log sale out (pengurangan stok dari order)
 * - Log adjustment (penyesuaian manual)
 * - Log expired (produk expired)
 * - Query history dengan filters
 */

const { StockMovement, Product } = require("../models");
const { v4: uuidv4 } = require("uuid");

/**
 * Log stock movement ke database
 * @param {Object} params - Parameter
 * @param {String} params.product_id - ID produk yang berubah stoknya
 * @param {String} params.movement_type - Tipe movement: 'procurement_in', 'sale_out', 'adjustment', 'expired'
 * @param {Number} params.quantity_change - Berapa banyak perubahan (positif atau negatif)
 * @param {String} params.created_by - UUID user yang melakukan action
 * @param {String} params.reference_id - ID dari procurement/order yang menyebabkan perubahan
 * @param {String} params.reference_type - Tipe reference: 'procurement', 'order', 'manual', 'expiry'
 * @param {String} params.notes - Catatan tambahan (optional)
 * @returns {Promise<Object>} StockMovement record yang baru dibuat
 */
exports.logStockMovement = async ({
  product_id,
  movement_type,
  quantity_change,
  created_by,
  reference_id = null,
  reference_type = null,
  notes = null,
}) => {
  try {
    // Validasi movement_type
    const validTypes = [
      "procurement_in",
      "sale_out",
      "adjustment",
      "expired",
    ];
    if (!validTypes.includes(movement_type)) {
      throw new Error(
        `Invalid movement_type. Must be one of: ${validTypes.join(", ")}`,
      );
    }

    // Get product untuk mendapatkan stok sebelumnya
    const product = await Product.findByPk(product_id);
    if (!product) {
      throw new Error(`Product with ID ${product_id} not found`);
    }

    const stock_before = parseFloat(product.total_stock || 0);
    const stock_after = stock_before + parseFloat(quantity_change);

    // Validasi stock tidak boleh negatif (hanya untuk sale_out)
    if (movement_type === "sale_out" && stock_after < 0) {
      throw new Error(
        `Insufficient stock. Current: ${stock_before}, Trying to reduce: ${Math.abs(quantity_change)}`,
      );
    }

    // Create stock movement record
    const movement = await StockMovement.create({
      id: uuidv4(),
      product_id,
      movement_type,
      quantity_change: parseFloat(quantity_change),
      stock_before,
      stock_after,
      reference_id,
      reference_type,
      created_by,
      created_at: new Date(),
    });

    // Update product stok
    await product.update({ total_stock: stock_after });

    return {
      success: true,
      movement,
      product_updated: {
        id: product.id,
        name: product.name,
        stock_before,
        stock_after,
      },
    };
  } catch (error) {
    console.error("Stock Movement Error:", error.message);
    throw error;
  }
};

/**
 * Log multiple stock movements (untuk bulk operations)
 * @param {Array} movements - Array of movement objects
 * @returns {Promise<Array>} Array of created movements
 */
exports.logMultipleMovements = async (movements) => {
  const results = [];
  for (const movement of movements) {
    try {
      const result = await this.logStockMovement(movement);
      results.push(result);
    } catch (error) {
      console.error(`Error logging movement for product ${movement.product_id}:`, error.message);
      results.push({
        success: false,
        product_id: movement.product_id,
        error: error.message,
      });
    }
  }
  return results;
};

/**
 * Get stock movement history untuk suatu produk
 * @param {String} product_id - ID produk
 * @param {Object} options - Options
 * @param {String} options.movement_type - Filter by type (optional)
 * @param {String} options.reference_type - Filter by reference type (optional)
 * @param {Number} options.limit - Limit records (default 50)
 * @param {Number} options.offset - Offset untuk pagination (default 0)
 * @returns {Promise<Object>} { movements: [], total: 0, pagination: {} }
 */
exports.getMovementHistory = async (
  product_id,
  {
    movement_type = null,
    reference_type = null,
    limit = 50,
    offset = 0,
    date_from = null,
    date_to = null,
  } = {},
) => {
  try {
    const whereClause = { product_id };

    // Filter by movement type
    if (movement_type) {
      whereClause.movement_type = movement_type;
    }

    // Filter by reference type
    if (reference_type) {
      whereClause.reference_type = reference_type;
    }

    // Filter by date range
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setHours(23, 59, 59, 999); // Include entire day
        whereClause.created_at[Op.lte] = endDate;
      }
    }

    // Query movements dengan sorting
    const { count, rows: movements } = await StockMovement.findAndCountAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      raw: true,
    });

    return {
      success: true,
      movements,
      total: count,
      pagination: {
        current_page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(count / limit),
        limit,
        offset,
        total: count,
      },
    };
  } catch (error) {
    console.error("Get History Error:", error.message);
    throw error;
  }
};

/**
 * Get stock movement summary untuk suatu produk
 * (Total masuk dari procurement, total keluar dari penjualan, dll)
 * @param {String} product_id - ID produk
 * @returns {Promise<Object>} Summary data
 */
exports.getMovementSummary = async (product_id) => {
  try {
    const product = await Product.findByPk(product_id, {
      attributes: ["id", "name", "total_stock", "selling_price"],
    });

    if (!product) {
      throw new Error(`Product with ID ${product_id} not found`);
    }

    // Get summary by movement type
    const movements = await StockMovement.findAll({
      where: { product_id },
      attributes: [
        "movement_type",
        [
          require("sequelize").fn(
            "SUM",
            require("sequelize").col("quantity_change"),
          ),
          "total_quantity",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      group: ["movement_type"],
      raw: true,
    });

    // Format summary
    const summary = {
      product: {
        id: product.id,
        name: product.name,
        current_stock: product.total_stock,
        selling_price: product.selling_price,
      },
      movements_breakdown: {
        procurement_in: movements.find((m) => m.movement_type === "procurement_in") || {
          movement_type: "procurement_in",
          total_quantity: 0,
          count: 0,
        },
        sale_out: movements.find((m) => m.movement_type === "sale_out") || {
          movement_type: "sale_out",
          total_quantity: 0,
          count: 0,
        },
        adjustment: movements.find((m) => m.movement_type === "adjustment") || {
          movement_type: "adjustment",
          total_quantity: 0,
          count: 0,
        },
        expired: movements.find((m) => m.movement_type === "expired") || {
          movement_type: "expired",
          total_quantity: 0,
          count: 0,
        },
      },
      total_movements: movements.reduce((sum, m) => sum + (m.count || 0), 0),
    };

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Get Summary Error:", error.message);
    throw error;
  }
};

/**
 * Validate stock before creating order
 * Memastikan stok cukup untuk order
 * @param {String} product_id - ID produk
 * @param {Number} quantity_needed - Jumlah yang dibutuhkan
 * @returns {Promise<Object>} { available: true/false, current_stock, quantity_needed }
 */
exports.validateStock = async (product_id, quantity_needed) => {
  try {
    const product = await Product.findByPk(product_id, {
      attributes: ["id", "name", "total_stock"],
    });

    if (!product) {
      throw new Error(`Product with ID ${product_id} not found`);
    }

    const current_stock = parseFloat(product.total_stock || 0);
    const qty_needed = parseFloat(quantity_needed);
    const available = current_stock >= qty_needed;

    return {
      available,
      current_stock,
      quantity_needed: qty_needed,
      deficit: available ? 0 : qty_needed - current_stock,
      product: {
        id: product.id,
        name: product.name,
      },
    };
  } catch (error) {
    console.error("Validate Stock Error:", error.message);
    throw error;
  }
};
