module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/phase1-e2e.test.js'],
  verbose: true,
  testTimeout: 120000,
  collectCoverage: false,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transform: {},
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ]
}; 