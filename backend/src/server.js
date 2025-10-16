const app = require("./app");
const { sequelize, testConnection } = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Disable foreign key checks for sync
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    // Sync database models
    await sequelize.sync({
      force: true, // TEMPORARY: Recreate tables for new schema
      alter: false,
    });

    // Re-enable foreign key checks
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("✅ Database models synchronized successfully.");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 BaleTani Fresh Market API is running on port ${PORT}`);
      console.log(`📖 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

startServer();
