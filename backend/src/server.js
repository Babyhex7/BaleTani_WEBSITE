const app = require("./app");
const { sequelize, testConnection } = require("./config/database");
const { startAutoCancelCron } = require("./services/orderAutoCancelCron");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("🔄 Starting server initialization...");

    // Test database connection
    console.log("🔄 Testing database connection...");
    await testConnection();

    // Disable foreign key checks for sync
    console.log("🔄 Disabling foreign key checks...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    // Sync database models
    console.log("🔄 Synchronizing database models...");
    console.log("⏳ This may take a moment...");

    await sequelize.sync({
      force: false, // Don't drop tables - preserve existing data
      alter: false, // Don't alter tables - prevent stuck on complex migrations
    });

    // Re-enable foreign key checks
    console.log("🔄 Re-enabling foreign key checks...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("✅ Database models synchronized successfully.");

    // Start server
    console.log("🔄 Starting HTTP server...");
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log(`🚀 BaleTani Fresh Market API is running on port ${PORT}`);
      console.log(`📖 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      console.log("=".repeat(60) + "\n");
      console.log("✅ Server is ready to accept connections!");

      // Start auto-cancel cron job
      console.log("⏰ Starting order auto-cancel cron job...");
      startAutoCancelCron();
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection at:", promise);
  console.error("Reason:", reason);
  // Jangan exit di development, biar server tetap jalan
  if (process.env.NODE_ENV === "production") {
    console.error("⚠️ Shutting down server due to unhandled rejection...");
    process.exit(1);
  } else {
    console.log("⚠️ Server masih jalan (development mode)");
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  // Jangan exit di development
  if (process.env.NODE_ENV === "production") {
    console.error("⚠️ Shutting down server due to uncaught exception...");
    process.exit(1);
  } else {
    console.log("⚠️ Server masih jalan (development mode)");
  }
});

// Handle SIGTERM (Graceful shutdown)
process.on("SIGTERM", async () => {
  console.log("\n⏳ SIGTERM signal received: closing server gracefully");
  try {
    await sequelize.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

startServer();
