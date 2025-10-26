/**
 * Migration Script: Add quantity_per_unit and unit_type to products table
 *
 * This script adds:
 * - quantity_per_unit: Jumlah per satuan (contoh: 65 untuk "65 kg per pack")
 * - unit_type: Tipe kemasan (pack, box, karton, unit, dll)
 *
 * Example:
 * - Pupuk Urea: quantity_per_unit=65, unit="kg", unit_type="pack", total_stock=5
 *   Artinya: Ada 5 pack, setiap pack berisi 65 kg
 */

const { sequelize } = require("../src/config/database");

async function addProductQuantityFields() {
  try {
    console.log(
      "🚀 Starting migration: Add quantity_per_unit and unit_type fields...\n"
    );

    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME IN ('quantity_per_unit', 'unit_type')
    `);

    const existingColumns = results.map((row) => row.COLUMN_NAME);

    // Add quantity_per_unit if not exists
    if (!existingColumns.includes("quantity_per_unit")) {
      console.log("✅ Adding column: quantity_per_unit");
      await sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN quantity_per_unit INT NOT NULL DEFAULT 1 
        COMMENT 'Jumlah per satuan (contoh: 65 untuk 65kg per pack)'
        AFTER selling_price
      `);
      console.log("✅ Column quantity_per_unit added successfully\n");
    } else {
      console.log("ℹ️  Column quantity_per_unit already exists\n");
    }

    // Add unit_type if not exists
    if (!existingColumns.includes("unit_type")) {
      console.log("✅ Adding column: unit_type");
      await sequelize.query(`
        ALTER TABLE products 
        ADD COLUMN unit_type VARCHAR(20) DEFAULT 'unit' 
        COMMENT 'Tipe kemasan (pack, box, karton, unit, dll)'
        AFTER unit
      `);
      console.log("✅ Column unit_type added successfully\n");
    } else {
      console.log("ℹ️  Column unit_type already exists\n");
    }

    // Update existing products to have default values
    console.log("📝 Updating existing products with default values...");
    await sequelize.query(`
      UPDATE products 
      SET quantity_per_unit = 1, unit_type = 'unit' 
      WHERE quantity_per_unit IS NULL OR unit_type IS NULL
    `);
    console.log("✅ Existing products updated\n");

    // Show sample data
    console.log("📊 Sample product data:");
    const [products] = await sequelize.query(`
      SELECT id, name, quantity_per_unit, unit, unit_type, total_stock 
      FROM products 
      LIMIT 5
    `);
    console.table(products);

    console.log("\n✅ Migration completed successfully!");
    console.log("\n💡 Usage Examples:");
    console.log(
      '   - Pupuk Urea: quantity_per_unit=65, unit="kg", unit_type="pack", total_stock=5'
    );
    console.log("     Artinya: Ada 5 pack tersedia, setiap pack berisi 65 kg");
    console.log(
      '   - Bibit Padi: quantity_per_unit=100, unit="pcs", unit_type="box", total_stock=10'
    );
    console.log(
      "     Artinya: Ada 10 box tersedia, setiap box berisi 100 pcs\n"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
addProductQuantityFields();
