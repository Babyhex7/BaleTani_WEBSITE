#!/usr/bin/env node

/**
 * ============================================================
 * VERIFICATION SCRIPT - Critical Fixes
 * ============================================================
 *
 * Script ini untuk verifikasi bahwa semua critical fixes
 * sudah diterapkan dengan benar.
 *
 * CARA JALANKAN:
 * node backend/verify_fixes.js
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Verifying Critical Fixes...\n");

let passed = 0;
let failed = 0;

// Helper function
function checkFileContains(filePath, searchString, description) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes(searchString)) {
      console.log(`✅ ${description}`);
      passed++;
      return true;
    } else {
      console.log(`❌ ${description}`);
      failed++;
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - File not found`);
    failed++;
    return false;
  }
}

console.log("📋 Checking JWT Consistency Fix...");
checkFileContains(
  "src/middlewares/auth.middleware.js",
  "decoded.userId",
  "Auth middleware uses decoded.userId"
);
checkFileContains(
  "src/controllers/customerAuth.controller.js",
  "userId: customer.id",
  "Customer auth generates token with userId"
);

console.log("\n📋 Checking Race Condition Fix...");
checkFileContains(
  "src/controllers/customerOrder.controller.js",
  "lock: transaction.LOCK.UPDATE",
  "Order creation uses pessimistic locking"
);

console.log("\n📋 Checking Database Indexes...");
checkFileContains(
  "src/models/product.model.js",
  "idx_product_category_active",
  "Product model has indexes"
);
checkFileContains(
  "src/models/order.model.js",
  "idx_order_customer",
  "Order model has indexes"
);
checkFileContains(
  "src/models/cart.model.js",
  "idx_cart_customer",
  "Cart model has indexes"
);
checkFileContains(
  "src/models/orderItem.model.js",
  "idx_order_item_order",
  "OrderItem model has indexes"
);

console.log("\n📋 Checking Soft Delete Configuration...");
checkFileContains(
  "src/models/order.model.js",
  "paranoid: true",
  "Order model has paranoid mode enabled"
);

console.log("\n📋 Checking CSRF Protection...");
checkFileContains("src/app.js", "csrf-csrf", "CSRF package imported");
checkFileContains("src/app.js", "doubleCsrf", "CSRF middleware configured");
checkFileContains(
  "src/app.js",
  "/api/csrf-token",
  "CSRF token endpoint exists"
);

console.log("\n📋 Checking Migration File...");
const migrationExists = fs.existsSync("database_indexes_migration.sql");
if (migrationExists) {
  console.log("✅ Database migration file exists");
  passed++;
} else {
  console.log("❌ Database migration file missing");
  failed++;
}

// Summary
console.log("\n" + "=".repeat(50));
console.log("📊 VERIFICATION SUMMARY");
console.log("=".repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log("=".repeat(50));

if (failed === 0) {
  console.log("\n🎉 ALL FIXES VERIFIED SUCCESSFULLY!\n");
  console.log("Next steps:");
  console.log(
    "1. Apply database migration (run database_indexes_migration.sql)"
  );
  console.log("2. Update frontend untuk include CSRF token");
  console.log("3. Test customer login/register (JWT payload changed)");
  console.log("4. Test order creation (race condition fixed)");
  process.exit(0);
} else {
  console.log("\n⚠️  SOME FIXES ARE MISSING!\n");
  console.log("Please check the failed items above.");
  process.exit(1);
}
