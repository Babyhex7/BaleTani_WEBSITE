const { Op } = require("sequelize");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const PaymentDetail = require("../models/paymentDetail.model");
const OrderStatusHistory = require("../models/orderStatusHistory.model");
const Product = require("../models/product.model");
const ProductImage = require("../models/productImage.model");
const Customer = require("../models/customer.model");
const Cart = require("../models/cart.model");

/**
 * Get customer order history with filters, search, and pagination
 * GET /api/customer/orders
 */
exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.customer.id; // Dari auth middleware
    const {
      search = "",
      status = "",
      date_range = "",
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    // Build where clause
    const whereClause = {
      customer_id: customerId,
    };

    // Filter by status
    if (status && status !== "all") {
      whereClause.order_status = status;
    }

    // Filter by date range
    if (date_range) {
      const now = new Date();
      let startDate;

      switch (date_range) {
        case "7":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "30":
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case "90":
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        whereClause.created_at = {
          [Op.gte]: startDate,
        };
      }
    }

    // Sorting
    let orderBy = [["created_at", "DESC"]]; // Default: newest first (terbaru di atas)
    switch (sort) {
      case "newest":
        orderBy = [["created_at", "DESC"]]; // Terbaru ke atas
        break;
      case "oldest":
        orderBy = [["created_at", "ASC"]]; // Terlama ke atas
        break;
      case "highest":
        orderBy = [["total_amount", "DESC"]]; // Tertinggi ke atas
        break;
      case "lowest":
        orderBy = [["total_amount", "ASC"]]; // Terendah ke atas
        break;
    }

    // Pagination
    const offset = (page - 1) * limit;

    // Search: cari di order number, customer name, ATAU product name
    if (search) {
      // Cari orders yang memiliki item dengan product_name yang cocok
      const ordersWithMatchingProducts = await OrderItem.findAll({
        where: {
          product_name: { [Op.like]: `%${search}%` },
        },
        attributes: ["order_id"],
        raw: true,
      });

      const orderIdsWithMatchingProducts = ordersWithMatchingProducts.map(
        (item) => item.order_id
      );

      // Gabungkan kondisi: order_number/customer_name ATAU order_id dari product search
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        ...(orderIdsWithMatchingProducts.length > 0
          ? [{ id: { [Op.in]: orderIdsWithMatchingProducts } }]
          : []),
      ];
    }

    // Fetch orders with items and payment details
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "selling_price", "total_stock"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  attributes: ["image_url", "is_primary"],
                  where: { is_primary: true },
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: PaymentDetail,
          as: "payment",
          attributes: [
            "payment_method",
            "bank_name",
            "virtual_account",
            "payment_status",
            "paid_at",
          ],
        },
      ],
      order: orderBy,
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    // Calculate statistics
    const stats = await calculateCustomerStats(customerId);

    // Response
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        orders: orders.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          order_date: order.created_at,
          status: order.order_status,
          payment_status: order.payment_status,
          payment_expired_at: order.payment_expired_at, // Untuk countdown timer
          cancelled_reason: order.cancelled_reason,
          cancelled_at: order.cancelled_at,
          total_amount: parseFloat(order.total_amount || 0),
          items: (order.orderItems || []).map((item) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product?.images?.[0]?.image_url || null,
            quantity: parseFloat(item.quantity || 0),
            unit: "pcs",
            price: parseFloat(item.final_price ?? item.original_price ?? 0),
            subtotal: parseFloat(item.subtotal || 0),
          })),
          payment: order.payment
            ? {
                method: order.payment.payment_method,
                bank: order.payment.bank_name,
                va_number: order.payment.virtual_account,
                status: order.payment.payment_status,
              }
            : {
                // Fallback jika tidak ada payment detail (misalnya cash)
                method: order.payment_method,
                bank: null,
                va_number: null,
                status: order.payment_status,
              },
        })),
        stats,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/**
 * Get order detail by ID
 * GET /api/customer/orders/:id
 */
