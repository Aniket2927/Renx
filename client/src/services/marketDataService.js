import API_CONFIG from '../config/api';

class MarketDataService {
  constructor() {
    this.apiKey = process.env.REACT_APP_TWELVEDATA_API_KEY;
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  async getQuote(symbol) {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.QUOTE}?symbol=${symbol}&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }

  async getTimeSeries(symbol, interval = API_CONFIG.INTERVALS.DAY, outputSize = 30) {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.TIME_SERIES}?symbol=${symbol}&interval=${interval}&outputsize=${outputSize}&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatTimeSeriesData(data);
    } catch (error) {
      console.error('Error fetching time series:', error);
      throw error;
    }
  }

  async searchSymbols(query) {
    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.SYMBOL_SEARCH}?symbol=${query}&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
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
      ]
    })).reverse();
  }

  // Batch request for multiple symbols
  async getBatchQuotes(symbols) {
    try {
      const promises = symbols.map(symbol => this.getQuote(symbol));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error fetching batch quotes:', error);
      throw error;
    }
  }
}

export default new MarketDataService(); 