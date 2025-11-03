/**
 * UPDATE ORDER STATUS ENUM SCRIPT
 * This script updates the orders table to use the new simplified status flow
 * Run this AFTER updating the Order model
 */

const { sequelize } = require("../src/config/database");

async function updateOrderStatusEnum() {
  try {
    console.log("🔄 Starting order status ENUM update...");

    // Step 1: Drop customer_email column if exists
    console.log("\n📧 Removing customer_email column...");
    try {
      await sequelize.query(`
        ALTER TABLE orders 
        DROP COLUMN customer_email;
      `);
      console.log("✅ customer_email column removed");
    } catch (error) {
      if (error.message.includes("doesn't exist")) {
        console.log("ℹ️  customer_email column already removed");
      } else {
        throw error;
      }
    }

    // Step 2: Update payment_status ENUM
    console.log("\n💳 Updating payment_status ENUM...");
    await sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_status 
      ENUM('pending', 'paid', 'failed', 'refunded') 
      NOT NULL 
      DEFAULT 'pending';
    `);
    console.log("✅ payment_status ENUM updated");

    // Step 3: Migrate old order_status values to new values
    console.log("\n📊 Migrating existing order_status values...");

    // Map old values to new values
    const statusMigrations = [
      { old: "checkout", new: "pending_payment" },
      { old: "shipped", new: "out_for_delivery" },
      { old: "delivered", new: "completed" },
      { old: "unpaid", new: "pending_payment" },
    ];

    for (const migration of statusMigrations) {
      const [results] = await sequelize.query(`
        UPDATE orders 
        SET order_status = '${migration.new}' 
        WHERE order_status = '${migration.old}';
      `);
      if (results.affectedRows > 0) {
        console.log(
          `  ✓ Migrated ${results.affectedRows} orders from '${migration.old}' to '${migration.new}'`
        );
      }
    }

    // Step 4: Update order_status ENUM
    console.log("\n🔄 Updating order_status ENUM...");
    await sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN order_status 
      ENUM(
        'pending_payment',
        'paid',
        'processing',
        'ready_for_pickup',
        'out_for_delivery',
        'completed',
        'cancelled'
      ) 
      NOT NULL 
      DEFAULT 'pending_payment';
    `);
    console.log("✅ order_status ENUM updated");

    // Step 5: Update payment_status for existing orders
    console.log("\n💰 Fixing payment_status values...");
    const [updateResults] = await sequelize.query(`
      UPDATE orders 
      SET payment_status = 'paid' 
      WHERE payment_status = 'unpaid' OR payment_status NOT IN ('pending', 'paid', 'failed', 'refunded');
    `);
    if (updateResults.affectedRows > 0) {
      console.log(
        `  ✓ Updated ${updateResults.affectedRows} payment_status values`
      );
    }

    console.log("\n✅ All migrations completed successfully!");
    console.log("\n📋 Summary:");
    console.log("  - Removed customer_email column");
    console.log(
      "  - Updated payment_status ENUM to: pending, paid, failed, refunded"
    );
    console.log(
      "  - Updated order_status ENUM to: pending_payment, paid, processing, ready_for_pickup, out_for_delivery, completed, cancelled"
    );
    console.log("  - Migrated existing order statuses to new values");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
updateOrderStatusEnum()
  .then(() => {
    console.log("\n🎉 Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration error:", error);
    process.exit(1);
  });
