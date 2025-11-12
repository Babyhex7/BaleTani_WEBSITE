/**
 * Test script untuk verify adminDiscount.controller.js imports
 */

try {
  const controller = require("./src/controllers/adminDiscount.controller.js");
  console.log("✅ SUCCESS: adminDiscount.controller.js loaded successfully!");
  console.log("✅ Cache service imported correctly");
  console.log("📋 Available functions:", Object.keys(controller).join(", "));
  process.exit(0);
} catch (error) {
  console.error("❌ ERROR loading adminDiscount.controller.js:");
  console.error(error.message);
  console.error("\nStack trace:");
  console.error(error.stack);
  process.exit(1);
}
