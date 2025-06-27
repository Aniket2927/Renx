import API_CONFIG from '../config/api';

class MarketDataService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3344';
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3344';
    this.subscriptions = new Map();
    this.wsConnection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Get JWT token from local storage
  getAuthToken() {
    return localStorage.getItem('accessToken');
  }

  // Make authenticated API call
  async apiCall(endpoint, options = {}) {
    const token = this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  async getQuote(symbol) {
    try {
      const result = await this.apiCall(`/api/market-data/quote/${symbol}`);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch quote');
      }
      
      // Transform to match existing format
      return {
        symbol: result.data.symbol,
        name: result.data.name || symbol,
        close: result.data.price,
        price: result.data.price,
        change: result.data.change,
        percent_change: result.data.changePercent,
        volume: result.data.volume,
        high: result.data.high,
        low: result.data.low,
        open: result.data.open,
        previous_close: result.data.previousClose,
        timestamp: result.data.timestamp
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }

  async getTimeSeries(symbol, interval = '1day', outputSize = 30) {
    try {
      const result = await this.apiCall(
        `/api/market-data/historical/${symbol}?interval=${interval}&outputsize=${outputSize}`
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch historical data');
      }
      
      return this.formatTimeSeriesData(result.data);
    } catch (error) {
      console.error('Error fetching time series:', error);
      throw error;
    }
  }

  async searchSymbols(query) {
    try {
      const result = await this.apiCall(`/api/market-data/search?query=${query}`);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to search symbols');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error searching symbols:', error);
      throw error;
    }
  }

  formatTimeSeriesData(data) {
    if (!data.values) return [];
    
    return data.values.map(item => ({
      x: new Date(item.datetime).getTime(),
      y: [
        parseFloat(item.open),
        parseFloat(item.high),
        parseFloat(item.low),
        parseFloat(item.close)
      ],
      volume: parseInt(item.volume)
    })).reverse();
  }

  async getBatchQuotes(symbols) {
    try {
      const result = await this.apiCall('/api/market-data/quotes', {
        method: 'POST',
        body: JSON.stringify({ symbols })
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch batch quotes');
      }
      
      // Transform to match existing format
      return result.data.map(quote => ({
        symbol: quote.symbol,
        name: quote.name || quote.symbol,
        close: quote.price,
        price: quote.price,
        change: quote.change,
        percent_change: quote.changePercent,
        volume: quote.volume,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        previous_close: quote.previousClose,
        timestamp: quote.timestamp
      }));
    } catch (error) {
      console.error('Error fetching batch quotes:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  async subscribe(symbol, callback) {
    try {
      const result = await this.apiCall('/api/market-data/subscribe', {
        method: 'POST',
        body: JSON.stringify({ symbol, interval: 5000 })
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to subscribe');
      }
      
      // Store callback for WebSocket updates
      if (!this.subscriptions.has(symbol)) {
        this.subscriptions.set(symbol, new Set());
      }
      this.subscriptions.get(symbol).add(callback);
      
      // Initialize WebSocket if not already connected
      if (!this.wsConnection) {
        this.initWebSocket();
      }
      
      return result;
    } catch (error) {
      console.error('Error subscribing to symbol:', error);
      throw error;
    }
  }

  // Unsubscribe from real-time updates
  async unsubscribe(symbol, callback) {
    try {
      const result = await this.apiCall('/api/market-data/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ symbol })
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to unsubscribe');
      }
      
      // Remove callback
      if (this.subscriptions.has(symbol)) {
        this.subscriptions.get(symbol).delete(callback);
        if (this.subscriptions.get(symbol).size === 0) {
          this.subscriptions.delete(symbol);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error unsubscribing from symbol:', error);
      throw error;
    }
  }

  // Initialize WebSocket connection
  initWebSocket() {
    const token = this.getAuthToken();
    if (!token) {
      console.error('No auth token for WebSocket');
      return;
    }

    this.wsConnection = new WebSocket(`${this.wsUrl}/socket.io/?auth=${token}`);

    this.wsConnection.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Join market room
      this.wsConnection.send(JSON.stringify({
        type: 'join',
        room: 'market'
      }));
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'market-update' && data.symbol) {
          // Notify all callbacks for this symbol
          const callbacks = this.subscriptions.get(data.symbol);
          if (callbacks) {
            const formattedData = {
              symbol: data.symbol,
              price: data.data.price,
              change: data.data.change,
              changePercent: data.data.change / data.data.price * 100,
              volume: data.data.volume,
              timestamp: new Date(data.data.timestamp).toISOString()
            };
            
            callbacks.forEach(callback => {
              try {
                callback(formattedData);
              } catch (err) {
                console.error('Error in market data callback:', err);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.wsConnection.onclose = () => {
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.initWebSocket(), 5000);
      }
    };
  }

  // Get market status
  async getMarketStatus() {
    try {
      const result = await this.apiCall('/api/market-data/status');
      return result;
    } catch (error) {
      console.error('Error fetching market status:', error);
      throw error;
    }
  }

  // Get market indices
  async getMarketIndices() {
    try {
      const result = await this.apiCall('/api/market-data/indices');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch indices');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw error;
    }
  }

  // Cleanup
  destroy() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscriptions.clear();
  }
}

export default new MarketDataService(); 