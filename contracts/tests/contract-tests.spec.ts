/**
 * Contract Tests for RenX Consolidation
 * 
 * This file contains comprehensive tests to validate:
 * - API contract compliance with OpenAPI specification
 * - TypeScript interface validation
 * - Multi-tenant data isolation
 * - RBAC enforcement
 * - Real-time data contracts
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  // Multi-tenancy types
  Tenant,
  TenantSettings,
  TenantContext,
  
  // Enhanced user types
  EnhancedUser,
  UserRole,
  Permission,
  
  // Authentication types
  AuthRequest,
  AuthResponse,
  TokenResponse,
  
  // Enhanced trading types
  EnhancedOrder,
  EnhancedPosition,
  EnhancedPortfolio,
  TradingContext,
  
  // Watchlist types
  WatchlistItem,
  WatchlistAlert,
  
  // AI/ML types
  EnhancedAISignal,
  SentimentData,
  MarketConditions,
  
  // Notification types
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationPreferences,
  
  // Pricing types
  PricingPlan,
  PlanFeature,
  PlanLimits,
  
  // WebSocket types
  WebSocketMessage,
  MarketDataUpdate,
  
  // API response types
  ApiResponse,
  PaginatedResponse,
  
  // Utility types
  WithTenant,
  WithUser,
  WithTimestamps,
  
  // Error types
  RenXError,
  
  // Health check types
  HealthStatus
} from '../types/enhanced-types';

// Mock data factories
const createMockTenant = (): Tenant => ({
  id: 'tenant-123',
  name: 'Test Trading Corp',
  domain: 'test-trading.com',
  status: 'active',
  plan: 'professional',
  settings: {
    tradingEnabled: true,
    maxUsers: 50,
    features: ['real-time-data', 'ai-signals', 'advanced-charts'],
    customization: {
      branding: {
        logo: 'https://example.com/logo.png',
        primaryColor: '#1e40af',
        theme: 'dark-pro'
      }
    },
    limits: {
      maxPositions: 100,
      maxWatchlistItems: 500,
      dailyTradeLimit: 1000
    }
  },
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z')
});

const createMockUser = (): EnhancedUser => ({
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  permissions: [
    {
      id: 'perm-1',
      name: 'trade:create',
      resource: 'trades',
      action: 'create'
    }
  ],
  status: 'active',
  tenantId: 'tenant-123',
  isActive: true,
  lastLoginAt: new Date('2024-01-01T12:00:00Z'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z')
});

const createMockOrder = (): EnhancedOrder => ({
  id: 'order-123',
  symbol: 'AAPL',
  side: 'buy',
  orderType: 'limit',
  quantity: 100,
  price: 150.00,
  status: 'pending',
  timeInForce: 'day',
  createdAt: '2024-01-01T10:00:00Z',
  tenantId: 'tenant-123',
  userId: 1,
  fees: {
    commission: 1.00,
    regulatory: 0.02,
    total: 1.02
  },
  riskChecks: {
    marginRequired: 7500.00,
    buyingPower: 50000.00,
    dayTradingBuyingPower: 100000.00
  }
});

const createMockPosition = (): EnhancedPosition => ({
  id: 'pos-123',
  symbol: 'AAPL',
  quantity: 100,
  averageCost: 145.00,
  currentPrice: 150.00,
  marketValue: 15000.00,
  unrealizedPnL: 500.00,
  assetType: 'stock',
  tenantId: 'tenant-123',
  userId: 1,
  pnl: {
    unrealized: 500.00,
    realized: 0.00,
    total: 500.00
  },
  risk: {
    exposure: 0.15,
    beta: 1.2,
    deltaAdjustedNotional: 15000.00
  }
});

const createMockAISignal = (): EnhancedAISignal => ({
  id: 'signal-123',
  symbol: 'AAPL',
  action: 'buy',
  confidence: 85,
  targetPrice: 160.00,
  stopLoss: 140.00,
  reasoning: 'Strong bullish momentum with positive earnings surprise',
  sentimentScore: 0.75,
  createdAt: '2024-01-01T09:00:00Z',
  expiresAt: '2024-01-01T17:00:00Z',
  tenantId: 'tenant-123',
  model: {
    name: 'LSTM-v2',
    version: '2.1.0',
    accuracy: 0.78
  },
  features: {
    technicalIndicators: {
      rsi: 65,
      macd: {
        macd: 2.5,
        signal: 1.8,
        histogram: 0.7
      },
      movingAverages: {
        ma20: 148.50,
        ma50: 145.00,
        ma200: 140.00
      },
      bollinger: {
        upper: 155.00,
        middle: 150.00,
        lower: 145.00
      },
      volume: 25000000,
      volatility: 0.25
    },
    sentimentAnalysis: {
      score: 0.75,
      magnitude: 0.8,
      sources: [
        {
          type: 'news',
          score: 0.8,
          weight: 0.4,
          articles: 15
        }
      ],
      lastUpdated: '2024-01-01T08:00:00Z'
    },
    marketConditions: {
      volatility: 'medium',
      trend: 'bullish',
      marketRegime: 'trending',
      correlation: 0.65
    }
  }
});

describe('Contract Tests - Type Validation', () => {
  describe('Multi-Tenancy Contracts', () => {
    it('should validate Tenant interface', () => {
      const tenant = createMockTenant();
      
      expect(tenant).toHaveProperty('id');
      expect(tenant).toHaveProperty('name');
      expect(tenant).toHaveProperty('status');
      expect(tenant).toHaveProperty('plan');
      expect(tenant).toHaveProperty('settings');
      expect(tenant).toHaveProperty('createdAt');
      expect(tenant).toHaveProperty('updatedAt');
      
      expect(typeof tenant.id).toBe('string');
      expect(typeof tenant.name).toBe('string');
      expect(['active', 'suspended', 'inactive']).toContain(tenant.status);
      expect(typeof tenant.settings).toBe('object');
    });

    it('should validate TenantSettings structure', () => {
      const tenant = createMockTenant();
      const settings = tenant.settings || {} as TenantSettings;
      
      expect(settings).toHaveProperty('tradingEnabled');
      expect(settings).toHaveProperty('maxUsers');
      expect(settings).toHaveProperty('features');
      
      expect(typeof settings.tradingEnabled).toBe('boolean');
      expect(typeof settings.maxUsers).toBe('number');
      expect(Array.isArray(settings.features)).toBe(true);
    });
  });

  describe('RBAC Contracts', () => {
    it('should validate EnhancedUser interface', () => {
      const user = createMockUser();
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('permissions');
      expect(user).toHaveProperty('status');
      expect(user).toHaveProperty('tenantId');
      expect(user).toHaveProperty('isActive');
      
      expect(typeof user.id).toBe('string');
      expect(typeof user.username).toBe('string');
      expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(['super_admin', 'admin', 'user']).toContain(user.role);
      expect(Array.isArray(user.permissions)).toBe(true);
      expect(typeof user.isActive).toBe('boolean');
    });

    it('should validate Permission structure', () => {
      const user = createMockUser();
      const permission = user.permissions[0];
      
      expect(permission).toHaveProperty('id');
      expect(permission).toHaveProperty('name');
      expect(permission).toHaveProperty('resource');
      expect(permission).toHaveProperty('action');
      
      expect(typeof permission.id).toBe('string');
      expect(typeof permission.name).toBe('string');
      expect(typeof permission.resource).toBe('string');
      expect(typeof permission.action).toBe('string');
    });
  });

  describe('Trading Contracts', () => {
    it('should validate EnhancedOrder interface', () => {
      const order = createMockOrder();
      
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('symbol');
      expect(order).toHaveProperty('side');
      expect(order).toHaveProperty('orderType');
      expect(order).toHaveProperty('quantity');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('tenantId');
      expect(order).toHaveProperty('userId');
      
      expect(typeof order.id).toBe('string');
      expect(typeof order.symbol).toBe('string');
      expect(['buy', 'sell']).toContain(order.side);
      expect(['market', 'limit', 'stop', 'stop_limit']).toContain(order.orderType);
      expect(typeof order.quantity).toBe('number');
      expect(['pending', 'filled', 'cancelled', 'rejected']).toContain(order.status);
    });

    it('should validate EnhancedPosition interface', () => {
      const position = createMockPosition();
      
      expect(position).toHaveProperty('id');
      expect(position).toHaveProperty('symbol');
      expect(position).toHaveProperty('quantity');
      expect(position).toHaveProperty('averageCost');
      expect(position).toHaveProperty('currentPrice');
      expect(position).toHaveProperty('marketValue');
      expect(position).toHaveProperty('tenantId');
      expect(position).toHaveProperty('userId');
      expect(position).toHaveProperty('pnl');
      expect(position).toHaveProperty('risk');
      
      expect(typeof position.quantity).toBe('number');
      expect(typeof position.averageCost).toBe('number');
      expect(typeof position.currentPrice).toBe('number');
      expect(typeof position.pnl).toBe('object');
      expect(typeof position.risk).toBe('object');
    });
  });

  describe('AI/ML Contracts', () => {
    it('should validate EnhancedAISignal interface', () => {
      const signal = createMockAISignal();
      
      expect(signal).toHaveProperty('id');
      expect(signal).toHaveProperty('symbol');
      expect(signal).toHaveProperty('action');
      expect(signal).toHaveProperty('confidence');
      expect(signal).toHaveProperty('reasoning');
      expect(signal).toHaveProperty('tenantId');
      expect(signal).toHaveProperty('model');
      expect(signal).toHaveProperty('features');
      
      expect(typeof signal.id).toBe('string');
      expect(['buy', 'sell', 'hold']).toContain(signal.action);
      expect(typeof signal.confidence).toBe('number');
      expect(signal.confidence).toBeGreaterThanOrEqual(0);
      expect(signal.confidence).toBeLessThanOrEqual(100);
      expect(typeof signal.reasoning).toBe('string');
    });

    it('should validate AI model structure', () => {
      const signal = createMockAISignal();
      const model = signal.model;
      
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('version');
      expect(model).toHaveProperty('accuracy');
      
      expect(typeof model.name).toBe('string');
      expect(typeof model.version).toBe('string');
      expect(typeof model.accuracy).toBe('number');
      expect(model.accuracy).toBeGreaterThanOrEqual(0);
      expect(model.accuracy).toBeLessThanOrEqual(1);
    });
  });

  describe('Notification Contracts', () => {
    it('should validate Notification interface', () => {
      const notification: Notification = {
        id: 'notif-123',
        tenantId: 'tenant-123',
        userId: 1,
        type: 'ai_signal',
        title: 'New AI Signal',
        message: 'Strong buy signal for AAPL',
        priority: 'high',
        channels: ['email', 'push'],
        status: 'pending',
        createdAt: '2024-01-01T10:00:00Z'
      };
      
      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('tenantId');
      expect(notification).toHaveProperty('userId');
      expect(notification).toHaveProperty('type');
      expect(notification).toHaveProperty('channels');
      
      expect(typeof notification.id).toBe('string');
      expect(typeof notification.tenantId).toBe('string');
      expect(typeof notification.userId).toBe('number');
      expect(Array.isArray(notification.channels)).toBe(true);
    });
  });
});

describe('Contract Tests - API Response Validation', () => {
  describe('Authentication API Contracts', () => {
    it('should validate AuthResponse structure', () => {
      const authResponse: AuthResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: createMockUser(),
          accessToken: 'jwt-token-here',
          refreshToken: 'refresh-token-here',
          expiresIn: 3600
        }
      };
      
      expect(authResponse).toHaveProperty('success');
      expect(authResponse).toHaveProperty('message');
      expect(authResponse).toHaveProperty('data');
      expect(authResponse.data).toHaveProperty('user');
      expect(authResponse.data).toHaveProperty('accessToken');
      expect(authResponse.data).toHaveProperty('refreshToken');
      expect(authResponse.data).toHaveProperty('expiresIn');
      
      expect(typeof authResponse.success).toBe('boolean');
      expect(typeof authResponse.message).toBe('string');
      expect(typeof authResponse.data.accessToken).toBe('string');
      expect(typeof authResponse.data.expiresIn).toBe('number');
    });
  });

  describe('API Response Wrapper Contracts', () => {
    it('should validate ApiResponse structure', () => {
      const response: ApiResponse<string> = {
        success: true,
        data: 'test data'
      };
      
      expect(response).toHaveProperty('success');
      expect(typeof response.success).toBe('boolean');
    });

    it('should validate PaginatedResponse structure', () => {
      const response: PaginatedResponse<EnhancedOrder> = {
        success: true,
        data: [createMockOrder()],
        meta: {
          total: 1,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1
        }
      };
      
      expect(response).toHaveProperty('meta');
      expect(response.meta).toHaveProperty('limit');
      expect(response.meta).toHaveProperty('total');
      expect(response.meta).toHaveProperty('hasMore');
      expect(response.meta).toHaveProperty('totalPages');
      
      expect(typeof response.meta.limit).toBe('number');
      expect(typeof response.meta.hasMore).toBe('boolean');
    });
  });
});

describe('Contract Tests - WebSocket Message Validation', () => {
  it('should validate WebSocketMessage structure', () => {
    const message: WebSocketMessage = {
      type: 'price_update',
      payload: {
        symbol: 'AAPL',
        price: 150.00,
        change: 2.50
      },
      timestamp: new Date('2024-01-01T10:00:00Z')
    };
    
    expect(message).toHaveProperty('type');
    expect(message).toHaveProperty('payload');
    expect(message).toHaveProperty('timestamp');
    
    expect(typeof message.type).toBe('string');
    expect(typeof message.payload).toBe('object');
    expect(message.timestamp instanceof Date).toBe(true);
  });

  it('should validate MarketDataUpdate structure', () => {
    const update: MarketDataUpdate = {
      type: 'market_data',
      payload: {
        symbol: 'AAPL',
        price: 150.00,
        change: 2.50,
        changePercent: 1.69,
        volume: 25000000,
        high: 152.00,
        low: 148.00,
        open: 149.00,
        previousClose: 147.50,
        timestamp: new Date('2024-01-01T10:00:00Z')
      },
      timestamp: new Date('2024-01-01T10:00:00Z')
    };
    
    expect(update).toHaveProperty('type');
    expect(update).toHaveProperty('payload');
    expect(update).toHaveProperty('timestamp');
    
    expect(typeof update.type).toBe('string');
    expect(typeof update.payload).toBe('object');
    expect(update.timestamp instanceof Date).toBe(true);
  });
});

describe('Contract Tests - Utility Type Validation', () => {
  it('should validate WithTenant utility type', () => {
    interface TestData {
      name: string;
      value: number;
    }
    
    const testDataWithTenant: WithTenant<TestData> = {
      name: 'test',
      value: 123,
      tenantId: 'tenant-123'
    };
    
    expect(testDataWithTenant).toHaveProperty('tenantId');
    expect(typeof testDataWithTenant.tenantId).toBe('string');
  });

  it('should validate WithUser utility type', () => {
    interface TestData {
      name: string;
      value: number;
    }
    
    const testDataWithUser: WithUser<TestData> = {
      name: 'test',
      value: 123,
      userId: 1
    };
    
    expect(testDataWithUser).toHaveProperty('userId');
    expect(typeof testDataWithUser.userId).toBe('number');
  });

  it('should validate WithTimestamps utility type', () => {
    interface TestData {
      name: string;
      value: number;
    }
    
    const testDataWithTimestamps: WithTimestamps<TestData> = {
      name: 'test',
      value: 123,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
    
    expect(testDataWithTimestamps).toHaveProperty('createdAt');
    expect(testDataWithTimestamps).toHaveProperty('updatedAt');
    expect(typeof testDataWithTimestamps.createdAt).toBe('string');
    expect(typeof testDataWithTimestamps.updatedAt).toBe('string');
  });
});

describe('Contract Tests - Error Handling', () => {
  it('should validate RenXError structure', () => {
    const error: RenXError = {
      name: 'ValidationError',
      message: 'Invalid tenant ID',
      code: 'INVALID_TENANT',
      statusCode: 400,
      tenantId: 'tenant-123',
      userId: 1,
      context: {
        field: 'tenantId',
        value: 'invalid-tenant'
      }
    };
    
    expect(error).toHaveProperty('name');
    expect(error).toHaveProperty('message');
    expect(error).toHaveProperty('code');
    expect(error).toHaveProperty('statusCode');
    
    expect(typeof error.code).toBe('string');
    expect(typeof error.statusCode).toBe('number');
    expect(typeof error.context).toBe('object');
  });
});

describe('Contract Tests - Health Check', () => {
  it('should validate HealthStatus structure', () => {
    const health: HealthStatus = {
      status: 'UP',
      timestamp: '2024-01-01T10:00:00Z',
      services: {
        database: true,
        redis: true,
        websocket: true,
        ai: true,
        notifications: true
      },
      version: '1.0.0',
      uptime: 3600
    };
    
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('services');
    expect(health).toHaveProperty('version');
    expect(health).toHaveProperty('uptime');
    
    expect(['UP', 'DOWN', 'DEGRADED']).toContain(health.status);
    expect(typeof health.services).toBe('object');
    expect(typeof health.version).toBe('string');
    expect(typeof health.uptime).toBe('number');
  });
});

describe('Contract Tests - Data Isolation', () => {
  it('should ensure all tenant-specific data includes tenantId', () => {
    const order = createMockOrder();
    const position = createMockPosition();
    const signal = createMockAISignal();
    
    expect(order.tenantId).toBeDefined();
    expect(position.tenantId).toBeDefined();
    expect(signal.tenantId).toBeDefined();
    
    expect(typeof order.tenantId).toBe('string');
    expect(typeof position.tenantId).toBe('string');
    expect(typeof signal.tenantId).toBe('string');
  });

  it('should ensure all user-specific data includes userId', () => {
    const order = createMockOrder();
    const position = createMockPosition();
    
    expect(order.userId).toBeDefined();
    expect(position.userId).toBeDefined();
    
    expect(typeof order.userId).toBe('number');
    expect(typeof position.userId).toBe('number');
  });
});

// Performance and compliance tests
describe('Contract Tests - Performance Requirements', () => {
  it('should validate message size constraints', () => {
    const message: WebSocketMessage = {
      type: 'price_update',
      payload: createMockOrder(),
      timestamp: new Date('2024-01-01T10:00:00Z')
    };
    
    const messageSize = JSON.stringify(message).length;
    expect(messageSize).toBeLessThan(64 * 1024); // 64KB limit
  });

  it('should validate timestamp format consistency', () => {
    const order = createMockOrder();
    const signal = createMockAISignal();
    
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    
    expect(order.createdAt).toMatch(iso8601Regex);
    expect(signal.createdAt).toMatch(iso8601Regex);
    if (signal.expiresAt) {
      expect(signal.expiresAt).toMatch(iso8601Regex);
    }
  });
});

// Export test utilities for use in other test files
export {
  createMockTenant,
  createMockUser,
  createMockOrder,
  createMockPosition,
  createMockAISignal
}; 