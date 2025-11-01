/**
 * Migration Script: Update order_items table
 * Run: node backend/scripts/updateOrderItemsTable.js
 */

// Load environment variables
require("dotenv").config();

const { sequelize } = require("../src/config/database");

async function updateOrderItemsTable() {
  try {
    console.log("🔄 Starting migration: Update order_items table...");

    // Add product_name field (untuk snapshot nama produk saat order dibuat)
    await sequelize.query(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS product_name VARCHAR(255) AFTER product_id
    `);
    console.log("✅ Added product_name field");

    // Rename price_per_unit to original_price for clarity
    // Check if column exists first
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM order_items LIKE 'original_price'
    `);

    if (columns.length === 0) {
      await sequelize.query(`
        ALTER TABLE order_items 
        CHANGE COLUMN price_per_unit original_price DECIMAL(12, 2) NOT NULL
        COMMENT 'Harga asli produk per unit'
      `);
      console.log("✅ Renamed price_per_unit to original_price");
    } else {
      console.log("ℹ️  original_price column already exists");
    }

    // Rename discount_per_unit to discount_price
    const [discountColumns] = await sequelize.query(`
      SHOW COLUMNS FROM order_items LIKE 'discount_price'
    `);

    if (discountColumns.length === 0) {
      await sequelize.query(`
        ALTER TABLE order_items 
        CHANGE COLUMN discount_per_unit discount_price DECIMAL(12, 2) DEFAULT 0
        COMMENT 'Harga setelah diskon per unit (jika ada diskon)'
      `);
      console.log("✅ Renamed discount_per_unit to discount_price");
    } else {
      console.log("ℹ️  discount_price column already exists");
    }

    // Add final_price field (harga akhir yang dibayar per unit)
    await sequelize.query(`
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS final_price DECIMAL(12, 2) NOT NULL DEFAULT 0 AFTER discount_price
    `);
    console.log("✅ Added final_price field");

    // Update subtotal comment
    await sequelize.query(`
      ALTER TABLE order_items 
      MODIFY COLUMN subtotal DECIMAL(15, 2) NOT NULL
    `);
    console.log("✅ Updated subtotal field");

    // Add index
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)
    `);
    console.log("✅ Added indexes");

    console.log("✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

updateOrderItemsTable();
