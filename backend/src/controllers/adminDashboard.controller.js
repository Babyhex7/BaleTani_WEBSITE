const {
  User,
  Customer,
  Product,
  Order,
  Category,
  Procurement,
  ContactMessage,
} = require("../models");
const { Op } = require("sequelize");

/**
 * Admin Dashboard Controller
 * Menyediakan statistik dan data untuk dashboard admin
 */

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Parallel queries untuk performa yang lebih baik
    const [
      totalOrdersToday,
      totalRevenueToday,
      pendingOrders,
      lowStockProducts,
      totalCustomers,
      ordersThisMonth,
      ordersLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      activeProducts,
      pendingProcurements,
      unreadMessages,
    ] = await Promise.all([
      // Total orders hari ini
      Order.count({
        where: {
          created_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
        },
      }),

      // Total revenue hari ini
      Order.sum("total_amount", {
        where: {
          payment_status: "paid",
          created_at: {
            [Op.gte]: today,
            [Op.lt]: tomorrow,
          },
        },
      }) || 0,

      // Pending orders
      Order.count({
        where: { payment_status: "pending" },
      }),

      // Low stock products (stok <= 10)
      Product.count({
        where: {
          total_stock: { [Op.lte]: 10 },
        },
      }),

      // Total customers
      Customer.count({
        // where clause cleaned,
      }),

      // Orders bulan ini
      Order.count({
        where: {
          created_at: { [Op.gte]: thisMonth },
        },
      }),

      // Orders bulan lalu
      Order.count({
        where: {
          created_at: {
            [Op.gte]: lastMonth,
            [Op.lt]: thisMonth,
          },
        },
      }),

      // Revenue bulan ini
      Order.sum("total_amount", {
        where: {
          payment_status: "paid",
          created_at: { [Op.gte]: thisMonth },
        },
      }) || 0,

      // Revenue bulan lalu
      Order.sum("total_amount", {
        where: {
          payment_status: "paid",
          created_at: {
            [Op.gte]: lastMonth,
            [Op.lt]: thisMonth,
          },
        },
      }) || 0,

      // Active products count
      Product.count({
        where: {
          is_active: true,
        },
      }),

      // Pending procurements
      Procurement.count({
        where: {
          status: "pending",
        },
      }),

      // Unread messages
      ContactMessage.count({
        where: {
          status: "pending",
        },
      }),
    ]);

    // Hitung growth percentage
    const orderGrowth =
      ordersLastMonth === 0
        ? 100
        : Math.round(
            ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100
          );

    const revenueGrowth =
      revenueLastMonth === 0
        ? 100
        : Math.round(
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
          );

    res.json({
      success: true,
      data: {
        // Today's metrics
        totalOrders: totalOrdersToday,
        totalRevenue: totalRevenueToday,
        pendingOrders,
        lowStockItems: lowStockProducts,

        // Overall metrics
        totalCustomers,
        activeProducts,
        pendingProcurements,
        unreadMessages,

        // Monthly growth
        monthlyGrowth: {
          orders: orderGrowth,
          revenue: revenueGrowth,
          ordersThisMonth,
          ordersLastMonth,
          revenueThisMonth,
          revenueLastMonth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get recent orders
const getRecentOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const recentOrders = await Order.findAll({
      limit,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "full_name", "phone_number"],
        },
      ],
      attributes: [
        "id",
        "customer_name",
        "total_amount",
        "payment_status",
        "order_status",
        "created_at",
        "order_type",
      ],
    });

    // Format data untuk frontend
    const formattedOrders = recentOrders.map((order) => ({
      id: order.id,
      customer_name:
        order.customer_name || order.customer?.full_name || "Guest",
      total_amount: parseFloat(order.total_amount),
      payment_status: order.payment_status,
      order_status: order.order_status,
      created_at: order.created_at,
      items_count: 0, // Bisa ditambahkan query ke order_items jika diperlukan
    }));

    res.json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    next(error);
  }
};

// Get low stock products
const getLowStockProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const threshold = parseInt(req.query.threshold) || 10;

    const lowStockProducts = await Product.findAll({
      where: {
        total_stock: { [Op.lte]: threshold },
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_name"],
        },
      ],
      order: [["total_stock", "ASC"]],
      limit,
      attributes: ["id", "name", "total_stock", "category_id"],
    });

    // Format data untuk frontend
    const formattedProducts = lowStockProducts.map((product) => ({
      id: product.id,
      name: product.name,
      total_stock: product.total_stock,
      category: product.category?.category_name || "Uncategorized",
      min_stock: threshold,
    }));

    res.json({
      success: true,
      data: formattedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// Get notifications (placeholder)
const getNotifications = async (req, res, next) => {
  try {
    // Untuk saat ini return empty array
    // Nanti bisa dikembangkan dengan tabel notifications
    const notifications = [];

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
  getLowStockProducts,
  getNotifications,
};
