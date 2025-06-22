/**
 * Enhanced TypeScript Interfaces for RenX Consolidation
 * 
 * This file extends NH-UI types with AN-BK enterprise features including:
 * - Multi-tenancy support
 * - Role-based access control (RBAC)
 * - Advanced trading features
 * - AI/ML integration
 * - Enterprise features (notifications, pricing, etc.)
 */

// Re-export existing NH-UI types
export * from '../../client/src/types/trading';

// Import shared schema types
export type {
  User as SchemaUser,
  Portfolio as SchemaPortfolio,
  Position as SchemaPosition,
  Order as SchemaOrder,
  AISignal as SchemaAISignal,
  TradingBot,
  InsertTradingBot,
  MarketData as SchemaMarketData,
  InsertMarketData,
  RiskAlert,
  InsertRiskAlert,
  ScreeningResult,
  InsertScreeningResult,
  OptionsData,
  InsertOptionsData
} from '../../shared/schema';

// Core User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnhancedUser extends User {
  tenantId: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: Date;
  isActive: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  trading: boolean;
  news: boolean;
}

// Tenant Management Types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'inactive';
  plan: 'starter' | 'professional' | 'enterprise';
  subscription_plan?: string; // For backward compatibility
  settings?: TenantSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  maxUsers: number;
  features: string[];
  tradingEnabled: boolean;
  customization?: {
    logo?: string;
    colors?: Record<string, string>;
    branding?: Record<string, any>;
  };
  limits?: {
    maxPositions: number;
    maxWatchlistItems: number;
    dailyTradeLimit: number;
  };
}

export interface TenantContext {
  tenant: Tenant;
  userRole: string;
  permissions: string[];
  features: string[];
}

// RBAC Types
export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  tenantId?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte';
  value: any;
}

// Trading and Portfolio Types
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  tenantId: string;
  userId: string;
  isDefault: boolean;
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  positions: Position[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  portfolioId: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  averageCost: number; // For backward compatibility
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  portfolioId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  fee: number;
  total: number;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  filledAt?: Date;
  cancelledAt?: Date;
  executedAt?: Date;
  createdAt: Date;
}

// AI and ML Types
export interface AISignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  strength: 'weak' | 'moderate' | 'strong';
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning: string;
  indicators: Record<string, number>;
  generatedAt: Date;
  expiresAt: Date;
}

export interface PredictionModel {
  id: string;
  name: string;
  type: 'lstm' | 'transformer' | 'ensemble';
  symbol: string;
  accuracy: number;
  lastTrained: Date;
  status: 'active' | 'training' | 'inactive';
  parameters: Record<string, any>;
}

// Market Data Types
export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
}

export interface Watchlist {
  id: string;
  name: string;
  userId: string;
  tenantId: string;
  symbols: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    totalPages: number;
  };
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

export interface MarketDataUpdate extends WebSocketMessage {
  type: 'market_data';
  payload: MarketData;
}

export interface PortfolioUpdate extends WebSocketMessage {
  type: 'portfolio_update';
  payload: {
    portfolioId: string;
    positions: Position[];
    totalValue: number;
    dayChange: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: Date;
  correlationId?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export commonly used type combinations
export type AuthenticatedUser = EnhancedUser & {
  tenantContext: TenantContext;
  roles: UserRole[];
  permissions: Permission[];
};

export type CreateUserRequest = Omit<EnhancedUser, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserRequest = DeepPartial<Omit<EnhancedUser, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateTenantRequest = Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTenantRequest = DeepPartial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreatePortfolioRequest = Omit<Portfolio, 'id' | 'totalValue' | 'totalReturn' | 'totalReturnPercent' | 'dayChange' | 'dayChangePercent' | 'positions' | 'createdAt' | 'updatedAt'>;
export type UpdatePortfolioRequest = DeepPartial<Pick<Portfolio, 'name' | 'description'>>;

// Authentication Types
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

// Enhanced Trading Types
export interface EnhancedOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity?: number;
  filledPrice?: number;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
  createdAt: string;
  tenantId: string;
  userId: number;
  fees?: {
    commission: number;
    regulatory: number;
    total: number;
  };
  riskChecks?: {
    marginRequired?: number;
    buyingPower?: number;
    dayTradingBuyingPower?: number;
  };
  metadata?: Record<string, any>;
}

export interface EnhancedPosition {
  id: string;
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity';
  tenantId: string;
  userId: number;
  pnl: {
    unrealized: number;
    realized: number;
    total: number;
  };
  risk: {
    exposure: number;
    beta: number;
    deltaAdjustedNotional?: number;
  };
}

// Multi-Tenant Trading Context
export interface TradingContext {
  tenantId: string;
  userId: number;
  portfolio: EnhancedPortfolio;
  positions: EnhancedPosition[];
  orders: EnhancedOrder[];
  watchlist: WatchlistItem[];
}

export interface EnhancedPortfolio {
  id: string;
  name: string;
  totalValue: number;
  availableCash: number;
  totalReturn: number;
  dailyPnL: number;
  isDefault: boolean;
  tenantId: string;
  userId: number;
  accountType: 'cash' | 'margin' | 'options';
  buyingPower: number;
  dayTradingBuyingPower: number;
  equity: number;
  maintenanceMargin: number;
  riskMetrics: RiskMetrics;
}

// Watchlist Types
export interface WatchlistItem {
  id: number;
  symbol: string;
  notes?: string;
  alertsEnabled: boolean;
  alerts?: WatchlistAlert[];
  createdAt: string;
}

export interface WatchlistAlert {
  id: number;
  type: 'price' | 'volume' | 'change_percent';
  condition: 'above' | 'below' | 'crosses';
  value: number;
  isActive: boolean;
  lastTriggered?: string;
}

// AI/ML Enhanced Types
export interface EnhancedAISignal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning: string;
  sentimentScore?: number;
  createdAt: string;
  expiresAt?: string;
  tenantId: string;
  model: {
    name: string;
    version: string;
    accuracy: number;
  };
  features: {
    technicalIndicators: TechnicalIndicators;
    sentimentAnalysis: SentimentData;
    marketConditions: MarketConditions;
  };
  backtestResults?: BacktestSummary;
}

