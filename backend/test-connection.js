const { sequelize, testConnection } = require("./src/config/database");

console.log("🔍 Testing database connection...");
console.log("Database config:");
console.log(`- Host: ${process.env.DB_HOST}`);
console.log(`- Port: ${process.env.DB_PORT}`);
console.log(`- Database: ${process.env.DB_NAME}`);
console.log(`- User: ${process.env.DB_USER}`);
console.log(`- Password: ${process.env.DB_PASSWORD ? '***hidden***' : 'empty'}`);

testConnection().then(() => {
  console.log("✅ Connection test completed!");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Connection test failed:", error.message);
  process.exit(1);
});