const { Sequelize } = require("sequelize");
require("dotenv").config();

async function addQuantityInfoField() {
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
      "🚀 Starting migration: Add quantity_info field for documentation...\n"
    );

    // Check if column exists
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'quantity_info'
    `);

    if (columns.length === 0) {
      console.log("✅ Adding column: quantity_info");
      await sequelize.query(`
        ALTER TABLE products
        ADD COLUMN quantity_info VARCHAR(100) DEFAULT NULL
        COMMENT 'Info jumlah per unit untuk dokumentasi (contoh: "65 kg per iket")'
        AFTER unit
      `);
      console.log("✅ Column quantity_info added successfully\n");
    } else {
      console.log("ℹ️  Column quantity_info already exists\n");
    }

    console.log("📊 Sample product data:");
    const [products] = await sequelize.query(`
      SELECT id, name, unit, quantity_info, total_stock, description
      FROM products
      LIMIT 5
    `);
    console.table(products);

    console.log("\n✅ Migration completed successfully!");
    console.log("\n💡 Usage:");
    console.log(
      '   - quantity_info: Info dokumentasi (contoh: "65 kg per iket", "100 gram per pack")'
    );
    console.log("   - Tampil di detail produk saja, tidak di tabel");
    console.log(
      '   - Tabel hanya tampilkan: total_stock + unit (contoh: "5 iket")'
    );

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    await sequelize.close();
    process.exit(1);
  }
}

addQuantityInfoField();
