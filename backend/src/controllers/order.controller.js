const { Order, User, Product, StockMovement } = require("../models");
const { Op } = require("sequelize");

// Get all orders with filters
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      transactionType,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { customer_name: { [Op.like]: `%${search}%` } },
        { id: { [Op.like]: `%${search}%` } },
      ];
    }

    if (status) {
      whereClause.order_status = status;
    }

    // Role-based filtering
    if (req.user.role === "whatsapp_admin") {
      whereClause.transaction_type = "online";
    } else if (req.user.role === "cashier") {
      whereClause.transaction_type = "offline";
    } else if (transactionType) {
      whereClause.transaction_type = transactionType;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email", "phoneNumber"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        orders: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email", "phoneNumber", "address"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check role-based access
    if (req.user.role === "whatsapp_admin" && order.transaction_type !== "online") {
      return res.status(403).json({
        success: false,
        message: "You can only access online orders",
      });
    }

    if (req.user.role === "cashier" && order.transaction_type !== "offline") {
      return res.status(403).json({
        success: false,
        message: "You can only access offline orders",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const {
      user_id,
      customer_name,
      transaction_type = "online",
      total_price,
      shipping_address,
      payment_method,
      notes,
      items,
    } = req.body;

    // Validate transaction type based on role
    if (req.user.role === "whatsapp_admin" && transaction_type !== "online") {
      return res.status(403).json({
        success: false,
        message: "WhatsApp Admin can only create online orders",
      });
    }

    if (req.user.role === "cashier" && transaction_type !== "offline") {
      return res.status(403).json({
        success: false,
        message: "Cashier can only create offline orders",
      });
    }

    // Create order
    const order = await Order.create({
      user_id,
      customer_name,
      transaction_type,
      order_status: "checkout",
      total_price,
      shipping_address,
      payment_method,
      notes,
    });

    // TODO: Create order items and update stock

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status, notes } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check role-based access
    if (req.user.role === "whatsapp_admin" && order.transaction_type !== "online") {
      return res.status(403).json({
        success: false,
        message: "You can only update online orders",
      });
    }

    if (req.user.role === "cashier" && order.transaction_type !== "offline") {
      return res.status(403).json({
        success: false,
        message: "You can only update offline orders",
      });
    }

    // Validate status transitions
    const validStatuses = [
      "checkout",
      "paid",
      "processing",
      "out_for_delivery",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Update order
    order.order_status = order_status;
    if (notes) order.notes = notes;
    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (["completed", "cancelled"].includes(order.order_status)) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled",
      });
    }

    // Update order
    order.order_status = "cancelled";
    order.notes = cancellation_reason || order.notes;
    await order.save();

    // TODO: Restore stock if items were already deducted

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const { startDate, endDate, transactionType } = req.query;

    const whereClause = {};

    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (transactionType) {
      whereClause.transaction_type = transactionType;
    }

    // Role-based filtering
    if (req.user.role === "whatsapp_admin") {
      whereClause.transaction_type = "online";
    } else if (req.user.role === "cashier") {
      whereClause.transaction_type = "offline";
    }

    const totalOrders = await Order.count({ where: whereClause });

    const completedOrders = await Order.count({
      where: { ...whereClause, order_status: "completed" },
    });

    const pendingOrders = await Order.count({
      where: {
        ...whereClause,
        order_status: { [Op.in]: ["checkout", "paid", "processing"] },
      },
    });

    const cancelledOrders = await Order.count({
      where: { ...whereClause, order_status: "cancelled" },
    });

    const totalRevenue = await Order.sum("total_price", {
      where: { ...whereClause, order_status: "completed" },
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue: totalRevenue || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
};
