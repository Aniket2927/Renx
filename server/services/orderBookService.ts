import { EventEmitter } from 'events';
import { marketDataService } from './marketDataService';
import { cacheService } from './cacheService';
import { auditService } from './auditService';

interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
  orderCount: number;
}

interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercentage: number;
  lastUpdate: Date;
  sequence: number;
}

interface MarketDepth {
  symbol: string;
  totalBidVolume: number;
  totalAskVolume: number;
  bidDepth: number;
  askDepth: number;
  imbalance: number; // Positive = more bids, Negative = more asks
  pressureIndex: number; // Market pressure indicator
}

export class OrderBookService extends EventEmitter {
  private orderBooks: Map<string, OrderBook> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map(); // symbol -> sessionIds
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly UPDATE_FREQUENCY = 500; // 500ms updates
  private readonly CACHE_TTL = 30; // 30 seconds
  private readonly MAX_DEPTH = 20; // Maximum order book depth

  constructor() {
    super();
    this.startCleanupInterval();
  }

  /**
   * Subscribe to order book updates for a symbol
   */
  async subscribeToOrderBook(symbol: string, sessionId: string): Promise<OrderBook> {
    try {
      // Add subscription
      if (!this.subscriptions.has(symbol)) {
        this.subscriptions.set(symbol, new Set());
      }
      this.subscriptions.get(symbol)!.add(sessionId);

      // Get or create order book
      let orderBook = this.orderBooks.get(symbol);
      if (!orderBook) {
        orderBook = await this.initializeOrderBook(symbol);
        this.orderBooks.set(symbol, orderBook);
        this.startOrderBookUpdates(symbol);
      }

      await auditService.logSecurityEvent({
        type: 'data_access',
        details: {
          action: 'orderbook_subscription',
          symbol,
          sessionId
        },
        severity: 'low'
      });

      return orderBook;
    } catch (error) {
      console.error('Error subscribing to order book:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from order book updates
   */
  async unsubscribeFromOrderBook(symbol: string, sessionId: string): Promise<void> {
    try {
      const subscriptions = this.subscriptions.get(symbol);
      if (subscriptions) {
        subscriptions.delete(sessionId);
        
        // If no more subscriptions, stop updates
        if (subscriptions.size === 0) {
          this.stopOrderBookUpdates(symbol);
          this.subscriptions.delete(symbol);
          this.orderBooks.delete(symbol);
        }
      }

      await auditService.logSecurityEvent({
        type: 'data_access',
        details: {
          action: 'orderbook_unsubscription',
          symbol,
          sessionId
        },
        severity: 'low'
      });
    } catch (error) {
      console.error('Error unsubscribing from order book:', error);
    }
  }

  /**
   * Get current order book for a symbol
   */
  async getOrderBook(symbol: string): Promise<OrderBook | null> {
    try {
      // Check cache first
      const cacheKey = `orderbook:${symbol}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get from memory or initialize
      let orderBook = this.orderBooks.get(symbol);
      if (!orderBook) {
        orderBook = await this.initializeOrderBook(symbol);
      }

      // Cache the result
      await cacheService.set(cacheKey, JSON.stringify(orderBook), this.CACHE_TTL);
      
      return orderBook;
    } catch (error) {
      console.error('Error getting order book:', error);
      return null;
    }
  }

  /**
   * Get market depth analysis
   */
  async getMarketDepth(symbol: string): Promise<MarketDepth | null> {
    try {
      const orderBook = await this.getOrderBook(symbol);
      if (!orderBook) return null;

      const totalBidVolume = orderBook.bids.reduce((sum, level) => sum + level.quantity, 0);
      const totalAskVolume = orderBook.asks.reduce((sum, level) => sum + level.quantity, 0);
      
      const bidDepth = orderBook.bids.length;
      const askDepth = orderBook.asks.length;
      
      // Calculate market imbalance (-1 to 1)
      const totalVolume = totalBidVolume + totalAskVolume;
      const imbalance = totalVolume > 0 ? (totalBidVolume - totalAskVolume) / totalVolume : 0;
      
      // Calculate pressure index (0 to 100)
      const pressureIndex = Math.round(((imbalance + 1) / 2) * 100);

      return {
        symbol,
        totalBidVolume,
        totalAskVolume,
        bidDepth,
        askDepth,
        imbalance,
        pressureIndex
      };
    } catch (error) {
      console.error('Error calculating market depth:', error);
      return null;
    }
  }

  /**
   * Initialize order book for a symbol
   */
  private async initializeOrderBook(symbol: string): Promise<OrderBook> {
    try {
      // Get current market data
      const quote = await marketDataService.getStockQuote(symbol);
      
      // Generate realistic order book data
      const orderBook = this.generateOrderBook(symbol, quote.price);
      
      return orderBook;
    } catch (error) {
      console.error('Error initializing order book:', error);
      throw error;
    }
  }

  /**
   * Generate realistic order book data
   */
  private generateOrderBook(symbol: string, currentPrice: number): OrderBook {
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    
    // Generate bid levels (below current price)
    for (let i = 0; i < this.MAX_DEPTH; i++) {
      const priceOffset = (i + 1) * (currentPrice * 0.001); // 0.1% steps
      const price = currentPrice - priceOffset;
      const quantity = this.generateQuantity(i);
      
      bids.push({
        price: Math.round(price * 100) / 100,
        quantity,
        total: price * quantity,
        orderCount: Math.floor(quantity / 100) + 1
      });
    }

    // Generate ask levels (above current price)
    for (let i = 0; i < this.MAX_DEPTH; i++) {
      const priceOffset = (i + 1) * (currentPrice * 0.001); // 0.1% steps
      const price = currentPrice + priceOffset;
      const quantity = this.generateQuantity(i);
      
      asks.push({
        price: Math.round(price * 100) / 100,
        quantity,
        total: price * quantity,
        orderCount: Math.floor(quantity / 100) + 1
      });
    }

    const spread = asks[0].price - bids[0].price;
    const spreadPercentage = (spread / currentPrice) * 100;

    return {
      symbol,
      bids,
      asks,
      spread,
      spreadPercentage,
      lastUpdate: new Date(),
      sequence: Date.now()
    };
  }

  /**
   * Generate realistic quantity for order book level
   */
  private generateQuantity(level: number): number {
    // Larger quantities at better prices (closer to market)
    const baseQuantity = 1000;
    const levelFactor = Math.pow(0.8, level); // Decreasing quantity with distance
    const randomFactor = 0.5 + Math.random(); // Random variation
    
    return Math.round(baseQuantity * levelFactor * randomFactor);
  }

  /**
   * Start real-time updates for order book
   */
  private startOrderBookUpdates(symbol: string): void {
    if (this.updateIntervals.has(symbol)) {
      return; // Already updating
    }

    const interval = setInterval(async () => {
      try {
        await this.updateOrderBook(symbol);
      } catch (error) {
        console.error(`Error updating order book for ${symbol}:`, error);
      }
    }, this.UPDATE_FREQUENCY);

    this.updateIntervals.set(symbol, interval);
  }

  /**
   * Stop real-time updates for order book
   */
  private stopOrderBookUpdates(symbol: string): void {
    const interval = this.updateIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(symbol);
    }
  }

  /**
   * Update order book with new data
   */
  private async updateOrderBook(symbol: string): Promise<void> {
    try {
      const orderBook = this.orderBooks.get(symbol);
      if (!orderBook) return;

      // Get latest market data
      const quote = await marketDataService.getStockQuote(symbol);
      
      // Update order book with small random changes
      this.simulateOrderBookChanges(orderBook, quote.price);
      
      // Update cache
      const cacheKey = `orderbook:${symbol}`;
      await cacheService.set(cacheKey, JSON.stringify(orderBook), this.CACHE_TTL);
      
      // Emit update event
      this.emit('orderBookUpdate', symbol, orderBook);
      
    } catch (error) {
      console.error('Error updating order book:', error);
    }
  }

  /**
   * Simulate realistic order book changes
   */
  private simulateOrderBookChanges(orderBook: OrderBook, currentPrice: number): void {
    // Update sequence number
    orderBook.sequence = Date.now();
    orderBook.lastUpdate = new Date();

    // Randomly modify some levels
    const changeCount = Math.floor(Math.random() * 5) + 1; // 1-5 changes
    
    for (let i = 0; i < changeCount; i++) {
      // Randomly choose bid or ask
      const isBid = Math.random() < 0.5;
      const levels = isBid ? orderBook.bids : orderBook.asks;
      
      if (levels.length > 0) {
        const levelIndex = Math.floor(Math.random() * Math.min(5, levels.length)); // Top 5 levels
        const level = levels[levelIndex];
        
        // Randomly change quantity (±20%)
        const change = (Math.random() - 0.5) * 0.4; // -0.2 to +0.2
        level.quantity = Math.max(100, Math.round(level.quantity * (1 + change)));
        level.total = level.price * level.quantity;
        level.orderCount = Math.floor(level.quantity / 100) + 1;
      }
    }

    // Recalculate spread
    if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
      orderBook.spread = orderBook.asks[0].price - orderBook.bids[0].price;
      orderBook.spreadPercentage = (orderBook.spread / currentPrice) * 100;
    }
  }

  /**
   * Start cleanup interval for expired subscriptions
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredSubscriptions();
    }, 60000); // Cleanup every minute
  }

  /**
   * Cleanup expired subscriptions and order books
   */
  private cleanupExpiredSubscriptions(): void {
    for (const [symbol, subscriptions] of this.subscriptions.entries()) {
      if (subscriptions.size === 0) {
        this.stopOrderBookUpdates(symbol);
        this.subscriptions.delete(symbol);
        this.orderBooks.delete(symbol);
      }
    }
  }

  /**
   * Get all active subscriptions
   */
  getActiveSubscriptions(): { symbol: string; subscriberCount: number }[] {
    const result: { symbol: string; subscriberCount: number }[] = [];
    
    for (const [symbol, subscriptions] of this.subscriptions.entries()) {
      result.push({
        symbol,
        subscriberCount: subscriptions.size
      });
    }
    
    return result;
  }

  /**
   * Cleanup all subscriptions and intervals
   */
  cleanup(): void {
    // Clear all intervals
    for (const interval of this.updateIntervals.values()) {
      clearInterval(interval);
    }
    
    // Clear all data
    this.updateIntervals.clear();
    this.subscriptions.clear();
    this.orderBooks.clear();
    
    // Remove all listeners
    this.removeAllListeners();
  }
}

export const orderBookService = new OrderBookService();
