/**
 * Migration Script: Create Order Payment Tables
 * Membuat tabel untuk order history dengan payment VA details
 */

require("dotenv").config();
const { Sequelize } = require("sequelize");

// Setup database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: console.log,
  }
);

async function createTables() {
  try {
    console.log("🔄 Starting migration...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // 1. Create payment_details table (untuk Virtual Account)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS payment_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
          order_id CHAR(36) NOT NULL,
        payment_method ENUM('bank_transfer', 'cod', 'e_wallet') DEFAULT 'bank_transfer',
        bank_name ENUM('BRI', 'BCA', 'MANDIRI') DEFAULT NULL,
        virtual_account VARCHAR(50) DEFAULT NULL,
        account_name VARCHAR(100) DEFAULT 'BaleTani Fresh Market',
        payment_status ENUM('pending', 'paid', 'failed', 'expired') DEFAULT 'pending',
        amount DECIMAL(12,2) NOT NULL,
        paid_at DATETIME DEFAULT NULL,
        payment_proof VARCHAR(255) DEFAULT NULL,
        expired_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_order_id (order_id),
        INDEX idx_va (virtual_account),
        INDEX idx_payment_status (payment_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Table payment_details created");

    // Ensure column types are aligned with models (id UUID in orders)
    await sequelize.query(`
        ALTER TABLE payment_details 
        MODIFY COLUMN order_id CHAR(36) NOT NULL;
      `);
    console.log("✅ Ensured payment_details.order_id uses CHAR(36)");

    // 2. Update orders table (tambah field jika belum ada)
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS order_type ENUM('online', 'offline') DEFAULT 'online' AFTER order_number,
      ADD COLUMN IF NOT EXISTS shipping_method ENUM('delivery', 'pickup') DEFAULT 'delivery' AFTER total_amount,
      ADD COLUMN IF NOT EXISTS shipping_address TEXT AFTER shipping_method,
      ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0 AFTER shipping_address,
      ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0 AFTER shipping_cost,
      ADD COLUMN IF NOT EXISTS service_fee DECIMAL(10,2) DEFAULT 2000 AFTER discount_amount,
      ADD COLUMN IF NOT EXISTS customer_notes TEXT AFTER service_fee,
      ADD COLUMN IF NOT EXISTS admin_notes TEXT AFTER customer_notes,
      ADD COLUMN IF NOT EXISTS cancelled_reason TEXT AFTER admin_notes,
      ADD COLUMN IF NOT EXISTS cancelled_at DATETIME DEFAULT NULL AFTER cancelled_reason,
      ADD COLUMN IF NOT EXISTS completed_at DATETIME DEFAULT NULL AFTER cancelled_at;
    `);
    console.log("✅ Table orders updated with new fields");

    // 3. Create order_status_history table (jika belum ada)
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        old_status VARCHAR(50) DEFAULT NULL,
        new_status VARCHAR(50) NOT NULL,
        changed_by INT DEFAULT NULL COMMENT 'Admin ID yang mengubah',
        notes TEXT DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_id (order_id),
        INDEX idx_new_status (new_status),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Table order_status_history created");

    // 4. Update order_items table
    await sequelize.query(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS product_image VARCHAR(255) AFTER subtotal,
      ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'pcs' AFTER product_image;
    `);
    console.log("✅ Table order_items updated");

    // 5. Create indexes for better performance (using correct column name: order_status)
    await sequelize.query(`
      ALTER TABLE orders
      ADD INDEX IF NOT EXISTS idx_customer_status (customer_id, order_status),
      ADD INDEX IF NOT EXISTS idx_order_date (created_at),
      ADD INDEX IF NOT EXISTS idx_order_status (order_status);
    `);
    console.log("✅ Indexes created on orders table");

    console.log("");
    console.log("✅✅✅ Migration completed successfully! ✅✅✅");
    console.log("");
    console.log("📋 Summary:");
    console.log("   - payment_details table created");
    console.log("   - orders table updated with new fields");
    console.log("   - order_status_history table created");
    console.log("   - order_items table updated");
    console.log("   - Performance indexes added");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run migration
createTables();
