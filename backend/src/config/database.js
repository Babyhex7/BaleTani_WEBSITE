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
    // ========================================
    // CONNECTION POOL CONFIGURATION
    // ========================================
    // Optimized untuk handle banyak concurrent requests
    pool: {
      max: 50, // Maximum 50 connections (naik dari 20)
      min: 10, // Always keep 10 connections warm (naik dari 5)
      acquire: 60000, // 60 detik timeout untuk dapat connection
      idle: 20000, // 20 detik idle sebelum release (naik dari 10)
      evict: 10000, // Check idle connections setiap 10 detik
      handleDisconnects: true, // Auto reconnect jika terputus
      // Validate connection sebelum digunakan
      validate: (connection) => {
        return connection && connection.state !== "disconnected";
      },
    },
    retry: {
      max: 5, // Retry 5 kali jika gagal (naik dari 3)
      backoffBase: 1000,
      backoffExponent: 1.5,
    },
    benchmark: false, // Disable benchmark untuk performance
  }
);

// Test connection dengan retry logic
const testConnection = async (retries = 3) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established successfully.");
      console.log(
        `📊 Pool Config: max=${sequelize.config.pool.max}, min=${sequelize.config.pool.min}`
      );
      return true;
    } catch (error) {
      console.error(
        `❌ Database connection attempt ${i}/${retries} failed:`,
        error.message
      );

      if (i === retries) {
        console.error(
          "❌ Unable to connect to database after",
          retries,
          "attempts"
        );
        console.error("❌ Error details:", error);
        process.exit(1);
      }

      // Wait before retry (exponential backoff)
      const delay = 1000 * Math.pow(2, i - 1);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// ========================================
// Connection Pool Monitoring
// ========================================
const getPoolStats = () => {
  try {
    const pool = sequelize.connectionManager.pool;
    if (pool) {
      return {
        total: pool._allObjects?.length || 0,
        available: pool._availableObjects?.length || 0,
        borrowed:
          (pool._allObjects?.length || 0) -
          (pool._availableObjects?.length || 0),
        max: sequelize.config.pool.max,
        min: sequelize.config.pool.min,
      };
    }
  } catch (error) {
    return { error: "Unable to get pool stats" };
  }
  return { error: "Pool not initialized" };
};

// Log pool stats setiap 5 menit (hanya development)
if (process.env.NODE_ENV === "development") {
  setInterval(() => {
    const stats = getPoolStats();
    if (!stats.error) {
      console.log(
        `📊 [DB POOL] Total: ${stats.total}, Available: ${stats.available}, In Use: ${stats.borrowed}/${stats.max}`
      );
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

// ========================================
// Graceful Shutdown Handler
// ========================================
const gracefulShutdown = async () => {
  console.log("\n⏳ Received shutdown signal, closing database connections...");
  try {
    // Log final pool stats
    const stats = getPoolStats();
    if (!stats.error) {
      console.log(
        `📊 [SHUTDOWN] Pool stats: ${stats.total} total, ${stats.borrowed} in use`
      );
    }

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

module.exports = { sequelize, testConnection, getPoolStats };
