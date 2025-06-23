export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  high52Week?: number;
  low52Week?: number;
  avgVolume?: number;
}

export interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  availableCash: number;
  totalReturn: number;
  dailyPnL: number;
  isDefault: boolean;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  assetType: 'stock' | 'crypto' | 'forex' | 'commodity';
}

export interface Order {
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
}

export interface AISignal {
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
}

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  sentimentScore?: number;
  impact?: 'high' | 'medium' | 'low';
  symbols?: string[];
  publishedAt: string;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description?: string;
  parameters: any;
  isActive: boolean;
  performance?: any;
}

export interface BacktestResult {
  id: string;
  totalReturn: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  winRate?: number;
  totalTrades?: number;
  profitFactor?: number;
  results: any;
}

export interface CommunityPost {
  id: string;
  title?: string;
  content: string;
  likes: number;
  replies: number;
  shares: number;
  tags?: string[];
  createdAt: string;
  user: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

export interface RiskMetrics {
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  var95: number;
  concentrationRisk: number;
}

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

export interface MarketInsights {
  insights: string[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  keyEvents: string[];
}

export interface PortfolioRiskAnalysis {
  riskScore: number;
  recommendations: string[];
  diversificationScore: number;
}
