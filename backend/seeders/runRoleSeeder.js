#!/usr/bin/env node

// Import database connection
require("../src/config/database");
const { seedRolesAndAdmin } = require("./roleSeeder");

// Run seeder
if (require.main === module) {
  seedRolesAndAdmin()
    .then(() => {
      console.log("🎉 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
