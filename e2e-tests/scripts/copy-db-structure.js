/**
 * Copy Database Structure
 * Script untuk copy struktur tabel dari database utama ke database test
 */

const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.test" });

async function copyDatabaseStructure() {
  let sourceConn, targetConn;

  try {
    console.log("🔄 Connecting to source database (baletani_db)...");

    sourceConn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 3306,
      database: "baletani_db",
      multipleStatements: true,
    });

    console.log("✅ Connected to source database");

    console.log("🔄 Connecting to target database (baletani_db_test)...");

    targetConn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || "baletani_db_test",
      multipleStatements: true,
    });

    console.log("✅ Connected to target database");

    // Get all tables from source
    const [tables] = await sourceConn.query("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);

    console.log(`\n📋 Found ${tableNames.length} tables to copy:`);
    tableNames.forEach((t) => console.log(`   - ${t}`));

    // Disable foreign key checks
    await targetConn.query("SET FOREIGN_KEY_CHECKS = 0");

    // Copy each table structure
    console.log("\n🔄 Copying table structures...");

    for (const tableName of tableNames) {
      try {
        // Drop table if exists
        await targetConn.query(`DROP TABLE IF EXISTS ${tableName}`);

        // Get CREATE TABLE statement
        const [createTableRows] = await sourceConn.query(
          `SHOW CREATE TABLE ${tableName}`
        );
        const createTableSQL = createTableRows[0]["Create Table"];

        // Create table in target database
        await targetConn.query(createTableSQL);

        console.log(`   ✅ ${tableName}`);
      } catch (error) {
        console.error(`   ❌ ${tableName}: ${error.message}`);
      }
    }

    // Re-enable foreign key checks
    await targetConn.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("\n✅ All table structures copied successfully!");

    // Verify
    const [testTables] = await targetConn.query("SHOW TABLES");
    console.log(`\n📊 Target database now has ${testTables.length} tables`);

    console.log("\n✅ Setup complete! Ready for testing.");
    console.log("\nRun tests with:");
    console.log("   npm run cy:open");
    console.log("   npm run cy:run:auth");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (sourceConn) await sourceConn.end();
    if (targetConn) await targetConn.end();
    console.log("\n🔌 Connections closed");
  }
}

copyDatabaseStructure();
