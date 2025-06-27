module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/phase1-validation.test.js'],
  verbose: true,
  collectCoverage: false,
  testTimeout: 300000, // 5 minutes for build tests
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {},
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ]
}; 