/**
 * Admin Order Management Controller
 * Mengelola order untuk admin
 */

const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const {
  Order,
  OrderItem,
  OrderStatusHistory,
  Customer,
  Product,
  Admin,
} = require("../models");

/**
 * GET /api/admin/orders
 * Get all orders with filters and pagination
 */
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      order_type = "",
      order_status = "",
      payment_status = "",
      payment_method = "",
      delivery_method = "",
      date_from = "",
      date_to = "",
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;

    // Build where clause
    const whereClause = {
      deleted_at: null,
    };

    // Search by order number, customer name, email, phone
    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } },
        { customer_phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by order type
    if (order_type && ["online", "offline"].includes(order_type)) {
      whereClause.order_type = order_type;
    }

    // Filter by order status
    if (order_status) {
      whereClause.order_status = order_status;
    }

    // Filter by payment status
    if (payment_status) {
      whereClause.payment_status = payment_status;
    }

    // Filter by payment method
    if (payment_method) {
      whereClause.payment_method = payment_method;
    }

    // Filter by delivery method
    if (delivery_method) {
      whereClause.delivery_method = delivery_method;
    }

    // Filter by date range
    if (date_from && date_to) {
      whereClause.created_at = {
        [Op.between]: [new Date(date_from), new Date(date_to + " 23:59:59")],
      };
    } else if (date_from) {
      whereClause.created_at = {
        [Op.gte]: new Date(date_from),
      };
    } else if (date_to) {
      whereClause.created_at = {
        [Op.lte]: new Date(date_to + " 23:59:59"),
      };
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get orders with related data
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "full_name", "phone_number", "address"],
          required: false,
        },
        {
          model: OrderItem,
          as: "orderItems",
          attributes: [
            "id",
            "product_name",
            "quantity",
            "unit",
            "original_price",
            "discount_price",
            "final_price",
            "subtotal",
          ],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order]],
      distinct: true,
    });

    // Format response
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type,
      customer_name: order.customer_name || order.customer?.full_name || "-",
      customer_email: order.customer_email || "-",
      customer_phone:
        order.customer_phone || order.customer?.phone_number || "-",
      payment_method: order.payment_method,
      delivery_method: order.delivery_method,
      order_status: order.order_status,
      payment_status: order.payment_status,
      item_subtotal: parseFloat(order.item_subtotal || 0),
      delivery_fee: parseFloat(order.delivery_fee || 0),
      discount_amount: parseFloat(order.discount_amount || 0),
      total_amount: parseFloat(order.total_amount || 0),
      items_count: order.orderItems ? order.orderItems.length : 0,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));

    const totalPages = Math.ceil(count / parseInt(limit));

    // Calculate summary statistics
    const totalRevenue = orders.reduce(
      (sum, order) => sum + parseFloat(order.total_amount || 0),
      0
    );

    res.status(200).json({
      success: true,
      message: "Orders berhasil diambil",
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
        summary: {
          total_revenue: totalRevenue,
          total_orders: count,
        },
      },
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil orders",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/orders/:id
 * Get order detail by ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, deleted_at: null },
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "full_name", "phone_number", "address"],
          required: false,
        },
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "selling_price", "total_stock"],
              required: false,
            },
          ],
        },
        {
          model: Admin,
          as: "processor",
          attributes: ["id", "full_name", "email"],
          required: false,
        },
        {
          model: Admin,
          as: "canceller",
          attributes: ["id", "full_name", "email"],
          required: false,
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          include: [
            {
              model: Admin,
              as: "admin",
              attributes: ["id", "full_name"],
              required: false,
            },
          ],
          order: [["changed_at", "DESC"]],
          required: false,
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detail order berhasil diambil",
      data: order,
    });
  } catch (error) {
    console.error("Error getting order detail:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail order",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/orders/:id/status
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, payment_status, notes } = req.body;
    const adminId = req.user.id;

    // Find order
    const order = await Order.findOne({
      where: { id, deleted_at: null },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    // Validate status values
    const validOrderStatuses = [
      "pending_payment",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "checkout",
      "out_for_delivery",
      "completed",
    ];
    const validPaymentStatuses = [
      "unpaid",
      "paid",
      "refunded",
      "pending",
      "failed",
    ];

    if (order_status && !validOrderStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "Status order tidak valid",
        validStatuses: validOrderStatuses,
      });
    }

    if (payment_status && !validPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: "Status pembayaran tidak valid",
        validStatuses: validPaymentStatuses,
      });
    }

    const oldOrderStatus = order.order_status;
    const oldPaymentStatus = order.payment_status;

    // Build update data
    const updateData = {
      updated_at: new Date(),
    };

    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    // Set processor if status changed to processing/paid
    if (
      (order_status === "processing" || payment_status === "paid") &&
      !order.processed_by
    ) {
      updateData.processed_by = adminId;
      updateData.processed_at = new Date();
    }

    // Update order
    await order.update(updateData);

    // Log status change to history
    if (order_status && order_status !== oldOrderStatus) {
      await OrderStatusHistory.create({
        order_id: id,
        old_status: oldOrderStatus,
        new_status: order_status,
        notes: notes || null,
        changed_by: adminId,
        changed_at: new Date(),
      });
    }

    // Fetch updated order with relations
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "full_name", "email"],
          required: false,
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          include: [
            {
              model: Admin,
              as: "admin",
              attributes: ["id", "full_name"],
              required: false,
            },
          ],
          order: [["changed_at", "DESC"]],
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Status order berhasil diupdate",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate status order",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/orders/:id/notes
 * Update admin notes
 */
const updateAdminNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const order = await Order.findOne({
      where: { id, deleted_at: null },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    await order.update({
      admin_notes,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Catatan admin berhasil diupdate",
      data: order,
    });
  } catch (error) {
    console.error("Error updating admin notes:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate catatan admin",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/orders/:id/cancel
 * Cancel order
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelled_reason } = req.body;
    const adminId = req.user.id;

    if (!cancelled_reason) {
      return res.status(400).json({
        success: false,
        message: "Alasan pembatalan harus diisi",
      });
    }

    const order = await Order.findOne({
      where: { id, deleted_at: null },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    // Check if order can be cancelled
    if (["delivered", "completed", "cancelled"].includes(order.order_status)) {
      return res.status(400).json({
        success: false,
        message:
          "Order yang sudah delivered/completed/cancelled tidak dapat dibatalkan",
      });
    }

    const oldStatus = order.order_status;

    // Update order
    await order.update({
      order_status: "cancelled",
      cancelled_reason,
      cancelled_by: adminId,
      cancelled_at: new Date(),
      updated_at: new Date(),
    });

    // Log to history
    await OrderStatusHistory.create({
      order_id: id,
      old_status: oldStatus,
      new_status: "cancelled",
      notes: `Dibatalkan: ${cancelled_reason}`,
      changed_by: adminId,
      changed_at: new Date(),
    });

    // TODO: Restore product stock if needed
    // Get order items and restore stock
    const orderItems = await OrderItem.findAll({
      where: { order_id: id, deleted_at: null },
    });

    for (const item of orderItems) {
      await Product.increment("total_stock", {
        by: parseFloat(item.quantity),
        where: { id: item.product_id },
      });
    }

    res.status(200).json({
      success: true,
      message: "Order berhasil dibatalkan dan stok telah dikembalikan",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membatalkan order",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/orders/statistics
 * Get order statistics
 */
const getOrderStatistics = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    const whereClause = { deleted_at: null };

    // Filter by date range
    if (date_from && date_to) {
      whereClause.created_at = {
        [Op.between]: [new Date(date_from), new Date(date_to + " 23:59:59")],
      };
    }

    // Count by status
    const statusCounts = await Order.findAll({
      where: whereClause,
      attributes: [
        "order_status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total_revenue"],
      ],
      group: ["order_status"],
      raw: true,
    });

    // Count by payment status
    const paymentCounts = await Order.findAll({
      where: whereClause,
      attributes: [
        "payment_status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["payment_status"],
      raw: true,
    });

    // Count by order type
    const typeCounts = await Order.findAll({
      where: whereClause,
      attributes: [
        "order_type",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total_revenue"],
      ],
      group: ["order_type"],
      raw: true,
    });

    // Total statistics
    const totalStats = await Order.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "total_orders"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total_revenue"],
        [
          sequelize.fn("AVG", sequelize.col("total_amount")),
          "average_order_value",
        ],
      ],
      raw: true,
    });

    res.status(200).json({
      success: true,
      message: "Statistik order berhasil diambil",
      data: {
        by_status: statusCounts,
        by_payment: paymentCounts,
        by_type: typeCounts,
        overall: totalStats,
      },
    });
  } catch (error) {
    console.error("Error getting order statistics:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik order",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateAdminNotes,
  cancelOrder,
  getOrderStatistics,
};