exports.getOrderDetail = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: {
        id: orderId,
        customer_id: customerId,
      },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "selling_price", "total_stock"],
              include: [
                {
                  model: ProductImage,
                  as: "images",
                  attributes: ["image_url", "is_primary"],
                  where: { is_primary: true },
                  required: false,
                },
              ],
            },
          ],
        },
        {
          model: PaymentDetail,
          as: "payment",
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          separate: true, // Separate query agar bisa sort
          order: [["changed_at", "DESC"]], // Terbaru di atas
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Format response
    const orderDetail = {
      id: order.id,
      order_number: order.order_number,
      order_date: order.created_at,
      status: order.order_status,
      payment_status: order.payment_status,

      // Customer info
      customer: {
        name: order.customer_name,
        phone: order.customer_phone,
        address: order.delivery_address,
      },

      // Delivery info
      delivery: {
        method: order.delivery_method,
        address: order.delivery_address,
        notes: order.delivery_notes,
        fee: parseFloat(order.delivery_fee),
      },

      // Items
      items:
        order.orderItems?.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product?.images?.[0]?.image_url || null,
          quantity: parseFloat(item.quantity),
          unit: "pcs", // Default unit (TODO: Nanti bisa tambah kolom unit di table products)
          price: parseFloat(item.final_price ?? item.original_price ?? 0),
          subtotal: parseFloat(item.subtotal),
          product_stock: item.product?.total_stock || 0,
        })) || [],

      // Payment summary
      payment: {
        method: order.payment
          ? order.payment.payment_method
          : order.payment_method,
        bank: order.payment?.bank_name,
        virtual_account: order.payment?.virtual_account,
        account_name: order.payment?.account_name || "BaleTani Fresh Market",
        status: order.payment?.payment_status || order.payment_status,
        paid_at: order.payment?.paid_at,
        expired_at: order.payment?.expired_at,

        subtotal: parseFloat(order.item_subtotal || 0),
        shipping_cost: parseFloat(order.delivery_fee || 0),
        discount: parseFloat(order.discount_amount || 0),
        // service_fee: DIHAPUS - tidak ada service fee
        total: parseFloat(order.total_amount || 0),
      },

      // Status history timeline (filter out payment status changes)
      timeline:
        order.statusHistory
          ?.filter((history) => !history.new_status.startsWith("payment:"))
          .map((history) => ({
            status: history.new_status,
            timestamp: history.changed_at || history.created_at,
            notes: history.notes,
          })) || [],

      // Notes
      customer_notes: order.delivery_notes,
      admin_notes: order.admin_notes,
      cancelled_reason: order.cancelled_reason,
      cancelled_at: order.cancelled_at,
    };

    return res.status(200).json({
      success: true,
      message: "Order detail fetched successfully",
      data: orderDetail,
    });
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order detail",
      error: error.message,
    });
  }
};

/**
 * Reorder - Add all items from previous order to cart
 * POST /api/customer/orders/:id/reorder
 */
exports.reorderItems = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const orderId = req.params.id;

    // Get order with items
    const order = await Order.findOne({
      where: {
        id: orderId,
        customer_id: customerId,
      },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let addedCount = 0;
    let outOfStockItems = [];

    // Add each item to cart
    for (const item of order.orderItems) {
      const product = item.product;

      // Check if product still exists and has stock
      if (!product) {
        outOfStockItems.push(item.product_name);
        continue;
      }

      if ((product.total_stock ?? 0) < item.quantity) {
        outOfStockItems.push(
          `${item.product_name} (stok: ${product.total_stock ?? 0})`
        );
        continue;
      }

      // Check if item already in cart
      const existingCartItem = await Cart.findOne({
        where: {
          customer_id: customerId,
          product_id: product.id,
        },
      });

      if (existingCartItem) {
        // Update quantity
        await existingCartItem.update({
          quantity: existingCartItem.quantity + item.quantity,
        });
      } else {
        // Add new cart item
        await Cart.create({
          customer_id: customerId,
          product_id: product.id,
          quantity: item.quantity,
        });
      }

      addedCount++;
    }

    return res.status(200).json({
      success: true,
      message: `${addedCount} produk berhasil ditambahkan ke keranjang`,
      data: {
        items_added: addedCount,
        out_of_stock: outOfStockItems,
      },
    });
  } catch (error) {
    console.error("Error reordering items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder items",
      error: error.message,
    });
  }
};

/**
 * Cancel order (only if status is pending_payment or paid)
 * PUT /api/customer/orders/:id/cancel
 */
