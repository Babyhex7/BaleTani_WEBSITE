// =================================================================
// SCRIPT: SEED TEST ACCOUNTS (Buat 100 Customer Test Accounts)
// =================================================================
// Script ini membuat 100 test customer accounts di database
// dengan proper bcrypt password hashing
//
// Phone: 6281000000001 - 6281000000100
// Password: test123 (hashed dengan bcrypt)
//
// CARA PAKAI:
// 1. Install dependencies: npm install mysql2 bcryptjs uuid
// 2. Pastikan MySQL running
// 3. Run: node scripts/seed-test-accounts.js

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Konfigurasi database
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "baletani_db",
};

// Konfigurasi test accounts
const TEST_CONFIG = {
  totalAccounts: 100,
  phonePrefix: "628100000", // 6281000000001 - 6281000000100
  password: "test123",
  bcryptRounds: 10,
};

/**
 * Main function untuk seed test accounts
 */
async function seedTestAccounts() {
  console.log("🚀 Starting test accounts seeding...\n");
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Total Accounts: ${TEST_CONFIG.totalAccounts}`);
  console.log(`   Password: ${TEST_CONFIG.password}\n`);

  let connection;

  try {
    // Connect ke database
    console.log("🔄 Connecting to database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Database connected!\n");

    // Hash password sekali saja (untuk semua accounts)
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(
      TEST_CONFIG.password,
      TEST_CONFIG.bcryptRounds
    );
    console.log(`   Hash: ${hashedPassword.substring(0, 30)}...\n`);

    // Create accounts
    console.log("📝 Creating test accounts...");
    let successCount = 0;
    let skipCount = 0;

    for (let i = 1; i <= TEST_CONFIG.totalAccounts; i++) {
      try {
        // Generate phone number dengan padding (0001, 0002, dst)
        const phoneNumber =
          TEST_CONFIG.phonePrefix + String(i).padStart(4, "0");
        const customerId = uuidv4();
        const fullName = `Test Customer ${i}`;
        const address = `Jl. Test No. ${i}, Jakarta Selatan`;

        // Insert customer
        await connection.query(
          `
          INSERT INTO customers (
            id,
            phone_number,
            password_hash,
            full_name,
            address,
            is_active,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
          [
            customerId,
            phoneNumber,
            hashedPassword,
            fullName,
            address,
            1, // is_active = true
          ]
        );

        successCount++;

        // Progress indicator setiap 10 accounts
        if (i % 10 === 0) {
          process.stdout.write(
            `   Progress: ${i}/${TEST_CONFIG.totalAccounts}\r`
          );
        }
      } catch (error) {
        // Skip jika phone sudah ada (duplicate key error)
        if (error.code === "ER_DUP_ENTRY") {
          skipCount++;
        } else {
          throw error;
        }
      }
    }

    console.log(`\n\n✅ Seeding complete!`);
    console.log(`   Created: ${successCount} accounts`);
    console.log(`   Skipped: ${skipCount} accounts (already exist)\n`);

    // Verify hasil
    console.log("🔍 Verifying results...");
    const [results] = await connection.query(`
      SELECT COUNT(*) as total
      FROM customers
      WHERE phone_number LIKE '628100000%'
    `);

    console.log(`   Total test customers in DB: ${results[0].total}\n`);

    // Show sample customers
    console.log("📋 Sample customers (first 5):");
    const [samples] = await connection.query(`
      SELECT 
        phone_number,
        full_name,
        address,
        created_at
      FROM customers
      WHERE phone_number LIKE '628100000%'
      ORDER BY phone_number
      LIMIT 5
    `);

    console.table(samples);

    console.log("🎉 Done! You can now use these accounts for K6 load testing.");
    console.log(
      `\n💡 Next step: Run 'node scripts/generate-test-data.js' to export to JSON\n`
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("   Stack:", error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed.");
    }
  }
}

/**
 * Cleanup function - hapus semua test accounts
 * HATI-HATI: Ini akan delete 100 test customers!
 */
async function cleanupTestAccounts() {
  console.log("🗑️  Cleaning up test accounts...\n");

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.query(`
      DELETE FROM customers
      WHERE phone_number LIKE '628100000%'
    `);

    console.log(`✅ Deleted ${result.affectedRows} test accounts\n`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run based on command line argument
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--cleanup")) {
    // Run cleanup
    console.log("⚠️  WARNING: This will delete all test accounts!");
    console.log("   Press Ctrl+C to cancel, or wait 3 seconds...\n");

    setTimeout(() => {
      cleanupTestAccounts();
    }, 3000);
  } else {
    // Run seeding
    seedTestAccounts();
  }
}

module.exports = { seedTestAccounts, cleanupTestAccounts };
