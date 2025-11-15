const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    timezone: "+07:00", // WIB (Indonesia Barat)
    dialectOptions: {
      timezone: "+07:00",
      connectTimeout: 60000, // 60 seconds
    },
    logging:
      process.env.NODE_ENV === "development"
        ? (sql) => {
            // Log query tapi potong jika terlalu panjang
            // Disable logging untuk sync operations (terlalu banyak)
            if (sql.includes("SHOW INDEX") || sql.includes("SHOW TABLES")) {
              return; // Skip logging schema queries
            }
            const shortSql =
              sql.length > 200 ? sql.substring(0, 200) + "..." : sql;
            console.log("🔵 SQL:", shortSql);
          }
        : false,
    pool: {
      max: 20, // Naik dari 10 ke 20 connections
      min: 5, // Naik dari 0 ke 5 (always keep minimum connections)
      acquire: 60000, // Naik dari 30s ke 60s
      idle: 10000, // Keep at 10s
      evict: 10000, // Check for idle connections every 10s
    },
    retry: {
      max: 3, // Retry 3 times on connection failure
      backoffBase: 1000,
      backoffExponent: 1.5,
    },
    benchmark: false, // Disable benchmark untuk performance
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1); // Exit jika database tidak bisa connect
  }
};

// ========================================
// Graceful Shutdown Handler
// ========================================
const gracefulShutdown = async () => {
  console.log("\n⏳ Received shutdown signal, closing database connections...");
  try {
    await sequelize.close();
    console.log("✅ Database connections closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error closing database connections:", error);
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on("SIGINT", gracefulShutdown); // Ctrl+C
process.on("SIGTERM", gracefulShutdown); // Kill command
process.on("SIGUSR2", gracefulShutdown); // Nodemon restart

module.exports = { sequelize, testConnection };
