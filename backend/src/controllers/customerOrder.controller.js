/**
 * CUSTOMER ORDER CONTROLLER
 * Handle customer order creation and management
 */

const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { getWIBDate } = require("../utils/dateHelper");
const {
  Order,
  OrderItem,
  Product,
  Customer,
  OrderStatusHistory,
  Cart,
  PaymentDetail,
} = require("../models");

/**
 * POST /api/customer/orders/create
 * Create order from customer checkout
 */
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      customer_name,
      customer_phone,
      delivery_method,
      delivery_address,
      delivery_notes,
      payment_method,
      bank_name, // TAMBAHAN: BRI, BCA, MANDIRI
      items, // [{ product_id, quantity }]
    } = req.body;

    // Get customer from token (REQUIRED - must be logged in)
    const customerId = req.customer?.id;

    if (!customerId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu untuk checkout",
      });
    }

    // Validation
    if (!customer_name || !customer_phone) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Nama dan nomor telepon wajib diisi",
      });
    }

    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Keranjang belanja kosong",
      });
    }

    if (delivery_method === "delivery" && !delivery_address) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Alamat pengiriman wajib diisi untuk metode delivery",
      });
    }

    // Generate order number
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    const randomNum = String(Math.floor(Math.random() * 10000)).padStart(
      4,
      "0"
    );
    const orderNumber = `ORD-${dateStr}-${randomNum}`;

    // Check if order number exists (very unlikely, but check anyway)
    const existingOrder = await Order.findOne({
      where: { order_number: orderNumber },
    });

    if (existingOrder) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan, silakan coba lagi",
      });
    }

    // Calculate totals and prepare order items
    let itemSubtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findOne({
        where: {
          id: item.product_id,
          is_active: true,
        },
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Produk tidak ditemukan atau tidak aktif`,
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

      const itemPrice = parseFloat(product.selling_price);
      const itemTotal = itemPrice * item.quantity;
      itemSubtotal += itemTotal;

      orderItemsData.push({
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        original_price: itemPrice,
        discount_price: 0,
        final_price: itemPrice,
        subtotal: itemTotal,
      });

      // Update stock
      await product.update(
        {
          total_stock: product.total_stock - item.quantity,
          updated_at: getWIBDate(),
        },
        { transaction }
      );
    }

    // Calculate delivery fee
    const deliveryFee = delivery_method === "delivery" ? 10000 : 0;

    // Calculate total
    const discountAmount = 0; // TODO: implement discount logic jika ada
    const totalAmount = itemSubtotal + deliveryFee - discountAmount;

    // Set initial status based on payment method
    let orderStatus = "pending_payment";
    let paymentStatus = "pending";

    if (payment_method === "cash") {
      // Cash = bayar di tempat, langsung set paid
      orderStatus = "paid";
      paymentStatus = "paid";
    }

    // Create order
    const order = await Order.create(
      {
        order_number: orderNumber,
        transaction_type: "online",
        customer_id: customerId,
        customer_name,
        customer_phone,
        payment_method,
        payment_proof_url: null,
        delivery_method,
        delivery_address: delivery_address || null,
        delivery_notes: delivery_notes || null,
        item_subtotal: itemSubtotal,
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        order_status: orderStatus,
        payment_status: paymentStatus,
        admin_notes: null,
        processed_by: null,
        processed_at: null,
        created_at: getWIBDate(),
        updated_at: getWIBDate(),
      },
      { transaction }
    );

    // Create order items
    for (const itemData of orderItemsData) {
      await OrderItem.create(
        {
          order_id: order.id,
          ...itemData,
          created_at: getWIBDate(),
          updated_at: getWIBDate(),
        },
        { transaction }
      );
    }

    // Create order status history
    await OrderStatusHistory.create(
      {
        order_id: order.id,
        old_status: null,
        new_status: orderStatus,
        changed_by: customerId,
        notes: "Order created by customer",
        changed_at: getWIBDate(),
      },
      { transaction }
    );

    // CREATE PAYMENT DETAIL (JIKA TRANSFER BANK)
    let paymentDetail = null;
    if (payment_method === "transfer" || payment_method === "bank_transfer") {
      // Validasi bank_name
      if (!bank_name || !["BRI", "BCA", "MANDIRI"].includes(bank_name)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Pilih bank terlebih dahulu (BRI/BCA/MANDIRI)",
        });
      }

      // Generate Virtual Account menggunakan static method dari model
      paymentDetail = await PaymentDetail.create(
        {
          order_id: order.id,
          payment_method: "bank_transfer",
          bank_name: bank_name,
          account_name: "BaleTani Fresh Market",
          payment_status: "pending",
        },
        { transaction }
      );
    }

    // Clear customer cart if authenticated
    if (customerId) {
      await Cart.destroy({
        where: { customer_id: customerId },
        transaction,
      });
    }

    await transaction.commit();

    // Fetch created order with items and payment detail
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "orderItems",
        },
        {
          model: PaymentDetail,
          as: "payment",
        },
      ],
    });

    // Prepare response
    const responseData = {
      id: createdOrder.id,
      order_number: createdOrder.order_number,
      customer_name: createdOrder.customer_name,
      customer_phone: createdOrder.customer_phone,
      payment_method: createdOrder.payment_method,
      delivery_method: createdOrder.delivery_method,
      delivery_address: createdOrder.delivery_address,
      item_subtotal: parseFloat(createdOrder.item_subtotal),
      delivery_fee: parseFloat(createdOrder.delivery_fee),
      total_amount: parseFloat(createdOrder.total_amount),
      order_status: createdOrder.order_status,
      payment_status: createdOrder.payment_status,
      created_at: createdOrder.created_at,
      items: createdOrder.orderItems.map((item) => ({
        product_name: item.product_name,
        quantity: parseFloat(item.quantity),
        final_price: parseFloat(item.final_price),
        subtotal: parseFloat(item.subtotal),
      })),
    };

    // Add payment detail if exists (for bank transfer)
    if (createdOrder.payment) {
      responseData.payment = {
        method: createdOrder.payment.payment_method,
        bank: createdOrder.payment.bank_name,
        virtual_account: createdOrder.payment.virtual_account,
        account_name: createdOrder.payment.account_name,
        expired_at: createdOrder.payment.expired_at,
        status: createdOrder.payment.payment_status,
      };
    }

    return res.status(201).json({
      success: true,
      message: "Order berhasil dibuat",
      data: responseData,
    });
  } catch (error) {
    // Only rollback if transaction is still active (not committed/rolled back)
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    // Enhanced logging for easier debugging
    console.error("Create order error:", error.message);
    if (error.stack) console.error(error.stack);
    // Sequelize-specific details
    if (error.errors) console.error("Validation errors:", error.errors);
    if (error.parent) console.error("DB error:", error.parent);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat order",
      error: error.message,
    });
  }
};

/**
 * GET /api/customer/orders
 * Get customer's orders
 */
const getMyOrders = async (req, res) => {
  try {
    const customerId = req.customer?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { page = 1, limit = 10, status = "" } = req.query;

    const whereClause = {
      customer_id: customerId,
    };

    if (status) {
      whereClause.order_status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          attributes: [
            "product_name",
            "quantity",
            "unit",
            "final_price",
            "subtotal",
          ],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: {
        orders: orders.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          total_amount: parseFloat(order.total_amount),
          order_status: order.order_status,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          delivery_method: order.delivery_method,
          created_at: order.created_at,
          items: order.orderItems,
        })),
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data orders",
      error: error.message,
    });
  }
};

/**
 * GET /api/customer/orders/:id
 * Get order detail
 */
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.customer?.id;

    const whereClause = {
      id: id,
    };

    // Only show customer's own orders
    if (customerId) {
      whereClause.customer_id = customerId;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: "orderItems",
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          // ordering of included association should be specified in top-level 'order'
        },
      ],
      order: [
        [
          { model: OrderStatusHistory, as: "statusHistory" },
          "changed_at",
          "DESC",
        ],
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail order",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderDetail,
};
