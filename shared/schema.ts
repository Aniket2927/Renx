import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading portfolios
export const portfolios = pgTable("portfolios", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull().default("0"),
  availableCash: decimal("available_cash", { precision: 15, scale: 2 }).notNull().default("0"),
  totalReturn: decimal("total_return", { precision: 15, scale: 2 }).notNull().default("0"),
  dailyPnL: decimal("daily_pnl", { precision: 15, scale: 2 }).notNull().default("0"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock positions
export const positions = pgTable("positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  portfolioId: uuid("portfolio_id").notNull().references(() => portfolios.id),
  symbol: varchar("symbol").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 8 }).notNull(),
  averageCost: decimal("average_cost", { precision: 15, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 2 }).notNull().default("0"),
  marketValue: decimal("market_value", { precision: 15, scale: 2 }).notNull().default("0"),
  unrealizedPnL: decimal("unrealized_pnl", { precision: 15, scale: 2 }).notNull().default("0"),
  assetType: varchar("asset_type").notNull(), // 'stock', 'crypto', 'forex', 'commodity'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trading orders
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  portfolioId: uuid("portfolio_id").notNull().references(() => portfolios.id),
  symbol: varchar("symbol").notNull(),
  side: varchar("side").notNull(), // 'buy', 'sell'
  orderType: varchar("order_type").notNull(), // 'market', 'limit', 'stop', 'stop_limit'
  quantity: decimal("quantity", { precision: 15, scale: 8 }).notNull(),
  price: decimal("price", { precision: 15, scale: 2 }),
  stopPrice: decimal("stop_price", { precision: 15, scale: 2 }),
  status: varchar("status").notNull().default("pending"), // 'pending', 'filled', 'cancelled', 'rejected'
  filledQuantity: decimal("filled_quantity", { precision: 15, scale: 8 }).notNull().default("0"),
  filledPrice: decimal("filled_price", { precision: 15, scale: 2 }),
  timeInForce: varchar("time_in_force").notNull().default("day"), // 'day', 'gtc', 'ioc', 'fok'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced AI trading signals for multi-asset support
export const aiSignals = pgTable("ai_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  symbol: varchar("symbol").notNull(),
  assetClass: varchar("asset_class").notNull(), // 'stocks', 'forex', 'crypto', 'commodities', 'options', 'etf', 'bonds'
  exchange: varchar("exchange"), // 'NYSE', 'NASDAQ', 'BINANCE', 'FOREX', etc.
  action: varchar("action").notNull(), // 'buy', 'sell', 'hold'
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  currentPrice: decimal("current_price", { precision: 15, scale: 6 }).notNull(),
  targetPrice: decimal("target_price", { precision: 15, scale: 6 }),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 6 }),
  reasoning: text("reasoning"),
  patterns: jsonb("patterns"), // Chart patterns detected (40+ patterns)
  technicalIndicators: jsonb("technical_indicators"), // RSI, MACD, Bollinger Bands, etc.
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }), // -100 to +100
  impactLevel: varchar("impact_level"), // 'low', 'medium', 'high'
  riskLevel: varchar("risk_level"), // 'low', 'medium', 'high'
  timeFrame: varchar("time_frame"), // '1m', '5m', '1h', '1d', '1w'
  modelVersion: varchar("model_version"), // AI model version used
  backtestAccuracy: decimal("backtest_accuracy", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Watchlists
export const watchlists = pgTable("watchlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  symbols: text("symbols").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// News articles with sentiment
export const newsArticles = pgTable("news_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title").notNull(),
  content: text("content"),
  summary: text("summary"),
  source: varchar("source").notNull(),
  url: varchar("url"),
  sentiment: varchar("sentiment"), // 'bullish', 'bearish', 'neutral'
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }),
  impact: varchar("impact"), // 'high', 'medium', 'low'
  symbols: text("symbols").array(),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Trading strategies
export const tradingStrategies = pgTable("trading_strategies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  parameters: jsonb("parameters"),
  isActive: boolean("is_active").notNull().default(false),
  performance: jsonb("performance"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Backtest results
export const backtestResults = pgTable("backtest_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  strategyId: uuid("strategy_id").notNull().references(() => tradingStrategies.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  initialCapital: decimal("initial_capital", { precision: 15, scale: 2 }).notNull(),
  finalValue: decimal("final_value", { precision: 15, scale: 2 }).notNull(),
  totalReturn: decimal("total_return", { precision: 10, scale: 4 }).notNull(),
  sharpeRatio: decimal("sharpe_ratio", { precision: 10, scale: 4 }),
  maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 4 }),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }),
  totalTrades: integer("total_trades"),
  profitFactor: decimal("profit_factor", { precision: 10, scale: 4 }),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community posts
export const communityPosts = pgTable("community_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title"),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  replies: integer("replies").notNull().default(0),
  shares: integer("shares").notNull().default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Automated Trading Bots
