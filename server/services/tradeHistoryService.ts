import { pool } from '../config/database';
import { cacheService } from './cacheService';
import { auditService } from './auditService';

interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  fees: number;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  executedAt: Date;
  createdAt: Date;
  orderId?: string;
  notes?: string;
}

interface TradeFilters {
  userId?: string;
  symbol?: string;
  type?: 'buy' | 'sell';
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: 'executedAt' | 'total' | 'symbol';
  sortOrder?: 'asc' | 'desc';
}

interface TradeAnalytics {
  totalTrades: number;
  totalVolume: number;
  totalFees: number;
  avgTradeSize: number;
  profitLoss: number;
  winRate: number;
  topSymbols: { symbol: string; count: number; volume: number }[];
  monthlyStats: { month: string; trades: number; volume: number }[];
}

interface PerformanceMetrics {
  userId: string;
  period: string;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

export class TradeHistoryService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly DEFAULT_LIMIT = 50;
  private readonly MAX_LIMIT = 1000;

  /**
   * Get trade history with filtering and pagination
   */
  async getTradeHistory(filters: TradeFilters): Promise<{
    trades: Trade[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const page = Math.max(1, filters.page || 1);
      const limit = Math.min(filters.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
      const offset = (page - 1) * limit;

      // Build query
      const { query, countQuery, params } = this.buildTradeQuery(filters, limit, offset);

      // Execute queries in parallel
      const [tradesResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, params.slice(0, -2)) // Remove limit and offset for count
      ]);

      const trades = tradesResult.rows.map(this.mapRowToTrade);
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);

      // Log access
      await auditService.logSecurityEvent({
        type: 'data_access',
        details: {
          action: 'trade_history_access',
          userId: filters.userId,
          filters: JSON.stringify(filters)
        },
        severity: 'low'
      });

