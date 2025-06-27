import marketDataService from './marketDataService';

class RealTimeMarketService {
  constructor() {
    this.subscribers = new Map();
    this.intervals = new Map();
    this.cache = new Map();
    this.cacheTimeout = 5000; // 5 seconds cache
  }

  // Subscribe to real-time price updates for a symbol
  subscribe(symbol, callback, intervalMs = 5000) {
    const key = symbol.toUpperCase();
    
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    
    this.subscribers.get(key).add(callback);
    
    // Start fetching data if this is the first subscriber
    if (this.subscribers.get(key).size === 1) {
      this.startFetching(key, intervalMs);
    }
    
    // Immediately send cached data if available
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        callback(cached.data);
      }
    }
    
    // Return unsubscribe function
    return () => this.unsubscribe(symbol, callback);
  }

  unsubscribe(symbol, callback) {
    const key = symbol.toUpperCase();
    
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).delete(callback);
      
      // Stop fetching if no more subscribers
      if (this.subscribers.get(key).size === 0) {
        this.stopFetching(key);
        this.subscribers.delete(key);
      }
    }
  }

  async startFetching(symbol, intervalMs) {
    const fetchData = async () => {
      try {
        const quote = await marketDataService.getQuote(symbol);
        
        // Transform TwelveData response to our format
        const transformedData = this.transformQuoteData(symbol, quote);
        
        // Cache the data
        this.cache.set(symbol, {
          data: transformedData,
          timestamp: Date.now()
        });
        
        // Notify all subscribers
        if (this.subscribers.has(symbol)) {
          this.subscribers.get(symbol).forEach(callback => {
            try {
              callback(transformedData);
            } catch (error) {
              console.error('Error in subscriber callback:', error);
            }
          });
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        
        // Notify subscribers of error with fallback data
        const fallbackData = this.getFallbackData(symbol);
        if (this.subscribers.has(symbol)) {
          this.subscribers.get(symbol).forEach(callback => {
            try {
              callback(fallbackData);
            } catch (error) {
              console.error('Error in error callback:', error);
            }
          });
        }
      }
    };

    // Fetch immediately
    await fetchData();
    
    // Set up interval
    const intervalId = setInterval(fetchData, intervalMs);
    this.intervals.set(symbol, intervalId);
  }

  stopFetching(symbol) {
    if (this.intervals.has(symbol)) {
      clearInterval(this.intervals.get(symbol));
      this.intervals.delete(symbol);
    }
  }

  transformQuoteData(symbol, quote) {
    // Handle different TwelveData response formats
    if (quote.error) {
      throw new Error(quote.error);
    }

    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(quote.close || quote.price || 0),
      bid: parseFloat(quote.close || quote.price || 0) - 0.01,
      ask: parseFloat(quote.close || quote.price || 0) + 0.01,
      volume: parseInt(quote.volume || 0),
      change: parseFloat(quote.change || 0),
      changePercent: parseFloat(quote.percent_change || 0),
      high: parseFloat(quote.high || quote.price || 0),
      low: parseFloat(quote.low || quote.price || 0),
      open: parseFloat(quote.open || quote.price || 0),
      previousClose: parseFloat(quote.previous_close || quote.price || 0),
      marketCap: this.estimateMarketCap(symbol, parseFloat(quote.close || quote.price || 0)),
      lastUpdate: new Date().toISOString(),
      source: 'TwelveData'
    };
  }

  getFallbackData(symbol) {
    // Provide realistic fallback data if API fails
    const basePrice = this.getBasePriceForSymbol(symbol);
    const randomVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = basePrice * (1 + randomVariation);
    const change = basePrice * randomVariation;
    
    return {
      symbol: symbol.toUpperCase(),
      price: parseFloat(price.toFixed(2)),
      bid: parseFloat((price - 0.05).toFixed(2)),
      ask: parseFloat((price + 0.05).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat((randomVariation * 100).toFixed(2)),
      high: parseFloat((price * 1.02).toFixed(2)),
      low: parseFloat((price * 0.98).toFixed(2)),
      open: parseFloat((price * 0.995).toFixed(2)),
      previousClose: parseFloat((price - change).toFixed(2)),
      marketCap: this.estimateMarketCap(symbol, price),
      lastUpdate: new Date().toISOString(),
      source: 'Fallback'
    };
  }

  getBasePriceForSymbol(symbol) {
    const basePrices = {
      'AAPL': 189.75,
      'TSLA': 245.30,
      'NVDA': 892.45,
      'MSFT': 378.85,
      'GOOGL': 142.65,
      'AMZN': 145.30,
      'META': 325.75,
      'NFLX': 485.20
    };
    
    return basePrices[symbol.toUpperCase()] || 100.00;
  }

  estimateMarketCap(symbol, price) {
    const sharesCounts = {
      'AAPL': 15500000000,
      'TSLA': 3160000000,
      'NVDA': 2460000000,
      'MSFT': 7430000000,
      'GOOGL': 12300000000,
      'AMZN': 10700000000,
      'META': 2540000000,
      'NFLX': 443000000
    };
    
    const shares = sharesCounts[symbol.toUpperCase()] || 1000000000;
    return price * shares;
  }

  // Get batch quotes for multiple symbols
  async getBatchQuotes(symbols) {
    try {
      const promises = symbols.map(symbol => 
        marketDataService.getQuote(symbol).then(quote => 
          this.transformQuoteData(symbol, quote)
        ).catch(error => {
          console.error(`Error fetching ${symbol}:`, error);
          return this.getFallbackData(symbol);
        })
      );
      
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error in batch quotes:', error);
      return symbols.map(symbol => this.getFallbackData(symbol));
    }
  }

  // Get cached data for a symbol
  getCachedData(symbol) {
    const key = symbol.toUpperCase();
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }
    return null;
  }

  // Cleanup all subscriptions and intervals
  cleanup() {
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
    this.subscribers.clear();
    this.cache.clear();
  }
}

export default new RealTimeMarketService(); 