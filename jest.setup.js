// Global test setup
require('dotenv/config');

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/renx_test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379/1';

// Mock console methods in test environment
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Global test timeout
jest.setTimeout(30000);

// Mock external services
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked AI response' } }]
        })
      }
    }
  }))
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  })
}));

// Global test utilities
global.testUtils = {
  generateTestUser: (overrides = {}) => ({
    id: `test-user-${Date.now()}`,
    email: 'test@example.com',
    tenantId: 'test-tenant',
    roles: ['user'],
    ...overrides
  }),
  
  generateTestTenant: (overrides = {}) => ({
    id: `test-tenant-${Date.now()}`,
    name: 'Test Tenant',
    domain: 'test.com',
    status: 'active',
    plan: 'professional',
    ...overrides
  }),
  
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
}; 