export interface SentimentData {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  sources: SentimentSource[];
  lastUpdated: string;
}

export interface SentimentSource {
  type: 'news' | 'social' | 'analyst';
  score: number;
  weight: number;
  articles?: number;
}

export interface MarketConditions {
  volatility: 'low' | 'medium' | 'high';
  trend: 'bullish' | 'bearish' | 'sideways';
  marketRegime: 'trending' | 'mean_reverting' | 'volatile';
  correlation: number;
}

export interface BacktestSummary {
  period: string;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  avgHoldingPeriod: number;
}

// Risk Metrics Types
export interface RiskMetrics {
  var: number; // Value at Risk
  cvar: number; // Conditional Value at Risk
  sharpeRatio: number;
  sortinoRatio: number;
  beta: number;
  alpha: number;
  maxDrawdown: number;
  volatility: number;
  correlation: number;
  exposureByAsset: Record<string, number>;
  exposureBySector: Record<string, number>;
  lastUpdated: Date;
}

// Technical Indicators Types
export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: number;
  volatility: number;
}

// Notification System Types
export interface Notification {
  id: string;
  tenantId: string;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'read' | 'failed';
  createdAt: string;
  readAt?: string;
}

export type NotificationType = 
  | 'trade_executed'
  | 'order_filled'
  | 'ai_signal'
  | 'price_alert'
  | 'risk_warning'
  | 'system_maintenance'
  | 'account_update';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export interface NotificationPreferences {
  tenantId: string;
  userId: number;
  preferences: {
    [key in NotificationType]: {
      enabled: boolean;
      channels: NotificationChannel[];
      threshold?: any;
    };
  };
}

// Pricing & Plans Types
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
  isActive: boolean;
  targetUserType: 'individual' | 'business' | 'enterprise';
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  category: 'trading' | 'data' | 'ai' | 'support' | 'integration';
  included: boolean;
}

export interface PlanLimits {
  maxUsers: number;
  maxPositions: number;
  maxWatchlistItems: number;
  dailyTrades: number;
  realTimeData: boolean;
  historicalDataYears: number;
  aiSignalsPerDay: number;
  supportLevel: 'basic' | 'priority' | 'dedicated';
}

// Configuration Types
export interface TradingThresholds {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxDrawdown: number;
  marginRequirement: number;
  riskFreeRate: number;
  correlationLimit: number;
}

export interface SystemConfiguration {
  tenantId: string;
  trading: TradingThresholds;
  ai: {
    modelUpdateFrequency: number;
    signalConfidenceThreshold: number;
    maxSignalsPerDay: number;
  };
  notifications: {
    defaultChannels: NotificationChannel[];
    retryAttempts: number;
    timeouts: Record<NotificationChannel, number>;
  };
  cache: {
    ttl: Record<string, number>;
    maxSize: number;
  };
}

// Cache Types
export interface CacheConfig {
  provider: 'redis' | 'memory';
  connection: {
    host: string;
    port: number;
    password?: string;
    database?: number;
  };
  defaultTTL: number;
  keyPrefix: string;
}

// Audit & Logging Types
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: number;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// Error Types
export interface RenXError extends Error {
  code: string;
  statusCode: number;
  tenantId?: string;
  userId?: number;
  context?: Record<string, any>;
}

// Utility Types
export type WithTenant<T> = T & { tenantId: string };
export type WithUser<T> = T & { userId: number };
export type WithTimestamps<T> = T & { createdAt: string; updatedAt: string };

// Feature Flag Types
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  conditions?: {
    tenantIds?: string[];
    userRoles?: UserRole[];
    percentage?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Health Check Types
export interface HealthStatus {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  timestamp: string;
  services: {
    database: boolean;
    redis: boolean;
    websocket: boolean;
    ai: boolean;
    notifications: boolean;
  };
  version: string;
  uptime: number;
}

// Additional Types for API Response Validation
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
}

// Remove duplicate definitions - using the earlier WebSocketMessage interface 