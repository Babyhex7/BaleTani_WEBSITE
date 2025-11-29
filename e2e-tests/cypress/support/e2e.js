// ***********************************************************
// This file is processed and loaded automatically before test files.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// Read more here: https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

/**
 * Before each test
 */
beforeEach(() => {
  // Clear cookies and local storage
  cy.clearCookies();
  cy.clearLocalStorage();

  // Set default viewport
  cy.viewport(1280, 720);
});

/**
 * After each test
 */
afterEach(() => {
  // Take screenshot on failure (already handled by Cypress)
  // But we can add custom cleanup here if needed
});

/**
 * Global error handler
 */
Cypress.on("uncaught:exception", (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // Useful for handling expected errors

  // Log the error for debugging
  console.error("Uncaught exception:", err.message);

  // Don't fail tests on these specific errors
  const ignoredErrors = [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ];

  if (ignoredErrors.some((msg) => err.message.includes(msg))) {
    return false;
  }

  // Fail on all other uncaught exceptions
  return true;
});

/**
 * Custom log function
 */
Cypress.Commands.add("logTest", (message, data) => {
  cy.log(`🧪 ${message}`);
  if (data) {
    cy.log(JSON.stringify(data, null, 2));
  }
});
