/**
 * Migration Script: Add procurement_type and soft delete fields to procurements table
 * 
 * This script will:
 * 1. Add procurement_type column (ENUM 'online', 'offline')
 * 2. Add deleted_at column for soft delete
 * 3. Add deleted_by column for tracking who deleted
 * 4. Set supplier_name to nullable (optional)
 */

const { sequelize } = require('../src/config/database');

async function runMigration() {
  console.log('🚀 Starting procurement table migration...\n');

  try {
    // Check if procurement_type column exists
    const [typeColumnExists] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'procurements'
        AND COLUMN_NAME = 'procurement_type';
    `);

    if (typeColumnExists[0].count === 0) {
      console.log('➕ Adding procurement_type column...');
      await sequelize.query(`
        ALTER TABLE procurements
        ADD COLUMN procurement_type ENUM('online', 'offline') NOT NULL DEFAULT 'online'
        AFTER procurement_number;
      `);
      console.log('✅ procurement_type column added\n');
    } else {
      console.log('ℹ️  procurement_type column already exists\n');
    }

    // Check if deleted_at column exists
    const [deletedAtExists] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'procurements'
        AND COLUMN_NAME = 'deleted_at';
    `);

    if (deletedAtExists[0].count === 0) {
      console.log('➕ Adding deleted_at column...');
      await sequelize.query(`
        ALTER TABLE procurements
        ADD COLUMN deleted_at DATETIME NULL
        AFTER updated_at;
      `);
      console.log('✅ deleted_at column added\n');
    } else {
      console.log('ℹ️  deleted_at column already exists\n');
    }

    // Check if deleted_by column exists
    const [deletedByExists] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'procurements'
        AND COLUMN_NAME = 'deleted_by';
    `);

    if (deletedByExists[0].count === 0) {
      console.log('➕ Adding deleted_by column...');
      await sequelize.query(`
        ALTER TABLE procurements
        ADD COLUMN deleted_by CHAR(36) NULL
        AFTER deleted_at;
      `);
      console.log('✅ deleted_by column added\n');
    } else {
      console.log('ℹ️  deleted_by column already exists\n');
    }

    // Make supplier_name nullable
    console.log('🔧 Updating supplier_name to nullable...');
    await sequelize.query(`
      ALTER TABLE procurements
      MODIFY COLUMN supplier_name VARCHAR(150) NULL;
    `);
    console.log('✅ supplier_name updated to nullable\n');

    // Add index for better performance
    console.log('📊 Adding indexes for performance...');
    
    try {
      await sequelize.query(`
        CREATE INDEX idx_procurement_type ON procurements(procurement_type);
      `);
      console.log('✅ Index on procurement_type created');
    } catch (err) {
      if (err.message.includes('Duplicate key name')) {
        console.log('ℹ️  Index on procurement_type already exists');
      } else {
        throw err;
      }
    }

    try {
      await sequelize.query(`
        CREATE INDEX idx_deleted_at ON procurements(deleted_at);
      `);
      console.log('✅ Index on deleted_at created');
    } catch (err) {
      if (err.message.includes('Duplicate key name')) {
        console.log('ℹ️  Index on deleted_at already exists');
      } else {
        throw err;
      }
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('\n📝 Summary of changes:');
    console.log('   - procurement_type: ENUM(\'online\', \'offline\') NOT NULL DEFAULT \'online\'');
    console.log('   - deleted_at: DATETIME NULL');
    console.log('   - deleted_by: CHAR(36) NULL');
    console.log('   - supplier_name: VARCHAR(150) NULL (made optional)');
    console.log('   - Added indexes for performance');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
runMigration();
