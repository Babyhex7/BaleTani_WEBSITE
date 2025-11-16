/**
 * ORDER AUTO-CANCEL CRON JOB
 * Otomatis membatalkan order yang tidak dibayar dalam waktu tertentu
 */

const { Order, Product, OrderItem, OrderStatusHistory } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { getWIBDate } = require("../utils/dateHelper");

// CONFIG: Timeout pembayaran - 10 MENIT (PRODUCTION)
const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000; // 10 menit

console.log(
  `[AUTO-CANCEL] Payment timeout: ${PAYMENT_TIMEOUT_MS / 60000} menit`
);

/**
 * Auto-cancel expired orders
 * Dijalankan setiap 30 detik (untuk testing) atau 1 menit (production)
 */
const autoCancelExpiredOrders = async () => {
  const transaction = await sequelize.transaction();

  try {
    const now = getWIBDate();

    // Cari semua order pending_payment yang sudah expired
    const expiredOrders = await Order.findAll({
      where: {
        order_status: "pending_payment",
        payment_expired_at: {
          [Op.lte]: now, // Sudah lewat waktu expired
        },
      },
      include: [
        {
          model: OrderItem,
          as: "orderItems",
          attributes: ["product_id", "quantity"],
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (expiredOrders.length === 0) {
      console.log("[AUTO-CANCEL] ✓ Tidak ada order expired");
      await transaction.commit();
      return { success: true, cancelledCount: 0 };
    }

    console.log(
      `[AUTO-CANCEL] Ditemukan ${expiredOrders.length} order expired`
    );

    let cancelledCount = 0;

    for (const order of expiredOrders) {
      try {
        // 1. Update order status
        await order.update(
          {
            order_status: "cancelled",
            cancelled_reason:
              "Pembayaran melebihi batas waktu (auto-cancelled)",
            cancelled_by: null, // NULL = system auto-cancel
            cancelled_at: now,
            updated_at: now,
          },
          { transaction }
        );

        // 2. Restore product stock
        if (order.orderItems && order.orderItems.length > 0) {
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
                `  → Stock ${product.name} dikembalikan: +${item.quantity}`
              );
            }
          }
        }

        // 3. Log ke order status history
        await OrderStatusHistory.create(
          {
            order_id: order.id,
            status: "cancelled",
            notes:
              "Otomatis dibatalkan sistem karena tidak dibayar dalam waktu yang ditentukan",
            created_by: null, // System
            created_at: now,
          },
          { transaction }
        );

        console.log(
          `[AUTO-CANCEL] ✓ Order ${order.order_number} dibatalkan (expired)`
        );
        cancelledCount++;
      } catch (error) {
        console.error(
          `[AUTO-CANCEL] ✗ Error cancel order ${order.order_number}:`,
          error.message
        );
        // Continue dengan order berikutnya
      }
    }

    await transaction.commit();
    console.log(`[AUTO-CANCEL] ✓ Berhasil cancel ${cancelledCount} order`);

    return {
      success: true,
      cancelledCount,
      orders: expiredOrders.map((o) => o.order_number),
    };
  } catch (error) {
    await transaction.rollback();
    console.error("[AUTO-CANCEL] ✗ Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Start cron job
 */
const startAutoCancelCron = () => {
  // Interval: 30 detik (lebih responsive untuk production)
  const CRON_INTERVAL_MS = 30 * 1000; // 30 detik

  console.log(
    `[AUTO-CANCEL] Cron job dimulai, interval: ${CRON_INTERVAL_MS / 1000} detik`
  );

  // Jalankan pertama kali setelah 10 detik
  setTimeout(() => {
    autoCancelExpiredOrders();
  }, 10000);

  // Kemudian jalankan setiap interval
  const intervalId = setInterval(() => {
    autoCancelExpiredOrders();
  }, CRON_INTERVAL_MS);

  return intervalId;
};

/**
 * Stop cron job
 */
const stopAutoCancelCron = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
    console.log("[AUTO-CANCEL] Cron job dihentikan");
  }
};

module.exports = {
  autoCancelExpiredOrders,
  startAutoCancelCron,
  stopAutoCancelCron,
  PAYMENT_TIMEOUT_MS,
};