      return {
        trades,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error getting trade history:', error);
      throw error;
    }
  }

  /**
   * Get trade by ID
   */
  async getTradeById(tradeId: string, userId: string): Promise<Trade | null> {
    try {
      const cacheKey = `trade:${tradeId}:${userId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        SELECT * FROM trades 
        WHERE id = $1 AND user_id = $2
      `;
      
      const result = await pool.query(query, [tradeId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const trade = this.mapRowToTrade(result.rows[0]);
      
      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(trade), this.CACHE_TTL);
      
      return trade;
    } catch (error) {
      console.error('Error getting trade by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new trade record
   */
  async createTrade(trade: Omit<Trade, 'id' | 'createdAt'>): Promise<Trade> {
    try {
      const query = `
        INSERT INTO trades (
          user_id, symbol, type, quantity, price, total, fees, 
          status, executed_at, order_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        trade.userId,
        trade.symbol,
        trade.type,
        trade.quantity,
        trade.price,
        trade.total,
        trade.fees,
        trade.status,
        trade.executedAt,
        trade.orderId || null,
        trade.notes || null
      ];

      const result = await pool.query(query, values);
      const newTrade = this.mapRowToTrade(result.rows[0]);

      // Log trade creation
      await auditService.logSecurityEvent({
        type: 'trade_execution',
        details: {
          action: 'trade_created',
          tradeId: newTrade.id,
          userId: trade.userId,
          symbol: trade.symbol,
          type: trade.type,
          quantity: trade.quantity,
          total: trade.total
        },
        severity: 'medium'
      });

      return newTrade;
    } catch (error) {
      console.error('Error creating trade:', error);
      throw error;
    }
  }

  /**
   * Update trade status
   */
  async updateTradeStatus(
    tradeId: string, 
    userId: string, 
    status: Trade['status']
  ): Promise<Trade | null> {
    try {
      const query = `
        UPDATE trades 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `;

      const result = await pool.query(query, [status, tradeId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const updatedTrade = this.mapRowToTrade(result.rows[0]);

      // Clear cache
      const cacheKey = `trade:${tradeId}:${userId}`;
      await cacheService.delete(cacheKey);

      // Log status update
      await auditService.logSecurityEvent({
        type: 'trade_execution',
        details: {
          action: 'trade_status_updated',
          tradeId,
          userId,
          newStatus: status
        },
        severity: 'low'
      });

      return updatedTrade;
    } catch (error) {
      console.error('Error updating trade status:', error);
      throw error;
    }
  }

  /**
   * Get trade analytics for a user
   */
  async getTradeAnalytics(userId: string, period?: string): Promise<TradeAnalytics> {
    try {
      const cacheKey = `analytics:${userId}:${period || 'all'}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Build date filter
      let dateFilter = '';
      const params = [userId];
      
      if (period) {
        dateFilter = 'AND executed_at >= $2';
        params.push(this.getPeriodStartDate(period).toISOString());
      }

      // Get basic stats
      const statsQuery = `
        SELECT 
          COUNT(*) as total_trades,
          SUM(total) as total_volume,
          SUM(fees) as total_fees,
          AVG(total) as avg_trade_size,
          COUNT(CASE WHEN type = 'buy' THEN 1 END) as buy_count,
          COUNT(CASE WHEN type = 'sell' THEN 1 END) as sell_count
        FROM trades 
        WHERE user_id = $1 AND status = 'completed' ${dateFilter}
      `;

      // Get top symbols
      const symbolsQuery = `
        SELECT 
          symbol,
          COUNT(*) as count,
          SUM(total) as volume
        FROM trades 
        WHERE user_id = $1 AND status = 'completed' ${dateFilter}
        GROUP BY symbol
        ORDER BY volume DESC
        LIMIT 10
      `;

      // Get monthly stats
      const monthlyQuery = `
        SELECT 
          TO_CHAR(executed_at, 'YYYY-MM') as month,
          COUNT(*) as trades,
          SUM(total) as volume
        FROM trades 
        WHERE user_id = $1 AND status = 'completed' ${dateFilter}
        GROUP BY TO_CHAR(executed_at, 'YYYY-MM')
        ORDER BY month DESC
        LIMIT 12
      `;

      const [statsResult, symbolsResult, monthlyResult] = await Promise.all([
        pool.query(statsQuery, params),
        pool.query(symbolsQuery, params),
        pool.query(monthlyQuery, params)
      ]);

      const stats = statsResult.rows[0];
      const profitLoss = await this.calculateProfitLoss(userId, period);
      const winRate = stats.sell_count > 0 ? 
        (await this.calculateWinRate(userId, period)) : 0;

      const analytics: TradeAnalytics = {
        totalTrades: parseInt(stats.total_trades),
        totalVolume: parseFloat(stats.total_volume) || 0,
        totalFees: parseFloat(stats.total_fees) || 0,
        avgTradeSize: parseFloat(stats.avg_trade_size) || 0,
        profitLoss,
        winRate,
        topSymbols: symbolsResult.rows.map(row => ({
          symbol: row.symbol,
          count: parseInt(row.count),
          volume: parseFloat(row.volume)
        })),
        monthlyStats: monthlyResult.rows.map(row => ({
          month: row.month,
          trades: parseInt(row.trades),
          volume: parseFloat(row.volume)
        }))
      };

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(analytics), this.CACHE_TTL);
      
      return analytics;
    } catch (error) {
      console.error('Error getting trade analytics:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics for a user
   */
  async getPerformanceMetrics(userId: string, period: string = '1y'): Promise<PerformanceMetrics> {
    try {
      const cacheKey = `performance:${userId}:${period}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const startDate = this.getPeriodStartDate(period);
      
      // Get all completed trades for the period
      const tradesQuery = `
        SELECT symbol, type, quantity, price, total, executed_at
        FROM trades 
        WHERE user_id = $1 AND status = 'completed' AND executed_at >= $2
        ORDER BY executed_at ASC
      `;

      const result = await pool.query(tradesQuery, [userId, startDate.toISOString()]);
      const trades = result.rows;

      if (trades.length === 0) {
        return this.getDefaultPerformanceMetrics(userId, period);
      }

      // Calculate performance metrics
      const metrics = await this.calculatePerformanceMetrics(trades, period);
      
      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(metrics), this.CACHE_TTL);
      
      return metrics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Export trade history to CSV
   */
  async exportTradeHistory(userId: string, filters: TradeFilters): Promise<string> {
    try {
      const { trades } = await this.getTradeHistory({ ...filters, userId, limit: 10000 });
      
      const csvHeader = 'Date,Symbol,Type,Quantity,Price,Total,Fees,Status\n';
      const csvRows = trades.map(trade => 
        `${trade.executedAt.toISOString()},${trade.symbol},${trade.type},${trade.quantity},${trade.price},${trade.total},${trade.fees},${trade.status}`
      ).join('\n');

      // Log export
      await auditService.logSecurityEvent({
        type: 'data_export',
        details: {
          action: 'trade_history_export',
          userId,
          recordCount: trades.length
        },
        severity: 'medium'
      });

      return csvHeader + csvRows;
    } catch (error) {
      console.error('Error exporting trade history:', error);
      throw error;
    }
  }

  /**
   * Build trade query with filters
   */
  private buildTradeQuery(filters: TradeFilters, limit: number, offset: number): {
    query: string;
    countQuery: string;
    params: any[];
  } {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }

    if (filters.symbol) {
      conditions.push(`symbol = $${paramIndex++}`);
      params.push(filters.symbol);
    }

    if (filters.type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(filters.type);
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }

    if (filters.dateFrom) {
      conditions.push(`executed_at >= $${paramIndex++}`);
      params.push(filters.dateFrom.toISOString());
    }

    if (filters.dateTo) {
      conditions.push(`executed_at <= $${paramIndex++}`);
      params.push(filters.dateTo.toISOString());
    }

    if (filters.minAmount) {
      conditions.push(`total >= $${paramIndex++}`);
      params.push(filters.minAmount);
    }

    if (filters.maxAmount) {
      conditions.push(`total <= $${paramIndex++}`);
      params.push(filters.maxAmount);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Sorting
    const sortBy = filters.sortBy || 'executedAt';
    const sortOrder = filters.sortOrder || 'desc';
    const orderClause = `ORDER BY ${sortBy} ${sortOrder}`;

    // Build queries
    const baseQuery = `FROM trades ${whereClause}`;
    const query = `SELECT * ${baseQuery} ${orderClause} LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    const countQuery = `SELECT COUNT(*) ${baseQuery}`;

    params.push(limit, offset);

    return { query, countQuery, params };
  }

  /**
   * Map database row to Trade object
   */
  private mapRowToTrade(row: any): Trade {
    return {
      id: row.id,
      userId: row.user_id,
      symbol: row.symbol,
      type: row.type,
      quantity: parseFloat(row.quantity),
      price: parseFloat(row.price),
      total: parseFloat(row.total),
      fees: parseFloat(row.fees),
      status: row.status,
      executedAt: new Date(row.executed_at),
      createdAt: new Date(row.created_at),
      orderId: row.order_id,
      notes: row.notes
    };
  }

  /**
   * Calculate profit/loss for a user
   */
  private async calculateProfitLoss(userId: string, period?: string): Promise<number> {
    // Simplified P&L calculation - would need more complex logic for real trading
    let dateFilter = '';
    const params = [userId];
    
    if (period) {
      dateFilter = 'AND executed_at >= $2';
      params.push(this.getPeriodStartDate(period).toISOString());
    }

    const query = `
      SELECT 
        SUM(CASE WHEN type = 'sell' THEN total ELSE -total END) as profit_loss
      FROM trades 
      WHERE user_id = $1 AND status = 'completed' ${dateFilter}
    `;

    const result = await pool.query(query, params);
    return parseFloat(result.rows[0].profit_loss) || 0;
  }

  /**
   * Calculate win rate for a user
   */
  private async calculateWinRate(userId: string, period?: string): Promise<number> {
    // Simplified win rate calculation
    let dateFilter = '';
    const params = [userId];
    
    if (period) {
      dateFilter = 'AND executed_at >= $2';
      params.push(this.getPeriodStartDate(period).toISOString());
    }

    const query = `
      SELECT 
        COUNT(CASE WHEN type = 'sell' AND total > 0 THEN 1 END) as wins,
        COUNT(CASE WHEN type = 'sell' THEN 1 END) as total_sells
      FROM trades 
      WHERE user_id = $1 AND status = 'completed' ${dateFilter}
    `;

    const result = await pool.query(query, params);
    const { wins, total_sells } = result.rows[0];
    
    return total_sells > 0 ? (parseInt(wins) / parseInt(total_sells)) * 100 : 0;
  }

  /**
   * Calculate performance metrics from trades
   */
  private async calculatePerformanceMetrics(trades: any[], period: string): Promise<PerformanceMetrics> {
    // Simplified performance calculation - would need more sophisticated algorithms
    const totalReturn = trades.reduce((sum, trade) => {
      return sum + (trade.type === 'sell' ? trade.total : -trade.total);
    }, 0);

    const totalInvested = trades
      .filter(trade => trade.type === 'buy')
      .reduce((sum, trade) => sum + trade.total, 0);

    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    
    // Annualized return (simplified)
    const periodMultiplier = this.getPeriodMultiplier(period);
    const annualizedReturn = returnPercentage * periodMultiplier;

    return {
      userId: trades[0]?.user_id || '',
      period,
      totalReturn,
      annualizedReturn,
      sharpeRatio: 0, // Would need risk-free rate and volatility
      maxDrawdown: 0, // Would need to calculate from equity curve
      volatility: 0, // Would need daily returns
      winRate: 0, // Would need to calculate from individual trades
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0
    };
  }

  /**
   * Get default performance metrics
   */
  private getDefaultPerformanceMetrics(userId: string, period: string): PerformanceMetrics {
    return {
      userId,
      period,
      totalReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      volatility: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0
    };
  }

  /**
   * Get start date for period
   */
  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    
    switch (period) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '1w':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '1m':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3m':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6m':
        return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // All time
    }
  }

  /**
   * Get period multiplier for annualized calculations
   */
  private getPeriodMultiplier(period: string): number {
    switch (period) {
      case '1d':
        return 365;
      case '1w':
        return 52;
      case '1m':
        return 12;
      case '3m':
        return 4;
      case '6m':
        return 2;
      case '1y':
        return 1;
      default:
        return 1;
    }
  }
}

export const tradeHistoryService = new TradeHistoryService(); 