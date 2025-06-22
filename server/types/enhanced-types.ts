// Enhanced Types for RenX Trading Platform Server
// This file contains all the type definitions needed for the multi-tenant trading platform

export interface EnhancedUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'suspended';
  tenantId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
  profileImageUrl?: string;
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'viewer';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface TenantContext {
  tenantId: string;
  tenantName: string;
  user: EnhancedUser;
  permissions: Permission[];
  subscription?: TenantSubscription;
  settings?: TenantSettings;
}

export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_plan: string;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  theme?: string;
  timezone?: string;
  currency?: string;
  tradingHours?: {
    start: string;
    end: string;
  };
  riskLimits?: {
    maxPositionSize?: number;
    maxDailyLoss?: number;
    marginRequirement?: number;
  };
  features?: {
    aiTrading?: boolean;
    advancedAnalytics?: boolean;
    copyTrading?: boolean;
    paperTrading?: boolean;
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

export interface TenantSubscription {
  planId: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate?: string;
  features: string[];
  limits: Record<string, number>;
}

// Authentication types
export interface AuthRequest {
  tenantId: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: EnhancedUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface TokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// Portfolio and Trading types
export interface Portfolio {
  id: string;
  name: string;
  userId: number;
  totalValue: number;
  availableCash: number;
  totalReturn: number;
  dailyPnl: number;
  isDefault: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  portfolioId: string;
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  assetType: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskMetrics {
  portfolioRisk: number;
  var95: number;
  expectedShortfall: number;
  beta: number;
  alpha: number;
  sharpeRatio: number;
  maxDrawdown: number;
  correlationRisk: number;
  concentrationRisk: number;
  liquidityRisk: number;
}

export interface AISignal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning: string;
  technicalIndicators?: Record<string, any>;
  marketSentiment?: number;
  riskLevel: 'low' | 'medium' | 'high';
  aiModel: string;
  expectedReturn?: number;
  maxDrawdown?: number;
  currentPrice: number;
  assetClass: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52Week?: number;
  low52Week?: number;
  assetClass: string;
  exchange: string;
  lastUpdated: string;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  timestamp: Date;
  data: any;
}

export interface MarketDataUpdate extends WebSocketMessage {
  type: string;
  timestamp: Date;
  data: any;
  symbol: string;
  price: number;
  change: number;
  volume: number;
}

export type MessageType = 'market_update' | 'trade_update' | 'portfolio_update' | 'notification' | 'system_alert';

// Database types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
}

export interface TenantDatabase {
  tenantId: string;
  connectionString: string;
  pool: any;
  db: any;
}

// Notification types
export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  status: 'pending' | 'sent' | 'read' | 'failed';
  createdAt: string;
  readAt?: string;
  fromUserId?: string;
}

// User interface for middleware
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
} 