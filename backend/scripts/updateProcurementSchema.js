const { sequelize } = require("../src/config/database");

async function updateProcurementSchema() {
  try {
    console.log("🔄 Starting procurement schema update...");

    // Add procurement_type column
    await sequelize.query(`
      ALTER TABLE procurements 
      ADD COLUMN IF NOT EXISTS procurement_type ENUM('online', 'offline') 
      NOT NULL DEFAULT 'online' 
      AFTER procurement_number
    `);
    console.log("✅ Added procurement_type column");

    // Make supplier_name nullable
    await sequelize.query(`
      ALTER TABLE procurements 
      MODIFY COLUMN supplier_name VARCHAR(150) NULL
    `);
    console.log("✅ Made supplier_name nullable");

    // Add soft delete columns
    await sequelize.query(`
      ALTER TABLE procurements 
      ADD COLUMN IF NOT EXISTS deleted_at DATETIME NULL
    `);
    console.log("✅ Added deleted_at column");

    await sequelize.query(`
      ALTER TABLE procurements 
      ADD COLUMN IF NOT EXISTS deleted_by CHAR(36) NULL
    `);
    console.log("✅ Added deleted_by column");

    // Add index on deleted_by for foreign key
    try {
      await sequelize.query(`
        CREATE INDEX idx_procurement_deleted_by ON procurements(deleted_by)
      `);
      console.log("✅ Added index for deleted_by");
    } catch (err) {
      if (err.message.includes('Duplicate key name')) {
        console.log("ℹ️  Index for deleted_by already exists");
      } else {
        console.warn("⚠️  Could not add index for deleted_by:", err.message);
      }
    }

    // Note: Foreign key constraint can be added later if needed
    console.log("ℹ️  Foreign key for deleted_by can be added manually if needed");

    console.log("✅ Procurement schema update completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating procurement schema:", error.message);
    console.error(error);
    process.exit(1);
  }
}

updateProcurementSchema();
