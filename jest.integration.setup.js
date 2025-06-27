/**
 * Jest Integration Test Setup
 * Configures test environment for database and API integration testing
 */

import { jest } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/renx_test';
process.env.PORT = '0'; // Use random port for testing
process.env.SESSION_SECRET = 'test-session-secret';
process.env.JWT_SECRET = 'test-jwt-secret';

// Disable external services in test environment
process.env.REDIS_URL = '';
process.env.KAFKA_BROKERS = '';
process.env.OPENAI_API_KEY = 'test-key';

// Mock external dependencies that aren't needed for integration tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    disconnect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG')
  }));
});

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined)
    }),
    consumer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined)
    })
  }))
}));

jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Mock WebSocket for testing
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));

// Mock fetch for external API calls
global.fetch = jest.fn();

// Console override to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Test database setup utilities
global.testUtils = {
  // Reset console for specific tests that need real logging
  enableConsole: () => {
    Object.assign(console, originalConsole);
  },
  
  // Disable console for noisy tests
  disableConsole: () => {
    Object.assign(console, {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    });
  },

  // Create test user data
  createTestUser: (overrides = {}) => ({
    id: 'test-user-' + Date.now(),
    email: `test-${Date.now()}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'test-tenant-001',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Create test order data
  createTestOrder: (overrides = {}) => ({
    id: 'test-order-' + Date.now(),
    symbol: 'AAPL',
    quantity: 100,
    orderType: 'market',
    side: 'buy',
    status: 'pending',
    userId: 'test-user-001',
    tenantId: 'test-tenant-001',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Create test portfolio data
  createTestPortfolio: (overrides = {}) => ({
    id: 'test-portfolio-' + Date.now(),
    name: 'Test Portfolio',
    totalValue: 100000,
    dailyChange: 500,
    dailyChangePercent: 0.5,
    userId: 'test-user-001',
    tenantId: 'test-tenant-001',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random test data
  randomString: (length = 8) => Math.random().toString(36).substring(2, length + 2),
  randomNumber: (min = 1, max = 1000) => Math.floor(Math.random() * (max - min + 1)) + min,
  randomPrice: () => Math.round((Math.random() * 1000 + 50) * 100) / 100
};

// Setup and teardown hooks
beforeAll(async () => {
  // Initialize test environment
  console.log('🧪 Setting up integration test environment...');
});

afterAll(async () => {
  // Cleanup test environment
  console.log('🧹 Cleaning up integration test environment...');
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  global.fetch.mockClear();
});

afterEach(() => {
  // Cleanup after each test
  jest.restoreAllMocks();
});

export default {}; 