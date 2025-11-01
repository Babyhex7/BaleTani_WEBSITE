/**
 * Migration Script: Update orders table for admin order management
 * Run: node backend/scripts/updateOrdersTable.js
 */

// Load environment variables
require("dotenv").config();

const { sequelize } = require("../src/config/database");

async function updateOrdersTable() {
  try {
    console.log("🔄 Starting migration: Update orders table...");

    // Add customer info fields
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) AFTER customer_id,
      ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) AFTER customer_name,
      ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) AFTER customer_email
    `);
    console.log("✅ Added customer info fields");

    // Add delivery notes
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS delivery_notes TEXT AFTER delivery_address
    `);
    console.log("✅ Added delivery_notes field");

    // Add payment proof URL
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_proof_url VARCHAR(500) AFTER payment_method
    `);
    console.log("✅ Added payment_proof_url field");

    // Add admin notes
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS admin_notes TEXT AFTER total_amount
    `);
    console.log("✅ Added admin_notes field");

    // Add processed by admin fields
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS processed_by CHAR(36) AFTER admin_notes,
      ADD COLUMN IF NOT EXISTS processed_at DATETIME AFTER processed_by
    `);
    console.log("✅ Added processed_by and processed_at fields");

    // Add cancelled fields
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS cancelled_reason TEXT AFTER order_status,
      ADD COLUMN IF NOT EXISTS cancelled_by CHAR(36) AFTER cancelled_reason,
      ADD COLUMN IF NOT EXISTS cancelled_at DATETIME AFTER cancelled_by
    `);
    console.log("✅ Added cancellation fields");

    // Update order_status enum values
    await sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN order_status ENUM(
        'pending_payment',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'checkout',
        'out_for_delivery',
        'completed'
      ) NOT NULL
    `);
    console.log("✅ Updated order_status enum values");

    // Update payment_status enum values
    await sequelize.query(`
      ALTER TABLE orders 
      MODIFY COLUMN payment_status ENUM(
        'unpaid',
        'paid',
        'refunded',
        'pending',
        'failed'
      ) NOT NULL
    `);
    console.log("✅ Updated payment_status enum values");

    // Add indexes for faster queries
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id)
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status)
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)
    `);
    console.log("✅ Added indexes");

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

updateOrdersTable();
