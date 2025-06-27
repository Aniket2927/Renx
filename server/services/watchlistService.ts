import { pool } from '../config/database';
import { EventEmitter } from 'events';
import { marketDataService } from './marketDataService';
import { cacheService } from './cacheService';
import { auditService } from './auditService';

interface Watchlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  color: string;
  symbols: WatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedAt: Date;
  notes?: string;
  targetPrice?: number;
  stopLoss?: number;
  alertEnabled: boolean;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdate: Date;
}

interface WatchlistAlert {
  id: string;
  userId: string;
  watchlistId: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_spike' | 'price_change';
  condition: {
    value: number;
    operator: 'gt' | 'lt' | 'gte' | 'lte';
  };
  isActive: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}

interface WatchlistPerformance {
  watchlistId: string;
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  topGainer: { symbol: string; changePercent: number };
  topLoser: { symbol: string; changePercent: number };
  mostActive: { symbol: string; volume: number };
  symbolCount: number;
  lastUpdate: Date;
}

export class WatchlistService extends EventEmitter {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly UPDATE_INTERVAL = 30000; // 30 seconds
  private updateTimer?: NodeJS.Timeout;
  private readonly MAX_WATCHLISTS_PER_USER = 10;
  private readonly MAX_SYMBOLS_PER_WATCHLIST = 100;

  constructor() {
    super();
    this.startPeriodicUpdates();
  }

