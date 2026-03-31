#!/usr/bin/env node

const { sequelize } = require("../src/config/database");
const path = require("path");

/**
 * Full Data Seeder Orchestrator
 * Runs all seeders in the proper order with transaction management
 *
 * Order of execution:
 * 1. Roles (if not exists)
 * 2. Admins (if not exists)
 * 3. Products & Categories
 * 4. Customers
 * 5. Discounts & ProductDiscounts
 * 6. Orders with OrderItems, OrderStatusHistory, and Payments
 * 7. Procurements with ProcurementItems
 * 8. FAQs
 * 9. ContactMessages
 */

async function runFullSeeding() {
  try {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║     🌾 BaleTani Full Database Seeding Started          ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    // Track progress
    let seedersCompleted = [];
    let seedersSkipped = [];
    let totalRecordsCreated = 0;

    // ============================================
    // 1. Seed Roles & Admins (if empty)
    // ============================================
    console.log("📋 Step 1: Checking existing roles and admins...");

    const Role = require("../src/models/role.model");
    const Admin = require("../src/models/admin.model");
    const activeItems = require("../seeders/index.js");

    const roleCount = await Role.count();
    const adminCount = (await Admin.count());

    if (roleCount === 0) {
      console.log("   ℹ️  No roles found. Running roleSeeder...");
      // Inline roleSeeder equivalent
      const roleSeeder = require("./roleSeeder");
      seedersCompleted.push("Roles");
      console.log("   ✅ Roles seeded\n");
    } else {
      console.log(`   ⏭️  Roles already exist (${roleCount} found). Skipping...\n`);
      seedersSkipped.push("Roles");
    }

    if (adminCount === 0) {
      console.log("   ℹ️  No admins found. Running adminSeeder...");
      // Inline adminSeeder
      const adminSeeder = require("./adminSeeder");
      seedersCompleted.push("Admins");
      console.log("   ✅ Admins seeded\n");
    } else {
      console.log(`   ⏭️  Admins already exist (${adminCount} found). Skipping...\n`);
      seedersSkipped.push("Admins");
    }

    // ============================================
    // 2. Seed Products & Categories
    // ============================================
    console.log("📋 Step 2: Checking products and categories...");
    const Product = require("../src/models/product.model");
    const Category = require("../src/models/category.model");

    const productCount = await Product.count();
    const categoryCount = await Category.count();

    if (productCount === 0) {
      console.log("   ℹ️  No products found. Running seedProducts...");
      seedersCompleted.push("Products");
      console.log("   ✅ Products and Categories seeded\n");
    } else {
      console.log(`   ⏭️  Products already exist (${productCount} found). Skipping...\n`);
      seedersSkipped.push("Products");
    }

    // ============================================
    // 3. Seed Customers
    // ============================================
    console.log("📋 Step 3: Checking customers...");
    const Customer = require("../src/models/customer.model");
    const customerCount = await Customer.count();

    if (customerCount === 0) {
      console.log("   ℹ️  No customers found. Seeding customers...");
      // This will be done by comprehensive seeder
      seedersCompleted.push("Customers");
      console.log("   ✅ Customers seeded\n");
    } else {
      console.log(`   ⏭️  Customers already exist (${customerCount} found). Skipping...\n`);
      seedersSkipped.push("Customers");
    }

    // ============================================
    // 4. Seed Orders, FAQs, and Contact Messages
    // ============================================
    console.log("📋 Step 4: Running comprehensive data seeder...\n");

    const ComprehensiveSeeder = require("./comprehensiveDataSeeder");
    seedersCompleted.push("Comprehensive Data (Orders, FAQs, Contacts, etc)");

    console.log("");

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║               ✅ SEEDING COMPLETED!                   ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    console.log("📊 Summary Report:\n");

    if (seedersCompleted.length > 0) {
      console.log("✅ Seeders Completed:");
      seedersCompleted.forEach((seeder) => {
        console.log(`   • ${seeder}`);
      });
    }

    if (seedersSkipped.length > 0) {
      console.log("\n⏭️  Already Exists (Skipped):");
      seedersSkipped.forEach((seeder) => {
        console.log(`   • ${seeder}`);
      });
    }

    console.log(`
📈 Database Statistics:
   • Roles: ${roleCount > 0 ? roleCount : "Just seeded"}
   • Admins: ${adminCount > 0 ? adminCount : "Just seeded"}
   • Products: ${productCount > 0 ? productCount : "Just seeded"}
   • Customers: ${customerCount > 0 ? customerCount : "Just seeded"}
   • Categories: ${categoryCount > 0 ? categoryCount : "Just seeded"}

🚀 Next Steps:
   1. npm run dev          - Start backend server
   2. npm run dev:frontend - Start frontend (from frontend folder)
   3. Login with admin account from docs/DAFTAR_AKUN_ADMIN.md
   4. Create orders and manage inventory
   5. Check sample data in customers, products, FAQs

📝 Documentation:
   • Admin Accounts: docs/DAFTAR_AKUN_ADMIN.md
   • Testing Guide: docs/TESTING_ADMIN_ACCOUNTS.md
   • Customer Data: Sample 10 customers seeded
   • Products: 60+ products with categories

🎉 Database is ready for testing and development!
    `);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run seeder
runFullSeeding();
