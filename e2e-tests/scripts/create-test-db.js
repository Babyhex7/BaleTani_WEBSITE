/**
 * Create Test Database
 * Script untuk membuat database test
 */

const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.test" });

async function createTestDatabase() {
  let connection;

  try {
    console.log("🔄 Connecting to MySQL...");

    // Connect tanpa specify database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 3306,
    });

    console.log("✅ Connected to MySQL");

    // Create test database
    const dbName = process.env.DB_NAME || "baletani_db_test";
    console.log(`🔄 Creating database: ${dbName}...`);

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );

    console.log(`✅ Database '${dbName}' created successfully`);

    // Show databases
    const [databases] = await connection.query(
      `SHOW DATABASES LIKE 'baletani_db%'`
    );

    console.log("\n📊 Available BaleTani databases:");
    databases.forEach((db) => {
      const dbName = Object.values(db)[0];
      console.log(`   - ${dbName}`);
    });

    console.log("\n✅ Setup complete!");
    console.log("\nNext steps:");
    console.log("1. Copy structure from main database:");
    console.log("   mysqldump -u root --no-data baletani_db > schema.sql");
    console.log("   mysql -u root baletani_db_test < schema.sql");
    console.log("\n2. Or run Cypress tests (will auto-seed):");
    console.log("   npm run cy:open");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 MySQL connection closed");
    }
  }
}

createTestDatabase();
