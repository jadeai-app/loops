module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>'],
  // The test matching patterns
  testMatch: ['**/tests/unit/**/*.spec.ts'],
  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    'firebase-admin/firestore': '<rootDir>/tests/mocks/firebase-admin-firestore.ts',
    'firebase-admin': '<rootDir>/tests/mocks/firebase-admin.ts',
    '@google-cloud/pubsub': '<rootDir>/tests/mocks/google-cloud-pubsub.ts',
    'firebase-functions/v2': '<rootDir>/tests/mocks/firebase-functions-v2.ts',
    'firebase-functions/logger': '<rootDir>/tests/mocks/firebase-functions-logger.ts',
  },
};