export const tradingBots = pgTable("trading_bots", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  assetClasses: text("asset_classes").array(), // ['stocks', 'forex', 'crypto']
  strategy: jsonb("strategy").notNull(), // Strategy configuration
  riskParameters: jsonb("risk_parameters"), // Stop-loss, position sizing
  isActive: boolean("is_active").notNull().default(false),
  isAutomated: boolean("is_automated").notNull().default(false),
  maxPositions: integer("max_positions").default(5),
  maxRiskPerTrade: decimal("max_risk_per_trade", { precision: 5, scale: 2 }).default("2.0"),
  totalPnL: decimal("total_pnl", { precision: 15, scale: 2 }).default("0"),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).default("0"),
  totalTrades: integer("total_trades").default(0),
  performance: jsonb("performance"), // Detailed performance metrics
  modelVersion: varchar("model_version"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market Data Cache for real-time feeds
export const marketData = pgTable("market_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  symbol: varchar("symbol").notNull(),
  assetClass: varchar("asset_class").notNull(),
  exchange: varchar("exchange"),
  price: decimal("price", { precision: 15, scale: 6 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 2 }),
  change: decimal("change", { precision: 15, scale: 6 }),
  changePercent: decimal("change_percent", { precision: 10, scale: 4 }),
  high: decimal("high", { precision: 15, scale: 6 }),
  low: decimal("low", { precision: 15, scale: 6 }),
  open: decimal("open", { precision: 15, scale: 6 }),
  close: decimal("close", { precision: 15, scale: 6 }),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  technicalIndicators: jsonb("technical_indicators"),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Analytics and Screening Results
export const screeningResults = pgTable("screening_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  criteria: jsonb("criteria").notNull(), // Screening criteria
  results: jsonb("results").notNull(), // Array of matching symbols
  assetClasses: text("asset_classes").array(),
  timeFrame: varchar("time_frame"),
  totalMatches: integer("total_matches").default(0),
  isScheduled: boolean("is_scheduled").default(false),
  scheduleInterval: varchar("schedule_interval"), // 'daily', 'hourly', 'real-time'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk Events and Alerts
export const riskAlerts = pgTable("risk_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  portfolioId: uuid("portfolio_id").references(() => portfolios.id),
  type: varchar("type").notNull(), // 'margin_call', 'stop_loss', 'volatility', 'concentration'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  symbol: varchar("symbol"),
  message: text("message").notNull(),
  data: jsonb("data"), // Additional alert data
  isRead: boolean("is_read").default(false),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Option Chain Data
export const optionsData = pgTable("options_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  underlyingSymbol: varchar("underlying_symbol").notNull(),
  strike: decimal("strike", { precision: 15, scale: 2 }).notNull(),
  expiration: timestamp("expiration").notNull(),
  optionType: varchar("option_type").notNull(), // 'call', 'put'
  bid: decimal("bid", { precision: 15, scale: 4 }),
  ask: decimal("ask", { precision: 15, scale: 4 }),
  lastPrice: decimal("last_price", { precision: 15, scale: 4 }),
  volume: integer("volume"),
  openInterest: integer("open_interest"),
  impliedVolatility: decimal("implied_volatility", { precision: 10, scale: 6 }),
  delta: decimal("delta", { precision: 10, scale: 6 }),
  gamma: decimal("gamma", { precision: 10, scale: 6 }),
  theta: decimal("theta", { precision: 10, scale: 6 }),
  vega: decimal("vega", { precision: 10, scale: 6 }),
  rho: decimal("rho", { precision: 10, scale: 6 }),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Copy Trading Relationships
export const copyTradingRelations = pgTable("copy_trading_relations", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  leaderId: varchar("leader_id").notNull().references(() => users.id),
  botId: uuid("bot_id").references(() => tradingBots.id),
  allocationPercentage: decimal("allocation_percentage", { precision: 5, scale: 2 }).default("100"),
  maxCopyAmount: decimal("max_copy_amount", { precision: 15, scale: 2 }),
  isActive: boolean("is_active").default(true),
  totalCopiedTrades: integer("total_copied_trades").default(0),
  totalPnL: decimal("total_pnl", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertPortfolio = typeof portfolios.$inferInsert;
export type Portfolio = typeof portfolios.$inferSelect;

export type InsertPosition = typeof positions.$inferInsert;
export type Position = typeof positions.$inferSelect;

export type InsertOrder = typeof orders.$inferInsert;
export type Order = typeof orders.$inferSelect;

export type InsertAISignal = typeof aiSignals.$inferInsert;
export type AISignal = typeof aiSignals.$inferSelect;

export type InsertWatchlist = typeof watchlists.$inferInsert;
export type Watchlist = typeof watchlists.$inferSelect;

export type InsertNewsArticle = typeof newsArticles.$inferInsert;
export type NewsArticle = typeof newsArticles.$inferSelect;

export type InsertTradingStrategy = typeof tradingStrategies.$inferInsert;
export type TradingStrategy = typeof tradingStrategies.$inferSelect;

export type InsertBacktestResult = typeof backtestResults.$inferInsert;
export type BacktestResult = typeof backtestResults.$inferSelect;

export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertTradingBot = typeof tradingBots.$inferInsert;
export type TradingBot = typeof tradingBots.$inferSelect;

export type InsertMarketData = typeof marketData.$inferInsert;
export type MarketData = typeof marketData.$inferSelect;

export type InsertScreeningResult = typeof screeningResults.$inferInsert;
export type ScreeningResult = typeof screeningResults.$inferSelect;

export type InsertRiskAlert = typeof riskAlerts.$inferInsert;
export type RiskAlert = typeof riskAlerts.$inferSelect;

export type InsertOptionsData = typeof optionsData.$inferInsert;
export type OptionsData = typeof optionsData.$inferSelect;

export type InsertCopyTradingRelation = typeof copyTradingRelations.$inferInsert;
export type CopyTradingRelation = typeof copyTradingRelations.$inferSelect;

// Zod schemas for validation
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPositionSchema = createInsertSchema(positions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWatchlistSchema = createInsertSchema(watchlists).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTradingStrategySchema = createInsertSchema(tradingStrategies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTradingBotSchema = createInsertSchema(tradingBots).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScreeningResultSchema = createInsertSchema(screeningResults).omit({ id: true, createdAt: true, updatedAt: true });
