const { sequelize } = require('./src/config/database');

(async () => {
  try {
    const result = await sequelize.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'baletani_db' AND TABLE_NAME IN ('admins', 'users')");
    console.log('Tables:', result[0].map(r => r.TABLE_NAME));
    
    // Also check if admins table has constraint
    const constraints = await sequelize.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'baletani_db' AND TABLE_NAME = 'order_status_history'
    `);
    console.log('\nConstraints on order_status_history:', constraints[0]);
  } catch (err) {
    console.error('Error:', err.message);
  }
  finally {
    process.exit(0);
  }
})();
