const { sequelize } = require("./src/config/database");

async function checkDatabase() {
  try {
    // Try to show all databases
    const [results] = await sequelize.query('SHOW DATABASES');
    console.log("📋 Available databases:");
    results.forEach(db => {
      console.log(`- ${Object.values(db)[0]}`);
    });

    // Check if our database exists
    const dbExists = results.some(db => Object.values(db)[0] === process.env.DB_NAME);
    
    if (dbExists) {
      console.log(`✅ Database '${process.env.DB_NAME}' exists!`);
      
      // Show tables in our database
      await sequelize.query(`USE ${process.env.DB_NAME}`);
      const [tables] = await sequelize.query('SHOW TABLES');
      
      if (tables.length > 0) {
        console.log(`📊 Tables in '${process.env.DB_NAME}':`);
        tables.forEach(table => {
          console.log(`- ${Object.values(table)[0]}`);
        });
      } else {
        console.log(`⚠️  Database '${process.env.DB_NAME}' exists but has no tables`);
      }
    } else {
      console.log(`❌ Database '${process.env.DB_NAME}' does not exist`);
    }
    
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();