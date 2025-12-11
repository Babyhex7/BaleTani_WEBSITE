/**
 * ML Model Webhook Handler
 * Auto-trigger model reload saat ada perubahan produk
 */

const axios = require("axios");
const logger = require("../utils/logger");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

/**
 * Trigger ML model reload
 * Call endpoint ini setelah:
 * - Produk baru ditambahkan
 * - Produk existing di-update
 * - Produk dihapus/dinonaktifkan
 *
 * @returns {Promise<Object>} Reload response
 */
const triggerModelReload = async () => {
  try {
    logger.info("🔄 Triggering ML model reload...");

    const response = await axios.post(
      `${ML_SERVICE_URL}/v1/admin/reload-model`,
      {},
      { timeout: 30000 } // 30s timeout untuk reload
    );

    logger.info(
      `✅ Model reloaded: ${response.data.indexed_products} products indexed`
    );

    return response.data;
  } catch (error) {
    logger.error(`❌ Failed to reload ML model: ${error.message}`);
    // Don't throw - model reload failure shouldn't block product operations
    return {
      status: "error",
      message: error.message,
      indexed_products: 0,
    };
  }
};

/**
 * Get ML model status
 *
 * @returns {Promise<Object>} Model status
 */
const getModelStatus = async () => {
  try {
    const response = await axios.get(
      `${ML_SERVICE_URL}/v1/admin/model-status`,
      { timeout: 5000 }
    );

    return response.data;
  } catch (error) {
    logger.error(`❌ Failed to get model status: ${error.message}`);
    throw error;
  }
};

/**
 * Schedule periodic model reload
 * Call this untuk setup cron job reload model
 *
 * @param {string} interval - Cron expression (e.g., '0 2 * * *' untuk daily 2 AM)
 */
const scheduleModelReload = (interval = "0 2 * * *") => {
  const cron = require("node-cron");

  logger.info(`📅 Scheduling model reload: ${interval}`);

  cron.schedule(interval, async () => {
    logger.info("⏰ Scheduled model reload triggered");
    await triggerModelReload();
  });
};

module.exports = {
  triggerModelReload,
  getModelStatus,
  scheduleModelReload,
};
