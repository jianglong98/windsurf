/**
 * Jest configuration for Massage Booking Website
 */

module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js',
    '!**/node_modules/**'
  ],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // A list of paths to directories that Jest should use to search for files in
  roots: [
    '<rootDir>/tests/'
  ],
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
  
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover'
  ],
  
  // Setup files that will be executed before each test file
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',
  
  // Default timeout of a test in milliseconds
  testTimeout: 30000
};
