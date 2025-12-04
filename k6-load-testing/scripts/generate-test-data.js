// ==========================================================
// SCRIPT: GENERATE TEST DATA (Export dari Database ke JSON)
// ==========================================================
// Script ini mengekstrak data dari MySQL database dan export ke JSON
// untuk digunakan sebagai test data di K6
//
// CARA PAKAI:
// 1. Pastikan MySQL database 'baletani_db' sudah running
// 2. Install dependencies: npm install mysql2
// 3. Run: node scripts/generate-test-data.js

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Konfigurasi database (dari .env atau hardcoded)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'baletani_db',
};

/**
 * Main function untuk generate test data
 */
async function generateTestData() {
  console.log('🔄 Connecting to database...');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Database: ${dbConfig.database}\n`);
  
  let connection;
  
  try {
    // Connect ke database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected!\n');
    
    // 1. Export Test Customers (100 accounts)
    console.log('📦 Exporting test customers...');
    await exportCustomers(connection);
    
    // 2. Export Products (500 random products)
    console.log('📦 Exporting products...');
    await exportProducts(connection);
    
    // 3. Export Categories
    console.log('📦 Exporting categories...');
    await exportCategories(connection);
    
    console.log('\n🎉 Test data generation complete!');
    console.log(`\n📁 Files created in: ${path.join(__dirname, '../data/')}`);
    console.log('   ✅ customers.json');
    console.log('   ✅ products.json');
    console.log('   ✅ categories.json\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

/**
 * Export 100 test customer accounts
 * Phone: 6281000000001 - 6281000000100
 */
async function exportCustomers(connection) {
  try {
    const [customers] = await connection.query(`
      SELECT 
        id as customer_id, 
        phone_number, 
        full_name as name, 
        address
      FROM customers
      WHERE phone_number LIKE '628100000%'
      ORDER BY phone_number
      LIMIT 100
    `);
    
    if (customers.length === 0) {
      console.warn('⚠️  No test customers found!');
      console.log('   Run SQL script: scripts/create-test-customers.sql first\n');
      return;
    }
    
    // Add plaintext password untuk K6 testing
    const customersWithPassword = customers.map(c => ({
      ...c,
      password: 'test123' // Plaintext password
    }));
    
    // Write to JSON file
    const filePath = path.join(__dirname, '../data/customers.json');
    fs.writeFileSync(
      filePath,
      JSON.stringify(customersWithPassword, null, 2)
    );
    
    console.log(`   ✅ Exported ${customers.length} customers`);
    
  } catch (error) {
    console.error('   ❌ Failed to export customers:', error.message);
    throw error;
  }
}

/**
 * Export 500 random products dari database
 */
async function exportProducts(connection) {
  try {
    const [products] = await connection.query(`
      SELECT 
        id as product_id, 
        name as product_name, 
        selling_price as price, 
        total_stock as stock, 
        category_id,
        description
      FROM products
      WHERE is_active = 1
      ORDER BY RAND()
      LIMIT 500
    `);
    
    if (products.length === 0) {
      console.warn('   ⚠️  No products found in database!');
      return;
    }
    
    // Write to JSON file
    const filePath = path.join(__dirname, '../data/products.json');
    fs.writeFileSync(
      filePath,
      JSON.stringify(products, null, 2)
    );
    
    console.log(`   ✅ Exported ${products.length} products`);
    
  } catch (error) {
    console.error('   ❌ Failed to export products:', error.message);
    throw error;
  }
}

/**
 * Export semua categories yang active
 */
async function exportCategories(connection) {
  try {
    const [categories] = await connection.query(`
      SELECT 
        id as category_id, 
        category_name, 
        description
      FROM product_categories
      WHERE is_active = 1
      ORDER BY category_name
    `);
    
    if (categories.length === 0) {
      console.warn('   ⚠️  No categories found in database!');
      return;
    }
    
    // Write to JSON file
    const filePath = path.join(__dirname, '../data/categories.json');
    fs.writeFileSync(
      filePath,
      JSON.stringify(categories, null, 2)
    );
    
    console.log(`   ✅ Exported ${categories.length} categories`);
    
  } catch (error) {
    console.error('   ❌ Failed to export categories:', error.message);
    throw error;
  }
}

// Run the main function
if (require.main === module) {
  generateTestData();
}

module.exports = { generateTestData };
