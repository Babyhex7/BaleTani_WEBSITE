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
    // Use `created_at` for date range. Do not restrict by `order_status`
    // so the report returns all transactions in the selected period.
    const whereClause = {
      created_at: {
        [Op.between]: [date_from, date_to],
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

    // Prepare detailed sales list with customer and order information
    const detailedSales = orders.map((order) => {
      return {
        order_id: order.id,
        order_number: order.order_number,
        order_date: order.created_at,
        customer_name: order.customer ? order.customer.full_name : "N/A",
        customer_phone: order.customer ? order.customer.phone_number : "N/A",
        payment_method: order.payment_method,
        delivery_method: order.delivery_method,
        order_status: order.order_status,
        total_amount: parseFloat(order.total_amount),
        shipping_cost: parseFloat(order.shipping_cost || 0),
        items: order.orderItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.product.name,
          product_unit: item.product.quantity_info,
          product_price: parseFloat(item.product.selling_price),
          product_image:
            item.product.images && item.product.images.length > 0
              ? item.product.images[0].image_url
              : null,
          quantity: parseFloat(item.quantity),
          subtotal: parseFloat(item.subtotal),
        })),
      };
    });

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
        detailedSales,
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

    console.log("📊 Inventory Report Filters:", {
      date_from,
      date_to,
      category_id,
      product_type,
      stock_status,
    });

    // Build where clause for products
    const productWhere = {
      is_active: true, // Only active products
    };

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

    console.log("📦 Product Where Clause:", productWhere);

    // Get all products with stock info
    const products = await Product.findAll({
      where: productWhere,
      attributes: [
        "id",
        "name",
        "product_type",
        "category_id",
        "quantity_info",
        "selling_price",
        "total_stock",
        "shelf_life_days",
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "category_name"],
          required: false, // LEFT JOIN to include products without category
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url"],
          limit: 1,
          required: false, // LEFT JOIN
          separate: true, // Avoid cartesian product
        },
      ],
      order: [["name", "ASC"]],
    });

    console.log(`✅ Found ${products.length} products`);

    // Calculate summary statistics
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p) => {
      const price = parseFloat(p.selling_price) || 0;
      const stock = parseFloat(p.total_stock) || 0;
      return sum + stock * price;
    }, 0);
    const outOfStock = products.filter((p) => p.total_stock === 0).length;
    const lowStock = products.filter(
      (p) => p.total_stock > 0 && p.total_stock <= 10
    ).length;
    const normalStock = products.filter((p) => p.total_stock > 10).length;

    console.log("📊 Summary Stats:", {
      totalProducts,
      totalStockValue,
      outOfStock,
      lowStock,
      normalStock,
    });

    // Get stock movements if date range provided
    let stockMovements = [];
    let movementSummary = {
      procurement_in: { count: 0, quantity: 0 },
      adjustment: { count: 0, quantity: 0 },
      sale_out: { count: 0, quantity: 0 },
      expired: { count: 0, quantity: 0 },
    };

    if (date_from && date_to) {
      console.log("📅 Fetching stock movements from", date_from, "to", date_to);
      
      stockMovements = await StockMovement.findAll({
        where: {
          movement_date: {
            [Op.between]: [date_from, date_to],
          },
        },
        attributes: [
          "id",
          "product_id",
          "movement_type",
          "quantity",
          "movement_date",
          "notes",
        ],
        include: [
          {
            model: Product,
            as: "product",
            attributes: ["id", "name", "quantity_info"],
            required: false,
          },
          {
            model: Admin,
            as: "creator",
            attributes: ["id", "username"],
            required: false,
          },
        ],
        order: [["movement_date", "DESC"]],
        limit: 50, // Limit recent movements
      });

      console.log(`📦 Found ${stockMovements.length} stock movements`);

      // Group movements by type
      stockMovements.forEach((movement) => {
        const type = movement.movement_type;
        if (movementSummary[type]) {
          movementSummary[type].count++;
          movementSummary[type].quantity += Math.abs(parseFloat(movement.quantity) || 0);
        }
      });
    }

    // Category breakdown
    const categoryStats = {};
    products.forEach((p) => {
      const catId = p.category_id || "uncategorized";
      const catName = p.category?.category_name || "Tanpa Kategori";

      if (!categoryStats[catId]) {
        categoryStats[catId] = {
          category_id: catId,
          category_name: catName,
          total_products: 0,
          total_stock: 0,
          total_value: 0,
        };
      }

      const price = parseFloat(p.selling_price) || 0;
      const stock = parseFloat(p.total_stock) || 0;

      categoryStats[catId].total_products++;
      categoryStats[catId].total_stock += stock;
      categoryStats[catId].total_value += stock * price;
    });

    const categoryBreakdown = Object.values(categoryStats).sort(
      (a, b) => b.total_value - a.total_value
    );

    console.log("📊 Category Breakdown:", categoryBreakdown.length, "categories");

    // Product type breakdown
    const onlineProducts = products.filter((p) => p.product_type === "online");
    const offlineProducts = products.filter((p) => p.product_type === "offline");

    const typeBreakdown = {
      online: {
        count: onlineProducts.length,
        stock: onlineProducts.reduce((sum, p) => sum + (parseFloat(p.total_stock) || 0), 0),
        value: onlineProducts.reduce(
          (sum, p) => sum + (parseFloat(p.total_stock) || 0) * (parseFloat(p.selling_price) || 0),
          0
        ),
      },
      offline: {
        count: offlineProducts.length,
        stock: offlineProducts.reduce((sum, p) => sum + (parseFloat(p.total_stock) || 0), 0),
        value: offlineProducts.reduce(
          (sum, p) => sum + (parseFloat(p.total_stock) || 0) * (parseFloat(p.selling_price) || 0),
          0
        ),
      },
    };

    console.log("📊 Type Breakdown:", typeBreakdown);

    // Format products list
    const productsList = products.map((p) => {
      const stock = parseFloat(p.total_stock) || 0;
      const price = parseFloat(p.selling_price) || 0;
      
      return {
        id: p.id,
        name: p.name,
        unit: p.quantity_info || "-",
        category_name: p.category?.category_name || "Tanpa Kategori",
        product_type: p.product_type,
        price: price,
        total_stock: stock,
        stock_value: stock * price,
        status: stock === 0 ? "out" : stock <= 10 ? "low" : "normal",
        image_url: p.images && p.images.length > 0 ? p.images[0].image_url : null,
      };
    });

    // Format stock movements
    const recentMovements = stockMovements.map((m) => ({
      id: m.id,
      product_id: m.product_id,
      product_name: m.product?.name || "N/A",
      product_unit: m.product?.quantity_info || "-",
      movement_type: m.movement_type,
      quantity: parseFloat(m.quantity) || 0,
      movement_date: m.movement_date,
      notes: m.notes || "-",
      creator_name: m.creator?.username || "System",
    }));

    console.log("✅ Inventory report generated successfully");

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
        movementSummary,
        products: productsList,
        recentMovements,
      },
    });
  } catch (error) {
    console.error("❌ Error in getInventoryReport:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil laporan inventori",
      error: error.message,
    });
  }
};

module.exports = {
  getSalesReport,
  getProcurementReport,
  getInventoryReport,
};
