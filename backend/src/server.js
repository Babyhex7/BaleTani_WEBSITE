const app = require("./app");
const { sequelize, testConnection } = require("./config/database");
const { startAutoCancelCron } = require("./services/orderAutoCancelCron");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    logger.info("Starting server initialization...");

    await testConnection();
    
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    
    logger.info("Synchronizing database models...");

    await sequelize.sync({
      force: false,
      alter: false,
    });

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    logger.info("Database models synchronized successfully");

    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log(`BaleTani Fresh Market API - Port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`API Base URL: http://localhost:${PORT}/api`);
      console.log("=".repeat(60) + "\n");
      logger.info("Server is ready to accept connections");

      logger.info("Starting order auto-cancel cron job");
      startAutoCancelCron();
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection:", reason);
  if (process.env.NODE_ENV === "production") {
    logger.error("Shutting down server due to unhandled rejection");
    process.exit(1);
  } else {
    logger.warn("Server continues running in development mode");
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  if (process.env.NODE_ENV === "production") {
    logger.error("Shutting down server due to uncaught exception");
    process.exit(1);
  } else {
    logger.warn("Server continues running in development mode");
  }
});

// Handle SIGTERM (Graceful shutdown)
process.on("SIGTERM", async () => {
  logger.info("SIGTERM signal received: closing server gracefully");
  try {
    await sequelize.close();
    logger.info("Database connection closed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
});

startServer();
