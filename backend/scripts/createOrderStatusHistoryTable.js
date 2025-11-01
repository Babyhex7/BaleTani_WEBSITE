/**
 * Migration Script: Create order_status_history table
 * Run: node backend/scripts/createOrderStatusHistoryTable.js
 */

// Load environment variables
require("dotenv").config();

const { sequelize } = require("../src/config/database");

async function createOrderStatusHistoryTable() {
  try {
    console.log("🔄 Starting migration: Create order_status_history table...");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id CHAR(36) PRIMARY KEY,
        order_id CHAR(36) NOT NULL,
        old_status VARCHAR(50) NULL,
        new_status VARCHAR(50) NOT NULL,
        notes TEXT NULL,
        changed_by CHAR(36) NOT NULL,
        changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_status_history_order_id (order_id),
        INDEX idx_order_status_history_changed_at (changed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Created order_status_history table");

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

createOrderStatusHistoryTable();
