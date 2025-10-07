/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Look for test files in the tests/integration directory
  testMatch: ['**/tests/integration/**/*.test.ts'],
  // Set a longer timeout for integration tests as they interact with emulators
  testTimeout: 30000,
  // Allow transpiling of specific node_modules packages that use ESM
  transformIgnorePatterns: [
    '/node_modules/(?!jose)/',
  ],
  // A setup file to run before each integration test file
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
};