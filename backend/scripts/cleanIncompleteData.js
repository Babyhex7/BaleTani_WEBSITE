/**
 * Clean incomplete seeding data
 * Removes orders, order items, and payment details that were partially created
 */

const { sequelize } = require("../src/config/database");
const { Order, OrderItem, OrderStatusHistory, PaymentDetail } = require("../src/models");

const cleanIncompleteData = async () => {
  try {
    console.log("🧹 Cleaning incomplete seeding data...\n");

    // Delete in correct order (respecting foreign keys)
    const deletedPayments = await PaymentDetail.destroy({ where: {}, force: true });
    console.log(`✅ Deleted ${deletedPayments} payment details`);

    const deletedStatusHistory = await OrderStatusHistory.destroy({ where: {}, force: true });
    console.log(`✅ Deleted ${deletedStatusHistory} order status histories`);

    const deletedItems = await OrderItem.destroy({ where: {}, force: true });
    console.log(`✅ Deleted ${deletedItems} order items`);

    const deletedOrders = await Order.destroy({ where: {}, force: true });
    console.log(`✅ Deleted ${deletedOrders} orders`);

    console.log(`\n✨ Cleanup complete! Database ready for re-seeding.`);
    console.log(`\n📝 Next step:\n   npm run seed:comprehensive\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

cleanIncompleteData();
