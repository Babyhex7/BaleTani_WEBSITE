/**
 * Migration Script: Add order_type to orders table
 * Run: node backend/scripts/updateOrdersTableAddType.js
 */

require("dotenv").config();
const { sequelize } = require("../src/config/database");

async function updateOrdersTableAddType() {
  try {
    console.log("🔄 Starting migration: Add order_type to orders table...");

    // Check if column already exists
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM orders LIKE 'order_type'
    `);

    if (columns.length === 0) {
      // Add order_type column after order_number
      await sequelize.query(`
        ALTER TABLE orders 
        ADD COLUMN order_type ENUM('online', 'offline') DEFAULT 'online' NOT NULL
        AFTER order_number
      `);
      console.log("✅ Added order_type column");
    } else {
      console.log("ℹ️  order_type column already exists");
    }

    // Add index for faster filtering
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type)
    `);
    console.log("✅ Added index for order_type");

    // Add created_by column if not exists (for offline orders)
    const [createdByColumns] = await sequelize.query(`
      SHOW COLUMNS FROM orders LIKE 'created_by'
    `);

    if (createdByColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE orders 
        ADD COLUMN created_by CHAR(36) NULL
        AFTER cancelled_at
      `);
      console.log(
        "✅ Added created_by column for tracking who created offline orders"
      );
    } else {
      console.log("ℹ️  created_by column already exists");
    }

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

updateOrdersTableAddType();
