/**
 * Test setup file for Jest
 * This file sets up the environment for testing
 */

const { sequelize } = require('../models');

// Global setup - runs once before all tests
global.beforeAll(async () => {
  // Ensure the test database is synced
  await sequelize.sync({ force: true });
});

// Global teardown - runs once after all tests
global.afterAll(async () => {
  // Close database connection
  await sequelize.close();
});
