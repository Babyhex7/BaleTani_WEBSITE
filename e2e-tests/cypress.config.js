const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Base URL untuk frontend customer
    baseUrl: "http://localhost:5173",

    // Environment variables
    env: {
      API_URL: "http://localhost:5000/api",
      BACKEND_URL: "http://localhost:5000",

      // Test accounts
      TEST_CUSTOMER_PHONE: "081234567890",
      TEST_CUSTOMER_PASSWORD: "password123",

      // WhatsApp
      WHATSAPP_NUMBER: "085885725027",
    },

    setupNodeEvents(on, config) {
      // Load database helper for seeding & reset
      require("./cypress/support/helpers/databaseHelper")(on, config);

      return config;
    },

    // Viewport configuration
    viewportWidth: 1280,
    viewportHeight: 720,

    // Video & screenshot configuration
    video: true,
    videoCompression: 32,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Retries
    retries: {
      runMode: 2, // Retry failed tests 2 times in CI
      openMode: 0, // No retries in interactive mode
    },

    // Exclude example specs
    excludeSpecPattern: [
      "**/examples/*",
      "**/1-getting-started/*",
      "**/2-advanced-examples/*",
    ],

    // Download folder
    downloadsFolder: "cypress/downloads",

    // Test isolation
    testIsolation: true,

    // Chrome web security
    chromeWebSecurity: false,

    // Experimental features
    experimentalStudio: false,
  },
});
