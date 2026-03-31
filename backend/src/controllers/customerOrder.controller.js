/**
 * CUSTOMER ORDER CONTROLLER
 * Handle customer order creation and management
 */

const { sequelize } = require("../config/database");
const { getWIBDate } = require("../utils/dateHelper");
const stockMovementService = require("../services/stockMovementService");
const {
  Order,
  OrderItem,
  Product,
  OrderStatusHistory,
  Cart,
  PaymentDetail,
  StockHistory,
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

    // Validate phone number format (Indonesia)
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(customer_phone.replace(/[\s-]/g, ""))) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Format nomor telepon tidak valid",
      });
    }

    if (!items || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Keranjang belanja kosong",
      });
    }

    // Limit max items per order
    if (items.length > 50) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Maksimal 50 item per order",
      });
    }

    // Validate delivery method
    if (!["delivery", "self_pickup"].includes(delivery_method)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Metode pengiriman tidak valid",
      });
    }

    if (delivery_method === "delivery" && !delivery_address) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Alamat pengiriman wajib diisi untuk metode delivery",
      });
    }

    // Validate payment method (allow transfer, bank_transfer, cash, qris)
    const validPaymentMethods = ["transfer", "bank_transfer", "cash", "qris"];
    if (!validPaymentMethods.includes(payment_method)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message:
          "Metode pembayaran tidak valid. Pilih: transfer, cash, atau qris",
      });
    }

    // Validasi bank_name jika payment_method adalah transfer/bank_transfer
    if (payment_method === "transfer" || payment_method === "bank_transfer") {
      if (!bank_name || !["BRI", "BCA", "MANDIRI"].includes(bank_name)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message:
            "Pilih bank terlebih dahulu untuk transfer (BRI/BCA/MANDIRI)",
        });
      }
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
      // Validate item structure
      const quantity = parseFloat(item.quantity);
      if (!item.product_id || !quantity || quantity <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Item tidak valid: product_id dan quantity wajib diisi (bisa decimal misal 0.5)",
        });
      }

      // Limit quantity per item (changed from 100 to allow flexibility with decimals)
      if (quantity > 1000) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Maksimal 1000 quantity per item",
        });
      }

      // FIX: Gunakan pessimistic lock untuk prevent race condition pada stock
      const product = await Product.findOne({
        where: {
          id: item.product_id,
          is_active: true,
        },
        include: [
          {
            model: require("../models").ProductDiscount,
            as: "productDiscounts",
            attributes: [
              "id",
              "product_id",
              "discount_id",
              "original_price",
              "discounted_price",
            ],
            required: false,
            include: [
              {
                model: require("../models").Discount,
                as: "discount",
                attributes: [
                  "id",
                  "discount_name",
                  "discount_type",
                  "value",
                  "start_date",
                  "end_date",
                  "is_active",
                ],
                where: {
                  is_active: true,
                  start_date: { [require("sequelize").Op.lte]: getWIBDate() },
                  end_date: { [require("sequelize").Op.gte]: getWIBDate() },
                },
                required: false,
              },
            ],
          },
        ],
        lock: transaction.LOCK.UPDATE, // Pessimistic lock untuk stock consistency
        transaction,
      });

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Produk tidak ditemukan atau tidak aktif`,
        });
      }

      // Check stock (support decimal quantities)
      const currentStock = parseFloat(product.total_stock || 0);
      if (currentStock < quantity) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Stok ${product.name} tidak mencukupi. Tersedia: ${currentStock}`,
        });
      }

      // Calculate price with discount - ALWAYS use pre-calculated discounted_price
      const originalPrice = parseFloat(product.selling_price);
      let finalPrice = originalPrice;
      let discountValue = 0;

      // Check if product has active discount - ALWAYS use discounted_price from table
      if (product.productDiscounts && product.productDiscounts.length > 0) {
        const activeDiscount = product.productDiscounts[0];

        // ALWAYS use discounted_price from ProductDiscount table (set by admin with max_discount)
        if (activeDiscount.discounted_price) {
          finalPrice = parseFloat(activeDiscount.discounted_price);
          discountValue = originalPrice - finalPrice;
        }
      }

      const itemTotal = Math.round(finalPrice * quantity * 100) / 100;
      itemSubtotal += itemTotal;

      orderItemsData.push({
        product_id: item.product_id,
        product_name: product.name,
        quantity: quantity,
        original_price: Math.round(originalPrice * 100) / 100,
        discount_price: Math.round(discountValue * 100) / 100,
        final_price: Math.round(finalPrice * 100) / 100,
        subtotal: itemTotal,
      });

      // Update stock (support decimal quantities like 0.5 kg)
      const newStock = currentStock - quantity;
      await product.update(
        {
          total_stock: newStock,
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

    // Set initial status - SEMUA metode payment mulai dari pending_payment
    let orderStatus = "pending_payment";
    let paymentStatus = "pending";

    // TIDAK ada auto-paid untuk cash, admin yang konfirmasi setelah customer bayar di tempat
    console.log(
      `[CREATE ORDER] Payment method: ${payment_method}, Initial status: ${orderStatus}`
    );

    // Set payment expiry time
    // Cash TIDAK ada expired time karena bayar di tempat (tidak bisa auto-cancel)
    const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000; // 10 menit dari sekarang

    const paymentExpiredAt =
      payment_method !== "cash" && payment_method !== "tunai"
        ? new Date(Date.now() + PAYMENT_TIMEOUT_MS)
        : null; // Cash tidak perlu expired time (tidak akan auto-cancel)

    if (paymentExpiredAt) {
      console.log(
        `[CREATE ORDER] Payment timeout: ${
          PAYMENT_TIMEOUT_MS / 60000
        } menit, expired at: ${paymentExpiredAt.toISOString()}`
      );
    } else {
      console.log(
        `[CREATE ORDER] Cash payment - No expiry time (pay on delivery/pickup)`
      );
    }

    // Create order
    const order = await Order.create(
      {
        order_number: orderNumber,
        order_type: "online",
        transaction_type: "online",
        customer_id: customerId,
        customer_name,
        customer_phone,
        payment_method,
        payment_proof_url: null,
        delivery_method,
        delivery_address: delivery_address || null,
        delivery_notes: delivery_notes || null,
        customer_notes: delivery_notes || null,
        item_subtotal: itemSubtotal,
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        order_status: orderStatus,
        payment_status: paymentStatus,
        payment_expired_at: paymentExpiredAt,
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
    // Cari system admin untuk automatic status history (bukan dari customer action)
    const Admin = require("../models").Admin;
    const systemAdmin = await Admin.findOne({
      attributes: ["id"],
      where: { full_name: "Super Admin" },
      transaction,
    });

    const changedBy = systemAdmin?.id || null; // Use Super Admin or null if not found

    await OrderStatusHistory.create(
      {
        order_id: order.id,
        old_status: null,
        new_status: orderStatus, // pending_payment untuk semua metode
        changed_by: changedBy,
        notes:
          payment_method === "cash"
            ? "Order created - Cash payment (pay on delivery/pickup)"
            : "Order created - Waiting for payment confirmation",
        changed_at: getWIBDate(),
      },
      { transaction }
    );

    // CREATE PAYMENT DETAIL (JIKA TRANSFER BANK)
    let paymentDetail = null;
    if (payment_method === "transfer" || payment_method === "bank_transfer") {
      // bank_name sudah divalidasi di atas, seharusnya sudah valid di sini

      // Dummy account numbers untuk masing-masing bank
      const bankAccounts = {
        BRI: "0021-01-123456-50-9",
        BCA: "1234567890",
        MANDIRI: "1370012345678",
      };

      const accountNumber = bankAccounts[bank_name];
      const expiry = PaymentDetail.getExpiryTime();

      paymentDetail = await PaymentDetail.create(
        {
          order_id: order.id,
          payment_method: "bank_transfer",
          bank_name: bank_name,
          account_name: "BaleTani Fresh Market",
          payment_status: "pending",
          virtual_account: accountNumber,
          amount: totalAmount,
          expired_at: expiry,
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

    // ========================================
    // LOG STOCK MOVEMENTS (after transaction commit)
    // ========================================
    // Log each item as a "sale_out" stock movement
    try {
      for (const item of items) {
        const quantity = parseFloat(item.quantity);
        await stockMovementService.logStockMovement({
          product_id: item.product_id,
          movement_type: "sale_out",
          quantity_change: -quantity, // Negative because it's a reduction
          created_by: "67ff125f-d9e6-42a7-93a6-f212f9db890d", // Use admin ID for stock movements
          reference_id: order.id,
          reference_type: "order",
        });

        // Also log in StockHistory
        try {
          await StockHistory.create({
            product_id: item.product_id,
            change_type: "order",
            quantity_change: -quantity,
            reason: `Order ${order.order_number}`,
            reference_id: order.id,
          });
          console.log(`[ORDER ${order.order_number}] StockHistory logged for product ${item.product_id}: -${quantity}`);
        } catch (historyError) {
          console.error(`[ORDER ${order.order_number}] Failed to log StockHistory for product ${item.product_id}:`, historyError.message);
        }
      }
      console.log(`[ORDER ${order.order_number}] Stock movements logged successfully`);
    } catch (stockError) {
      // Log the error but don't fail the order - stock was already updated in DB
      console.error(`[ORDER ${order.order_number}] Failed to log stock movements:`, stockError.message);
    }

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
      payment_expired_at: createdOrder.payment_expired_at, // Untuk countdown timer
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

    // ========================================
    // GENERATE WHATSAPP MESSAGE
    // ========================================
    const formatRupiah = (amount) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (date) => {
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(new Date(date));
    };

    // Build WhatsApp message
    let waMessage = `🛒 *KONFIRMASI PESANAN BALETANI*\n\n`;
    waMessage += `📋 *Detail Pesanan*\n`;
    waMessage += `No. Order: ${responseData.order_number}\n`;
    waMessage += `Tanggal: ${formatDate(responseData.created_at)}\n`;
    waMessage += `Nama: ${responseData.customer_name}\n`;
    waMessage += `No. HP: ${responseData.customer_phone}\n\n`;

    waMessage += `📦 *Produk yang Dipesan:*\n`;
    responseData.items.forEach((item, index) => {
      waMessage += `${index + 1}. ${item.product_name}\n`;
      waMessage += `   Qty: ${item.quantity} × ${formatRupiah(
        item.final_price
      )} = ${formatRupiah(item.subtotal)}\n`;
    });

    waMessage += `\n💰 *Rincian Pembayaran:*\n`;
    waMessage += `Subtotal: ${formatRupiah(responseData.item_subtotal)}\n`;
    waMessage += `Ongkir: ${formatRupiah(responseData.delivery_fee)}\n`;
    waMessage += `─────────────────\n`;
    waMessage += `*TOTAL: ${formatRupiah(responseData.total_amount)}*\n\n`;

    waMessage += `🚚 *Metode Pengiriman:*\n`;
    waMessage += `${
      delivery_method === "delivery"
        ? "🏠 Delivery/Antar"
        : "🏪 Ambil Sendiri (Self Pickup)"
    }\n`;
    if (delivery_method === "delivery") {
      waMessage += `Alamat: ${delivery_address || "-"}\n`;
    }
    waMessage += `\n`;

    waMessage += `💳 *Metode Pembayaran:*\n`;
    if (payment_method === "transfer" && createdOrder.payment) {
      waMessage += `🏦 Transfer Bank ${createdOrder.payment.bank_name}\n\n`;
      waMessage += `*SILAKAN TRANSFER KE:*\n`;
      waMessage += `Bank: ${createdOrder.payment.bank_name}\n`;
      waMessage += `No. Rek: ${createdOrder.payment.virtual_account}\n`;
      waMessage += `a/n: ${createdOrder.payment.account_name}\n`;
      waMessage += `Jumlah: ${formatRupiah(responseData.total_amount)}\n\n`;

      // Gunakan payment_expired_at dari order (bukan payment.expired_at)
      if (responseData.payment_expired_at) {
        waMessage += `⏰ *Selesaikan pembayaran sebelum:*\n`;
        waMessage += `${formatDate(responseData.payment_expired_at)}\n`;
        waMessage += `_(10 menit dari sekarang)_\n\n`;
      }

      waMessage += `📸 *Setelah transfer, mohon kirim bukti transfer ke nomor ini*\n\n`;
    } else if (payment_method === "qris") {
      waMessage += `📱 QRIS\n\n`;
      waMessage += `*CARA PEMBAYARAN:*\n`;
      waMessage += `1️⃣ Admin akan mengirimkan QR Code pembayaran ke nomor ini\n`;
      waMessage += `2️⃣ Scan QR Code yang dikirim admin\n`;
      waMessage += `3️⃣ Selesaikan pembayaran dengan nominal yang tertera\n`;
      waMessage += `4️⃣ Kirim bukti pembayaran dan konfirmasi setelah berhasil\n\n`;
      waMessage += `Jumlah: ${formatRupiah(responseData.total_amount)}\n\n`;

      if (responseData.payment_expired_at) {
        waMessage += `⏰ *Selesaikan pembayaran sebelum:*\n`;
        waMessage += `${formatDate(responseData.payment_expired_at)}\n`;
        waMessage += `_(10 menit dari sekarang)_\n\n`;
      }
    } else if (payment_method === "cash" || payment_method === "tunai") {
      waMessage += `💵 Cash (Bayar di Tempat)\n`;
      waMessage += `Pembayaran dilakukan saat pengambilan/pengiriman barang\n`;
      waMessage += `Jumlah: ${formatRupiah(responseData.total_amount)}\n`;
      waMessage += `💡 Siapkan uang pas untuk mempermudah transaksi\n\n`;
    }

    waMessage += `Terima kasih sudah berbelanja di *BaleTani Fresh Market*! 🌿✨\n`;
    waMessage += `\n_Pesan otomatis dari sistem BaleTani_`;

    // Add WhatsApp message to response (with error handling)
    try {
      const adminWhatsAppPhone =
        process.env.WHATSAPP_ADMIN_PHONE || "6287735517999";

      responseData.whatsapp = {
        phone: adminWhatsAppPhone,
        message: waMessage,
        url: `https://wa.me/${adminWhatsAppPhone}?text=${encodeURIComponent(
          waMessage
        )}`,
      };
    } catch (waError) {
      console.error("WhatsApp message generation failed:", waError);
      // Order tetap sukses meskipun WhatsApp gagal
      responseData.whatsapp = null;
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
          model: PaymentDetail,
          as: "payment",
          required: false,
        },
        {
          model: OrderStatusHistory,
          as: "statusHistory",
          required: false,
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
