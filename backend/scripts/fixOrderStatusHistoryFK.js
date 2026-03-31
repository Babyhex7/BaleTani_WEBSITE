/**
 * Fix OrderStatusHistory foreign key constraint
 * Alters the table to fix the foreign key reference
 */

const { sequelize } = require('../src/config/database');

const fixOrderStatusHistory = async () => {
  try {
    console.log("🔧 Fixing OrderStatusHistory foreign key...\n");
    
    // First, drop the faulty constraint
    try {
      await sequelize.query(`ALTER TABLE order_status_history DROP FOREIGN KEY order_status_history_ibfk_2;`);
      console.log("✅ Dropped old foreign key constraint");
    } catch (err) {
      console.log("⏭️  No existing constraint to drop");
    }
    
    // Add the correct foreign key
    await sequelize.query(`
      ALTER TABLE order_status_history 
      ADD CONSTRAINT order_status_history_ibfk_2 
      FOREIGN KEY (changed_by) REFERENCES users(id) 
      ON DELETE CASCADE 
      ON UPDATE CASCADE;
    `);
    console.log("✅ Added correct foreign key constraint");
    
    console.log("\n✨ OrderStatusHistory table fixed!");
    console.log("📝 Next step:\n   npm run seed:comprehensive\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

fixOrderStatusHistory();
