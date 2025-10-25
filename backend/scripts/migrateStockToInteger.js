/**
 * Migration Script: Change total_stock from DECIMAL(10,2) to INT
 * Run this script to update the database schema
 */
const { sequelize } = require("../src/config/database");

async function migrateStockColumn() {
  try {
    console.log("🔄 Starting migration: total_stock DECIMAL → INTEGER");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Step 1: Round all existing decimal values to integers
    await sequelize.query(`
      UPDATE products 
      SET total_stock = ROUND(total_stock, 0)
      WHERE total_stock IS NOT NULL
    `);
    console.log("✅ Step 1: Rounded all decimal values to integers");

    // Step 2: Alter column type from DECIMAL to INT
    await sequelize.query(`
      ALTER TABLE products 
      MODIFY COLUMN total_stock INT DEFAULT 0
    `);
    console.log("✅ Step 2: Changed column type to INT");

    // Step 3: Verify the change
    const [result] = await sequelize.query(`
      SHOW COLUMNS FROM products WHERE Field = 'total_stock'
    `);
    console.log("✅ Step 3: Column verification:", result[0]);

    console.log("\n🎉 Migration completed successfully!");
    console.log("ℹ️  total_stock is now INTEGER (no decimals, Shopee-style)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateStockColumn();
