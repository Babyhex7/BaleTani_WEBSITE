/**
 * Order Seeder
 * Insert 10 dummy orders untuk testing
 */

const { sequelize } = require("../src/config/database");
const {
  Order,
  OrderItem,
  OrderStatusHistory,
  Product,
  Customer,
  Admin,
} = require("../src/models");

const orderSeeder = async () => {
  try {
    console.log("🌱 Starting Order Seeder...");

    // Check if admin exists (use phone_number instead of email)
    let admin = await Admin.findOne({ where: { phone_number: "08123456789" } });
    if (!admin) {
      console.log(
        "💡 Admin with phone 08123456789 not found, finding any admin..."
      );
      admin = await Admin.findOne();
      if (!admin) {
        console.error(
          "❌ No admin found in database! Please run adminSeeder first."
        );
        return;
      }
      console.log(`✅ Using admin: ${admin.full_name} (ID: ${admin.id})`);
    }

    // Check if products exist
    const products = await Product.findAll({ limit: 5 });
    if (products.length === 0) {
      console.error("❌ No products found! Please add products first.");
      return;
    }

    // Check if customer exists
    let customer = await Customer.findOne();
    if (!customer) {
      // Create dummy customer if not exists
      customer = await Customer.create({
        full_name: "John Doe",
        email: "john@example.com",
        phone_number: "081234567890",
        password_hash: "dummy_hash",
        is_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log("✅ Created dummy customer");
    }

    // Delete existing dummy orders (optional)
    await OrderItem.destroy({ where: {} });
    await OrderStatusHistory.destroy({ where: {} });
    await Order.destroy({ where: {} });
    console.log("🗑️  Cleared existing orders");

    // Order statuses
    const statuses = [
      "pending_payment",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const paymentStatuses = ["unpaid", "paid", "refunded"];
    const paymentMethods = [
      "cash",
      "transfer_bca",
      "transfer_bri",
      "gopay",
      "ovo",
    ];
    const deliveryMethods = ["pickup", "delivery", "courier"];
    const orderTypes = ["online", "offline"];

    const orders = [];

    for (let i = 1; i <= 10; i++) {
      const orderType =
        orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const paymentMethod =
        paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const deliveryMethod =
        deliveryMethods[Math.floor(Math.random() * deliveryMethods.length)];

      // Random status
      const orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
      let paymentStatus = "unpaid";
      if (
        orderStatus === "paid" ||
        orderStatus === "processing" ||
        orderStatus === "shipped" ||
        orderStatus === "delivered"
      ) {
        paymentStatus = "paid";
      } else if (orderStatus === "cancelled") {
        paymentStatus = Math.random() > 0.5 ? "refunded" : "unpaid";
      }

      // Generate order number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const random = String(1000 + i).padStart(4, "0");
      const orderNumber = `ORD-${year}${month}${day}-${random}`;

      // Random products (1-3 items)
      const numItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        if (!selectedProducts.find((p) => p.id === product.id)) {
          selectedProducts.push(product);
        }
      }

      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const product of selectedProducts) {
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = parseFloat(product.selling_price);
        const itemSubtotal = price * quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit: "kg", // Add unit field
          original_price: price,
          discount_price: null,
          final_price: price,
          subtotal: itemSubtotal,
        });
      }

      const deliveryFee =
        deliveryMethod === "pickup"
          ? 0
          : Math.floor(Math.random() * 20000) + 10000;
      const discountAmount =
        Math.random() > 0.7 ? Math.floor(Math.random() * 10000) : 0;
      const totalAmount = subtotal + deliveryFee - discountAmount;

      // Create order
      const order = await Order.create({
        order_number: orderNumber,
        transaction_type: orderType, // transaction_type not order_type
        customer_id: customer.id, // Always need customer_id
        customer_name:
          orderType === "online" ? customer.full_name : `Customer Offline ${i}`,
        customer_email:
          orderType === "online" ? customer.email : `offline${i}@example.com`,
        customer_phone:
          orderType === "online"
            ? customer.phone_number
            : `0812345678${String(i).padStart(2, "0")}`,
        delivery_address: `Jl. Test Address No. ${i}, Jakarta`,
        delivery_notes:
          i % 2 === 0 ? `Catatan pengiriman untuk order ${i}` : null,
        payment_method:
          paymentMethod === "cash"
            ? "cash"
            : paymentMethod.includes("transfer")
            ? "transfer"
            : "qris",
        delivery_method:
          deliveryMethod === "pickup" ? "self_pickup" : "delivery",
        payment_proof_url:
          paymentStatus === "paid" && paymentMethod !== "cash"
            ? `proof_${i}.jpg`
            : null,
        order_status: orderStatus,
        payment_status: paymentStatus,
        item_subtotal: subtotal, // item_subtotal not subtotal
        delivery_fee: deliveryFee,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        admin_notes: i % 3 === 0 ? `Admin notes untuk order ${i}` : null,
        processed_by: orderStatus !== "pending_payment" ? admin.id : null,
        processed_at: orderStatus !== "pending_payment" ? new Date() : null,
        cancelled_reason:
          orderStatus === "cancelled" ? "Dibatalkan oleh customer" : null,
        cancelled_by:
          orderStatus === "cancelled"
            ? i % 2 === 0
              ? admin.id
              : customer.id
            : null,
        cancelled_at: orderStatus === "cancelled" ? new Date() : null,
        created_by: orderType === "offline" ? admin.id : null,
        created_at: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000), // Spread over 10 days
        updated_at: new Date(),
      });

      // Create order items
      for (const item of orderItems) {
        await OrderItem.create({
          order_id: order.id,
          ...item,
          created_at: order.created_at,
          updated_at: order.updated_at,
        });
      }

      // Create status history
      await OrderStatusHistory.create({
        order_id: order.id,
        old_status: null,
        new_status: orderStatus,
        notes: `Order created with status: ${orderStatus}`,
        changed_by: admin.id, // Always use admin.id, not null
        changed_at: order.created_at,
      });

      orders.push(order);
      console.log(
        `✅ Created order ${i}/10: ${orderNumber} (${orderType}, ${orderStatus})`
      );
    }

    console.log("\n🎉 Order Seeder completed successfully!");
    console.log(`📦 Created ${orders.length} orders`);

    // Show summary
    const onlineCount = orders.filter(
      (o) => o.transaction_type === "online"
    ).length;
    const offlineCount = orders.filter(
      (o) => o.transaction_type === "offline"
    ).length;
    console.log(`   - Online: ${onlineCount}`);
    console.log(`   - Offline: ${offlineCount}`);
  } catch (error) {
    console.error("❌ Error seeding orders:", error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  orderSeeder()
    .then(() => {
      console.log("✅ Seeder finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeder failed:", error);
      process.exit(1);
    });
}

module.exports = orderSeeder;
