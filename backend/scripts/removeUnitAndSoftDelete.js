/**
 * Migration Script: Remove unit field and soft delete columns
 *
 * Changes:
 * 1. Drop `unit` column from order_items table
 * 2. Drop soft delete columns (deleted_at, deleted_by, delete_reason) from all tables
 * 3. Update to use hard delete instead
 */

const { sequelize } = require("../src/config/database");

async function removeUnitAndSoftDelete() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log("🔄 Starting migration to remove unit and soft delete...\n");

    // 1. Drop unit column from order_items
    console.log("📋 Step 1: Dropping 'unit' column from order_items...");
    try {
      await queryInterface.describeTable("order_items");
      const columns = await queryInterface.describeTable("order_items");

      if (columns.unit) {
        await sequelize.query(`
          ALTER TABLE order_items
          DROP COLUMN unit;
        `);
        console.log("✅ Column 'unit' dropped from order_items\n");
      } else {
        console.log("⚠️  Column 'unit' already doesn't exist in order_items\n");
      }
    } catch (error) {
      console.log(`⚠️  Error dropping unit: ${error.message}\n`);
    }

    // 2. Drop soft delete columns from products
    console.log(
      "📋 Step 2: Dropping soft delete columns and unit from products..."
    );
    try {
      // Drop foreign key constraint first
      try {
        await sequelize.query(
          `ALTER TABLE products DROP FOREIGN KEY fk_products_deleted_by;`
        );
        console.log("  ✅ Dropped foreign key fk_products_deleted_by");
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`  ⚠️  FK drop: ${e.message}`);
        }
      }

      // Drop index
      try {
        await sequelize.query(
          `ALTER TABLE products DROP INDEX idx_deleted_by;`
        );
        console.log("  ✅ Dropped index idx_deleted_by");
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`  ⚠️  Index drop: ${e.message}`);
        }
      }

      const productColumns = await queryInterface.describeTable("products");

      // Drop deleted_by column
      if (productColumns.deleted_by) {
        await sequelize.query(`ALTER TABLE products DROP COLUMN deleted_by;`);
        console.log("  ✅ Dropped deleted_by from products");
      }

      // Drop deleted_at column if exists
      if (productColumns.deleted_at) {
        await sequelize.query(`ALTER TABLE products DROP COLUMN deleted_at;`);
        console.log("  ✅ Dropped deleted_at from products");
      }

      // Drop delete_reason column if exists
      if (productColumns.delete_reason) {
        await sequelize.query(
          `ALTER TABLE products DROP COLUMN delete_reason;`
        );
        console.log("  ✅ Dropped delete_reason from products");
      }

      // Drop unit column
      if (productColumns.unit) {
        await sequelize.query(`ALTER TABLE products DROP COLUMN unit;`);
        console.log("  ✅ Dropped unit from products");
      }

      console.log("");
    } catch (error) {
      console.log(`⚠️  Error with products: ${error.message}\n`);
    }

    // 3. Drop soft delete columns from product_categories
    console.log(
      "📋 Step 3: Dropping soft delete columns from product_categories..."
    );
    try {
      // Drop indexes and foreign keys first
      try {
        await sequelize.query(
          `ALTER TABLE product_categories DROP INDEX IF EXISTS idx_deleted_by;`
        );
        await sequelize.query(
          `ALTER TABLE product_categories DROP FOREIGN KEY IF EXISTS fk_categories_deleted_by;`
        );
      } catch (e) {
        console.log(`  ⚠️  Constraint drop: ${e.message}`);
      }

      const categoryColumns = await queryInterface.describeTable(
        "product_categories"
      );

      if (categoryColumns.deleted_at) {
        await sequelize.query(
          `ALTER TABLE product_categories DROP COLUMN deleted_at;`
        );
        console.log("  ✅ Dropped deleted_at from product_categories");
      }
      if (categoryColumns.deleted_by) {
        await sequelize.query(
          `ALTER TABLE product_categories DROP COLUMN deleted_by;`
        );
        console.log("  ✅ Dropped deleted_by from product_categories");
      }
      if (categoryColumns.delete_reason) {
        await sequelize.query(
          `ALTER TABLE product_categories DROP COLUMN delete_reason;`
        );
        console.log("  ✅ Dropped delete_reason from product_categories");
      }
      console.log("");
    } catch (error) {
      console.log(`⚠️  Error with product_categories: ${error.message}\n`);
    }

    // 4. Drop soft delete columns from discounts
    console.log("📋 Step 4: Dropping soft delete columns from discounts...");
    try {
      // Drop indexes and foreign keys first
      try {
        await sequelize.query(
          `ALTER TABLE discounts DROP INDEX IF EXISTS idx_deleted_by;`
        );
        await sequelize.query(
          `ALTER TABLE discounts DROP FOREIGN KEY IF EXISTS fk_discounts_deleted_by;`
        );
      } catch (e) {
        console.log(`  ⚠️  Constraint drop: ${e.message}`);
      }

      const discountColumns = await queryInterface.describeTable("discounts");

      if (discountColumns.deleted_at) {
        await sequelize.query(`ALTER TABLE discounts DROP COLUMN deleted_at;`);
        console.log("  ✅ Dropped deleted_at from discounts");
      }
      if (discountColumns.deleted_by) {
        await sequelize.query(`ALTER TABLE discounts DROP COLUMN deleted_by;`);
        console.log("  ✅ Dropped deleted_by from discounts");
      }
      if (discountColumns.delete_reason) {
        await sequelize.query(
          `ALTER TABLE discounts DROP COLUMN delete_reason;`
        );
        console.log("  ✅ Dropped delete_reason from discounts");
      }
      console.log("");
    } catch (error) {
      console.log(`⚠️  Error with discounts: ${error.message}\n`);
    }

    // 5. Drop soft_delete_logs table if exists
    console.log("📋 Step 5: Dropping soft_delete_logs table...");
    try {
      await sequelize.query(`DROP TABLE IF EXISTS soft_delete_logs;`);
      console.log("✅ Table soft_delete_logs dropped\n");
    } catch (error) {
      console.log(`⚠️  Error dropping soft_delete_logs: ${error.message}\n`);
    }

    console.log("✅ Migration completed successfully!");
    console.log("\n📝 Summary:");
    console.log("  - Removed 'unit' column from order_items");
    console.log(
      "  - Removed soft delete columns from products, product_categories, discounts"
    );
    console.log("  - Dropped soft_delete_logs table");
    console.log(
      "  - All tables now use hard delete (DELETE instead of UPDATE deleted_at)"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
removeUnitAndSoftDelete()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  });
