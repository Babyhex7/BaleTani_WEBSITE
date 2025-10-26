const { Sequelize } = require("sequelize");
require("dotenv").config();

async function removeProductQuantityFields() {
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

  try {
    console.log(
      "🚀 Starting rollback: Remove quantity_per_unit and unit_type fields...\n"
    );

    // Check if columns exist
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME IN ('quantity_per_unit', 'unit_type')
    `);

    const existingColumns = columns.map((col) => col.COLUMN_NAME);

    // Remove quantity_per_unit if exists
    if (existingColumns.includes("quantity_per_unit")) {
      console.log("🗑️  Removing column: quantity_per_unit");
      await sequelize.query(`
        ALTER TABLE products
        DROP COLUMN quantity_per_unit
      `);
      console.log("✅ Column quantity_per_unit removed successfully\n");
    } else {
      console.log(
        "ℹ️  Column quantity_per_unit does not exist (already removed)\n"
      );
    }

    // Remove unit_type if exists
    if (existingColumns.includes("unit_type")) {
      console.log("🗑️  Removing column: unit_type");
      await sequelize.query(`
        ALTER TABLE products
        DROP COLUMN unit_type
      `);
      console.log("✅ Column unit_type removed successfully\n");
    } else {
      console.log("ℹ️  Column unit_type does not exist (already removed)\n");
    }

    console.log("📊 Sample product data after rollback:");
    const [products] = await sequelize.query(`
      SELECT id, name, unit, total_stock, description
      FROM products
      LIMIT 5
    `);
    console.table(products);

    console.log("\n✅ Rollback completed successfully!");
    console.log("\n💡 Product structure now:");
    console.log('   - name: Nama produk (contoh: "Bayam 7 iket")');
    console.log('   - unit: Satuan (contoh: "iket", "pcs", "kg")');
    console.log("   - total_stock: Jumlah unit tersedia (contoh: 5)");
    console.log("   - description: Deskripsi opsional");

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during rollback:", error);
    await sequelize.close();
    process.exit(1);
  }
}

removeProductQuantityFields();
