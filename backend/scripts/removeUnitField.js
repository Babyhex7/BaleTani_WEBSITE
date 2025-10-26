const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log,
  }
);

async function removeUnitField() {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi database berhasil");

    // Hapus kolom unit dari tabel products
    await sequelize.query(`
      ALTER TABLE products 
      DROP COLUMN unit
    `);

    console.log("✅ Kolom unit berhasil dihapus dari tabel products");

    // Tampilkan sample data
    const [results] = await sequelize.query(`
      SELECT id, name, quantity_info, total_stock 
      FROM products 
      LIMIT 5
    `);

    console.log("\n📊 Sample data setelah penghapusan unit:");
    console.table(results);

    await sequelize.close();
    console.log("\n✅ Selesai!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

removeUnitField();
