const { sequelize } = require("./src/config/database");
const { Order } = require("./src/models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // Test create order - STANDARISASI: HANYA delivery_* fields
    const testOrder = {
      order_number: "TEST-" + Date.now(),
      order_type: "online",
      transaction_type: "online",
      customer_id: "4f198145-06ab-4f85-8f3b-5224fab79d46",
      customer_name: "Test Customer",
      customer_phone: "08123456789",
      payment_method: "cash",
      delivery_method: "delivery",
      delivery_address:
        "Jl. Sudirman No. 999, Jakarta Pusat, DKI Jakarta 10110",
      delivery_notes: "Harap hubungi 30 menit sebelum pengiriman",
      customer_notes: "Harap hubungi 30 menit sebelum pengiriman",
      item_subtotal: 100000,
      delivery_fee: 10000,
      discount_amount: 0,
      service_fee: 0,
      total_amount: 110000,
      order_status: "paid",
      payment_status: "paid",
    };

    console.log("🔄 Creating test order...\n");
    const order = await Order.create(testOrder);

    console.log("✅ Order created successfully!");
    console.log("Order ID:", order.id);
    console.log("Order Number:", order.order_number);
    console.log("\n📍 STANDARISASI - Hanya delivery_* fields:");
    console.log("  ✅ delivery_address:", order.delivery_address);
    console.log("  ✅ delivery_notes:", order.delivery_notes);
    console.log("  ✅ customer_notes:", order.customer_notes);
    console.log("  ✅ delivery_method:", order.delivery_method);
    console.log("  ✅ delivery_fee:", order.delivery_fee);

    // Verify in database
    console.log("\n🔍 Verifying in database...");
    const [result] = await sequelize.query(
      `SELECT delivery_address, delivery_notes, customer_notes, delivery_method, delivery_fee 
       FROM orders WHERE id = ?`,
      { replacements: [order.id] }
    );

    console.log("\n✅ Database verification:");
    console.log(JSON.stringify(result[0], null, 2));

    // Clean up
    console.log("\n🗑️  Cleaning up test data...");
    await Order.destroy({ where: { id: order.id } });
    console.log("✅ Test data removed");

    process.exit(0);
  } catch (e) {
    console.error("❌ Error:", e.message);
    console.error(e);
    process.exit(1);
  }
})();
