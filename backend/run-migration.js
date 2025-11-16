/**
 * AUTO MIGRATION SCRIPT
 * Jalankan migration database otomatis tanpa manual
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runMigration = async () => {
  let connection;
  
  try {
    console.log('\n========================================');
    console.log('  🚀 AUTO MIGRATION - PAYMENT EXPIRY');
    console.log('========================================\n');

    // Baca SQL migration
    const migrationPath = path.join(__dirname, 'migrations', 'add_payment_expiry_fields.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Migration file:', migrationPath);
    console.log('');

    // Connect ke database
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'baletani_db',
      multipleStatements: true
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);
    console.log('');

    // STEP 1: Add column first
    console.log('🔄 Step 1: Adding column payment_expired_at...\n');
    try {
      await connection.query(`
        ALTER TABLE orders
        ADD COLUMN payment_expired_at DATETIME DEFAULT NULL
        COMMENT 'Waktu expired untuk pembayaran (10 menit dari created_at)'
      `);
      console.log('   ✅ Column payment_expired_at added successfully\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('   ⚠️  Column already exists, skipping\n');
      } else {
        throw error;
      }
    }

    // STEP 2: Add index
    console.log('🔄 Step 2: Creating index idx_order_payment_expired...\n');
    try {
      await connection.query(`
        CREATE INDEX idx_order_payment_expired 
        ON orders(order_status, payment_expired_at)
      `);
      console.log('   ✅ Index idx_order_payment_expired created successfully\n');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('   ⚠️  Index already exists, skipping\n');
      } else {
        throw error;
      }
    }

    console.log('');
    console.log('🔍 Verifying migration...');
    
    // Verify column exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM orders LIKE 'payment_expired_at'"
    );
    
    if (columns.length > 0) {
      console.log('   ✅ Column payment_expired_at exists');
    } else {
      throw new Error('Column payment_expired_at not found!');
    }

    // Verify index exists
    const [indexes] = await connection.query(
      "SHOW INDEX FROM orders WHERE Key_name = 'idx_order_payment_expired'"
    );
    
    if (indexes.length > 0) {
      console.log('   ✅ Index idx_order_payment_expired exists');
    } else {
      console.log('   ⚠️  Index not created (might already exist)');
    }

    console.log('');
    console.log('========================================');
    console.log('  ✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('========================================');
    console.log('');
    console.log('🚀 Next step: Start server with "npm start"');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ MIGRATION FAILED:', error.message);
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run migration
runMigration();
