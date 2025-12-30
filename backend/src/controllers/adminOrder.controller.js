/**
 * Admin Order Management Controller
 * Mengelola order untuk admin
 */

const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { getWIBDate } = require("../utils/dateHelper");
const {
  Order,
  OrderItem,
  OrderStatusHistory,
  Customer,
  Product,
  ProductDiscount,
  Discount,
  Admin,
  PaymentDetail,
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
    const whereClause = {};

    // Search by order number, customer name, phone
    if (search) {
      whereClause[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by order type (transaction_type in database)
    if (order_type && ["online", "offline"].includes(order_type)) {
      whereClause.transaction_type = order_type;
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
            "original_price",
            "discount_price",
            "final_price",
            "subtotal",
          ],
          required: false,
        },
        {
          model: PaymentDetail,
          as: "payment",
          attributes: [
            "payment_method",
            "bank_name",
            "virtual_account",
            "account_name",
            "payment_status",
            "paid_at",
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
      order_type: order.transaction_type, // Use transaction_type from database consistently
      customer_name: order.customer_name || order.customer?.full_name || "-",
      customer_phone:
        order.customer_phone || order.customer?.phone_number || "-",
      payment_method: order.payment_method,
      delivery_method: order.delivery_method,
      delivery_address:
        order.delivery_address ||
        order.shipping_address ||
        order.customer?.address ||
        null,
      delivery_notes: order.delivery_notes || order.customer_notes || null,
      order_status: order.order_status,
      payment_status: order.payment_status,
      subtotal: parseFloat(order.item_subtotal || 0), // Rename to subtotal for frontend
      delivery_fee: parseFloat(order.delivery_fee || order.shipping_cost || 0),
      discount_amount: parseFloat(order.discount_amount || 0),
      total_amount: parseFloat(order.total_amount || 0),
      items_count: order.orderItems ? order.orderItems.length : 0,
      created_at: order.created_at,
      updated_at: order.updated_at,
      // TAMBAHAN: Payment detail info
      payment_detail: order.payment
        ? {
            method: order.payment.payment_method,
            bank: order.payment.bank_name,
            virtual_account: order.payment.virtual_account,
            account_name: order.payment.account_name,
            status: order.payment.payment_status,
            paid_at: order.payment.paid_at,
          }
        : null,
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
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: count,
          items_per_page: parseInt(limit),
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
      where: { id },
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
          model: PaymentDetail,
          as: "payment",
          required: false,
        },
        {
          model: Admin,
          as: "processor",
          attributes: ["id", "full_name", "phone_number"],
          required: false,
        },
        {
          model: Admin,
          as: "canceller",
          attributes: ["id", "full_name", "phone_number"],
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
      where: { id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    // Validate status values (UPDATED to match new ENUM)
    const validOrderStatuses = [
      "pending_payment",
      "paid",
      "processing",
      "ready_for_pickup",
      "out_for_delivery",
      "completed",
      "cancelled",
    ];
    const validPaymentStatuses = ["pending", "paid", "failed", "refunded"];

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
      updated_at: getWIBDate(),
    };

    if (order_status) updateData.order_status = order_status;
    if (payment_status) updateData.payment_status = payment_status;

    // Set processor if status changed to processing/paid
    if (
      (order_status === "processing" || payment_status === "paid") &&
      !order.processed_by
    ) {
      updateData.processed_by = adminId;
      updateData.processed_at = getWIBDate();
    }

    // Update order
    await order.update(updateData);

    // Update PaymentDetail if payment_status changed
    if (payment_status && payment_status !== oldPaymentStatus) {
      await PaymentDetail.update(
        {
          payment_status: payment_status,
          updated_at: getWIBDate(),
          ...(payment_status === "paid" && { paid_at: getWIBDate() }),
        },
        {
          where: { order_id: id },
        }
      );
    }

    // Log status change to history (untuk ORDER status)
    if (order_status && order_status !== oldOrderStatus) {
      await OrderStatusHistory.create({
        order_id: id,
        old_status: oldOrderStatus,
        new_status: order_status,
        notes: notes || null,
        changed_by: adminId,
        changed_at: getWIBDate(),
      });
    }

    // Log payment status change to history (TAMBAHAN)
    if (payment_status && payment_status !== oldPaymentStatus) {
      await OrderStatusHistory.create({
        order_id: id,
        old_status: `payment:${oldPaymentStatus}`,
        new_status: `payment:${payment_status}`,
        notes: notes || `Status pembayaran diubah menjadi ${payment_status}`,
        changed_by: adminId,
        changed_at: getWIBDate(),
      });
    }

    // Fetch updated order with relations
    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "full_name", "phone_number", "address"],
          required: false,
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          include: [
            {
              model: Admin,
              as: "admin",
              attributes: ["id", "full_name", "phone_number"],
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
      where: { id },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    await order.update({
      admin_notes,
      updated_at: getWIBDate(),
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
      where: { id },
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
      cancelled_at: getWIBDate(),
      updated_at: getWIBDate(),
    });

    // Log to history
    await OrderStatusHistory.create({
      order_id: id,
      old_status: oldStatus,
      new_status: "cancelled",
      notes: `Dibatalkan: ${cancelled_reason}`,
      changed_by: adminId,
      changed_at: getWIBDate(),
    });

    // TODO: Restore product stock if needed
    // Get order items and restore stock
    const orderItems = await OrderItem.findAll({
      where: { order_id: id },
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

    const whereClause = {};

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

    // Count by order type (transaction_type in database)
    const typeCounts = await Order.findAll({
      where: whereClause,
      attributes: [
        ["transaction_type", "order_type"], // Alias transaction_type as order_type
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("total_amount")), "total_revenue"],
      ],
      group: ["transaction_type"],
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

/**
 * POST /api/admin/orders/create-offline
 * Create offline order (manual input by admin)
 */
const createOfflineOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      customer_name,
      customer_phone,
      delivery_address,
      delivery_notes,
      payment_method,
      delivery_method,
      delivery_fee = 0,
      discount_amount = 0,
      admin_notes,
      items, // Array of { product_id, quantity }
    } = req.body;

    const adminId = req.user.id;

    // Validation
    if (!customer_name || !customer_phone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Nama customer dan nomor telepon harus diisi",
      });
    }

    if (!payment_method || !delivery_method) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Metode pembayaran dan pengiriman harus dipilih",
      });
    }

    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Minimal harus ada 1 produk",
      });
    }

    // Get or create offline customer (use first customer or create dummy)
    let customer = await Customer.findOne({ transaction });
    if (!customer) {
      customer = await Customer.create(
        {
          full_name: "Offline Customer",
          phone_number: "000000000000",
          password_hash: "dummy",
          is_active: true,
        },
        { transaction }
      );
    }

    // Generate order number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    const orderNumber = `ORD-${year}${month}${day}-${random}`;

    // Calculate totals from items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${item.product_id} tidak ditemukan`,
        });
      }

      // Check stock
      if (product.total_stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stok ${product.name} tidak mencukupi. Tersedia: ${product.total_stock}`,
        });
      }

      // Check if product has active discount
      const productDiscount = await ProductDiscount.findOne({
        where: { product_id: item.product_id },
        include: [
          {
            model: Discount,
            as: "discount",
            where: {
              is_active: 1,
              start_date: { [Op.lte]: getWIBDate() },
              end_date: { [Op.gte]: getWIBDate() },
            },
            required: false,
          },
        ],
        transaction,
      });

      const originalPrice =
        Math.round(parseFloat(product.selling_price) * 100) / 100;
      let finalPrice = originalPrice;
      let discountValue = 0;

      // ALWAYS use pre-calculated discounted_price from ProductDiscount table
      if (productDiscount && productDiscount.discounted_price) {
        finalPrice =
          Math.round(parseFloat(productDiscount.discounted_price) * 100) / 100;
        discountValue = Math.round((originalPrice - finalPrice) * 100) / 100;
      }

      const qty = parseFloat(item.quantity);
      const itemSubtotal = Math.round(finalPrice * qty * 100) / 100;

      subtotal += itemSubtotal;

      orderItems.push({
        product_id: item.product_id,
        product_name: product.name,
        quantity: qty,
        original_price: originalPrice,
        discount_price: discountValue,
        final_price: finalPrice,
        subtotal: itemSubtotal,
      });
    }

    const totalAmount =
      subtotal + parseFloat(delivery_fee) - parseFloat(discount_amount);

    // Determine order status based on payment method
    const orderStatus = payment_method === "cash" ? "paid" : "pending_payment";
    const paymentStatus = payment_method === "cash" ? "paid" : "pending";

    // Create order
    const order = await Order.create(
      {
        order_number: orderNumber,
        order_type: "offline",
        transaction_type: "offline",
        customer_id: customer.id,
        customer_name,
        customer_phone,
        delivery_address: delivery_address || null,
        delivery_notes: delivery_notes || null,
        customer_notes: delivery_notes || null,
        payment_method,
        delivery_method,
        order_status: orderStatus,
        payment_status: paymentStatus,
        item_subtotal: subtotal,
        delivery_fee: parseFloat(delivery_fee),
        discount_amount: parseFloat(discount_amount),
        total_amount: totalAmount,
        admin_notes: admin_notes || null,
        created_by: adminId,
        processed_by: adminId,
        processed_at: getWIBDate(),
        created_at: getWIBDate(),
        updated_at: getWIBDate(),
      },
      { transaction }
    );

    // Create order items and update stock
    for (const item of orderItems) {
      await OrderItem.create(
        {
          order_id: order.id,
          ...item,
        },
        { transaction }
      );

      // Update product stock
      const product = await Product.findByPk(item.product_id, { transaction });
      await product.update(
        {
          total_stock: product.total_stock - item.quantity,
        },
        { transaction }
      );
    }

    // Create status history
    await OrderStatusHistory.create(
      {
        order_id: order.id,
        old_status: null,
        new_status: orderStatus,
        notes: `Order offline dibuat oleh admin. Payment: ${payment_method}`,
        changed_by: adminId,
        changed_at: getWIBDate(),
      },
      { transaction }
    );

    // Create payment detail for offline orders
    await PaymentDetail.create(
      {
        order_id: order.id,
        payment_method: payment_method,
        payment_status: paymentStatus,
        amount: totalAmount,
        paid_at: payment_method === "cash" ? getWIBDate() : null,
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    // Fetch created order with relations
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Order offline berhasil dibuat",
      data: createdOrder,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error creating offline order:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Gagal membuat order offline",
      error: error.message,
    });
  }
};

/**
 * GET /api/admin/orders/:id/invoice
 * Generate Invoice/Receipt for Offline Order
 */
const generateOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch order with complete details
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "quantity_info"],
            },
          ],
        },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "full_name", "phone_number", "email"],
        },
        {
          model: Admin,
          as: "creator",
          attributes: ["id", "full_name", "phone_number"],
        },
        {
          model: PaymentDetail,
          as: "paymentDetails",
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(order);

    // Return HTML response
    res.setHeader("Content-Type", "text/html");
    res.send(invoiceHTML);
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Gagal generate invoice",
      error: error.message,
    });
  }
};

/**
 * Helper function to generate Invoice HTML
 */
const generateInvoiceHTML = (order) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const itemsHTML = order.orderItems
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        ${item.product_name}
        ${item.product?.quantity_info ? `<br><small style="color: #6b7280;">(${item.product.quantity_info})</small>` : ""}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.final_price)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatCurrency(item.subtotal)}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.order_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f3f4f6;
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .invoice-header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .invoice-header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .invoice-body {
      padding: 30px;
    }
    .invoice-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 20px;
    }
    .info-section {
      flex: 1;
    }
    .info-section h3 {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .info-section p {
      font-size: 14px;
      color: #374151;
      margin-bottom: 5px;
      line-height: 1.6;
    }
    .info-section strong {
      color: #111827;
      font-weight: 600;
    }
    .order-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 5px;
    }
    .badge-offline {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .badge-paid {
      background-color: #d1fae5;
      color: #065f46;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    thead {
      background-color: #f9fafb;
    }
    th {
      padding: 12px;
      text-align: left;
      font-size: 13px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    th:nth-child(1) { text-align: center; width: 50px; }
    th:nth-child(3) { text-align: center; width: 80px; }
    th:nth-child(4), th:nth-child(5) { text-align: right; width: 120px; }
    td {
      font-size: 14px;
      color: #374151;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .totals-row {
      display: flex;
      justify-content: flex-end;
      padding: 8px 0;
      font-size: 14px;
    }
    .totals-label {
      width: 200px;
      text-align: right;
      color: #6b7280;
      padding-right: 20px;
    }
    .totals-value {
      width: 150px;
      text-align: right;
      font-weight: 600;
      color: #374151;
    }
    .total-grand {
      border-top: 2px solid #e5e7eb;
      margin-top: 10px;
      padding-top: 10px;
      font-size: 16px;
    }
    .total-grand .totals-label {
      color: #111827;
      font-weight: 700;
    }
    .total-grand .totals-value {
      color: #10b981;
      font-weight: 700;
      font-size: 18px;
    }
    .invoice-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 13px;
    }
    .invoice-footer p {
      margin: 5px 0;
    }
    .print-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      padding: 12px 24px;
      background-color: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
      transition: all 0.3s ease;
    }
    .print-button:hover {
      background-color: #059669;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(16, 185, 129, 0.4);
    }
    @media print {
      body {
        padding: 0;
        background-color: white;
      }
      .invoice-container {
        box-shadow: none;
        border-radius: 0;
      }
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <div class="invoice-header">
      <h1>🌾 INVOICE BALETANI</h1>
      <p>Sistem Penjualan Hasil Pertanian</p>
    </div>

    <!-- Body -->
    <div class="invoice-body">
      <!-- Invoice Info -->
      <div class="invoice-info">
        <div class="info-section">
          <h3>Informasi Order</h3>
          <p><strong>No. Order:</strong> ${order.order_number}</p>
          <p><strong>Tanggal:</strong> ${formatDate(order.created_at)}</p>
          <p><strong>Tipe:</strong> <span class="order-badge badge-offline">OFFLINE</span></p>
          <p><strong>Status:</strong> <span class="order-badge badge-paid">${order.payment_status === "paid" ? "LUNAS" : "BELUM LUNAS"}</span></p>
        </div>
        <div class="info-section">
          <h3>Informasi Customer</h3>
          <p><strong>Nama:</strong> ${order.customer_name || order.customer?.full_name || "-"}</p>
          <p><strong>Telepon:</strong> ${order.customer_phone || order.customer?.phone_number || "-"}</p>
          ${order.delivery_address ? `<p><strong>Alamat:</strong> ${order.delivery_address}</p>` : ""}
        </div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Produk</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <div class="totals-row">
          <div class="totals-label">Subtotal Produk:</div>
          <div class="totals-value">${formatCurrency(order.item_subtotal)}</div>
        </div>
        ${
          order.delivery_fee > 0
            ? `
        <div class="totals-row">
          <div class="totals-label">Biaya Pengiriman:</div>
          <div class="totals-value">${formatCurrency(order.delivery_fee)}</div>
        </div>
        `
            : ""
        }
        ${
          order.discount_amount > 0
            ? `
        <div class="totals-row">
          <div class="totals-label">Diskon:</div>
          <div class="totals-value">- ${formatCurrency(order.discount_amount)}</div>
        </div>
        `
            : ""
        }
        <div class="totals-row total-grand">
          <div class="totals-label">TOTAL:</div>
          <div class="totals-value">${formatCurrency(order.total_amount)}</div>
        </div>
      </div>

      <!-- Payment Info -->
      <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
        <p style="font-size: 14px; color: #374151; margin-bottom: 5px;">
          <strong>Metode Pembayaran:</strong> ${order.payment_method === "cash" ? "TUNAI" : order.payment_method === "transfer" ? "TRANSFER BANK" : "QRIS"}
        </p>
        <p style="font-size: 14px; color: #374151;">
          <strong>Metode Pengiriman:</strong> ${order.delivery_method === "self_pickup" ? "AMBIL SENDIRI" : "DELIVERY"}
        </p>
        ${order.admin_notes ? `<p style="font-size: 13px; color: #6b7280; margin-top: 10px;"><strong>Catatan:</strong> ${order.admin_notes}</p>` : ""}
      </div>

      <!-- Footer -->
      <div class="invoice-footer">
        <p><strong>Terima kasih atas pembelian Anda!</strong></p>
        <p>BaleTani - Sistem Penjualan Hasil Pertanian</p>
        <p>Untuk pertanyaan, hubungi: admin@baletani.com | +62 812-3456-7890</p>
      </div>
    </div>
  </div>

  <!-- Print Button -->
  <button class="print-button" onclick="window.print()">🖨️ Print Invoice</button>
</body>
</html>
  `;
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateAdminNotes,
  cancelOrder,
  getOrderStatistics,
  createOfflineOrder,
  generateOrderInvoice,
};
