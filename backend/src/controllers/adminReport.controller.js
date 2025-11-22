const { Op, fn, col, literal } = require("sequelize");
const { sequelize } = require("../config/database");
const {
  Order,
  OrderItem,
  Product,
  ProductImage,
  Customer,
  Procurement,
  ProcurementItem,
  Admin,
  StockMovement,
  Category,
} = require("../models");

/**
 * GET /api/admin/reports/sales
 * Get sales report with filters
 */
const getSalesReport = async (req, res) => {
  try {
    const {
      date_from,
      date_to,
      group_by = "day",
      payment_type = "",
      order_type = "",
    } = req.query;

    // Validate date range
    if (!date_from || !date_to) {
      return res.status(400).json({
        success: false,
        message: "Tanggal awal dan akhir harus diisi",
      });
    }

    // Build where clause for orders using model column names
    // Use `created_at` for date range and `order_status` for status
    const whereClause = {
      created_at: {
        [Op.between]: [date_from, date_to],
      },
      order_status: {
        // Map legacy/localized statuses to real enum values used in the model
        [Op.in]: ["completed", "out_for_delivery"],
      },
    };

    // Map frontend payment_type to actual `payment_method` values in Order model
    if (payment_type && ["midtrans", "cod"].includes(payment_type)) {
      if (payment_type === "cod") {
        whereClause.payment_method = "cash";
      } else if (payment_type === "midtrans") {
        // Midtrans typically maps to gateway/transfer payments; choose 'transfer' as best-effort
        whereClause.payment_method = "transfer";
      }
    }

    // Map frontend order_type (pickup/delivery) to `delivery_method` on Order model
    if (order_type && ["pickup", "delivery"].includes(order_type)) {
      if (order_type === "pickup") {
        whereClause.delivery_method = "self_pickup";
      } else if (order_type === "delivery") {
        whereClause.delivery_method = "delivery";
      }
    }

    // Get all orders with items
    const orders = await Order.findAll({
      where: whereClause,
      // Exclude known-missing DB columns to avoid ER_BAD_FIELD_ERROR when DB isn't migrated yet
      attributes: { exclude: ["payment_expired_at"] },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "quantity_info", "selling_price"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  attributes: ["image_url"],
                  separate: true,
                  limit: 1,
                },
              ],
            },
          ],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "full_name", "phone_number"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    // Calculate summary statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.total_amount),
      0
    );
    const totalItems = orders.reduce((sum, order) => {
      return (
        sum +
        order.orderItems.reduce((itemSum, item) => itemSum + parseFloat(item.quantity || 0), 0)
      );
    }, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group orders by date
    const groupedData = {};
    orders.forEach((order) => {
      const orderDate = new Date(order.created_at);
      let key;

      if (group_by === "day") {
        key = orderDate.toISOString().slice(0, 10);
      } else if (group_by === "week") {
        const startOfWeek = new Date(orderDate);
        startOfWeek.setDate(orderDate.getDate() - orderDate.getDay());
        key = startOfWeek.toISOString().slice(0, 10);
      } else if (group_by === "month") {
        key = orderDate.toISOString().slice(0, 7);
      } else {
        key = orderDate.toISOString().slice(0, 10);
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          orders: 0,
          revenue: 0,
          items: 0,
        };
      }

      groupedData[key].orders += 1;
      groupedData[key].revenue += parseFloat(order.total_amount);
      groupedData[key].items += order.orderItems.reduce(
        (sum, item) => sum + parseFloat(item.quantity || 0),
        0
      );
    });

    // Convert to array and sort by date
    const chartData = Object.values(groupedData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Calculate breakdown by payment type
    const paymentBreakdown = orders.reduce((acc, order) => {
      const type = order.payment_method || "unknown";
      if (!acc[type]) {
        acc[type] = { count: 0, revenue: 0 };
      }
      acc[type].count += 1;
      acc[type].revenue += parseFloat(order.total_amount);
      return acc;
    }, {});

    // Calculate breakdown by order type
    const orderTypeBreakdown = orders.reduce((acc, order) => {
      // Use delivery_method for pickup/delivery breakdown
      const type = order.delivery_method || "unknown";
      if (!acc[type]) {
        acc[type] = { count: 0, revenue: 0 };
      }
      acc[type].count += 1;
      acc[type].revenue += parseFloat(order.total_amount);
      return acc;
    }, {});

    // Get top 10 products
    const productStats = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.product_id;
        if (!productStats[productId]) {
          productStats[productId] = {
            product_id: productId,
            product_name: item.product.name,
            product_unit: item.product.quantity_info,
            product_price: item.product.selling_price,
            product_image:
              item.product.images && item.product.images.length > 0
                ? item.product.images[0].image_url
                : null,
            total_quantity: 0,
            total_revenue: 0,
            order_count: 0,
          };
        }
        productStats[productId].total_quantity += parseFloat(item.quantity || 0);
        productStats[productId].total_revenue += parseFloat(item.subtotal);
        productStats[productId].order_count += 1;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalRevenue,
          totalItems,
          averageOrderValue,
        },
        chartData,
        paymentBreakdown,
        orderTypeBreakdown,
        topProducts,
      },
    });
  } catch (error) {
    console.error("❌ Error in getSalesReport:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan penjualan",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/reports/procurement
 * Get procurement report with filters
 */
const getProcurementReport = async (req, res) => {
  try {
    const {
      date_from,
      date_to,
      status = "",
      type = "",
      group_by = "day",
    } = req.query;

    // Validate date range
    if (!date_from || !date_to) {
      return res.status(400).json({
        success: false,
        message: "Tanggal awal dan akhir harus diisi",
      });
    }

    // Build where clause
    const whereClause = {
      procurement_date: {
        [Op.between]: [date_from, date_to],
      },
    };

    // Filter by status
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereClause.status = status;
    }

    // Filter by type
    if (type && ["online", "offline"].includes(type)) {
      whereClause.procurement_type = type;
    }

    // Get all procurements
    const procurements = await Procurement.findAll({
      where: whereClause,
      include: [
        {
          model: Admin,
          as: "creator",
          attributes: ["id", "phone_number", "full_name"],
        },
        {
          model: Admin,
          as: "approver",
          attributes: ["id", "phone_number", "full_name"],
        },
        {
          model: ProcurementItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "quantity_info"],
            },
          ],
        },
      ],
      order: [["procurement_date", "ASC"]],
    });

    // Calculate summary
    const totalProcurements = procurements.length;
    const totalAmount = procurements.reduce(
      (sum, p) => sum + parseFloat(p.total_amount),
      0
    );
    const totalItems = procurements.reduce((sum, p) => {
      return (
        sum + p.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
      );
    }, 0);

    // Status breakdown
    const statusBreakdown = procurements.reduce((acc, p) => {
      if (!acc[p.status]) {
        acc[p.status] = { count: 0, amount: 0 };
      }
      acc[p.status].count += 1;
      acc[p.status].amount += parseFloat(p.total_amount);
      return acc;
    }, {});

    // Type breakdown
    const typeBreakdown = procurements.reduce((acc, p) => {
      const type = p.procurement_type || "unknown";
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0 };
      }
      acc[type].count += 1;
      acc[type].amount += parseFloat(p.total_amount);
      return acc;
    }, {});

    // Group by date
    const groupedData = {};
    procurements.forEach((p) => {
      const date = new Date(p.procurement_date);
      let key;

      if (group_by === "day") {
        key = date.toISOString().slice(0, 10);
      } else if (group_by === "week") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().slice(0, 10);
      } else if (group_by === "month") {
        key = date.toISOString().slice(0, 7);
      } else {
        key = date.toISOString().slice(0, 10);
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          count: 0,
          amount: 0,
        };
      }

      groupedData[key].count += 1;
      groupedData[key].amount += parseFloat(p.total_amount);
    });

    const chartData = Object.values(groupedData).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Top products procured
    const productStats = {};
    procurements.forEach((p) => {
      p.items.forEach((item) => {
        const productId = item.product_id;
        if (!productStats[productId]) {
          productStats[productId] = {
            product_id: productId,
            product_name: item.product.name,
            product_unit: item.product.quantity_info,
            total_quantity: 0,
            total_amount: 0,
          };
        }
        productStats[productId].total_quantity += item.quantity;
        productStats[productId].total_amount += parseFloat(item.subtotal);
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProcurements,
          totalAmount,
          totalItems,
          averageAmount:
            totalProcurements > 0 ? totalAmount / totalProcurements : 0,
        },
        statusBreakdown,
        typeBreakdown,
        chartData,
        topProducts,
      },
    });
  } catch (error) {
    console.error("❌ Error in getProcurementReport:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan pengadaan",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/reports/inventory
 * Get inventory report with stock movements
 */
const getInventoryReport = async (req, res) => {
  try {
    const {
      date_from,
      date_to,
      category_id = "",
      product_type = "",
      stock_status = "", // low, out, normal
    } = req.query;

    // Build where clause for products
    const productWhere = {};

    if (product_type && ["online", "offline"].includes(product_type)) {
      productWhere.product_type = product_type;
    }

    if (category_id) {
      productWhere.category_id = category_id;
    }

    // Stock status filter
    if (stock_status === "out") {
      productWhere.total_stock = 0;
    } else if (stock_status === "low") {
      productWhere.total_stock = {
        [Op.between]: [1, 10],
      };
    } else if (stock_status === "normal") {
      productWhere.total_stock = {
        [Op.gt]: 10,
      };
    }

    // Get all products with stock info
    const products = await Product.findAll({
      where: productWhere,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url"],
          limit: 1,
        },
      ],
      order: [["name", "ASC"]],
    });

    // Calculate summary statistics
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => {
      return sum + p.total_stock * parseFloat(p.selling_price);
    }, 0);
    const outOfStock = products.filter((p) => p.total_stock === 0).length;
    const lowStock = products.filter(
      (p) => p.total_stock > 0 && p.total_stock <= 10
    ).length;
    const normalStock = products.filter((p) => p.total_stock > 10).length;

    // Get stock movements if date range provided
    let stockMovements = [];
    let movementSummary = {};

    if (date_from && date_to) {
      stockMovements = await StockMovement.findAll({
        where: {
          movement_date: {
            [Op.between]: [date_from, date_to],
          },
        },
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "quantity_info"],
          },
          {
            model: Admin,
            as: "creator",
            attributes: ["id", "username"],
          },
        ],
        order: [["movement_date", "DESC"]],
      });

      // Group movements by type
      movementSummary = {
        procurement_in: {
          count: 0,
          quantity: 0,
        },
        adjustment: {
          count: 0,
          quantity: 0,
        },
        sale_out: {
          count: 0,
          quantity: 0,
        },
        expired: {
          count: 0,
          quantity: 0,
        },
      };

      stockMovements.forEach((movement) => {
        const type = movement.movement_type;
        if (movementSummary[type]) {
          movementSummary[type].count++;
          movementSummary[type].quantity += movement.quantity;
        }
      });
    }

    // Category breakdown
    const categoryStats = {};
    products.forEach((p) => {
      const catId = p.category_id;
      const catName = p.category?.category_name || "Uncategorized";

      if (!categoryStats[catId]) {
        categoryStats[catId] = {
          category_id: catId,
          category_name: catName,
          total_products: 0,
          total_stock: 0,
          total_value: 0,
        };
      }

      categoryStats[catId].total_products++;
      categoryStats[catId].total_stock += p.total_stock;
      categoryStats[catId].total_value += p.total_stock * parseFloat(p.selling_price);
    });

    const categoryBreakdown = Object.values(categoryStats).sort(
      (a, b) => b.total_value - a.total_value
    );

    // Product type breakdown
    const typeBreakdown = {
      online: {
        count: products.filter((p) => p.product_type === "online").length,
        stock: products
          .filter((p) => p.product_type === "online")
          .reduce((sum, p) => sum + p.total_stock, 0),
        value: products
          .filter((p) => p.product_type === "online")
          .reduce((sum, p) => sum + p.total_stock * parseFloat(p.selling_price), 0),
      },
      offline: {
        count: products.filter((p) => p.product_type === "offline").length,
        stock: products
          .filter((p) => p.product_type === "offline")
          .reduce((sum, p) => sum + p.total_stock, 0),
        value: products
          .filter((p) => p.product_type === "offline")
          .reduce((sum, p) => sum + p.total_stock * parseFloat(p.selling_price), 0),
      },
    };

    // Format products list
    const productsList = products.map((p) => ({
      id: p.id,
      name: p.name,
      unit: p.quantity_info,
      category_name: p.category?.category_name || "-",
      product_type: p.product_type,
      price: parseFloat(p.selling_price),
      total_stock: p.total_stock,
      stock_value: p.total_stock * parseFloat(p.selling_price),
      status:
        p.total_stock === 0
          ? "out"
          : p.total_stock <= 10
          ? "low"
          : "normal",
      image_url: p.images?.[0]?.image_url || null,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalStockValue,
          outOfStock,
          lowStock,
          normalStock,
        },
        categoryBreakdown,
        typeBreakdown,
        movementSummary: date_from && date_to ? movementSummary : null,
        stockMovements: date_from && date_to ? stockMovements.slice(0, 50) : [], // Limit to 50 recent movements
        products: productsList,
      },
    });
  } catch (error) {
    console.error("❌ Error in getInventoryReport:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan inventory",
      error: error.message,
    });
  }
};

module.exports = {
  getSalesReport,
  getProcurementReport,
  getInventoryReport,
};