  /**
   * Get all watchlists for a user
   */
  async getUserWatchlists(userId: string): Promise<Watchlist[]> {
    try {
      const cacheKey = `watchlists:${userId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        SELECT w.*, 
               json_agg(
                 json_build_object(
                   'id', wi.id,
                   'symbol', wi.symbol,
                   'name', wi.name,
                   'addedAt', wi.added_at,
                   'notes', wi.notes,
                   'targetPrice', wi.target_price,
                   'stopLoss', wi.stop_loss,
                   'alertEnabled', wi.alert_enabled
                 ) ORDER BY wi.added_at DESC
               ) as symbols
        FROM watchlists w
        LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
        WHERE w.user_id = $1
        GROUP BY w.id
        ORDER BY w.is_default DESC, w.created_at ASC
      `;

      const result = await pool.query(query, [userId]);
      const watchlists = await Promise.all(
        result.rows.map(row => this.mapRowToWatchlist(row))
      );

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(watchlists), this.CACHE_TTL);

      return watchlists;
    } catch (error) {
      console.error('Error getting user watchlists:', error);
      throw error;
    }
  }

  /**
   * Get a specific watchlist
   */
  async getWatchlist(watchlistId: string, userId: string): Promise<Watchlist | null> {
    try {
      const cacheKey = `watchlist:${watchlistId}:${userId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        SELECT w.*, 
               json_agg(
                 json_build_object(
                   'id', wi.id,
                   'symbol', wi.symbol,
                   'name', wi.name,
                   'addedAt', wi.added_at,
                   'notes', wi.notes,
                   'targetPrice', wi.target_price,
                   'stopLoss', wi.stop_loss,
                   'alertEnabled', wi.alert_enabled
                 ) ORDER BY wi.added_at DESC
               ) as symbols
        FROM watchlists w
        LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
        WHERE w.id = $1 AND (w.user_id = $2 OR w.is_public = true)
        GROUP BY w.id
      `;

      const result = await pool.query(query, [watchlistId, userId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const watchlist = await this.mapRowToWatchlist(result.rows[0]);

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(watchlist), this.CACHE_TTL);

      return watchlist;
    } catch (error) {
      console.error('Error getting watchlist:', error);
      throw error;
    }
  }

  /**
   * Create a new watchlist
   */
  async createWatchlist(
    userId: string,
    name: string,
    options: {
      description?: string;
      isDefault?: boolean;
      isPublic?: boolean;
      color?: string;
    } = {}
  ): Promise<Watchlist> {
    try {
      // Check if user has reached the limit
      const existingWatchlists = await this.getUserWatchlists(userId);
      if (existingWatchlists.length >= this.MAX_WATCHLISTS_PER_USER) {
        throw new Error(`Maximum ${this.MAX_WATCHLISTS_PER_USER} watchlists allowed per user`);
      }

      // If this is set as default, remove default from other watchlists
      if (options.isDefault) {
        await pool.query(
          'UPDATE watchlists SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      const query = `
        INSERT INTO watchlists (
          user_id, name, description, is_default, is_public, color
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        userId,
        name,
        options.description || null,
        options.isDefault || false,
        options.isPublic || false,
        options.color || '#3B82F6'
      ];

      const result = await pool.query(query, values);
      const watchlist = await this.mapRowToWatchlist(result.rows[0]);

      // Clear cache
      await cacheService.delete(`watchlists:${userId}`);

      // Log creation
      await auditService.logSecurityEvent({
        type: 'data_modification',
        details: {
          action: 'watchlist_created',
          watchlistId: watchlist.id,
          userId,
          name
        },
        severity: 'low'
      });

      return watchlist;
    } catch (error) {
      console.error('Error creating watchlist:', error);
      throw error;
    }
  }

  /**
   * Update a watchlist
   */
  async updateWatchlist(
    watchlistId: string,
    userId: string,
    updates: {
      name?: string;
      description?: string;
      isDefault?: boolean;
      isPublic?: boolean;
      color?: string;
    }
  ): Promise<Watchlist | null> {
    try {
      // Check ownership
      const existing = await this.getWatchlist(watchlistId, userId);
      if (!existing || existing.userId !== userId) {
        return null;
      }

      // If setting as default, remove default from other watchlists
      if (updates.isDefault) {
        await pool.query(
          'UPDATE watchlists SET is_default = false WHERE user_id = $1 AND id != $2',
          [userId, watchlistId]
        );
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(updates.description);
      }
      if (updates.isDefault !== undefined) {
        updateFields.push(`is_default = $${paramIndex++}`);
        values.push(updates.isDefault);
      }
      if (updates.isPublic !== undefined) {
        updateFields.push(`is_public = $${paramIndex++}`);
        values.push(updates.isPublic);
      }
      if (updates.color !== undefined) {
        updateFields.push(`color = $${paramIndex++}`);
        values.push(updates.color);
      }

      if (updateFields.length === 0) {
        return existing;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(watchlistId, userId);

      const query = `
        UPDATE watchlists 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      const updatedWatchlist = await this.mapRowToWatchlist(result.rows[0]);

      // Clear cache
      await cacheService.delete(`watchlist:${watchlistId}:${userId}`);
      await cacheService.delete(`watchlists:${userId}`);

      return updatedWatchlist;
    } catch (error) {
      console.error('Error updating watchlist:', error);
      throw error;
    }
  }

  /**
   * Delete a watchlist
   */
  async deleteWatchlist(watchlistId: string, userId: string): Promise<boolean> {
    try {
      // Check ownership
      const existing = await this.getWatchlist(watchlistId, userId);
      if (!existing || existing.userId !== userId) {
        return false;
      }

      // Delete watchlist and all its items (cascade)
      const result = await pool.query(
        'DELETE FROM watchlists WHERE id = $1 AND user_id = $2',
        [watchlistId, userId]
      );

      if (result.rowCount === 0) {
        return false;
      }

      // Clear cache
      await cacheService.delete(`watchlist:${watchlistId}:${userId}`);
      await cacheService.delete(`watchlists:${userId}`);

      // Log deletion
      await auditService.logSecurityEvent({
        type: 'data_modification',
        details: {
          action: 'watchlist_deleted',
          watchlistId,
          userId
        },
        severity: 'medium'
      });

      return true;
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      throw error;
    }
  }

  /**
   * Add symbol to watchlist
   */
  async addSymbolToWatchlist(
    watchlistId: string,
    userId: string,
    symbol: string,
    options: {
      notes?: string;
      targetPrice?: number;
      stopLoss?: number;
      alertEnabled?: boolean;
    } = {}
  ): Promise<WatchlistItem | null> {
    try {
      // Check ownership and limits
      const watchlist = await this.getWatchlist(watchlistId, userId);
      if (!watchlist || watchlist.userId !== userId) {
        return null;
      }

      if (watchlist.symbols.length >= this.MAX_SYMBOLS_PER_WATCHLIST) {
        throw new Error(`Maximum ${this.MAX_SYMBOLS_PER_WATCHLIST} symbols allowed per watchlist`);
      }

      // Check if symbol already exists
      const existingSymbol = watchlist.symbols.find(s => s.symbol === symbol.toUpperCase());
      if (existingSymbol) {
        throw new Error('Symbol already exists in watchlist');
      }

      // Get symbol name from market data
      const quote = await marketDataService.getStockQuote(symbol);
      
      const query = `
        INSERT INTO watchlist_items (
          watchlist_id, symbol, name, notes, target_price, stop_loss, alert_enabled
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [
        watchlistId,
        symbol.toUpperCase(),
        quote.name || symbol.toUpperCase(),
        options.notes || null,
        options.targetPrice || null,
        options.stopLoss || null,
        options.alertEnabled || false
      ];

      const result = await pool.query(query, values);
      const item = this.mapRowToWatchlistItem(result.rows[0]);

      // Update with current market data
      item.currentPrice = quote.price;
      item.change = quote.change;
      item.changePercent = quote.changePercent;
      item.volume = quote.volume;
      item.lastUpdate = new Date();

      // Clear cache
      await cacheService.delete(`watchlist:${watchlistId}:${userId}`);
      await cacheService.delete(`watchlists:${userId}`);

      // Log addition
      await auditService.logSecurityEvent({
        type: 'data_modification',
        details: {
          action: 'symbol_added_to_watchlist',
          watchlistId,
          userId,
          symbol
        },
        severity: 'low'
      });

      return item;
    } catch (error) {
      console.error('Error adding symbol to watchlist:', error);
      throw error;
    }
  }

  /**
   * Remove symbol from watchlist
   */
  async removeSymbolFromWatchlist(
    watchlistId: string,
    userId: string,
    symbol: string
  ): Promise<boolean> {
    try {
      // Check ownership
      const watchlist = await this.getWatchlist(watchlistId, userId);
      if (!watchlist || watchlist.userId !== userId) {
        return false;
      }

      const result = await pool.query(
        'DELETE FROM watchlist_items WHERE watchlist_id = $1 AND symbol = $2',
        [watchlistId, symbol.toUpperCase()]
      );

      if (result.rowCount === 0) {
        return false;
      }

      // Clear cache
      await cacheService.delete(`watchlist:${watchlistId}:${userId}`);
      await cacheService.delete(`watchlists:${userId}`);

      return true;
    } catch (error) {
      console.error('Error removing symbol from watchlist:', error);
      throw error;
    }
  }

  /**
   * Update watchlist item
   */
  async updateWatchlistItem(
    watchlistId: string,
    userId: string,
    symbol: string,
    updates: {
      notes?: string;
      targetPrice?: number;
      stopLoss?: number;
      alertEnabled?: boolean;
    }
  ): Promise<WatchlistItem | null> {
    try {
      // Check ownership
      const watchlist = await this.getWatchlist(watchlistId, userId);
      if (!watchlist || watchlist.userId !== userId) {
        return null;
      }

      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex++}`);
        values.push(updates.notes);
      }
      if (updates.targetPrice !== undefined) {
        updateFields.push(`target_price = $${paramIndex++}`);
        values.push(updates.targetPrice);
      }
      if (updates.stopLoss !== undefined) {
        updateFields.push(`stop_loss = $${paramIndex++}`);
        values.push(updates.stopLoss);
      }
      if (updates.alertEnabled !== undefined) {
        updateFields.push(`alert_enabled = $${paramIndex++}`);
        values.push(updates.alertEnabled);
      }

      if (updateFields.length === 0) {
        return null;
      }

      values.push(watchlistId, symbol.toUpperCase());

      const query = `
        UPDATE watchlist_items 
        SET ${updateFields.join(', ')}
        WHERE watchlist_id = $${paramIndex++} AND symbol = $${paramIndex++}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      const item = this.mapRowToWatchlistItem(result.rows[0]);

      // Clear cache
      await cacheService.delete(`watchlist:${watchlistId}:${userId}`);
      await cacheService.delete(`watchlists:${userId}`);

      return item;
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      throw error;
    }
  }

  /**
   * Get watchlist performance
   */
  async getWatchlistPerformance(watchlistId: string, userId: string): Promise<WatchlistPerformance | null> {
    try {
      const cacheKey = `watchlist_performance:${watchlistId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const watchlist = await this.getWatchlist(watchlistId, userId);
      if (!watchlist) {
        return null;
      }

      const symbols = watchlist.symbols;
      if (symbols.length === 0) {
        return {
          watchlistId,
          totalValue: 0,
          totalChange: 0,
          totalChangePercent: 0,
          topGainer: { symbol: '', changePercent: 0 },
          topLoser: { symbol: '', changePercent: 0 },
          mostActive: { symbol: '', volume: 0 },
          symbolCount: 0,
          lastUpdate: new Date()
        };
      }

      // Calculate performance metrics
      const totalValue = symbols.reduce((sum, s) => sum + s.currentPrice, 0);
      const totalChange = symbols.reduce((sum, s) => sum + s.change, 0);
      const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

      const topGainer = symbols.reduce((max, s) => 
        s.changePercent > max.changePercent ? s : max
      );

      const topLoser = symbols.reduce((min, s) => 
        s.changePercent < min.changePercent ? s : min
      );

      const mostActive = symbols.reduce((max, s) => 
        s.volume > max.volume ? s : max
      );

      const performance: WatchlistPerformance = {
        watchlistId,
        totalValue,
        totalChange,
        totalChangePercent,
        topGainer: { symbol: topGainer.symbol, changePercent: topGainer.changePercent },
        topLoser: { symbol: topLoser.symbol, changePercent: topLoser.changePercent },
        mostActive: { symbol: mostActive.symbol, volume: mostActive.volume },
        symbolCount: symbols.length,
        lastUpdate: new Date()
      };

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(performance), this.CACHE_TTL);

      return performance;
    } catch (error) {
      console.error('Error getting watchlist performance:', error);
      return null;
    }
  }

  /**
   * Get public watchlists
   */
  async getPublicWatchlists(limit: number = 20): Promise<Watchlist[]> {
    try {
      const cacheKey = `public_watchlists:${limit}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const query = `
        SELECT w.*, u.username,
               json_agg(
                 json_build_object(
                   'id', wi.id,
                   'symbol', wi.symbol,
                   'name', wi.name,
                   'addedAt', wi.added_at
                 ) ORDER BY wi.added_at DESC
               ) as symbols
        FROM watchlists w
        JOIN users u ON w.user_id = u.id
        LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
        WHERE w.is_public = true
        GROUP BY w.id, u.username
        ORDER BY w.created_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      const watchlists = await Promise.all(
        result.rows.map(row => this.mapRowToWatchlist(row))
      );

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(watchlists), this.CACHE_TTL * 2);

      return watchlists;
    } catch (error) {
      console.error('Error getting public watchlists:', error);
      return [];
    }
  }

  /**
   * Start periodic updates for watchlist data
   */
  private startPeriodicUpdates(): void {
    this.updateTimer = setInterval(async () => {
      try {
        await this.updateWatchlistData();
      } catch (error) {
        console.error('Error updating watchlist data:', error);
      }
    }, this.UPDATE_INTERVAL);
  }

  /**
   * Update market data for all watchlist symbols
   */
  private async updateWatchlistData(): Promise<void> {
    try {
      // Get all unique symbols from all watchlists
      const symbolsQuery = `
        SELECT DISTINCT symbol FROM watchlist_items
      `;
      
      const result = await pool.query(symbolsQuery);
      const symbols = result.rows.map(row => row.symbol);

      if (symbols.length === 0) return;

      // Update market data in batches
      const batchSize = 10;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async symbol => {
          try {
            const quote = await marketDataService.getStockQuote(symbol);
            
            // Emit update event for real-time updates
            this.emit('symbolUpdate', {
              symbol,
              price: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
              volume: quote.volume,
              lastUpdate: new Date()
            });
            
          } catch (error) {
            console.error(`Error updating ${symbol}:`, error);
          }
        }));

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Clear performance caches
      const performanceCacheKeys = await cacheService.getKeys('watchlist_performance:*');
      if (performanceCacheKeys.length > 0) {
        await Promise.all(performanceCacheKeys.map(key => cacheService.delete(key)));
      }

    } catch (error) {
      console.error('Error in periodic watchlist update:', error);
    }
  }

  /**
   * Map database row to Watchlist object
   */
  private async mapRowToWatchlist(row: any): Promise<Watchlist> {
    const symbols = row.symbols && row.symbols[0] && row.symbols[0].id ? 
      await Promise.all(row.symbols.map(async (symbolData: any) => {
        const item = this.mapRowToWatchlistItem(symbolData);
        
        // Get current market data
        try {
          const quote = await marketDataService.getStockQuote(item.symbol);
          item.currentPrice = quote.price;
          item.change = quote.change;
          item.changePercent = quote.changePercent;
          item.volume = quote.volume;
          item.lastUpdate = new Date();
        } catch (error) {
          // Use default values if market data unavailable
          item.currentPrice = 0;
          item.change = 0;
          item.changePercent = 0;
          item.volume = 0;
          item.lastUpdate = new Date();
        }
        
        return item;
      })) : [];

    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      isDefault: row.is_default,
      isPublic: row.is_public,
      color: row.color,
      symbols,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  /**
   * Map database row to WatchlistItem object
   */
  private mapRowToWatchlistItem(row: any): WatchlistItem {
    return {
      id: row.id,
      symbol: row.symbol,
      name: row.name,
      addedAt: new Date(row.addedAt || row.added_at),
      notes: row.notes,
      targetPrice: row.targetPrice || row.target_price,
      stopLoss: row.stopLoss || row.stop_loss,
      alertEnabled: row.alertEnabled || row.alert_enabled,
      currentPrice: 0, // Will be updated with market data
      change: 0,
      changePercent: 0,
      volume: 0,
      lastUpdate: new Date()
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
    this.removeAllListeners();
  }
}

export const watchlistService = new WatchlistService(); 