exports.cancelOrder = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const orderId = req.params.id;
    const { reason } = req.body;

    const order = await Order.findOne({
      where: {
        id: orderId,
        customer_id: customerId,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (!["pending_payment", "paid"].includes(order.order_status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Update order status
    await order.update({
      order_status: "cancelled",
      cancelled_reason: reason || "Cancelled by customer",
      cancelled_by: customerId,
      cancelled_at: new Date(),
    });

    // Add to status history
    await OrderStatusHistory.create({
      order_id: orderId,
      old_status: order.order_status,
      new_status: "cancelled",
      notes: reason || "Cancelled by customer",
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: {
        order_id: orderId,
        status: "cancelled",
      },
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

/**
 * Helper: Calculate customer statistics
 */
async function calculateCustomerStats(customerId) {
  try {
    // Total orders
    const totalOrders = await Order.count({
      where: { customer_id: customerId },
    });

    // Total spending (completed orders only)
    const totalSpending = await Order.sum("total_amount", {
      where: {
        customer_id: customerId,
        order_status: "completed",
      },
    });

    // Completed orders
    const completedOrders = await Order.count({
      where: {
        customer_id: customerId,
        order_status: "completed",
      },
    });

    // Pending orders (pending_payment, paid, processing)
    const pendingOrders = await Order.count({
      where: {
        customer_id: customerId,
        order_status: {
          [Op.in]: [
            "pending_payment",
            "paid",
            "processing",
            "out_for_delivery",
          ],
        },
      },
    });

    return {
      total_orders: totalOrders,
      total_spending: parseFloat(totalSpending) || 0,
      completed_orders: completedOrders,
      pending_orders: pendingOrders,
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    return {
      total_orders: 0,
      total_spending: 0,
      completed_orders: 0,
      pending_orders: 0,
    };
  }
}

/**
 * POST /api/customer/orders/:orderId/manual-cancel
 * Manual trigger auto-cancel (dipanggil dari frontend saat countdown habis)
 */
exports.triggerManualCancel = async (req, res) => {
  const { sequelize } = require("../config/database");
  const { getWIBDate } = require("../utils/dateHelper");

  const transaction = await sequelize.transaction();

  try {
    const { orderId } = req.params;
    const customerId = req.customer.id;

    console.log(
      `[MANUAL CANCEL] Triggered for Order ID: ${orderId} by Customer: ${customerId}`
    );

    // Cari order
    const order = await Order.findOne({
      where: {
        id: orderId,
        customer_id: customerId,
        order_status: "pending_payment",
      },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan atau sudah tidak pending",
      });
    }

    // Cek apakah sudah expired
    const now = getWIBDate();
    if (new Date(order.payment_expired_at) > now) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Order belum expired, tidak bisa dibatalkan otomatis",
      });
    }

    console.log(`[MANUAL CANCEL] Cancelling order: ${order.order_number}`);

    // Update order status
    await order.update(
      {
        order_status: "cancelled",
        cancelled_reason:
          "Pembayaran melebihi batas waktu (Triggered by frontend)",
        cancelled_at: now,
        cancelled_by: null, // NULL = system trigger
        updated_at: now,
      },
      { transaction }
    );

    // Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findByPk(item.product_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (product) {
        await product.update(
          {
            total_stock: product.total_stock + item.quantity,
            updated_at: now,
          },
          { transaction }
        );
        console.log(
          `[MANUAL CANCEL] Stock restored: ${product.name} (+${item.quantity})`
        );
      }
    }

    // Log ke history
    await OrderStatusHistory.create(
      {
        order_id: order.id,
        status: "cancelled",
        notes: "Otomatis dibatalkan oleh sistem karena waktu pembayaran habis",
        created_by: null,
        created_at: now,
      },
      { transaction }
    );

    await transaction.commit();

    console.log(
      `[MANUAL CANCEL] ✅ Order ${order.order_number} cancelled successfully`
    );

    res.json({
      success: true,
      message: "Order berhasil dibatalkan otomatis",
      data: {
        order_id: order.id,
        order_number: order.order_number,
        order_status: "cancelled",
        cancelled_at: now,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("[MANUAL CANCEL] ❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membatalkan order",
      error: error.message,
    });
  }
};

module.exports = exports;
