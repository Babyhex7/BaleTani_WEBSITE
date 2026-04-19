/**
 * ORDER AUTO-CANCEL CRON JOB
 * Otomatis membatalkan order yang tidak dibayar dalam waktu tertentu
 */

const { Order, Product, OrderItem, OrderStatusHistory } = require("../models");
const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const { getWIBDate } = require("../utils/dateHelper");
const logger = require("../utils/logger");

const PAYMENT_TIMEOUT_MS = 10 * 60 * 1000;

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
      await transaction.commit();
      return { success: true, cancelledCount: 0 };
    }

    logger.info(`[AUTO-CANCEL] Found ${expiredOrders.length} expired orders`);

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
              const currentStock = parseFloat(product.total_stock || 0);
              const restoreQty = parseFloat(item.quantity || 0);
              await product.update(
                {
                  total_stock: currentStock + restoreQty,
                  updated_at: now,
                },
                { transaction }
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

        cancelledCount++;
      } catch (error) {
        logger.error(
          `[AUTO-CANCEL] Error cancel order ${order.order_number}:`,
          error.message
        );
        // Continue dengan order berikutnya
      }
    }

    await transaction.commit();
    logger.info(`[AUTO-CANCEL] Cancelled ${cancelledCount} orders`);

    return {
      success: true,
      cancelledCount,
      orders: expiredOrders.map((o) => o.order_number),
    };
  } catch (error) {
    await transaction.rollback();
    logger.error("[AUTO-CANCEL] Error:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Start cron job
 */
const startAutoCancelCron = () => {
  const CRON_INTERVAL_MS = 30 * 1000;

  logger.info(`[AUTO-CANCEL] Cron job started, interval: ${CRON_INTERVAL_MS / 1000}s`);

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
    logger.info("[AUTO-CANCEL] Cron job stopped");
  }
};

module.exports = {
  autoCancelExpiredOrders,
  startAutoCancelCron,
  stopAutoCancelCron,
  PAYMENT_TIMEOUT_MS,
};
