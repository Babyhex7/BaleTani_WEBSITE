/**
 * Script to add 'icon' field to product_categories table
 * This script adds icon column to support category icons using Heroicons
 */

const { sequelize } = require("../src/config/database");

async function addIconField() {
  try {
    console.log("🔧 Adding 'icon' field to product_categories table...");

    // Add icon column if it doesn't exist
    await sequelize.query(`
      ALTER TABLE product_categories 
      ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'CubeIcon' 
      COMMENT 'Heroicon name for category'
    `);

    console.log(
      "✅ Successfully added 'icon' field to product_categories table"
    );
  } catch (error) {
    console.error("❌ Error adding icon field:", error);
    throw error;
  }
}

// Run the migration
addIconField()
  .then(() => {
    console.log("🎉 Migration completed successfully");
    sequelize.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    sequelize.close();
    process.exit(1);
  });
