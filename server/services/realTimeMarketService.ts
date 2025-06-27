import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { twelveDataAPI } from './marketDataService';
import { cacheService } from './cacheService';
import { getWebSocketService } from './websocketService';

interface MarketDataSubscription {
  symbol: string;
  interval: number;
  lastUpdate: number;
  subscribers: Set<string>;
}

interface RealTimeQuote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export class RealTimeMarketService extends EventEmitter {
  private subscriptions: Map<string, MarketDataSubscription> = new Map();
  private wsConnection: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  
  // Rate limiting
  private rateLimiter: Map<string, number> = new Map();
  private readonly MAX_REQUESTS_PER_MINUTE = 60;
  
  constructor() {
    super();
    this.initializeService();
  }
  
  private async initializeService() {
    // Start periodic updates for subscribed symbols
    this.startPeriodicUpdates();
    
    // Initialize WebSocket connection for real-time data
    await this.connectWebSocket();
  }
  
  private async connectWebSocket() {
    try {
      const wsUrl = process.env.TWELVE_DATA_WS_URL || 'wss://ws.twelvedata.com/v1/quotes/price';
      const apiKey = process.env.TWELVE_DATA_API_KEY;
      
      if (!apiKey) {
        console.error('TwelveData API key not configured');
        return;
      }
      
      this.wsConnection = new WebSocket(`${wsUrl}?apikey=${apiKey}`);
      
      this.wsConnection.on('open', () => {
        console.log('✅ WebSocket connected to TwelveData');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        
        // Re-subscribe to all symbols
        this.subscriptions.forEach((_, symbol) => {
          this.subscribeToWebSocket(symbol);
        });
      });
      
      this.wsConnection.on('message', (data: WebSocket.Data) => {
        this.handleWebSocketMessage(data);
      });
      
      this.wsConnection.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
      
      this.wsConnection.on('close', () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.stopHeartbeat();
        this.handleReconnect();
      });
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.handleReconnect();
    }
  }
  
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connectWebSocket(), this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection-failed');
    }
  }
  
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({ action: 'heartbeat' }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }
  
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private subscribeToWebSocket(symbol: string) {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        action: 'subscribe',
        params: {
          symbols: symbol
        }
      }));
    }
  }
  
  private unsubscribeFromWebSocket(symbol: string) {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        action: 'unsubscribe',
        params: {
          symbols: symbol
        }
      }));
    }
  }
  
  private async handleWebSocketMessage(data: WebSocket.Data) {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.event === 'price') {
        const quote = this.transformWebSocketData(message);
        await this.updateMarketData(quote.symbol, quote);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }
  
  private transformWebSocketData(data: any): RealTimeQuote {
    return {
      symbol: data.symbol,
      price: parseFloat(data.price || 0),
      bid: parseFloat(data.bid || data.price || 0),
      ask: parseFloat(data.ask || data.price || 0),
      volume: parseInt(data.volume || 0),
      change: parseFloat(data.change || 0),
      changePercent: parseFloat(data.percent_change || 0),
      high: parseFloat(data.high || data.price || 0),
      low: parseFloat(data.low || data.price || 0),
      open: parseFloat(data.open || data.price || 0),
      previousClose: parseFloat(data.previous_close || data.price || 0),
      timestamp: new Date().toISOString()
    };
  }
  
  private startPeriodicUpdates() {
    // Update market data every 5 seconds for subscribed symbols
    this.updateInterval = setInterval(() => {
      this.updateAllSubscriptions();
    }, 5000);
  }
  
  private async updateAllSubscriptions() {
    const symbolsToUpdate: string[] = [];
    const now = Date.now();
    
    this.subscriptions.forEach((subscription, symbol) => {
      if (now - subscription.lastUpdate >= subscription.interval) {
        symbolsToUpdate.push(symbol);
      }
    });
    
    if (symbolsToUpdate.length > 0) {
      await this.batchUpdateSymbols(symbolsToUpdate);
    }
  }
  
  private async batchUpdateSymbols(symbols: string[]) {
    try {
      // Check rate limiting
      if (!this.checkRateLimit()) {
        console.warn('Rate limit exceeded, skipping update');
        return;
      }
      
      // Use batch API call for efficiency
      const quotes = await twelveDataAPI.getQuotes(symbols);
      
      if (quotes && typeof quotes === 'object') {
        // Handle single symbol response
        if (!Array.isArray(quotes) && quotes.symbol) {
          await this.updateMarketData(quotes.symbol, this.transformAPIData(quotes));
        } 
        // Handle multiple symbols response
        else if (quotes.data && Array.isArray(quotes.data)) {
          // Use Promise.all for parallel processing
          await Promise.all(
            quotes.data.map(quote => 
              this.updateMarketData(quote.symbol, this.transformAPIData(quote))
            )
          );
        }
      }
    } catch (error) {
      console.error('Error batch updating symbols:', error);
    }
  }
  
  private transformAPIData(data: any): RealTimeQuote {
    return {
      symbol: data.symbol,
      price: parseFloat(data.close || data.price || 0),
      bid: parseFloat(data.close || data.price || 0) - 0.01,
      ask: parseFloat(data.close || data.price || 0) + 0.01,
      volume: parseInt(data.volume || 0),
      change: parseFloat(data.change || 0),
      changePercent: parseFloat(data.percent_change || 0),
      high: parseFloat(data.high || data.price || 0),
      low: parseFloat(data.low || data.price || 0),
      open: parseFloat(data.open || data.price || 0),
      previousClose: parseFloat(data.previous_close || data.close || 0),
      timestamp: new Date().toISOString()
    };
  }
  
  private async updateMarketData(symbol: string, data: RealTimeQuote) {
    try {
      // Update cache
      const cacheKey = `market:${symbol}`;
      await cacheService.set(cacheKey, data, 300); // Cache for 5 minutes
      
      // Update subscription
      const subscription = this.subscriptions.get(symbol);
      if (subscription) {
        subscription.lastUpdate = Date.now();
        
        // Get WebSocket service instance
        const wsService = getWebSocketService();
        
        // Broadcast to all subscribers via WebSocket
        subscription.subscribers.forEach(tenantId => {
          wsService.broadcastMarketUpdate(tenantId, symbol, {
            price: data.price,
            change: data.change,
            volume: data.volume,
            timestamp: Date.now(),
            indicators: {
              bid: data.bid,
              ask: data.ask,
              high: data.high,
              low: data.low
            }
          });
        });
      }
      
      // Emit event for internal listeners
      this.emit('market-update', { symbol, data });
      
    } catch (error) {
      console.error(`Error updating market data for ${symbol}:`, error);
    }
  }
  
  private checkRateLimit(): boolean {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    
    const currentCount = this.rateLimiter.get(minute.toString()) || 0;
    if (currentCount >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    this.rateLimiter.set(minute.toString(), currentCount + 1);
    
    // Clean up old entries
    this.rateLimiter.forEach((_, key) => {
      if (parseInt(key) < minute - 1) {
        this.rateLimiter.delete(key);
      }
    });
    
    return true;
  }
  
  // Public methods
  
  async subscribe(symbol: string, tenantId: string, interval: number = 5000): Promise<void> {
    let subscription = this.subscriptions.get(symbol);
    
    if (!subscription) {
      subscription = {
        symbol,
        interval,
        lastUpdate: 0,
        subscribers: new Set()
      };
      this.subscriptions.set(symbol, subscription);
      
      // Subscribe to WebSocket if connected
      if (this.isConnected) {
        this.subscribeToWebSocket(symbol);
      }
    }
    
    subscription.subscribers.add(tenantId);
    
    // Get initial data
    await this.getQuote(symbol);
  }
  
  unsubscribe(symbol: string, tenantId: string): void {
    const subscription = this.subscriptions.get(symbol);
    
    if (subscription) {
      subscription.subscribers.delete(tenantId);
      
      if (subscription.subscribers.size === 0) {
        this.subscriptions.delete(symbol);
        
        // Unsubscribe from WebSocket
        if (this.isConnected) {
          this.unsubscribeFromWebSocket(symbol);
        }
      }
    }
  }
  
  async getQuote(symbol: string): Promise<RealTimeQuote | null> {
    try {
      // Check cache first
      const cacheKey = `market:${symbol}`;
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        return cached as RealTimeQuote;
      }
      
      // Fetch from API
      const quote = await twelveDataAPI.getPrice(symbol);
      
      if (quote && quote.price) {
        const transformedData = this.transformAPIData(quote);
        await this.updateMarketData(symbol, transformedData);
        return transformedData;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting quote for ${symbol}:`, error);
      return null;
    }
  }
  
  async getHistoricalData(symbol: string, interval: string = '1day', outputsize: number = 30) {
    try {
      const cacheKey = `historical:${symbol}:${interval}:${outputsize}`;
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const data = await twelveDataAPI.getTimeSeries(symbol, interval, outputsize);
      
      if (data && data.values) {
        await cacheService.set(cacheKey, data, 900); // Cache for 15 minutes
        return data;
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting historical data for ${symbol}:`, error);
      return null;
    }
  }
  
  async searchSymbols(query: string, limit: number = 10) {
    try {
      const cacheKey = `search:${query}:${limit}`;
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const data = await twelveDataAPI.getSymbols();
      
      if (data && Array.isArray(data)) {
        const results = data
          .filter((item: any) => 
            item.symbol?.toLowerCase().includes(query.toLowerCase()) ||
            item.name?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, limit)
          .map((item: any) => ({
            symbol: item.symbol,
            name: item.name || item.symbol,
            type: item.type || 'stock',
            exchange: item.exchange || 'US'
          }));
        
        await cacheService.set(cacheKey, results, 3600); // Cache for 1 hour
        return results;
      }
      
      return [];
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }
  
  getConnectionStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
  
  // Cleanup
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.stopHeartbeat();
    
    if (this.wsConnection) {
      this.wsConnection.close();
    }
    
    this.subscriptions.clear();
    this.removeAllListeners();
  }
}

export const realTimeMarketService = new RealTimeMarketService(); 