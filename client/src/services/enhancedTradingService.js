import { apiService, tradingAPI, marketAPI, portfolioAPI } from './api';

class EnhancedTradingService {
  constructor() {
    this.wsConnection = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
  }

  // WebSocket connection management with enhanced error handling
  async connectWebSocket() {
    if (this.isConnecting || (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3344';
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      
      this.wsConnection = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.wsConnection.onopen = () => {
        console.log('Enhanced Trading WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.subscribeToMarketData();
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log('Enhanced Trading WebSocket disconnected');
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.wsConnection.onerror = (error) => {
        console.error('Enhanced Trading WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // Enhanced reconnection logic
  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connectWebSocket();
      }, delay);
    } else {
      console.error('Max WebSocket reconnection attempts reached');
    }
  }

  // Handle incoming WebSocket messages
  handleWebSocketMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'MARKET_DATA':
        this.notifySubscribers('marketData', payload);
        break;
      case 'ORDER_UPDATE':
        this.notifySubscribers('orderUpdate', payload);
        break;
      case 'TRADE_EXECUTION':
        this.notifySubscribers('tradeExecution', payload);
        break;
      case 'PORTFOLIO_UPDATE':
        this.notifySubscribers('portfolioUpdate', payload);
        break;
      default:
        console.log('Unknown WebSocket message type:', type);
    }
  }

  // Subscribe to market data updates
  subscribeToMarketData() {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'SUBSCRIBE',
        payload: {
          channels: ['market_data', 'order_updates', 'trade_executions', 'portfolio_updates']
        }
      }));
    }
  }

  // Subscriber management
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);
    
    // Auto-connect WebSocket when first subscriber is added
    if (this.subscribers.size === 1) {
      this.connectWebSocket();
    }
    
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).delete(callback);
      if (this.subscribers.get(event).size === 0) {
        this.subscribers.delete(event);
      }
    }
  }

  notifySubscribers(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber callback for ${event}:`, error);
        }
      });
    }
  }

  // Enhanced order placement with validation and error handling
  async placeOrder(orderData) {
    try {
      // Validate order data
      const validationError = this.validateOrderData(orderData);
      if (validationError) {
        throw new Error(validationError);
      }

      // Use consolidated trading API
      const result = await tradingAPI.placeOrder(orderData);
      
      // Notify subscribers of order placement
      this.notifySubscribers('orderPlaced', result);
      
      return result;
    } catch (error) {
      console.error('Order placement failed:', error);
      throw new Error(error.message || 'Failed to place order');
    }
  }

  // Order validation
  validateOrderData(orderData) {
    const { symbol, quantity, price, type, side } = orderData;
    
    if (!symbol || typeof symbol !== 'string') {
      return 'Invalid symbol';
    }
    
    if (!quantity || quantity <= 0) {
      return 'Invalid quantity';
    }
    
    if (type === 'limit' && (!price || price <= 0)) {
      return 'Invalid price for limit order';
    }
    
    if (!['buy', 'sell'].includes(side)) {
      return 'Invalid order side';
    }
    
    if (!['market', 'limit', 'stop', 'stop_limit'].includes(type)) {
      return 'Invalid order type';
    }
    
    return null;
  }

  // Enhanced order management
  async getOrders() {
    try {
      return await tradingAPI.getOrders();
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async cancelOrder(orderId) {
    try {
      const result = await tradingAPI.cancelOrder(orderId);
      this.notifySubscribers('orderCancelled', { orderId, ...result });
      return result;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      throw error;
    }
  }

  // Portfolio management with consolidated API
  async getPositions() {
    try {
      return await tradingAPI.getPositions();
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      throw error;
    }
  }

  async getPortfolioSummary() {
    try {
      return await portfolioAPI.getSummary();
    } catch (error) {
      console.error('Failed to fetch portfolio summary:', error);
      throw error;
    }
  }

  async getPortfolioPerformance() {
    try {
      return await portfolioAPI.getPerformance();
    } catch (error) {
      console.error('Failed to fetch portfolio performance:', error);
      throw error;
    }
  }

  // Market data with consolidated API
  async getMarketData(symbol) {
    try {
      return await marketAPI.getQuote(symbol);
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      throw error;
    }
  }

  async getBatchMarketData(symbols) {
    try {
      return await marketAPI.getBatchQuotes(symbols);
    } catch (error) {
      console.error('Failed to fetch batch market data:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol, interval = '1day', outputsize = 'compact') {
    try {
      return await marketAPI.getTimeSeries(symbol, interval, outputsize);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      throw error;
    }
  }

  // AI-powered trading features using consolidated API
  async getPricePrediction(symbol, historicalData) {
    try {
      return await apiService.predictPrice(symbol, historicalData);
    } catch (error) {
      console.error('Failed to get price prediction:', error);
      throw error;
    }
  }

  async getTradingSignal(symbol, features) {
    try {
      return await apiService.getTradingSignal(symbol, features);
    } catch (error) {
      console.error('Failed to get trading signal:', error);
      throw error;
    }
  }

  async analyzeSentiment(text) {
    try {
      return await apiService.analyzeSentiment(text);
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      throw error;
    }
  }

  // Risk management utilities
  calculatePositionSize(accountValue, riskPercent, stopLoss, entryPrice) {
    const riskAmount = accountValue * (riskPercent / 100);
    const priceRisk = Math.abs(entryPrice - stopLoss);
    return Math.floor(riskAmount / priceRisk);
  }

  calculateRiskReward(entryPrice, stopLoss, takeProfit) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    return reward / risk;
  }

  // Performance analytics
  calculatePnL(positions) {
    return positions.reduce((total, position) => {
      const unrealizedPnL = (position.currentPrice - position.avgPrice) * position.quantity;
      return total + position.realizedPnL + unrealizedPnL;
    }, 0);
  }

  calculateWinRate(trades) {
    if (trades.length === 0) return 0;
    const winningTrades = trades.filter(trade => trade.pnl > 0);
    return (winningTrades.length / trades.length) * 100;
  }

  // Cleanup method
  disconnect() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscribers.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }
}

// Export singleton instance
const enhancedTradingService = new EnhancedTradingService();
export default enhancedTradingService;
