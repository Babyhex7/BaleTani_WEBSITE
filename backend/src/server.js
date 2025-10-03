const app = require("./app");
const { sequelize, testConnection } = require("./config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database models
    await sequelize.sync({
      force: false, // Set to true only for development when you want to recreate tables
      alter: false, // Set to true to automatically update table structure
    });
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
