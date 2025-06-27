module.exports = {
  projects: [
    {
      displayName: 'Server Tests',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.js',
        '<rootDir>/tests/integration/**/*.test.js',
        '<rootDir>/server/tests/**/*.test.js'
      ],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            module: 'ESNext',
            target: 'ES2020'
          }
        }],
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      extensionsToTreatAsEsm: ['.ts', '.tsx'],
      moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
    },
    {
      displayName: 'Client Tests',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/client/src/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/tests/frontend/**/*.test.{js,jsx,ts,tsx}'
      ],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          useESM: true,
          tsconfig: {
            jsx: 'react-jsx',
            module: 'ESNext',
            target: 'ES2020'
          }
        }],
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub',
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^~/(.*)$': '<rootDir>/client/src/$1',
        '^client/(.*)$': '<rootDir>/client/$1'
      },
      setupFilesAfterEnv: ['<rootDir>/jest.frontend.setup.js'],
    }
  ],
  testTimeout: 30000,
  collectCoverageFrom: [
    'server/**/*.{js,ts}',
    'client/src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true
}; 