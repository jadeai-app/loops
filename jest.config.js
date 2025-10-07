
module.exports = {
  // Use 'node' environment for backend/rules tests
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // Firebase SDKs use ESM modules, so we need to tell Jest to transform them
  transformIgnorePatterns: [
    '/node_modules/(?!(firebase|@firebase|jose)/)',
  ],
};
