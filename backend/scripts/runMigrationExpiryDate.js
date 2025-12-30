const { sequelize } = require("../src/config/database");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    console.log("🔄 Running migration: make_expiry_date_nullable.sql");

    const migrationPath = path.join(
      __dirname,
      "..",
      "migrations",
      "make_expiry_date_nullable.sql"
    );

    const sql = fs.readFileSync(migrationPath, "utf8");

    // Execute the migration
    await sequelize.query(sql);

    console.log("✅ Migration completed successfully!");
    console.log("   - expiry_date column in procurement_items is now nullable");

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
